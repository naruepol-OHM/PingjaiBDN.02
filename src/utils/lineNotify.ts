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
 * Builds the base URL for the current application instance.
 * Ensures no trailing slash issues and proper scheme handling.
 */
export const getAppBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin || '';
  const pathname = window.location.pathname || '';
  // Clean trailing slashes
  const cleanPath = pathname.replace(/\/+$/, '');
  return `${origin}${cleanPath}`;
};

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
  const baseUrl = getAppBaseUrl();
  const trackingCode = appointment.trackingCode.trim().toUpperCase();
  
  // Direct action URLs designed for mobile LINE in-app browser & external browsers
  const manageUrl = `${baseUrl}/?action=confirm&code=${encodeURIComponent(trackingCode)}`;
  const confirmUrl = `${baseUrl}/?action=confirm&code=${encodeURIComponent(trackingCode)}`;
  const inSessionUrl = `${baseUrl}/?action=in_session&code=${encodeURIComponent(trackingCode)}`;
  const completeUrl = `${baseUrl}/?action=complete&code=${encodeURIComponent(trackingCode)}`;
  const rescheduleUrl = `${baseUrl}/?action=reschedule&code=${encodeURIComponent(trackingCode)}`;
  const trackingUrl = `${baseUrl}/?tab=tracking&code=${encodeURIComponent(trackingCode)}`;

  let msgText = '';

  if (actionType === 'NEW_BOOKING') {
    const locText = appointment.meetingFormat === 'in_person'
      ? `พบตัวจริง (${appointment.meetingLocation || 'ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์'})`
      : appointment.meetingFormat === 'online'
      ? 'ออนไลน์ผ่านระบบ'
      : 'โทรศัพท์';

    msgText = [
      '🔔 [แจ้งเตือนนัดหมายใหม่ - ศูนย์พิงใจ บ.ด.น.]',
      `รหัสติดตาม: ${trackingCode}`,
      `หัวข้อ: ${topicTitle}`,
      `ผู้ขอรับคำปรึกษา: ${appointment.isAnonymous ? 'ปกปิดชื่อ (ใช้นามสมมุติ)' : appointment.studentName}`,
      `ระดับชั้น: ${appointment.studentGrade} ${appointment.studentRoom ? `ห้อง ${appointment.studentRoom}` : ''}`,
      `วัน/เวลา: ${appointment.appointmentDay} (${appointment.appointmentDate}) ${appointment.appointmentTimeSlot}`,
      `ครูที่ปรึกษา: ${appointment.counselorName}`,
      `รูปแบบ: ${locText}`,
      '',
      '⚡ ลิงก์จัดการนัดหมายสำหรับครู (แตะเพื่อเปิด):',
      manageUrl,
      '',
      '🔍 ลิงก์ตรวจสอบสถานะสำหรับนักเรียน:',
      trackingUrl
    ].join('\n');

  } else if (actionType === 'STATUS_CHANGE') {
    const statusThai =
      appointment.status === 'confirmed' ? '✅ ยืนยันการนัดหมายแล้ว' :
      appointment.status === 'in_session' ? '💬 กำลังเข้ารับคำปรึกษา' :
      appointment.status === 'completed' ? '🎉 ให้คำปรึกษาเรียบร้อย (ปิดเคส)' :
      appointment.status === 'cancelled' ? '❌ ยกเลิกการนัดหมาย' : '⏳ รอการยืนยัน';

    msgText = [
      '📢 [อัปเดตสถานะนัดหมาย - ศูนย์พิงใจ บ.ด.น.]',
      `รหัสติดตาม: ${trackingCode}`,
      `สถานะ: ${statusThai}`,
      `นักเรียน: ${appointment.isAnonymous ? 'นักเรียน' : appointment.studentName} (${appointment.studentGrade})`,
      `ครูที่ปรึกษา: ${appointment.counselorName}`,
      `วัน/เวลา: ${appointment.appointmentDay} (${appointment.appointmentDate}) ${appointment.appointmentTimeSlot}`,
      `บันทึก: ${appointment.statusNotes || 'ไม่มีข้อความเพิ่มเติม'}`,
      '',
      '⚡ ลิงก์จัดการนัดหมายสำหรับครู:',
      manageUrl,
      '',
      '🔍 ลิงก์ตรวจสอบสถานะสำหรับนักเรียน:',
      trackingUrl
    ].join('\n');

  } else {
    msgText = [
      '⏰ [เตือนความจำนัดหมาย - ศูนย์พิงใจ บ.ด.น.]',
      `รหัสติดตาม: ${trackingCode}`,
      `นัดหมายวันนี้: ${appointment.appointmentDay} (${appointment.appointmentDate}) ${appointment.appointmentTimeSlot}`,
      `ครูที่ปรึกษา: ${appointment.counselorName}`,
      `สถานที่: ${appointment.meetingLocation || 'ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์'}`,
      '',
      '⚡ ลิงก์จัดการนัดหมายสำหรับครู:',
      manageUrl
    ].join('\n');
  }

  return {
    message: msgText,
    confirmUrl,
    inSessionUrl,
    completeUrl,
    rescheduleUrl,
    trackingUrl,
    appointmentId: appointment.id,
    trackingCode,
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
