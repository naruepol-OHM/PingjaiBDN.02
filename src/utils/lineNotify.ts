import { Appointment } from '../types';

export interface LineNotifyPayload {
  message: string;
  confirmUrl: string;
  inSessionUrl: string;
  completeUrl: string;
  rescheduleUrl: string;
  trackingUrl: string;
  appointmentId: string;
  trackingCode: string;
  status: string;
  counselorName: string;
  appointmentDate: string;
  appointmentTimeSlot: string;
  timestamp: string;
  fullAppointment?: Appointment;
}

/**
 * Builds the LINE notification message text + payload for a given appointment/action.
 * Pure function so it can be reused both by the automatic triggers (booking/status change)
 * and by the manual "test" button, without needing settings to already be saved.
 */
export const buildLineNotifyPayload = (
  appointment: Appointment,
  actionType: 'NEW_BOOKING' | 'STATUS_CHANGE' | 'REMINDER',
  topicTitle: string
): LineNotifyPayload => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const confirmUrl = `${origin}${pathname}?action=confirm&code=${appointment.trackingCode}`;
  const inSessionUrl = `${origin}${pathname}?action=in_session&code=${appointment.trackingCode}`;
  const completeUrl = `${origin}${pathname}?action=complete&code=${appointment.trackingCode}`;
  const rescheduleUrl = `${origin}${pathname}?action=reschedule&code=${appointment.trackingCode}`;
  const trackingUrl = `${origin}${pathname}?tab=tracking&code=${appointment.trackingCode}`;
  let msgText = '';

  if (actionType === 'NEW_BOOKING') {
    msgText = `🔔 [แจ้งเตือนนัดหมายใหม่ - ศูนย์พิงใจ บ.ด.น.]\nรหัส: ${appointment.trackingCode}\nหัวข้อ: ${topicTitle}\nผู้ขอรับคำปรึกษา: ${appointment.isAnonymous ? 'ปกปิดชื่อ (ใช้นามสมมุติ)' : appointment.studentName}\nระดับชั้น: ${appointment.studentGrade} ${appointment.studentRoom ? `ห้อง ${appointment.studentRoom}` : ''}\nวัน/เวลา: ${appointment.appointmentDay} (${appointment.appointmentDate}) ${appointment.appointmentTimeSlot}\nครูที่ปรึกษา: ${appointment.counselorName}\nรูปแบบ: ${appointment.meetingFormat === 'in_person' ? 'พบตัวจริงที่ห้องศูนย์พิงใจ' : appointment.meetingFormat === 'online' ? 'ออนไลน์' : 'โทรศัพท์'}\n\n⚡ ลิงก์ด่วนสำหรับครูที่ปรึกษา:\n1️⃣ ยืนยันนัดหมาย:\n👉 ${confirmUrl}\n\n2️⃣ เริ่มให้คำปรึกษา (กำลังปรึกษา):\n👉 ${inSessionUrl}\n\n3️⃣ บันทึกเสร็จสิ้นการปรึกษา:\n👉 ${completeUrl}\n\n4️⃣ เมนูเลื่อนวันนัดหมาย:\n👉 ${rescheduleUrl}`;
  } else if (actionType === 'STATUS_CHANGE') {
    const statusThai =
      appointment.status === 'confirmed' ? '✅ ยืนยันการนัดหมายแล้ว' :
      appointment.status === 'in_session' ? '💬 กำลังเข้ารับคำปรึกษา' :
      appointment.status === 'completed' ? '🎉 ให้คำปรึกษาเรียบร้อย' :
      appointment.status === 'cancelled' ? '❌ ยกเลิกการนัดหมาย' : '⏳ รอการยืนยัน';

    msgText = `📢 [อัปเดตสถานะนัดหมาย - ศูนย์พิงใจ บ.ด.น.]\nรหัส: ${appointment.trackingCode}\nสถานะใหม่: ${statusThai}\nนักเรียน: ${appointment.isAnonymous ? 'นักเรียน' : appointment.studentName} (${appointment.studentGrade})\nครูที่ปรึกษา: ${appointment.counselorName}\nวัน/เวลา: ${appointment.appointmentDay} (${appointment.appointmentDate}) ${appointment.appointmentTimeSlot}\nบันทึก: ${appointment.statusNotes || 'ไม่มีข้อความเพิ่มเติม'}\n\n⚡ จัดการคำปรึกษา:\n👉 ยืนยันนัด: ${confirmUrl}\n👉 กำลังปรึกษา: ${inSessionUrl}\n👉 เสร็จสิ้น: ${completeUrl}\n👉 เลื่อนนัด: ${rescheduleUrl}\n🔍 ดูสถานะ: ${trackingUrl}`;
  } else {
    msgText = `⏰ [เตือนความจำนัดหมาย - ศูนย์พิงใจ บ.ด.น.]\nรหัส: ${appointment.trackingCode}\nนัดหมายวันนี้: ${appointment.appointmentDay} (${appointment.appointmentDate}) ${appointment.appointmentTimeSlot}\nครูที่ปรึกษา: ${appointment.counselorName}\nสถานที่: ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2\n\n⚡ ดำเนินการ:\n👉 เริ่มให้คำปรึกษา: ${inSessionUrl}\n👉 บันทึกเสร็จสิ้น: ${completeUrl}\n👉 เลื่อนนัด: ${rescheduleUrl}`;
  }

  return {
    message: msgText,
    confirmUrl,
    inSessionUrl,
    completeUrl,
    rescheduleUrl,
    trackingUrl,
    appointmentId: appointment.id,
    trackingCode: appointment.trackingCode,
    status: appointment.status,
    counselorName: appointment.counselorName,
    appointmentDate: appointment.appointmentDate,
    appointmentTimeSlot: appointment.appointmentTimeSlot,
    timestamp: new Date().toISOString(),
    fullAppointment: appointment
  };
};

/**
 * Actually posts the payload to a webhook URL (Apps Script / Make / Zapier / custom server)
 * and reports back whether it really succeeded, instead of always assuming success.
 *
 * NOTE: we intentionally do NOT use `mode: 'no-cors'` here. With no-cors the browser sends
 * the request but the JS code can never read whether it succeeded or failed (opaque response),
 * which is why the previous "test" button always showed a fake success toast. Some webhook
 * targets (like a bare Google Apps Script deployment) may still not return CORS headers -
 * in that case fetch will throw, and we surface that clearly instead of pretending it worked.
 */
export const postLineWebhook = async (
  url: string,
  payload: LineNotifyPayload
): Promise<{ success: boolean; message: string }> => {
  const trimmedUrl = (url || '').trim();

  if (!trimmedUrl || !trimmedUrl.startsWith('http')) {
    return {
      success: false,
      message: 'ยังไม่ได้กรอก Webhook URL หรือ URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://) กรุณากรอกแล้วกด "บันทึกการตั้งค่า" ก่อนทดสอบ'
    };
  }

  try {
    // IMPORTANT: use 'text/plain' instead of 'application/json' as the Content-Type here.
    // 'application/json' is a non-simple header, which forces the browser to send a CORS
    // preflight (OPTIONS request) first. Google Apps Script Web Apps only implement
    // doGet/doPost (no doOptions), so that preflight fails and the browser blocks the
    // whole request before it's ever sent - which shows up as "Failed to fetch".
    // 'text/plain' is CORS-safelisted, so no preflight is triggered, and the raw JSON
    // string in the body is still readable via e.postData.contents on the Apps Script side
    // (and via a normal JSON body parser on Make.com/Zapier/custom servers too).
    const res = await fetch(trimmedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        success: false,
        message: `Webhook ตอบกลับผิดพลาด (HTTP ${res.status}) ${text ? '- ' + text.slice(0, 150) : ''}`
      };
    }

    return {
      success: true,
      message: 'ส่งคำขอไปยัง Webhook สำเร็จ (ตอบกลับ HTTP ' + res.status + ')'
    };
  } catch (err) {
    return {
      success: false,
      message:
        'ส่งไม่สำเร็จ: ' +
        (err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ') +
        ' (ตรวจสอบว่า URL ถูกต้อง, Deploy แล้ว, และตั้งค่า "Who has access" เป็น Anyone)'
    };
  }
};
