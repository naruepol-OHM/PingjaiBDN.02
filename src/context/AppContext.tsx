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
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, sanitizeFirestoreData } from '../lib/firebase';
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
  loginAdmin: (passcode: string) => Promise<boolean>;
  logoutAdmin: () => void;

  // Appointment Actions
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'trackingCode' | 'createdAt' | 'status' | 'lineNotificationSent'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, statusNotes?: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string, newDay: DayOfWeek, newTimeSlot: string, reason?: string) => Promise<void>;
  saveCaseSummary: (appointmentId: string, summary: Omit<ConfidentialCaseSummary, 'id' | 'appointmentId' | 'dateRecorded'>) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  bulkDeleteAppointments: (ids: string[]) => Promise<void>;

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

// Fixed Firebase Auth account used for the shared teacher/admin login.
// The admin still only types the school PIN in the UI; that PIN is used
// as the password for this single Firebase Auth user so Firestore rules
// can verify request.auth != null before allowing writes.
const ADMIN_EMAIL = 'admin@bdn-pingjai.local';

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

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminRoleName, setAdminRoleName] = useState<string>('ครูผู้ดูแลระบบศูนย์พิงใจ');

  // Keep isAdminAuthenticated in sync with the real Firebase Auth session
  // (handles page reloads, other tabs, and token expiry correctly).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminAuthenticated(!!user);
      if (user) {
        setAdminRoleName('คณะกรรมการศูนย์พิงใจ บ.ด.น.');
      }
    });
    return () => unsubscribe();
  }, []);

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
        // NOTE: we intentionally do NOT auto-reseed INITIAL_COUNSELORS when
        // the collection is empty anymore. That behaviour used to silently
        // overwrite real admin edits with hardcoded starter data any time
        // the collection was (or briefly appeared) empty. Seeding should
        // only ever be done once, deliberately, via a one-off setup script.
        const loaded: Counselor[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as Counselor);
        });
        setCounselors(loaded);
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
        // See the counselors listener above: no more auto-reseed on empty.
        const loaded: Topic[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as Topic);
        });
        loaded.sort((a, b) => (a.numericId || 0) - (b.numericId || 0));
        setTopics(loaded);
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
        // See the counselors listener above: no more auto-reseed on empty.
        const loaded: TimetableEntry[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as TimetableEntry);
        });
        // Sort Mon -> Fri
        const dayOrder = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
        loaded.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
        setTimetable(loaded);
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
        // See the counselors listener above: no more auto-reseed on empty.
        // This one matters most: silently re-writing INITIAL_APPOINTMENTS
        // (fake demo bookings) over real student appointment data would be
        // a serious data-integrity problem, not just a cosmetic one.
        const loaded: Appointment[] = [];
        snapshot.forEach((d) => {
          loaded.push(d.data() as Appointment);
        });
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAppointments(loaded);
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

  const loginAdmin = async (passcode: string): Promise<boolean> => {
    try {
      // The PIN the teacher types is used as the password for a single
      // shared Firebase Auth account. This gives us a real request.auth
      // token for Firestore rules while keeping the same simple "one PIN"
      // login UX as before.
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, passcode);
      addToast({
        type: 'success',
        title: 'เข้าสู่ระบบหลังบ้านสำเร็จ',
        message: 'ยินดีต้อนรับคณะครูและผู้ดูแลระบบศูนย์พิงใจ'
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'auth/login');
      addToast({
        type: 'error',
        title: 'รหัสผ่านไม่ถูกต้อง',
        message: 'กรุณาตรวจสอบรหัสผ่านสำหรับคุณครูอีกครั้ง'
      });
      return false;
    }
  };

  const logoutAdmin = () => {
    signOut(auth).catch((err) => {
      handleFirestoreError(err, OperationType.GET, 'auth/logout');
    });
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

    const targetUrl =
      lineSettings?.webhookUrl && lineSettings.webhookUrl.trim().startsWith('http')
        ? lineSettings.webhookUrl.trim()
        : 'https://bodinnonpingjai.netlify.app/.netlify/functions/line-webhook';

    const result = await postLineWebhook(targetUrl, payload);
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

    const sanitizedAppointment = sanitizeFirestoreData(newAppointment);

    try {
      await setDoc(doc(db, 'appointments', newId), sanitizedAppointment);
      setAppointments((prev) => [newAppointment, ...prev.filter((a) => a.id !== newId)]);

      addToast({
        type: 'success',
        title: 'บันทึกการนัดหมายสำเร็จ!',
        message: `รหัสติดตามของคุณคือ ${trackingCode} กรุณาจดจำรหัสเพื่อใช้ตรวจสถานะ`,
        duration: 7000
      });

      // Send LINE notification and notify user
      sendLineNotification(newAppointment, 'NEW_BOOKING').then((res) => {
        if (res.success) {
          addToast({
            type: 'success',
            title: 'ส่งการแจ้งเตือนเข้า LINE สำเร็จ',
            message: 'ระบบได้ส่งข้อมูลนัดหมายไปยังกลุ่มคุณครูเรียบร้อยแล้ว',
            duration: 5000
          });
        } else {
          console.warn('Line notification warning:', res.message);
        }
      }).catch((e) => console.warn('Line notification error:', e));

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `appointments/${newId}`);
      // Fallback local update so user is not completely blocked
      setAppointments((prev) => [newAppointment, ...prev]);
      addToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล',
        message: 'ระบบกำลังทำงานในโหมดสำรอง กรุณาแจ้งคุณครูเพื่อตรวจสอบรหัสนัดหมาย'
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

  const deleteAppointment = async (id: string) => {
    const target = appointments.find((a) => a.id === id);
    const trackingCode = target?.trackingCode || id;
    try {
      await deleteDoc(doc(db, 'appointments', id));
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      addToast({
        type: 'success',
        title: 'ลบรายการนัดหมายสำเร็จ',
        message: `ลบข้อมูลนัดหมายรหัส ${trackingCode} ออกจากระบบเรียบร้อยแล้ว`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      addToast({
        type: 'info',
        title: 'ลบข้อมูลในระบบสำเร็จ',
        message: `ลบรหัสนัดหมาย ${trackingCode} เรียบร้อยแล้ว`
      });
    }
  };

  const bulkDeleteAppointments = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        batch.delete(doc(db, 'appointments', id));
      });
      await batch.commit();
      setAppointments((prev) => prev.filter((a) => !ids.includes(a.id)));
      addToast({
        type: 'success',
        title: 'ลบรายการที่เลือกสำเร็จ',
        message: `ลบข้อมูลนัดหมายทั้งหมด ${ids.length} รายการเรียบร้อยแล้ว`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'appointments/bulk');
      setAppointments((prev) => prev.filter((a) => !ids.includes(a.id)));
      addToast({
        type: 'info',
        title: 'ลบข้อมูลในระบบสำเร็จ',
        message: `ลบข้อมูล ${ids.length} รายการเรียบร้อยแล้ว`
      });
    }
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
        deleteAppointment,
        bulkDeleteAppointments,
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
