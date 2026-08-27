import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
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
import { buildLineNotifyPayload, postLineWebhook } from '../utils/lineNotify';
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
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'trackingCode' | 'createdAt' | 'status' | 'lineNotificationSent'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, statusNotes?: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string, newDay: DayOfWeek, newTimeSlot: string, reason?: string) => Promise<void>;
  saveCaseSummary: (appointmentId: string, summary: Omit<ConfidentialCaseSummary, 'id' | 'appointmentId' | 'dateRecorded'>) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;

  // Admin Data Management
  addCounselor: (counselor: Omit<Counselor, 'id'>) => Promise<void>;
  updateCounselor: (counselor: Counselor) => Promise<void>;
  deleteCounselor: (id: string) => Promise<void>;
  updateTopic: (topic: Topic) => Promise<void>;
  updateTimetable: (timetableEntries: TimetableEntry[]) => Promise<void>;
  updateLineSettings: (settings: LineSettings) => Promise<void>;
  updateSchoolInfo: (info: SchoolInfo) => Promise<void>;
  resetSchoolInfoToDefault: () => Promise<void>;

  // LINE and Real-time Alerts
  sendLineNotification: (appointment: Appointment, actionType: 'NEW_BOOKING' | 'STATUS_CHANGE' | 'REMINDER') => Promise<{ success: boolean; message: string }>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Utilities
  resetToDefaults: () => Promise<void>;
  isDbConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'bdn_pingjai_admin_auth_session';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [counselors, setCounselors] = useState<Counselor[]>(INITIAL_COUNSELORS);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(INITIAL_TIMETABLE);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [lineSettings, setLineSettings] = useState<LineSettings>(INITIAL_LINE_SETTINGS);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(INITIAL_SCHOOL_INFO);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTopicForBooking, setSelectedTopicForBooking] = useState<TopicId | null>(null);
  const [selectedCounselorForBooking, setSelectedCounselorForBooking] = useState<Counselor | null>(null);
  const [selectedDayForBooking, setSelectedDayForBooking] = useState<DayOfWeek | null>(null);
  const [selectedGradeLevelForBooking, setSelectedGradeLevelForBooking] = useState<GradeLevel | null>(null);
  const [trackingQuery, setTrackingQuery] = useState<string>('');

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [adminRoleName, setAdminRoleName] = useState<string>('ครูผู้ดูแลระบบศูนย์พิงใจ');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
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

  // 1. Real-time listener for Counselors / Teachers
  useEffect(() => {
    const counselorsRef = collection(db, 'counselors');
    const unsubscribe = onSnapshot(
      counselorsRef,
      (snapshot) => {
        setIsDbConnected(true);
        if (snapshot.empty) {
          // Auto-seed initial counselors to Firestore
          const batch = writeBatch(db);
          INITIAL_COUNSELORS.forEach((c) => {
            const docRef = doc(db, 'counselors', c.id);
            batch.set(docRef, c);
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'counselors');
          });
        } else {
          const loaded: Counselor[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as Counselor);
          });
          // Sort alphabetically or keep consistent
          setCounselors(loaded);
        }
      },
      (error) => {
        setIsDbConnected(false);
        handleFirestoreError(error, OperationType.LIST, 'counselors');
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Real-time listener for Topics
  useEffect(() => {
    const topicsRef = collection(db, 'topics');
    const unsubscribe = onSnapshot(
      topicsRef,
      (snapshot) => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_TOPICS.forEach((t) => {
            const docRef = doc(db, 'topics', t.id);
            batch.set(docRef, t);
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'topics');
          });
        } else {
          const loaded: Topic[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as Topic);
          });
          loaded.sort((a, b) => (a.numericId || 0) - (b.numericId || 0));
          setTopics(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'topics');
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Real-time listener for Timetable
  useEffect(() => {
    const timetableRef = collection(db, 'timetable');
    const unsubscribe = onSnapshot(
      timetableRef,
      (snapshot) => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_TIMETABLE.forEach((item) => {
            const docRef = doc(db, 'timetable', item.id);
            batch.set(docRef, item);
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'timetable');
          });
        } else {
          const loaded: TimetableEntry[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as TimetableEntry);
          });
          // Sort Mon -> Fri
          const dayOrder = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
          loaded.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
          setTimetable(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'timetable');
      }
    );
    return () => unsubscribe();
  }, []);

  // 4. Real-time listener for Appointments
  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const unsubscribe = onSnapshot(
      appointmentsRef,
      (snapshot) => {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_APPOINTMENTS.forEach((apt) => {
            const docRef = doc(db, 'appointments', apt.id);
            batch.set(docRef, apt);
          });
          batch.commit().catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'appointments');
          });
        } else {
          const loaded: Appointment[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as Appointment);
          });
          loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAppointments(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'appointments');
      }
    );
    return () => unsubscribe();
  }, []);

  // 5. Real-time listener for School Info
  useEffect(() => {
    const schoolInfoDocRef = doc(db, 'settings', 'schoolInfo');
    const unsubscribe = onSnapshot(
      schoolInfoDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSchoolInfo(docSnap.data() as SchoolInfo);
        } else {
          setDoc(schoolInfoDocRef, INITIAL_SCHOOL_INFO).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'settings/schoolInfo');
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/schoolInfo');
      }
    );
    return () => unsubscribe();
  }, []);

  // 6. Real-time listener for LINE Settings
  useEffect(() => {
    const lineSettingsDocRef = doc(db, 'settings', 'lineSettings');
    const unsubscribe = onSnapshot(
      lineSettingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setLineSettings(docSnap.data() as LineSettings);
        } else {
          setDoc(lineSettingsDocRef, INITIAL_LINE_SETTINGS).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, 'settings/lineSettings');
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/lineSettings');
      }
    );
    return () => unsubscribe();
  }, []);

  const loginAdmin = (passcode: string): boolean => {
    if (passcode === 'Bdn@123') {
      setIsAdminAuthenticated(true);
      setAdminRoleName('คณะกรรมการศูนย์พิงใจ บ.ด.น.');
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
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
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
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
    const payload = buildLineNotifyPayload(appointment, actionType, topicObj?.title || appointment.topicId);

    if (!lineSettings.webhookUrl || !lineSettings.webhookUrl.trim().startsWith('http')) {
      return {
        success: false,
        message: 'ยังไม่ได้ตั้งค่า Webhook URL กรุณากรอกและกด "บันทึกการตั้งค่า" ในหน้าตั้งค่า LINE ก่อน'
      };
    }

    const result = await postLineWebhook(lineSettings.webhookUrl, payload);
    return result;
  };

  const createAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'trackingCode' | 'createdAt' | 'status' | 'lineNotificationSent'>
  ): Promise<Appointment> => {
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

    try {
      await setDoc(doc(db, 'appointments', newId), newAppointment);
      sendLineNotification(newAppointment, 'NEW_BOOKING').catch((e) => console.warn('Line notification error:', e));

      addToast({
        type: 'success',
        title: 'บันทึกการนัดหมายสำเร็จ!',
        message: `รหัสติดตามของคุณคือ ${trackingCode} กรุณาจดจำรหัสเพื่อใช้ตรวจสถานะ`,
        duration: 6000
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `appointments/${newId}`);
      addToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาดในการบันทึก',
        message: 'ไม่สามารถบันทึกนัดหมายลงฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
      });
    }

    return newAppointment;
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus, statusNotes?: string) => {
    const targetApt = appointments.find((a) => a.id === id);
    if (!targetApt) return;

    const updatedApt: Appointment = {
      ...targetApt,
      status,
      statusNotes: statusNotes !== undefined ? statusNotes : targetApt.statusNotes,
      confirmedAt: status === 'confirmed' ? new Date().toISOString() : targetApt.confirmedAt,
      completedAt: status === 'completed' ? new Date().toISOString() : targetApt.completedAt,
      lineNotificationHistory: [
        ...(targetApt.lineNotificationHistory || []),
        {
          timestamp: new Date().toISOString(),
          type: 'STATUS_UPDATED',
          message: `เปลี่ยนสถานะเป็น ${status} (${statusNotes || 'ไม่มีบันทึกเพิ่มเติม'})`
        }
      ]
    };

    try {
      await updateDoc(doc(db, 'appointments', id), {
        status: updatedApt.status,
        statusNotes: updatedApt.statusNotes || '',
        confirmedAt: updatedApt.confirmedAt || null,
        completedAt: updatedApt.completedAt || null,
        lineNotificationHistory: updatedApt.lineNotificationHistory
      });

      sendLineNotification(updatedApt, 'STATUS_CHANGE').catch((e) => console.warn('Line notification error:', e));

      addToast({
        type: 'success',
        title: 'อัปเดตสถานะสำเร็จ',
        message: `ปรับสถานะนัดหมายเรียบร้อยแล้ว`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
      addToast({
        type: 'error',
        title: 'ไม่สามารถอัปเดตสถานะได้',
        message: 'เกิดข้อผิดพลาดในการบันทึกสถานะ'
      });
    }
  };

  const rescheduleAppointment = async (
    id: string,
    newDate: string,
    newDay: DayOfWeek,
    newTimeSlot: string,
    reason?: string
  ) => {
    const targetApt = appointments.find((a) => a.id === id);
    if (!targetApt) return;

    const previousSchedule = targetApt.previousSchedule || {
      date: targetApt.appointmentDate,
      day: targetApt.appointmentDay,
      timeSlot: targetApt.appointmentTimeSlot
    };

    const updatePayload = {
      previousSchedule,
      appointmentDate: newDate,
      appointmentDay: newDay,
      appointmentTimeSlot: newTimeSlot,
      status: 'confirmed' as AppointmentStatus,
      rescheduledAt: new Date().toISOString(),
      rescheduleReason: reason || 'ปรับเปลี่ยนวันเวลานัดหมายตามความสะดวกของครูและนักเรียน',
      statusNotes: `[เลื่อนนัดหมาย]: ย้ายเป็น ${newDay} (${newDate}) เวลา ${newTimeSlot}${reason ? ` (เหตุผล: ${reason})` : ''}`,
      lineNotificationHistory: [
        ...(targetApt.lineNotificationHistory || []),
        {
          timestamp: new Date().toISOString(),
          type: 'APPOINTMENT_RESCHEDULED',
          message: `เลื่อนวันนัดหมายเป็น ${newDay} (${newDate}) เวลา ${newTimeSlot} - ${reason || 'นัดหมายใหม่'}`
        }
      ]
    };

    try {
      await updateDoc(doc(db, 'appointments', id), updatePayload);
      const updatedApt = { ...targetApt, ...updatePayload };
      sendLineNotification(updatedApt, 'STATUS_CHANGE').catch((e) => console.warn('Line error:', e));

      addToast({
        type: 'success',
        title: 'เลื่อนวันนัดหมายสำเร็จ!',
        message: `ย้ายเป็น ${newDay} (${newDate}) เวลา ${newTimeSlot} เรียบร้อยแล้ว`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
      addToast({
        type: 'error',
        title: 'เลื่อนนัดหมายไม่สำเร็จ',
        message: 'เกิดข้อผิดพลาดในการบันทึกลงฐานข้อมูล'
      });
    }
  };

  const saveCaseSummary = async (
    appointmentId: string,
    summaryData: Omit<ConfidentialCaseSummary, 'id' | 'appointmentId' | 'dateRecorded'>
  ) => {
    const targetApt = appointments.find((a) => a.id === appointmentId);
    if (!targetApt) return;

    const caseId = 'case-' + Date.now();
    const fullSummary: ConfidentialCaseSummary = {
      ...summaryData,
      id: caseId,
      appointmentId,
      dateRecorded: new Date().toISOString(),
      lastEditedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        caseSummary: fullSummary,
        status: 'completed',
        completedAt: targetApt.completedAt || new Date().toISOString()
      });

      addToast({
        type: 'success',
        title: 'บันทึกสรุปผลคำปรึกษาสำเร็จ',
        message: 'ข้อมูลถูกเข้ารหัสจัดเก็บใน Firebase Firestore เฉพาะศูนย์พิงใจเรียบร้อยแล้ว'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${appointmentId}`);
      addToast({
        type: 'error',
        title: 'บันทึกไม่สำเร็จ',
        message: 'เกิดข้อผิดพลาดในการบันทึกสรุปผล'
      });
    }
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    await updateAppointmentStatus(id, 'cancelled', reason || 'นักเรียนขอยกเลิกนัดหมาย');
    addToast({
      type: 'info',
      title: 'ยกเลิกการนัดหมายแล้ว',
      message: 'ระบบได้บันทึกการยกเลิกเรียบร้อย'
    });
  };

  const addCounselor = async (newC: Omit<Counselor, 'id'>) => {
    const id = 'c-custom-' + Date.now();
    const counselor: Counselor = { ...newC, id };
    try {
      await setDoc(doc(db, 'counselors', id), counselor);
      addToast({
        type: 'success',
        title: 'เพิ่มรายชื่อครูสำเร็จ',
        message: `เพิ่มคุณครู ${counselor.name} ใน Firestore เรียบร้อยแล้ว`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `counselors/${id}`);
      addToast({
        type: 'error',
        title: 'เพิ่มครูไม่สำเร็จ',
        message: 'ไม่สามารถบันทึกข้อมูลครูลงฐานข้อมูลได้'
      });
    }
  };

  const updateCounselor = async (updatedC: Counselor) => {
    try {
      await setDoc(doc(db, 'counselors', updatedC.id), updatedC, { merge: true });
      addToast({
        type: 'success',
        title: 'แก้ไขข้อมูลครูสำเร็จ',
        message: `อัปเดตข้อมูล ${updatedC.name} ใน Firestore เรียบร้อยแล้ว`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `counselors/${updatedC.id}`);
      addToast({
        type: 'error',
        title: 'แก้ไขข้อมูลไม่สำเร็จ',
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
      });
    }
  };

  const deleteCounselor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'counselors', id));
      addToast({
        type: 'info',
        title: 'ลบรายชื่อครูแล้ว',
        message: 'ลบข้อมูลคุณครูออกจาก Firestore เรียบร้อย'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `counselors/${id}`);
      addToast({
        type: 'error',
        title: 'ลบข้อมูลไม่สำเร็จ',
        message: 'เกิดข้อผิดพลาดในการลบข้อมูล'
      });
    }
  };

  const updateTopic = async (updatedTopic: Topic) => {
    try {
      await setDoc(doc(db, 'topics', updatedTopic.id), updatedTopic, { merge: true });
      addToast({
        type: 'success',
        title: 'อัปเดตหัวข้อสำเร็จ',
        message: `แก้ไขข้อมูลหัวข้อ ${updatedTopic.title} ใน Firestore เรียบร้อย`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `topics/${updatedTopic.id}`);
    }
  };

  const updateTimetable = async (entries: TimetableEntry[]) => {
    try {
      const batch = writeBatch(db);
      entries.forEach((item) => {
        batch.set(doc(db, 'timetable', item.id), item, { merge: true });
      });
      await batch.commit();
      addToast({
        type: 'success',
        title: 'อัปเดตตารางเวลาสำเร็จ',
        message: 'บันทึกตารางการให้บริการประจำสัปดาห์ลง Firestore เรียบร้อยแล้ว'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'timetable');
    }
  };

  const updateLineSettings = async (settings: LineSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'lineSettings'), settings, { merge: true });
      addToast({
        type: 'success',
        title: 'บันทึกการตั้งค่า LINE สำเร็จ',
        message: 'อัปเดตการเชื่อมต่อระบบแจ้งเตือน LINE ลง Firestore เรียบร้อย'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/lineSettings');
    }
  };

  const updateSchoolInfo = async (info: SchoolInfo) => {
    try {
      await setDoc(doc(db, 'settings', 'schoolInfo'), info, { merge: true });
      addToast({
        type: 'success',
        title: 'บันทึกข้อมูลและโลโก้โรงเรียนสำเร็จ',
        message: 'อัปเดตตราสัญลักษณ์และข้อมูลศูนย์พิงใจลง Firestore เรียบร้อยแล้ว'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/schoolInfo');
    }
  };

  const resetSchoolInfoToDefault = async () => {
    try {
      await setDoc(doc(db, 'settings', 'schoolInfo'), INITIAL_SCHOOL_INFO);
      addToast({
        type: 'info',
        title: 'คืนค่าโลโก้เดิมเรียบร้อย',
        message: 'ระบบได้คืนค่าตราสัญลักษณ์พระเกี้ยวต้นฉบับ บ.ด.น.'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/schoolInfo');
    }
  };

  const resetToDefaults = async () => {
    try {
      const batch = writeBatch(db);

      // Re-seed topics
      INITIAL_TOPICS.forEach((t) => {
        batch.set(doc(db, 'topics', t.id), t);
      });
      // Re-seed counselors
      INITIAL_COUNSELORS.forEach((c) => {
        batch.set(doc(db, 'counselors', c.id), c);
      });
      // Re-seed timetable
      INITIAL_TIMETABLE.forEach((item) => {
        batch.set(doc(db, 'timetable', item.id), item);
      });
      // Re-seed settings
      batch.set(doc(db, 'settings', 'schoolInfo'), INITIAL_SCHOOL_INFO);
      batch.set(doc(db, 'settings', 'lineSettings'), INITIAL_LINE_SETTINGS);

      await batch.commit();

      addToast({
        type: 'info',
        title: 'รีเซ็ตข้อมูลเริ่มต้นแล้ว',
        message: 'ระบบได้คืนค่าข้อมูลต้นฉบับโรงเรียนบดินทรเดชา นนทบุรี ใน Firestore เรียบร้อย'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'resetToDefaults');
    }
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
        resetToDefaults,
        isDbConnected
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
