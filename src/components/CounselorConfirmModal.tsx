import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolEmblem } from './SchoolEmblem';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Building,
  Sparkles,
  Check,
  Copy,
  AlertTriangle,
  ArrowRight,
  Lock,
  HeartHandshake,
  Send,
  X,
  PlayCircle,
  RotateCcw,
  CalendarDays,
  FileText,
  AlertCircle,
  ExternalLink,
  Phone,
  BookmarkCheck
} from 'lucide-react';
import { Appointment, TopicId, DayOfWeek, AppointmentStatus } from '../types';

interface CounselorConfirmModalProps {
  confirmCode: string;
  initialAction?: 'confirm' | 'in_session' | 'complete' | 'reschedule';
  onClose: () => void;
}

export const CounselorConfirmModal: React.FC<CounselorConfirmModalProps> = ({
  confirmCode,
  initialAction = 'confirm',
  onClose
}) => {
  const {
    appointments,
    updateAppointmentStatus,
    rescheduleAppointment,
    saveCaseSummary,
    topics,
    schoolInfo,
    addToast,
    setActiveTab
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'confirm' | 'in_session' | 'complete' | 'reschedule'>(initialAction);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  // Form states - Confirm
  const [teacherNote, setTeacherNote] = useState('');
  const [meetingVenue, setMeetingVenue] = useState('ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2');
  
  // Form states - In Session
  const [inSessionNote, setInSessionNote] = useState('');

  // Form states - Complete Case
  const [keyIssues, setKeyIssues] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'watch' | 'critical'>('normal');

  // Form states - Reschedule
  const [newDate, setNewDate] = useState('');
  const [newDay, setNewDay] = useState<DayOfWeek>('จันทร์');
  const [newTimeSlot, setNewTimeSlot] = useState('11.10 - 12.00 น.');
  const [reschedulePresetReason, setReschedulePresetReason] = useState('ครูติดภารกิจประชุม/อบรมวิชาการ');
  const [customRescheduleReason, setCustomRescheduleReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  useEffect(() => {
    if (confirmCode) {
      const codeClean = confirmCode.trim().toUpperCase();
      const found = appointments.find(
        (a) => a.trackingCode.toUpperCase() === codeClean || a.id === confirmCode
      );
      if (found) {
        setAppointment(found);
        if (found.statusNotes) {
          setTeacherNote(found.statusNotes);
        }
        // Initialize reschedule fields with appointment data
        setNewDate(found.appointmentDate || '');
        setNewDay(found.appointmentDay || 'จันทร์');
        setNewTimeSlot(found.appointmentTimeSlot || '11.10 - 12.00 น.');

        // Initialize case summary fields if already exist
        if (found.caseSummary) {
          setKeyIssues(found.caseSummary.keyIssues || '');
          setSessionSummary(found.caseSummary.sessionSummary || '');
          setActionPlan(found.caseSummary.actionPlan || '');
          setFollowUpNeeded(found.caseSummary.followUpNeeded || false);
          setFollowUpDate(found.caseSummary.followUpDate || '');
          setUrgencyLevel(found.caseSummary.urgencyLevel || 'normal');
        }
      }
    }
  }, [confirmCode, appointments]);

  useEffect(() => {
    if (initialAction) {
      setActiveSubTab(initialAction);
    }
  }, [initialAction]);

  if (!appointment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ไม่พบข้อมูลรหัสนัดหมาย</h3>
            <p className="text-xs text-slate-500 mt-1">
              รหัส <span className="font-mono font-bold text-slate-800">{confirmCode}</span> อาจไม่ถูกต้องหรือถูกลบออกจากระบบแล้ว
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </div>
    );
  }

  const topicObj = topics.find((t) => t.id === appointment.topicId);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const getActionUrl = (action: string) => {
    return `${origin}${pathname}?action=${action}&code=${appointment.trackingCode}`;
  };

  const handleCopyLink = (actionType: string, label: string) => {
    const url = getActionUrl(actionType);
    navigator.clipboard.writeText(url);
    setCopiedLinkType(actionType);
    setTimeout(() => setCopiedLinkType(null), 2500);
    addToast({
      type: 'info',
      title: `คัดลอก${label}สำเร็จ`,
      message: `คัดลอกลิงก์สำหรับเคส ${appointment.trackingCode} เรียบร้อยแล้ว`
    });
  };

  // Action: Confirm
  const handleConfirm = () => {
    setIsSubmitting(true);
    const finalNote = teacherNote.trim()
      ? `[ครูยืนยันนัด]: ${teacherNote.trim()} (สถานที่: ${meetingVenue})`
      : `ครูที่ปรึกษายืนยันการรับนัดหมายเรียบร้อยแล้ว (สถานที่: ${meetingVenue})`;

    updateAppointmentStatus(appointment.id, 'confirmed', finalNote);
    setIsSubmitting(false);
    addToast({
      type: 'success',
      title: 'ยืนยันวันนัดหมายสำเร็จ!',
      message: `บันทึกการยืนยันนัดหมายสำหรับเคส ${appointment.trackingCode} เรียบร้อยแล้ว`
    });
  };

  // Action: In Session (กำลังปรึกษา)
  const handleInSession = () => {
    setIsSubmitting(true);
    const note = inSessionNote.trim() || 'เริ่มเข้าสู่ช่วงการพูดคุยให้คำปรึกษา ณ ศูนย์พิงใจ';
    updateAppointmentStatus(appointment.id, 'in_session', `[กำลังปรึกษา]: ${note}`);
    setIsSubmitting(false);
    addToast({
      type: 'success',
      title: 'ปรับสถานะเป็น "กำลังให้คำปรึกษา" แล้ว',
      message: `อัปเดตสถานะสำหรับเคส ${appointment.trackingCode} เรียบร้อยแล้ว`
    });
  };

  // Action: Complete Case (เสร็จสิ้น)
  const handleComplete = () => {
    setIsSubmitting(true);
    saveCaseSummary(appointment.id, {
      counselorId: appointment.counselorId,
      counselorName: appointment.counselorName,
      keyIssues: keyIssues.trim() || 'รับฟัง ให้คำปรึกษา และให้กำลังใจแก่นักเรียน',
      sessionSummary: sessionSummary.trim() || 'นักเรียนมีสีหน้าและสภาพจิตใจที่ผ่อนคลายขึ้นหลังได้รับการรับฟัง',
      actionPlan: actionPlan.trim() || 'ติดตามผลการปรับตัวตามระยะเวลาที่กำหนด',
      followUpNeeded,
      followUpDate: followUpNeeded ? followUpDate : undefined,
      urgencyLevel,
      isLocked: true
    });
    setIsSubmitting(false);
    addToast({
      type: 'success',
      title: 'บันทึกเสร็จสิ้นการให้คำปรึกษาแล้ว!',
      message: `บันทึกสรุปผลและปิดเคส ${appointment.trackingCode} เรียบร้อยแล้ว`
    });
  };

  // Action: Reschedule (เลื่อนนัด)
  const handleReschedule = () => {
    if (!newDate) {
      addToast({
        type: 'error',
        title: 'กรุณาเลือกวันที่ใหม่',
        message: 'โปรดระบุวันที่ต้องการเลื่อนนัดหมาย'
      });
      return;
    }

    setIsSubmitting(true);
    const finalReason = reschedulePresetReason === 'อื่นๆ' 
      ? (customRescheduleReason.trim() || 'ปรับเปลี่ยนวันเวลานัดหมายใหม่')
      : reschedulePresetReason;

    rescheduleAppointment(appointment.id, newDate, newDay, newTimeSlot, finalReason);
    setIsSubmitting(false);
  };

  // Auto calculate day of week when date changes
  const handleDateChange = (val: string) => {
    setNewDate(val);
    if (val) {
      const d = new Date(val);
      const dayNum = d.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri
      const daysMap: Record<number, DayOfWeek> = {
        1: 'จันทร์',
        2: 'อังคาร',
        3: 'พุธ',
        4: 'พฤหัสบดี',
        5: 'ศุกร์'
      };
      if (daysMap[dayNum]) {
        setNewDay(daysMap[dayNum]);
      }
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ยืนยันแล้ว
          </span>
        );
      case 'in_session':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1 animate-pulse">
            <PlayCircle className="w-3 h-3 text-sky-600" />
            กำลังรับคำปรึกษา
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
            <BookmarkCheck className="w-3 h-3 text-purple-600" />
            ให้คำปรึกษาเรียบร้อย
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            ยกเลิกแล้ว
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            รอการยืนยัน
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Modal Header with Bodindecha Colors */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-pink-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-white border border-white/40 shadow-xs overflow-hidden flex items-center justify-center">
              <SchoolEmblem size="sm" shape="rounded" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-pink-500/30 text-pink-200 border border-pink-400/30 px-2 py-0.2 rounded-full font-bold">
                  {schoolInfo.shortName}
                </span>
                <span className="text-[11px] text-sky-200">ระบบจัดการคำปรึกษาสำหรับครู</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                ศูนย์พิงใจ บ.ด.น. - จัดการนัดหมาย
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appointment Context Bar */}
        <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">รหัสเคส:</span>
            <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded-md border border-slate-300">
              {appointment.trackingCode}
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-medium hidden sm:inline">
              ครู{appointment.counselorName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">สถานะปัจจุบัน:</span>
            {getStatusBadge(appointment.status)}
          </div>
        </div>

        {/* Action Tabs Header */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-5 pt-3">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setActiveSubTab('confirm')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'confirm'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              1. ยืนยันนัดหมาย
            </button>

            <button
              onClick={() => setActiveSubTab('in_session')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'in_session'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              2. กำลังปรึกษา
            </button>

            <button
              onClick={() => setActiveSubTab('complete')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'complete'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              3. เสร็จสิ้นการปรึกษา
            </button>

            <button
              onClick={() => setActiveSubTab('reschedule')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'reschedule'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              4. เมนูเลื่อนนัด
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Summary Information Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-lg border shadow-2xs"
                style={{
                  backgroundColor: topicObj?.bgColor || '#f1f5f9',
                  color: topicObj?.color || '#0f172a',
                  borderColor: topicObj?.borderColor || '#cbd5e1'
                }}
              >
                หัวข้อ: {topicObj?.title || appointment.topicId}
              </span>

              <span className="text-[11px] text-slate-500 font-medium">
                รูปแบบ: {appointment.meetingFormat === 'in_person' ? 'พบตัวจริงที่ศูนย์พิงใจ' : appointment.meetingFormat === 'online' ? 'ออนไลน์' : 'โทรศัพท์'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block">ผู้ขอรับคำปรึกษา:</span>
                  <span className="font-semibold text-slate-900">
                    {appointment.studentName}{' '}
                    {appointment.isAnonymous && (
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-semibold">
                        (นามสมมุติ)
                      </span>
                    )}
                  </span>
                  <div className="text-[11px] text-slate-500">
                    ชั้น {appointment.studentGrade} {appointment.studentRoom ? `ห้อง ${appointment.studentRoom}` : ''} | โทร: {appointment.contactPhone || '-'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 block">วันและเวลานัดหมายปัจจุบัน:</span>
                  <span className="font-bold text-slate-900">
                    {appointment.appointmentDay} ({appointment.appointmentDate})
                  </span>
                  <div className="text-[11px] text-pink-700 font-semibold">
                    {appointment.appointmentTimeSlot}
                  </div>
                </div>
              </div>
            </div>

            {/* Brief Issue */}
            {appointment.briefIssueDescription && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  ประเด็นความกังวลเบื้องต้นจากนักเรียน:
                </span>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic mt-1">
                  "{appointment.briefIssueDescription}"
                </p>
              </div>
            )}

            {/* Previous Reschedule Record */}
            {appointment.rescheduledAt && appointment.previousSchedule && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <CalendarDays className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">เคสนี้เคยมีการเลื่อนนัดหมาย:</span> เดิมนัดไว้ {appointment.previousSchedule.day} ({appointment.previousSchedule.date}) เวลา {appointment.previousSchedule.timeSlot}
                  {appointment.rescheduleReason && (
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      เหตุผล: {appointment.rescheduleReason}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: CONFIRM TAB */}
          {activeSubTab === 'confirm' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-xl border border-emerald-200 bg-emerald-50/20">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                1. ยืนยันการรับนัดหมาย (Counselor Confirmation)
              </div>
              <p className="text-xs text-slate-600">
                เมื่อกดยืนยัน ระบบจะปรับสถานะนัดหมายเป็น <strong className="text-emerald-700">"ยืนยันแล้ว"</strong> และแจ้งเตือนให้นักเรียนทราบทันที
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานที่นัดพบ:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {[
                    'ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2',
                    'ห้องแนะแนว อาคาร 2 ชั้น 1',
                    'อาคาร 4 ลานกิจกรรมชั้นล่าง',
                    'Google Meet (ออนไลน์)'
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setMeetingVenue(loc)}
                      className={`px-3 py-1.5 rounded-lg text-xs text-left border transition-all cursor-pointer ${
                        meetingVenue === loc
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      📍 {loc}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={meetingVenue}
                  onChange={(e) => setMeetingVenue(e.target.value)}
                  placeholder="หรือพิมพ์สถานที่นัดพบอื่นๆ..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อความนัดแนะเพิ่มเติมถึงนักเรียน (ถ้ามี):
                </label>
                <input
                  type="text"
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  placeholder="เช่น ครูพร้อมรับฟังและรอพบหนูตามเวลานัดนะคะ สบายใจได้เลยค่ะ"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirm}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'กำลังบันทึก...' : 'กดยืนยันรับนัดหมายทันที (Confirm)'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IN SESSION TAB */}
          {activeSubTab === 'in_session' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-xl border border-sky-200 bg-sky-50/20">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                <PlayCircle className="w-4 h-4 text-sky-600" />
                2. เริ่มให้คำปรึกษา (กำลังปรึกษา / In Session)
              </div>
              <p className="text-xs text-slate-600">
                กดเมื่อนักเรียนมาถึงห้องศูนย์พิงใจ หรือเริ่มการให้คำปรึกษา เพื่อเปลี่ยนสถานะเป็น <strong className="text-sky-700">"กำลังรับคำปรึกษา"</strong>
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  บันทึกเบื้องต้นระหว่างเริ่มเซสชัน (ถ้ามี):
                </label>
                <input
                  type="text"
                  value={inSessionNote}
                  onChange={(e) => setInSessionNote(e.target.value)}
                  placeholder="เช่น เริ่มการพูดคุย บรรยากาศเป็นกันเอง ณ ห้องศูนย์พิงใจ"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleInSession}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก: เริ่มให้คำปรึกษาแล้ว (In Session)'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE CASE TAB */}
          {activeSubTab === 'complete' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-xl border border-purple-200 bg-purple-50/20">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <BookmarkCheck className="w-4 h-4 text-purple-600" />
                3. บันทึกเสร็จสิ้นการให้คำปรึกษา (Completed Case)
              </div>
              <p className="text-xs text-slate-600">
                บันทึกสรุปผลและปรับสถานะเป็น <strong className="text-purple-700">"ให้คำปรึกษาเรียบร้อย"</strong> โดยข้อมูลจะถูกเข้ารหัสจัดเก็บเป็นความลับเฉพาะศูนย์พิงใจ
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเด็นปัญหาหลักที่พบ:
                </label>
                <input
                  type="text"
                  value={keyIssues}
                  onChange={(e) => setKeyIssues(e.target.value)}
                  placeholder="เช่น ความเครียดเรื่องการสอบเข้ามหาวิทยาลัย, ความสัมพันธ์กับเพื่อนในห้อง"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สรุปผลการให้คำปรึกษา & แนวทางช่วยเหลือ:
                </label>
                <textarea
                  rows={2}
                  value={sessionSummary}
                  onChange={(e) => setSessionSummary(e.target.value)}
                  placeholder="เช่น ได้รับฟังและสะท้อนความรู้สึก นักเรียนเริ่มมองเห็นแนวทางจัดการเวลาได้ดีขึ้น"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ระดับความเร่งด่วน/เฝ้าระวัง:
                  </label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="normal">🟢 ปกติ (รับฟังและให้คำแนะนำทั่วไป)</option>
                    <option value="watch">🟡 เฝ้าระวัง (ติดตามต่อเนื่อง)</option>
                    <option value="critical">🔴 วิกฤติเร่งด่วน (ประสานผู้เชี่ยวชาญ/ผู้ปกครอง)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={followUpNeeded}
                      onChange={(e) => setFollowUpNeeded(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">ต้องการนัดติดตามผลต่อเนื่อง (Follow-up)</span>
                  </label>
                  {followUpNeeded && (
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleComplete}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเสร็จสิ้นการให้คำปรึกษา (Completed)'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RESCHEDULE TAB */}
          {activeSubTab === 'reschedule' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/20">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <CalendarDays className="w-4 h-4 text-amber-600" />
                4. เมนูเลื่อนวันเวลานัดหมาย (Reschedule Menu)
              </div>
              <p className="text-xs text-slate-600">
                หากครูติดภารกิจประชุม อบรม หรือต้องการปรับวันเวลาให้เหมาะสมทั้งสองฝ่าย สามารถเลือกวันเวลานัดหมายใหม่ได้ทันที
              </p>

              {/* Current vs New Comparison */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">วันเวลานัดหมายเดิม:</span>
                  <div className="font-semibold text-slate-800 line-through">
                    {appointment.appointmentDay} ({appointment.appointmentDate})
                  </div>
                  <div className="text-slate-500 line-through text-[11px]">
                    {appointment.appointmentTimeSlot}
                  </div>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                  <span className="text-[10px] text-amber-700 block font-semibold">วันเวลานัดหมายใหม่ที่จะปรับ:</span>
                  <div className="font-bold text-amber-900">
                    {newDay} ({newDate || 'ยังไม่ได้เลือกวันที่'})
                  </div>
                  <div className="text-amber-800 text-[11px] font-semibold">
                    {newTimeSlot}
                  </div>
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลือกวันที่ใหม่:
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันในสัปดาห์:
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="จันทร์">วันจันทร์</option>
                    <option value="อังคาร">วันอังคาร</option>
                    <option value="พุธ">วันพุธ</option>
                    <option value="พฤหัสบดี">วันพฤหัสบดี</option>
                    <option value="ศุกร์">วันศุกร์</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รอบเวลาใหม่:
                  </label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="11.10 - 12.00 น.">11.10 - 12.00 น. (พักกลางวัน ม.ต้น)</option>
                    <option value="12.00 - 12.50 น.">12.00 - 12.50 น. (พักกลางวัน ม.ปลาย)</option>
                    <option value="15.30 - 16.30 น.">15.30 - 16.30 น. (หลังเลิกเรียน)</option>
                    <option value="08.30 - 09.20 น.">08.30 - 09.20 น. (คาบ 1)</option>
                    <option value="09.20 - 10.10 น.">09.20 - 10.10 น. (คาบ 2)</option>
                    <option value="ตามที่ตกลงกัน">ตามที่ตกลงกันเป็นกรณีพิเศษ</option>
                  </select>
                </div>
              </div>

              {/* Reschedule Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เหตุผลการขอเลื่อนนัดหมาย (จะแจ้งให้นักเรียนทราบ):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {[
                    'ครูติดภารกิจประชุม/อบรมวิชาการ',
                    'ตรงกับกิจกรรม/การสอบของโรงเรียน',
                    'นักเรียนติดภารกิจ/สอบเก็บคะแนน',
                    'ปรับตามความสะดวกทั้งสองฝ่าย'
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setReschedulePresetReason(reason);
                        setCustomRescheduleReason('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs text-left border transition-all cursor-pointer ${
                        reschedulePresetReason === reason
                          ? 'bg-amber-100 text-amber-900 border-amber-400 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      • {reason}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={customRescheduleReason}
                  onChange={(e) => {
                    setCustomRescheduleReason(e.target.value);
                    setReschedulePresetReason('อื่นๆ');
                  }}
                  placeholder="หรือพิมพ์ระบุเหตุผลอื่นๆ..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleReschedule}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการเลื่อนวันนัดหมาย (Reschedule & Notify)'}
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Links Generator / Copy Hub */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              ชุดลิงก์ด่วน 4 รายการ (สามารถคัดลอกส่งใน LINE หรือแชทให้ครูกดได้โดยตรง):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleCopyLink('confirm', 'ลิงก์ยืนยันนัด')}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  copiedLinkType === 'confirm'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-50'
                }`}
              >
                <div className="truncate">
                  <span className="font-bold text-emerald-800 block text-[11px]">1. ลิงก์ยืนยันนัดหมาย</span>
                  <span className="text-[10px] text-slate-400 font-mono">?action=confirm</span>
                </div>
                {copiedLinkType === 'confirm' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink('in_session', 'ลิงก์กำลังปรึกษา')}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  copiedLinkType === 'in_session'
                    ? 'bg-sky-100 border-sky-300 text-sky-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-sky-50'
                }`}
              >
                <div className="truncate">
                  <span className="font-bold text-sky-800 block text-[11px]">2. ลิงก์กำลังปรึกษา</span>
                  <span className="text-[10px] text-slate-400 font-mono">?action=in_session</span>
                </div>
                {copiedLinkType === 'in_session' ? (
                  <Check className="w-4 h-4 text-sky-600 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink('complete', 'ลิงก์เสร็จสิ้นการปรึกษา')}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  copiedLinkType === 'complete'
                    ? 'bg-purple-100 border-purple-300 text-purple-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-purple-50'
                }`}
              >
                <div className="truncate">
                  <span className="font-bold text-purple-800 block text-[11px]">3. ลิงก์เสร็จสิ้นการปรึกษา</span>
                  <span className="text-[10px] text-slate-400 font-mono">?action=complete</span>
                </div>
                {copiedLinkType === 'complete' ? (
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink('reschedule', 'ลิงก์เมนูเลื่อนนัด')}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  copiedLinkType === 'reschedule'
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-amber-50'
                }`}
              >
                <div className="truncate">
                  <span className="font-bold text-amber-800 block text-[11px]">4. ลิงก์เมนูเลื่อนนัด</span>
                  <span className="text-[10px] text-slate-400 font-mono">?action=reschedule</span>
                </div>
                {copiedLinkType === 'reschedule' ? (
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveTab('admin');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            ไปที่ระบบจัดการหลังบ้าน (Admin)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
