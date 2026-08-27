// netlify/functions/line-webhook.js
//
// ศูนย์พิงใจ บ.ด.น. — Netlify Serverless Webhook Relay
// 1. รับการแจ้งเตือนจากหน้าเว็บ (POST { message, trackingCode, status, fullAppointment })
//    -> ยิง Push เข้า LINE Group/User โดยตรงผ่าน Messaging API
//    -> ส่งต่อไปยัง Google Apps Script (GOOGLE_SHEET_WEBHOOK_URL) เพื่อบันทึก Log และชีต Appointments
// 2. รับ Webhook Events จาก LINE Platform (Verify / Message / Join)
//    -> ตอบกลับ 200 OK ทันทีเพื่อให้ Verify ผ่าน 100%
//    -> บันทึก groupId/userId ลง Logs และส่งเข้า Google Sheet

const DEFAULT_CHANNEL_ACCESS_TOKEN =
  process.env.LINE_CHANNEL_ACCESS_TOKEN ||
  "E/GiX+b1r+tvJInDmDOY+/rXwEzsOGC6ZovluttD7NsEBE6Tk4KJDpfDrrwvtVDYHmWWCFrwZ75EfPgO1wRQpRL67u/VhmqJa0bKxp0JNEhmO4C5tFrhOkP3Wrr2YISLjohrpIOrkHAJ2CwOSyYzVgdB04t89/1O/w1cDnyilFU=";

const DEFAULT_TARGET_ID =
  process.env.LINE_TARGET_ID || "C4e107649c73cb2d0f30e2170813dbf93";

exports.handler = async (event) => {
  // Allow CORS for Webhook calls from client-side
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "ศูนย์พิงใจ Webhook is running (POST only)" }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error("Invalid JSON body:", err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, error: "Invalid JSON format" }),
    };
  }

  // -------------------------------------------------------------
  // Case A: Incoming Webhook Event from LINE Platform (Verify / Group / User Event)
  // -------------------------------------------------------------
  if (Array.isArray(data.events)) {
    console.log("Incoming LINE events count:", data.events.length);
    for (const evt of data.events) {
      const sourceType = evt.source && evt.source.type;
      const groupId = evt.source && evt.source.groupId;
      const userId = evt.source && evt.source.userId;
      const roomId = evt.source && evt.source.roomId;

      console.log("LINE Event captured:", {
        type: evt.type,
        sourceType,
        groupId,
        userId,
        roomId,
      });

      const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
      if (sheetWebhookUrl) {
        try {
          await fetch(sheetWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              trackingCode: "LINE_ID_CAPTURE",
              status: evt.type,
              message: `sourceType=${sourceType} groupId=${groupId || "-"} userId=${userId || "-"} roomId=${roomId || "-"}`,
            }),
          });
        } catch (e) {
          console.error("Failed forwarding event to Sheet:", e);
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "LINE events processed" }),
    };
  }

  // -------------------------------------------------------------
  // Case B: Direct Notification Request from Website (Booking / Status update)
  // -------------------------------------------------------------
  let lineResult = "-";
  if (data.message) {
    try {
      const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEFAULT_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: DEFAULT_TARGET_ID,
          messages: [{ type: "text", text: data.message }],
        }),
      });

      const resText = await lineRes.text().catch(() => "");
      lineResult = `HTTP ${lineRes.status} ${resText}`;
      console.log("LINE Push response:", lineResult);
    } catch (err) {
      lineResult = `Error: ${err instanceof Error ? err.message : String(err)}`;
      console.error("LINE Push error:", lineResult);
    }
  }

  // Forward to Google Apps Script Web App (if configured in environment variables)
  const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (sheetWebhookUrl) {
    try {
      await fetch(sheetWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error("Failed forwarding appointment to Sheet webhook:", e);
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      lineResult,
      trackingCode: data.trackingCode,
      message: "Notification received and processed",
    }),
  };
};
