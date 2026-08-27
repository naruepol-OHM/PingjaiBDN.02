export type GradeLevel = 'm_junior' | 'm_senior'; // ม.ต้น (ม.1-ม.3) | ม.ปลาย (ม.4-ม.6)

export type TopicId = 'mental_health' | 'studies_future' | 'love_sex_ed' | 'friends_social';

export interface Topic {
  id: TopicId;
  numericId: number;
  title: string;
  shortDescription: string;
  scopeDescription: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
}

export interface Counselor {
  id: string;
  name: string;
  roleTitle?: string; // e.g. ผู้อำนวยการ, รองผู้อำนวยการ, ครูแนะแนว, ครูผู้ชำนาญการ
  topicIds: TopicId[];
  department?: string;
  imageUrl: string;
  bio?: string;
  availableDays?: ('จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์')[];
  phone?: string;
  lineId?: string;
  isActive: boolean;
}

export type DayOfWeek = 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์';

export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  juniorTopicId: TopicId;
  juniorTimeSlot: string; // 11.10 - 12.00 น.
  seniorTopicId: TopicId;
  seniorTimeSlot: string; // 12.00 - 12.50 น.
  notes?: string;
}

export type AppointmentStatus =
  | 'pending' // รอการยืนยัน
  | 'confirmed' // ยืนยันแล้ว
  | 'in_session' // กำลังรับคำปรึกษา
  | 'completed' // ให้คำปรึกษาเรียบร้อย
  | 'cancelled'; // ยกเลิกแล้ว

export interface ConfidentialCaseSummary {
  id: string;
  appointmentId: string;
  counselorId: string;
  counselorName: string;
  dateRecorded: string;
  keyIssues: string; // ปัญหาหลักที่พบ
  sessionSummary: string; // สรุปบทสนทนาและคำปรึกษา
  actionPlan: string; // แผนการช่วยเหลือ/ส่งต่อ
  followUpNeeded: boolean;
  followUpDate?: string;
  urgencyLevel: 'normal' | 'watch' | 'critical'; // ปกติ | เฝ้าระวัง | วิกฤติเร่งด่วน
  mentalHealthScore?: number; // 1-10
  isLocked: boolean; // ล็อกแบบลับเฉพาะ
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface Appointment {
  id: string;
  trackingCode: string; // e.g. BDN-2608-9842
  createdAt: string;
  studentName: string;
  studentNickname?: string;
  isAnonymous: boolean; // ใช้นามสมมุติ/ปกปิดชื่อ
  studentGrade: string; // ม.1 - ม.6
  studentRoom?: string; // ห้อง เช่น ม.3/4
  studentIdNumber?: string; // เลขประจำตัวนักเรียน
  contactPhone: string;
  contactLineId?: string;
  topicId: TopicId;
  counselorId: string;
  counselorName: string;
  gradeLevel: GradeLevel;
  appointmentDate: string; // YYYY-MM-DD
  appointmentDay: DayOfWeek;
  appointmentTimeSlot: string;
  meetingFormat: 'in_person' | 'online' | 'phone'; // พบตัวจริงที่ห้องศูนย์พิงใจ / ออนไลน์ / โทรศัพท์
  meetingLocation?: string; // สถานที่นัดพบ เช่น ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์ หรือสถานที่ที่นักเรียนเลือก
  briefIssueDescription: string; // รายละเอียดเบื้องต้น
  status: AppointmentStatus;
  statusNotes?: string; // บันทึกแจ้งนักเรียน เช่น "พบกันที่ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2"
  confirmedAt?: string;
  completedAt?: string;
  rescheduledAt?: string;
  rescheduleReason?: string;
  previousSchedule?: {
    date: string;
    day: DayOfWeek;
    timeSlot: string;
  };
  caseSummary?: ConfidentialCaseSummary;
  lineNotificationSent: boolean;
  lineNotificationHistory?: {
    timestamp: string;
    type: string;
    message: string;
  }[];
}

export interface LineSettings {
  webhookUrl: string;
  lineNotifyToken: string;
  enableStudentAlert: boolean;
  enableTeacherAlert: boolean;
  autoSendOnBooking: boolean;
  autoSendOnStatusChange: boolean;
}

export interface SchoolInfo {
  schoolName: string;
  centerName: string;
  shortName: string;
  slogan: string;
  location: string;
  logoUrl?: string;
  customLogoType?: 'vector' | 'image';
  logoShape?: 'circle' | 'rounded' | 'original'; // วงกลม | สี่เหลี่ยมมน | ต้นฉบับ
  logoFit?: 'contain' | 'cover'; // พอดีกรอบ | เติมเต็มกรอบ
  logoPadding?: 'none' | 'small' | 'medium'; // ระยะขอบใน
  emergencyHotlines: {
    name: string;
    number: string;
    description: string;
  }[];
}
