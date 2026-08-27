import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BellRing,
  Send,
  CheckCircle2,
  Save,
  MessageSquare,
  Shield,
  Sparkles,
  Smartphone,
  ExternalLink,
  Link as LinkIcon,
  HelpCircle,
  Copy
} from 'lucide-react';
import { LineSettings } from '../../types';
import { CounselorConfirmModal } from '../CounselorConfirmModal';
import { buildLineNotifyPayload, postLineWebhook } from '../../utils/lineNotify';

export const LineSettingsManager: React.FC = () => {
  const { lineSettings, updateLineSettings, appointments, topics, addToast } = useApp();

  const [webhookUrl, setWebhookUrl] = useState(lineSettings.webhookUrl);
  const [lineNotifyToken, setLineNotifyToken] = useState(lineSettings.lineNotifyToken);
  const [enableStudentAlert, setEnableStudentAlert] = useState(lineSettings.enableStudentAlert);
  const [enableTeacherAlert, setEnableTeacherAlert] = useState(lineSettings.enableTeacherAlert);
  const [autoSendOnBooking, setAutoSendOnBooking] = useState(lineSettings.autoSendOnBooking);
  const [autoSendOnStatusChange, setAutoSendOnStatusChange] = useState(lineSettings.autoSendOnStatusChange);

  const [testSent, setTestSent] = useState(false);
  const [testConfirmModalCode, setTestConfirmModalCode] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const sampleApt = appointments.length > 0 ? appointments[0] : null;
  const sampleTrackingCode = sampleApt ? sampleApt.trackingCode : 'BDN-2608-8821';
  const sampleUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?action=confirm&code=${sampleTrackingCode}` : `https://.../?action=confirm&code=${sampleTrackingCode}`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLineSettings({
      webhookUrl: webhookUrl.trim(),
      lineNotifyToken: lineNotifyToken.trim(),
      enableStudentAlert,
      enableTeacherAlert,
      autoSendOnBooking,
      autoSendOnStatusChange
    });
  };

  const handleSendTestNotification = async () => {
    const trimmedUrl = webhookUrl.trim();

    if (!trimmedUrl || !trimmedUrl.startsWith('http')) {
      addToast({
        type: 'error',
        title: 'ยังไม่ได้กรอก Webhook URL',
        message: 'กรุณากรอก LINE Notify / Webhook Endpoint URL ให้ถูกต้องก่อนทดสอบ (ต้องขึ้นต้นด้วย http:// หรือ https://)'
      });
      return;
    }

    if (appointments.length === 0) {
      addToast({
        type: 'error',
        title: 'ไม่มีข้อมูลนัดหมายสำหรับทดสอบ',
        message: 'กรุณาสร้างคำขอนัดหมายอย่างน้อย 1 รายการก่อน แล้วค่อยกลับมาทดสอบส่งข้อความ'
      });
      return;
    }

    setIsTesting(true);
    try {
      // Persist current form values first, so "บันทึกการตั้งค่า" and the live test always match
      updateLineSettings({
        webhookUrl: trimmedUrl,
        lineNotifyToken: lineNotifyToken.trim(),
        enableStudentAlert,
        enableTeacherAlert,
        autoSendOnBooking,
        autoSendOnStatusChange
      });

      const sampleAppointment = appointments[0];
      const topicTitle = topics.find((t) => t.id === sampleAppointment.topicId)?.title || sampleAppointment.topicId;
      const payload = buildLineNotifyPayload(sampleAppointment, 'NEW_BOOKING', topicTitle);

      // Use the URL straight from the input (not from context state, which may not have
      // re-rendered yet) so the test always reflects exactly what's on screen right now.
      const result = await postLineWebhook(trimmedUrl, payload);

      setTestSent(result.success);
      setTimeout(() => setTestSent(false), 3500);

      addToast({
        type: result.success ? 'success' : 'error',
        title: result.success ? 'ส่งคำขอไปยัง Webhook สำเร็จ' : 'ส่งไม่สำเร็จ',
        message: result.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BellRing className="w-5 h-5 text-slate-900" />
          ระบบตั้งค่าการแจ้งเตือนผ่าน LINE Notify & Webhook
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          เชื่อมต่อระบบแจ้งเตือนข้อความอัตโนมัติเมื่อมีนักเรียนนัดหมายใหม่ หรือเมื่อครูปรับสถานะ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              LINE Notify / Webhook Endpoint URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://notify-api.line.me/api/notify หรือ Webhook URL"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * รองรับ LINE Notify API Token, Make.com, Zapier หรือ Custom Webhook Server
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              LINE Channel Access Token / Bearer Token
            </label>
            <input
              type="password"
              value={lineNotifyToken}
              onChange={(e) => setLineNotifyToken(e.target.value)}
              placeholder="กรอก Token ของศูนย์พิงใจ บ.ด.น."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono focus:bg-white"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800">เงื่อนไขการส่งแจ้งเตือนอัตโนมัติ:</h4>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendOnBooking}
                onChange={(e) => setAutoSendOnBooking(e.target.checked)}
                className="accent-slate-900 w-4 h-4 rounded"
              />
              <span>ส่งแจ้งเตือนเข้ากลุ่มครูทันทีเมื่อมี <strong>"คำขอนัดหมายใหม่"</strong></span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendOnStatusChange}
                onChange={(e) => setAutoSendOnStatusChange(e.target.checked)}
                className="accent-slate-900 w-4 h-4 rounded"
              />
              <span>ส่งแจ้งเตือนนักเรียนเมื่อ <strong>"ครูกดยืนยัน / เปลี่ยนสถานะ"</strong></span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={isTesting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {isTesting ? 'กำลังส่ง...' : 'ทดสอบส่งข้อความ LINE'}
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>

        {/* Live Phone Mockup Preview */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1 text-slate-200">
                <Smartphone className="w-4 h-4" />
                จำลองหน้าจอ LINE Notify
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Chat Bubble */}
            <div className="mt-4 space-y-3">
              <div className="bg-white text-slate-900 p-3.5 rounded-xl rounded-tl-xs shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-900 border-b border-slate-100 pb-1">
                  <span className="flex items-center gap-1 text-blue-900">
                    <BellRing className="w-3.5 h-3.5 text-blue-600" />
                    ศูนย์พิงใจ บ.ด.น.
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">เมื่อสักครู่</span>
                </div>
                <p className="font-bold text-slate-900 text-xs">
                  🔔 [แจ้งเตือนนัดหมายใหม่ - ศูนย์พิงใจ บ.ด.น.]
                </p>
                <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                  <div>รหัส: <strong className="text-slate-900">{sampleTrackingCode}</strong></div>
                  <div>หัวข้อ: สุขภาพจิตและความเครียด</div>
                  <div>ผู้ขอรับคำปรึกษา: {sampleApt ? (sampleApt.isAnonymous ? 'ปกปิดชื่อ (ใช้นามสมมุติ)' : sampleApt.studentName) : 'น้องดาว (ม.3/5)'}</div>
                  <div>วัน/เวลา: {sampleApt ? `${sampleApt.appointmentDay} (${sampleApt.appointmentDate}) ${sampleApt.appointmentTimeSlot}` : 'วันศุกร์ (11.10 - 12.00 น.)'}</div>
                  <div>ครูที่ปรึกษา: {sampleApt ? sampleApt.counselorName : 'นางสาวปิยนุช ก้อนแก้ว'}</div>
                  <div>รูปแบบ: พบตัวจริงที่ห้องศูนย์พิงใจ</div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-emerald-800 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-emerald-600" />
                    👉 ลิงก์สำหรับครูกดยืนยันวันนัดหมาย:
                  </span>
                  <button
                    type="button"
                    onClick={() => setTestConfirmModalCode(sampleTrackingCode)}
                    className="w-full text-left p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] text-emerald-900 font-mono break-all cursor-pointer transition-colors flex items-center justify-between group"
                    title="คลิกเพื่อทดสอบเปิดหน้าต่างยืนยันสำหรับครู"
                  >
                    <span className="truncate mr-1">{sampleUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform" />
                  </button>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">
                    * เมื่อครูกดลิงก์นี้จาก LINE จะเปิดหน้าต่างยืนยันนัดหมาย 1-Click ทันที
                  </span>
                </div>
              </div>

              {testSent && (
                <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ส่งสัญญาณจำลองพร้อมแนบลิงก์สำเร็จ!
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 text-[11px] text-slate-400 text-center">
            ระบบส่งข้อความอัตโนมัติพร้อมแนบลิงก์กดยืนยันให้ครู
          </div>
        </div>
      </div>

      {/* Test Counselor Confirm Modal */}
      {testConfirmModalCode && (
        <CounselorConfirmModal
          confirmCode={testConfirmModalCode}
          onClose={() => setTestConfirmModalCode(null)}
        />
      )}
    </div>
  );
};
