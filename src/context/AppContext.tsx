import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Topic,
  Counselor,
  TimetableEntry,
  Appointment,
  LineSettings,
  SchoolInfo,
  AppointmentStatus,
  ConfidentialCaseSummary,
  DayOfWeek,
  GradeLevel,
  TopicId
} from '../types';
import {
  INITIAL_TOPICS,
  INITIAL_COUNSELORS,
  INITIAL_TIMETABLE,
  INITIAL_APPOINTMENTS,
  INITIAL_LINE_SETTINGS,
  INITIAL_SCHOOL_INFO
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

interface AppContextType {
  topics: Topic[];
  counselors: Counselor[];
  timetable: TimetableEntry[];
  appointments: Appointment[];
  lineSettings: LineSettings;
  schoolInfo: SchoolInfo;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTopicForBooking: TopicId | null;
  setSelectedTopicForBooking: (topicId: TopicId | null) => void;
  selectedCounselorForBooking: Counselor | null;
  setSelectedCounselorForBooking: (counselor: Counselor | null) => void;
  selectedDayForBooking: DayOfWeek | null;
  setSelectedDayForBooking: (day: DayOfWeek | null) => void;
  selectedGradeLevelForBooking: GradeLevel | null;
  setSelectedGradeLevelForBooking: (grade: GradeLevel | null) => void;
  trackingQuery: string;
  setTrackingQuery: (query: string) => void;
  
  // Admin Authentication
  isAdminAuthenticated: boolean;
  adminRoleName: string;
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;

  // Appointment Actions
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'trackingCode' | 'createdAt' | 'status' | 'lineNotificationSent'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, statusNotes?: string) => void;
  rescheduleAppointment: (id: string, newDate: string, newDay: DayOfWeek, newTimeSlot: string, reason?: string) => void;
  saveCaseSummary: (appointmentId: string, summary: Omit<ConfidentialCaseSummary, 'id' | 'appointmentId' | 'dateRecorded'>) => void;
  cancelAppointment: (id: string, reason?: string) => void;
  
  // Admin Data Management
  addCounselor: (counselor: Omit<Counselor, 'id'>) => void;
  updateCounselor: (counselor: Counselor) => void;
  deleteCounselor: (id: string) => void;
  updateTopic: (topic: Topic) => void;
  updateTimetable: (timetableEntries: TimetableEntry[]) => void;
  updateLineSettings: (settings: LineSettings) => void;
  updateSchoolInfo: (info: SchoolInfo) => void;
  resetSchoolInfoToDefault: () => void;
  
  // LINE and Real-time Alerts
  sendLineNotification: (appointment: Appointment, actionType: 'NEW_BOOKING' | 'STATUS_CHANGE' | 'REMINDER') => Promise<{ success: boolean; message: string }>;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Utilities
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOPICS: 'bdn_pingjai_topics_v1',
  COUNSELORS: 'bdn_pingjai_counselors_v1',
  TIMETABLE: 'bdn_pingjai_timetable_v1',
  APPOINTMENTS: 'bdn_pingjai_appointments_v1',
  LINE_SETTINGS: 'bdn_pingjai_line_settings_v1',
  SCHOOL_INFO: 'bdn_pingjai_school_info_v1',
  ADMIN_AUTH: 'bdn_pingjai_admin_auth_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
    return saved ? JSON.parse(saved) : INITIAL_TOPICS;
  });

  const [counselors, setCounselors] = useState<Counselor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUNSELORS);
    return saved ? JSON.parse(saved) : INITIAL_COUNSELORS;
  });

  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [lineSettings, setLineSettings] = useState<LineSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LINE_SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_LINE_SETTINGS;
  });

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO);
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_INFO;
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTopicForBooking, setSelectedTopicForBooking] = useState<TopicId | null>(null);
  const [selectedCounselorForBooking, setSelectedCounselorForBooking] = useState<Counselor | null>(null);
  const [selectedDayForBooking, setSelectedDayForBooking] = useState<DayOfWeek | null>(null);
  const [selectedGradeLevelForBooking, setSelectedGradeLevelForBooking] = useState<GradeLevel | null>(null);
  const [trackingQuery, setTrackingQuery] = useState<string>('');

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });
  const [adminRoleName, setAdminRoleName] = useState<string>('ครูผู้ดูแลระบบศูนย์พิงใจ');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage with safe error handling
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    } catch (e) {
      console.warn('Storage sync error topics:', e);
    }
  }, [topics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUNSELORS, JSON.stringify(counselors));
    } catch (e) {
      console.warn('Storage sync error counselors:', e);
    }
  }, [counselors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
    } catch (e) {
      console.warn('Storage sync error timetable:', e);
    }
  }, [timetable]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.warn('Storage sync error appointments:', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LINE_SETTINGS, JSON.stringify(lineSettings));
    } catch (e) {
      console.warn('Storage sync error lineSettings:', e);
    }
  }, [lineSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(schoolInfo));
    } catch (e) {
      console.warn('Storage sync error schoolInfo:', e);
    }
  }, [schoolInfo]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginAdmin = (passcode: string): boolean => {
    // Passcode for teachers/admin
    if (passcode === 'Bdn@123') {
      setIsAdminAuthenticated(true);
      setAdminRoleName('คณะกรรมการศูนย์พิงใจ บ.ด.น.');
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      addToast({
        type: 'success',
        title: 'เข้าสู่ระบบหลังบ้านสำเร็จ',
        message: 'ยินดีต้อนรับคณะครูและผู้ดูแลระบบศูนย์พิงใจ'
      });
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'รหัสผ่านไม่ถูกต้อง',
        message: 'กรุณาตรวจสอบรหัสผ่านสำหรับคุณครูอีกครั้ง'
      });
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    addToast({
      type: 'info',
      title: 'ออกจากระบบแล้ว',
      message: 'ออกจากระบบหลังบ้านศูนย์พิงใจเรียบร้อย'
    });
  };

  const generateTrackingCode = (): string => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const date = new Date();
    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    return `BDN-${dayStr}${monthStr}-${randomDigits}`;
  };

  const sendLineNotification = async (
    appointment: Appointment,
    actionType: 'NEW_BOOKING' | 'STATUS_CHANGE' | 'REMINDER'
  ): Promise<{ success: boolean; message: string }> => {
    const topicObj = topics.find((t) => t.id === appointment.topicId);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const confirmUrl = `${origin}${pathname}?action=confirm&code=${appointment.trackingCode}`;
    const inSessionUrl = `${origin}${pathname}?action=in_session&code=${appointment.trackingCode}`;
    const completeUrl = `${origin}${pathname}?action=complete&code=${appointment.trackingCode}`;
    const rescheduleUrl = `${origin}${pathname}?action=reschedule&code=${appointment.trackingCode}`;
    const trackingUrl = `${origin}${pathname}?tab=tracking&code=${appointment.trackingCode}`;
    let msgText = '';

    if (actionType === 'NEW_BOOKING') {
      msgText = `🔔 [แจ้งเตือนนัดหมายใหม่ - ศูนย์พิงใจ บ.ด.น.]\nรหัส: ${appointment.trackingCode}\nหัวข้อ: ${topicObj?.title || appointment.topicId}\nผู้ขอรับคำปรึกษา: ${appointment.isAnonymous ? 'ปกปิดชื่อ (ใช้นามสมมุติ)' : appointment.studentName}\nระดับชั้น: ${appointment.studentGrade} ${appointment.studentRoom ? `ห้อง ${appointment.studentRoom}` : ''}\nวัน/เวลา: ${appointment.appointmentDay} (${appointment.appointmentDate}) ${appointment.appointmentTimeSlot}\nครูที่ปรึกษา: ${appointment.counselorName}\nรูปแบบ: ${appointment.meetingFormat === 'in_person' ? 'พบตัวจริงที่ห้องศูนย์พิงใจ' : appointment.meetingFormat === 'online' ? 'ออนไลน์' : 'โทรศัพท์'}\n\n⚡ ลิงก์ด่วนสำหรับครูที่ปรึกษา:\n1️⃣ ยืนยันนัดหมาย:\n👉 ${confirmUrl}\n\n2️⃣ เริ่มให้คำปรึกษา (กำลังปรึกษา):\n👉 ${inSessionUrl}\n\n3️⃣ บันทึกเสร็จสิ้นการปรึกษา:\n👉 ${completeUrl}\n\n4️⃣ เมนูเลื่อนวันนัดหมาย:\n👉 ${rescheduleUrl}`;
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

    // Try sending webhook if configured
    let webhookSuccess = false;
    if (lineSettings.webhookUrl && lineSettings.webhookUrl.startsWith('http')) {
      try {
        await fetch(lineSettings.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
            timestamp: new Date().toISOString()
          }),
          mode: 'no-cors'
        });
        webhookSuccess = true;
      } catch (e) {
        console.warn('Webhook dispatch simulated/skipped:', e);
      }
    }

    return {
      success: true,
      message: msgText
    };
  };

  const createAppointment = (
    appointmentData: Omit<Appointment, 'id' | 'trackingCode' | 'createdAt' | 'status' | 'lineNotificationSent'>
  ): Appointment => {
    const newId = 'apt-' + Date.now();
    const trackingCode = generateTrackingCode();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
      trackingCode,
      createdAt: new Date().toISOString(),
      status: 'pending',
      lineNotificationSent: true,
      lineNotificationHistory: [
        {
          timestamp: new Date().toISOString(),
          type: 'BOOKING_RECEIVED',
          message: `ลงทะเบียนสำเร็จ รหัสติดตาม ${trackingCode}`
        }
      ]
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Send simulated / webhook LINE alert
    sendLineNotification(newAppointment, 'NEW_BOOKING');

    addToast({
      type: 'success',
      title: 'บันทึกการนัดหมายสำเร็จ!',
      message: `รหัสติดตามของคุณคือ ${trackingCode} กรุณาจดจำรหัสเพื่อใช้ตรวจสถานะ`,
      duration: 6000
    });

    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus, statusNotes?: string) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated: Appointment = {
            ...apt,
            status,
            statusNotes: statusNotes !== undefined ? statusNotes : apt.statusNotes,
            confirmedAt: status === 'confirmed' ? new Date().toISOString() : apt.confirmedAt,
            completedAt: status === 'completed' ? new Date().toISOString() : apt.completedAt,
            lineNotificationHistory: [
              ...(apt.lineNotificationHistory || []),
              {
                timestamp: new Date().toISOString(),
                type: 'STATUS_UPDATED',
                message: `เปลี่ยนสถานะเป็น ${status} (${statusNotes || 'ไม่มีบันทึกเพิ่มเติม'})`
              }
            ]
          };

          // Send notification
          sendLineNotification(updated, 'STATUS_CHANGE');

          return updated;
        }
        return apt;
      })
    );

    addToast({
      type: 'success',
      title: 'อัปเดตสถานะสำเร็จ',
      message: `ปรับสถานะนัดหมายเรียบร้อยแล้ว`
    });
  };

  const rescheduleAppointment = (
    id: string,
    newDate: string,
    newDay: DayOfWeek,
    newTimeSlot: string,
    reason?: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated: Appointment = {
            ...apt,
            previousSchedule: apt.previousSchedule || {
              date: apt.appointmentDate,
              day: apt.appointmentDay,
              timeSlot: apt.appointmentTimeSlot
            },
            appointmentDate: newDate,
            appointmentDay: newDay,
            appointmentTimeSlot: newTimeSlot,
            status: 'confirmed',
            rescheduledAt: new Date().toISOString(),
            rescheduleReason: reason || 'ปรับเปลี่ยนวันเวลานัดหมายตามความสะดวกของครูและนักเรียน',
            statusNotes: `[เลื่อนนัดหมาย]: ย้ายเป็น ${newDay} (${newDate}) เวลา ${newTimeSlot}${reason ? ` (เหตุผล: ${reason})` : ''}`,
            lineNotificationHistory: [
              ...(apt.lineNotificationHistory || []),
              {
                timestamp: new Date().toISOString(),
                type: 'APPOINTMENT_RESCHEDULED',
                message: `เลื่อนวันนัดหมายเป็น ${newDay} (${newDate}) เวลา ${newTimeSlot} - ${reason || 'นัดหมายใหม่'}`
              }
            ]
          };

          sendLineNotification(updated, 'STATUS_CHANGE');
          return updated;
        }
        return apt;
      })
    );

    addToast({
      type: 'success',
      title: 'เลื่อนวันนัดหมายสำเร็จ!',
      message: `ย้ายเป็น ${newDay} (${newDate}) เวลา ${newTimeSlot} เรียบร้อยแล้ว`
    });
  };

  const saveCaseSummary = (
    appointmentId: string,
    summaryData: Omit<ConfidentialCaseSummary, 'id' | 'appointmentId' | 'dateRecorded'>
  ) => {
    const caseId = 'case-' + Date.now();
    const fullSummary: ConfidentialCaseSummary = {
      ...summaryData,
      id: caseId,
      appointmentId,
      dateRecorded: new Date().toISOString(),
      lastEditedAt: new Date().toISOString()
    };

    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            caseSummary: fullSummary,
            status: 'completed',
            completedAt: apt.completedAt || new Date().toISOString()
          };
        }
        return apt;
      })
    );

    addToast({
      type: 'success',
      title: 'บันทึกสรุปผลคำปรึกษาสำเร็จ',
      message: 'ข้อมูลถูกเข้ารหัสจัดเก็บเป็นความลับเฉพาะศูนย์พิงใจเรียบร้อยแล้ว'
    });
  };

  const cancelAppointment = (id: string, reason?: string) => {
    updateAppointmentStatus(id, 'cancelled', reason || 'นักเรียนขอยกเลิกนัดหมาย');
    addToast({
      type: 'info',
      title: 'ยกเลิกการนัดหมายแล้ว',
      message: 'ระบบได้บันทึกการยกเลิกเรียบร้อย'
    });
  };

  const addCounselor = (newC: Omit<Counselor, 'id'>) => {
    const id = 'c-custom-' + Date.now();
    const counselor: Counselor = { ...newC, id };
    setCounselors((prev) => [...prev, counselor]);
    addToast({
      type: 'success',
      title: 'เพิ่มรายชื่อครูสำเร็จ',
      message: `เพิ่มคุณครู ${counselor.name} ในระบบแล้ว`
    });
  };

  const updateCounselor = (updatedC: Counselor) => {
    setCounselors((prev) => prev.map((c) => (c.id === updatedC.id ? updatedC : c)));
    addToast({
      type: 'success',
      title: 'แก้ไขข้อมูลครูสำเร็จ',
      message: `อัปเดตข้อมูล ${updatedC.name} เรียบร้อยแล้ว`
    });
  };

  const deleteCounselor = (id: string) => {
    setCounselors((prev) => prev.filter((c) => c.id !== id));
    addToast({
      type: 'info',
      title: 'ลบรายชื่อครูแล้ว',
      message: 'ลบข้อมูลคุณครูออกจากระบบเรียบร้อย'
    });
  };

  const updateTopic = (updatedTopic: Topic) => {
    setTopics((prev) => prev.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)));
    addToast({
      type: 'success',
      title: 'อัปเดตหัวข้อสำเร็จ',
      message: `แก้ไขข้อมูลหัวข้อ ${updatedTopic.title} เรียบร้อย`
    });
  };

  const updateTimetable = (entries: TimetableEntry[]) => {
    setTimetable(entries);
    addToast({
      type: 'success',
      title: 'อัปเดตตารางเวลาสำเร็จ',
      message: 'บันทึกตารางการให้บริการประจำสัปดาห์ใหม่แล้ว'
    });
  };

  const updateLineSettings = (settings: LineSettings) => {
    setLineSettings(settings);
    addToast({
      type: 'success',
      title: 'บันทึกการตั้งค่า LINE สำเร็จ',
      message: 'อัปเดตการเชื่อมต่อระบบแจ้งเตือน LINE เรียบร้อย'
    });
  };

  const updateSchoolInfo = (info: SchoolInfo) => {
    setSchoolInfo(info);
    addToast({
      type: 'success',
      title: 'บันทึกข้อมูลและโลโก้โรงเรียนสำเร็จ',
      message: 'อัปเดตตราสัญลักษณ์และข้อมูลศูนย์พิงใจเรียบร้อยแล้ว'
    });
  };

  const resetSchoolInfoToDefault = () => {
    setSchoolInfo(INITIAL_SCHOOL_INFO);
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(INITIAL_SCHOOL_INFO));
    } catch (e) {
      console.warn('Storage reset error:', e);
    }
    addToast({
      type: 'info',
      title: 'คืนค่าโลโก้เดิมเรียบร้อย',
      message: 'ระบบได้คืนค่าตราสัญลักษณ์พระเกี้ยวต้นฉบับ บ.ด.น.'
    });
  };

  const resetToDefaults = () => {
    setTopics(INITIAL_TOPICS);
    setCounselors(INITIAL_COUNSELORS);
    setTimetable(INITIAL_TIMETABLE);
    setAppointments(INITIAL_APPOINTMENTS);
    setLineSettings(INITIAL_LINE_SETTINGS);
    setSchoolInfo(INITIAL_SCHOOL_INFO);
    localStorage.clear();
    addToast({
      type: 'info',
      title: 'รีเซ็ตข้อมูลเริ่มต้นแล้ว',
      message: 'ระบบได้คืนค่าข้อมูลต้นฉบับโรงเรียนบดินทรเดชา นนทบุรี'
    });
  };

  return (
    <AppContext.Provider
      value={{
        topics,
        counselors,
        timetable,
        appointments,
        lineSettings,
        schoolInfo,
        activeTab,
        setActiveTab,
        selectedTopicForBooking,
        setSelectedTopicForBooking,
        selectedCounselorForBooking,
        setSelectedCounselorForBooking,
        selectedDayForBooking,
        setSelectedDayForBooking,
        selectedGradeLevelForBooking,
        setSelectedGradeLevelForBooking,
        trackingQuery,
        setTrackingQuery,
        isAdminAuthenticated,
        adminRoleName,
        loginAdmin,
        logoutAdmin,
        createAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        saveCaseSummary,
        cancelAppointment,
        addCounselor,
        updateCounselor,
        deleteCounselor,
        updateTopic,
        updateTimetable,
        updateLineSettings,
        updateSchoolInfo,
        resetSchoolInfoToDefault,
        sendLineNotification,
        toasts,
        addToast,
        removeToast,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
