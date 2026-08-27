import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Lock,
  Calendar,
  Users,
  Layers,
  Clock,
  BellRing,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageCircle,
  Eye,
  Edit,
  Building,
  KeyRound,
  LogOut,
  Sparkles,
  Filter,
  Link as LinkIcon,
  ExternalLink,
  Share2,
  Copy,
  Check,
  CalendarDays,
  PlayCircle,
  BookmarkCheck,
  Download,
  Trash2,
  CheckSquare,
  Square,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { TeacherManager } from './TeacherManager';
import { TopicManager } from './TopicManager';
import { TimetableManager } from './TimetableManager';
import { LineSettingsManager } from './LineSettingsManager';
import { SchoolBrandingManager } from './SchoolBrandingManager';
import { ConfidentialCaseModal } from './ConfidentialCaseModal';
import { CounselorConfirmModal } from '../CounselorConfirmModal';
import { Appointment, AppointmentStatus, TopicId } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminRoleName,
    loginAdmin,
    logoutAdmin,
    appointments,
    topics,
    counselors,
    updateAppointmentStatus,
    deleteAppointment,
    bulkDeleteAppointments,
    addToast
  } = useApp();

  // Admin sub-tabs
  const [adminTab, setAdminTab] = useState<
    'appointments' | 'teachers' | 'topics' | 'timetable' | 'line' | 'branding' | 'cases'
  >('appointments');

  // Login form state
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Filters for appointments
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection & Deletion states
  const [selectedAptIds, setSelectedAptIds] = useState<string[]>([]);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Confidential Modal
  const [activeCaseModalAppointment, setActiveCaseModalAppointment] = useState<Appointment | null>(null);

  // Venue quick edit modal
  const [editingVenueAppointment, setEditingVenueAppointment] = useState<Appointment | null>(null);
  const [venueNoteInput, setVenueNoteInput] = useState('');

  // Counselor Action Hub Link Modal Preview & Copy State
  const [previewActionModal, setPreviewActionModal] = useState<{
    code: string;
    action: 'confirm' | 'in_session' | 'complete' | 'reschedule';
  } | null>(null);
  const [copiedLinkAptId, setCopiedLinkAptId] = useState<string | null>(null);

  const handleCopyCounselorConfirmLink = (apt: Appointment) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const confirmUrl = `${origin}${pathname}?action=confirm&code=${apt.trackingCode}`;
    navigator.clipboard.writeText(confirmUrl);
    setCopiedLinkAptId(apt.id);
    setTimeout(() => setCopiedLinkAptId(null), 2500);
    addToast({
      type: 'info',
      title: 'คัดลอกลิงก์ยืนยันสำหรับครูสำเร็จ',
      message: `คัดลอกลิงก์ยืนยันนัดหมายสำหรับเคส ${apt.trackingCode} เรียบร้อยแล้ว (สามารถส่งใน LINE ให้ครูกดได้ทันที)`
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passcode);
    if (!success) {
      setLoginError(true);
    }
  };

  const handleQuickConfirm = (apt: Appointment) => {
    updateAppointmentStatus(
      apt.id,
      'confirmed',
      apt.statusNotes || 'ยืนยันการนัดหมายแล้ว พบกันที่ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2'
    );
  };

  const handleOpenVenueEditor = (apt: Appointment) => {
    setEditingVenueAppointment(apt);
    setVenueNoteInput(apt.statusNotes || 'ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2');
  };

  const handleSaveVenueNote = () => {
    if (editingVenueAppointment) {
      updateAppointmentStatus(editingVenueAppointment.id, editingVenueAppointment.status, venueNoteInput);
      setEditingVenueAppointment(null);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesTopic = topicFilter === 'all' || apt.topicId === topicFilter;
    const matchesSearch =
      apt.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.counselorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.studentIdNumber && apt.studentIdNumber.includes(searchQuery));
    return matchesStatus && matchesTopic && matchesSearch;
  });

  // Excel Export Handler
  const handleExportExcel = () => {
    if (filteredAppointments.length === 0) {
      addToast({
        type: 'warning',
        title: 'ไม่มีข้อมูลสำหรับส่งออก',
        message: 'ไม่พบรายการนัดหมายตามเงื่อนไขที่เลือก'
      });
      return;
    }

    const dataToExport = filteredAppointments.map((apt, index) => {
      const topicObj = topics.find((t) => t.id === apt.topicId);
      const statusThai =
        apt.status === 'confirmed' ? 'ยืนยันแล้ว' :
        apt.status === 'in_session' ? 'กำลังรับคำปรึกษา' :
        apt.status === 'completed' ? 'เสร็จสิ้นแล้ว' :
        apt.status === 'cancelled' ? 'ยกเลิกแล้ว' : 'รอการยืนยัน';

      const formatThai =
        apt.meetingFormat === 'in_person' ? 'พบตัวจริง' :
        apt.meetingFormat === 'online' ? 'ออนไลน์ (LINE/Call)' : 'โทรศัพท์';

      return {
        'ลำดับ': index + 1,
        'รหัสติดตาม': apt.trackingCode,
        'วันที่ยื่นเรื่อง': new Date(apt.createdAt).toLocaleString('th-TH'),
        'ชื่อ-นามสกุล นักเรียน': apt.studentName,
        'ชื่อเล่น': apt.studentNickname || '-',
        'สถานะการระบุตัวตน': apt.isAnonymous ? 'ใช้นามสมมุติ' : 'ระบุชื่อจริง',
        'ระดับชั้น': apt.studentGrade,
        'ห้อง': apt.studentRoom || '-',
        'เลขประจำตัว': apt.studentIdNumber || '-',
        'เบอร์โทรศัพท์': apt.contactPhone || '-',
        'LINE ID': apt.contactLineId || '-',
        'หัวข้อการปรึกษา': topicObj?.title || apt.topicId,
        'ครูผู้ให้คำปรึกษา': apt.counselorName,
        'วันนัดหมาย': apt.appointmentDay,
        'วันที่นัดหมาย (YYYY-MM-DD)': apt.appointmentDate,
        'ช่วงเวลานัดหมาย': apt.appointmentTimeSlot,
        'รูปแบบการพบ': formatThai,
        'สถานที่นัดพบ': apt.meetingLocation || (apt.meetingFormat === 'in_person' ? 'ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์' : '-'),
        'เรื่องที่ขอปรึกษาโดยย่อ': apt.briefIssueDescription || '-',
        'สถานะนัดหมาย': statusThai,
        'บันทึกสถานที่/ข้อความ': apt.statusNotes || '-',
        'บันทึกผลเคสลับ': apt.caseSummary ? 'มีบันทึก' : 'ยังไม่มี',
        'สรุปผลคำปรึกษา (เคสลับ)': apt.caseSummary?.summaryNotes || '-',
        'การส่งต่อเคส': apt.caseSummary?.referralNeeded ? (apt.caseSummary.referralDepartment || 'ส่งต่อ') : 'ไม่ต้องส่งต่อ',
        'วันที่บันทึกผลเคส': apt.caseSummary?.recordedAt ? new Date(apt.caseSummary.recordedAt).toLocaleString('th-TH') : '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Set readable column widths
    worksheet['!cols'] = [
      { wch: 6 },  // ลำดับ
      { wch: 16 }, // รหัสติดตาม
      { wch: 20 }, // วันที่ยื่นเรื่อง
      { wch: 24 }, // ชื่อนักเรียน
      { wch: 10 }, // ชื่อเล่น
      { wch: 14 }, // นามสมมุติ
      { wch: 10 }, // ชั้น
      { wch: 8 },  // ห้อง
      { wch: 12 }, // เลขประจำตัว
      { wch: 14 }, // เบอร์โทร
      { wch: 14 }, // LINE ID
      { wch: 24 }, // หัวข้อ
      { wch: 24 }, // ครู
      { wch: 10 }, // วัน
      { wch: 16 }, // วันที่
      { wch: 26 }, // ช่วงเวลา
      { wch: 16 }, // รูปแบบ
      { wch: 30 }, // สถานที่
      { wch: 35 }, // เรื่องที่ปรึกษา
      { wch: 14 }, // สถานะ
      { wch: 30 }, // บันทึก
      { wch: 14 }, // เคสลับ
      { wch: 40 }, // สรุปเคส
      { wch: 18 }, // ส่งต่อ
      { wch: 20 }  // วันที่บันทึก
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายการนัดหมายศูนย์พิงใจ');

    const todayStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `รายงานนัดหมาย_ศูนย์พิงใจ_บดน_${todayStr}.xlsx`);

    addToast({
      type: 'success',
      title: 'ส่งออกรายงาน Excel สำเร็จ',
      message: `ดาวน์โหลดไฟล์ รายงานนัดหมาย_ศูนย์พิงใจ_บดน_${todayStr}.xlsx จำนวน ${dataToExport.length} รายการ เรียบร้อยแล้ว`
    });
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedAptIds.length === filteredAppointments.length) {
      setSelectedAptIds([]);
    } else {
      setSelectedAptIds(filteredAppointments.map((a) => a.id));
    }
  };

  const handleToggleSelectApt = (id: string) => {
    setSelectedAptIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete single appointment
  const handleConfirmDeleteSingle = async () => {
    if (!deletingAppointment) return;
    setIsDeleting(true);
    try {
      await deleteAppointment(deletingAppointment.id);
      setSelectedAptIds((prev) => prev.filter((id) => id !== deletingAppointment.id));
      setDeletingAppointment(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete appointments
  const handleConfirmBulkDelete = async () => {
    if (!selectedAptIds.length) return;
    setIsDeleting(true);
    try {
      await bulkDeleteAppointments(selectedAptIds);
      setSelectedAptIds([]);
      setIsBulkDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate Metrics
  const totalCount = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const caseRecordsCount = appointments.filter((a) => !!a.caseSummary).length;

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-xs border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-slate-300" />
          </div>

          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            ระบบความปลอดภัยศูนย์พิงใจ
          </span>

          <h2 className="text-xl font-bold text-slate-900 mt-3 mb-1">
            เข้าสู่ระบบจัดการสำหรับครูและแอดมิน
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-left text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่านสำหรับคุณครู (PIN / Passcode):
              </label>
              <input
                id="admin-passcode-input"
                type="password"
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setLoginError(false);
                }}
                placeholder="กรอกรหัสผ่านเพื่อเข้าสู่ระบบ..."
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-center font-mono"
              />
              {loginError && (
                <p className="text-xs text-rose-600 mt-1 font-medium text-left">
                  * รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง
                </p>
              )}
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-slate-300" />
              เข้าสู่ระบบหลังบ้าน
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            * เฉพาะคณะครูและบุคลากรที่ได้รับมอบหมายดูแลศูนย์พิงใจ บ.ด.น.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Admin Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-md">
              ADMIN CONSOLE
            </span>
            <span className="text-xs text-slate-300">
              ศูนย์พิทักษ์สิทธิ เสรีภาพ และความปลอดภัย
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            ระบบจัดการหลังบ้าน ศูนย์พิงใจ บ.ด.น.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            ผู้ปฏิบัติหน้าที่: <span className="font-semibold text-white">{adminRoleName}</span>
          </p>
        </div>

        <button
          onClick={logoutAdmin}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto border border-slate-700 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          ออกจากระบบครู
        </button>
      </div>

      {/* Metrics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">นัดหมายทั้งหมด</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[10px] text-slate-400">รายการในระบบ</span>
        </div>

        <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-xs text-amber-800 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            รอการยืนยัน (Pending)
          </span>
          <div className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-amber-700">ต้องดำเนินการ</span>
        </div>

        <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ยืนยันแล้ว (Confirmed)
          </span>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{confirmedCount}</div>
          <span className="text-[10px] text-emerald-700">รอนัดหมายเข้าพบ</span>
        </div>

        <div className="bg-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-800 font-semibold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            สรุปเคสลับแล้ว
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{caseRecordsCount}</div>
          <span className="text-[10px] text-slate-600">บันทึกผลเสร็จสิ้น</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1">
        <button
          id="admin-tab-appointments"
          onClick={() => setAdminTab('appointments')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'appointments'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          จัดการนัดหมาย ({appointments.length})
          {pendingCount > 0 && (
            <span className="w-4 h-4 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          id="admin-tab-teachers"
          onClick={() => setAdminTab('teachers')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'teachers'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          แก้ไขรายชื่อครู ({counselors.length})
        </button>

        <button
          id="admin-tab-topics"
          onClick={() => setAdminTab('topics')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'topics'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          แก้ไขหัวข้อ (4 ด้าน)
        </button>

        <button
          id="admin-tab-timetable"
          onClick={() => setAdminTab('timetable')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'timetable'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          แก้ไขตารางเวลา
        </button>

        <button
          id="admin-tab-line"
          onClick={() => setAdminTab('line')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'line'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          แจ้งเตือน LINE & Webhook
        </button>

        <button
          id="admin-tab-branding"
          onClick={() => setAdminTab('branding')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'branding'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          ตั้งค่าโลโก้ & ตราโรงเรียน
        </button>
      </div>

      {/* TAB CONTENT: Appointments Manager */}
      {adminTab === 'appointments' && (
        <div className="space-y-4">
          {/* Filters Bar & Actions Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหารหัส, ชื่อนักเรียน, ครู..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium text-slate-700"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="pending">รอการยืนยัน</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="in_session">กำลังให้คำปรึกษา</option>
                  <option value="completed">เสร็จสิ้นแล้ว</option>
                  <option value="cancelled">ยกเลิกแล้ว</option>
                </select>

                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium text-slate-700"
                >
                  <option value="all">ทุกหัวข้อ</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons: Excel Export & Bulk Delete */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              {selectedAptIds.length > 0 && (
                <button
                  id="admin-bulk-delete-btn"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer animate-fade-in"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบที่เลือก ({selectedAptIds.length})
                </button>
              )}

              <button
                id="admin-export-excel-btn"
                onClick={handleExportExcel}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="ดาวน์โหลดข้อมูลนัดหมายเป็นไฟล์ Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                ส่งออก Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredAppointments.length > 0 &&
                          selectedAptIds.length === filteredAppointments.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded accent-slate-900 cursor-pointer"
                        title="เลือกทั้งหมด"
                      />
                    </th>
                    <th className="py-3 px-3">รหัส / วันที่ยื่น</th>
                    <th className="py-3 px-4">นักเรียน / ชั้น</th>
                    <th className="py-3 px-4">หัวข้อ & วันนัดหมาย</th>
                    <th className="py-3 px-4">ครูที่ปรึกษา</th>
                    <th className="py-3 px-4 text-center">สถานะ</th>
                    <th className="py-3 px-4 text-right">การจัดการ & ผลเคสลับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((apt) => {
                    const topicObj = topics.find((t) => t.id === apt.topicId);
                    const isSelected = selectedAptIds.includes(apt.id);
                    return (
                      <tr
                        key={apt.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-slate-50/90' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectApt(apt.id)}
                            className="rounded accent-slate-900 cursor-pointer"
                          />
                        </td>

                        {/* Tracking Code */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          <div>{apt.trackingCode}</div>
                          <span className="text-[10px] text-slate-400 font-normal font-sans">
                            {new Date(apt.createdAt).toLocaleDateString('th-TH', { dateStyle: 'short' })}
                          </span>
                        </td>

                        {/* Student */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {apt.studentName}
                            {apt.isAnonymous && (
                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                                นามสมมุติ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {apt.studentGrade} {apt.studentRoom ? `(${apt.studentRoom})` : ''} | โทร: {apt.contactPhone}
                          </div>
                        </td>

                        {/* Topic & Appointment Date */}
                        <td className="py-3 px-4">
                          <span
                            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border mb-1"
                            style={{
                              backgroundColor: topicObj?.bgColor,
                              color: topicObj?.color,
                              borderColor: topicObj?.borderColor
                            }}
                          >
                            {topicObj?.title}
                          </span>
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            {apt.appointmentDay} ({apt.appointmentDate})
                            {apt.rescheduledAt && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1 py-0.2 rounded font-bold" title={`เลื่อนนัดเมื่อ: ${apt.rescheduledAt}`}>
                                เลื่อนนัด
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{apt.appointmentTimeSlot}</div>
                        </td>

                        {/* Counselor */}
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {apt.counselorName}
                          <div className="text-[10px] text-slate-500 font-normal">
                            {apt.meetingFormat === 'in_person'
                              ? `พบตัวจริง (${apt.meetingLocation || 'อาคารประชาสัมพันธ์'})`
                              : apt.meetingFormat === 'online'
                              ? 'ออนไลน์'
                              : 'โทรศัพท์'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <select
                            value={apt.status}
                            onChange={(e) =>
                              updateAppointmentStatus(
                                apt.id,
                                e.target.value as AppointmentStatus
                              )
                            }
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : apt.status === 'in_session'
                                ? 'bg-sky-50 text-sky-800 border-sky-300'
                                : apt.status === 'completed'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : apt.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="pending">⏳ รอการยืนยัน</option>
                            <option value="confirmed">✅ ยืนยันแล้ว</option>
                            <option value="in_session">💬 กำลังปรึกษา</option>
                            <option value="completed">🎉 เสร็จสิ้น</option>
                            <option value="cancelled">❌ ยกเลิก</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {apt.status === 'pending' && (
                              <button
                                onClick={() => handleQuickConfirm(apt)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                              >
                                รับนัด ✓
                              </button>
                            )}

                            {/* Reschedule button */}
                            <button
                              id={`reschedule-btn-${apt.id}`}
                              onClick={() => setPreviewActionModal({ code: apt.trackingCode, action: 'reschedule' })}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                              title="เปิดเมนูเลื่อนวันเวลานัดหมาย (Reschedule)"
                            >
                              <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                              <span className="hidden xl:inline">เลื่อนนัด</span>
                            </button>

                            {/* Direct Counselor Confirmation Link / Modal Preview button */}
                            <button
                              id={`counselor-link-btn-${apt.id}`}
                              onClick={() => handleCopyCounselorConfirmLink(apt)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                                copiedLinkAptId === apt.id
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'text-sky-700 hover:text-sky-950 hover:bg-sky-50'
                              }`}
                              title="คัดลอกลิงก์สำหรับครูกดยืนยันนัดหมาย (ส่งผ่าน LINE หรือเปิดดู)"
                            >
                              {copiedLinkAptId === apt.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <LinkIcon className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => setPreviewActionModal({ code: apt.trackingCode, action: 'confirm' })}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                              title="เปิดหน้าต่างจัดการคำปรึกษา 4 ลิงก์สำหรับครู"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {/* Venue / Note button */}
                            <button
                              onClick={() => handleOpenVenueEditor(apt)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                              title="กำหนดสถานที่ / ข้อความถึงนักเรียน"
                            >
                              <Building className="w-3.5 h-3.5" />
                            </button>

                            {/* Confidential Case Note button */}
                            <button
                              id={`case-summary-btn-${apt.id}`}
                              onClick={() => setActiveCaseModalAppointment(apt)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                apt.caseSummary
                                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              title="บันทึกสรุปผลคำปรึกษาแบบลับเฉพาะ"
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              {apt.caseSummary ? 'ดูผลเคสลับ 🔒' : '+ บันทึกเคสลับ'}
                            </button>

                            {/* Delete single appointment button */}
                            <button
                              id={`delete-btn-${apt.id}`}
                              onClick={() => setDeletingAppointment(apt)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="ลบรายการนัดหมายนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredAppointments.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                ไม่พบรายการนัดหมายที่ตรงกับเงื่อนไขการค้นหา
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Teacher Manager */}
      {adminTab === 'teachers' && <TeacherManager />}

      {/* TAB CONTENT: Topic Manager */}
      {adminTab === 'topics' && <TopicManager />}

      {/* TAB CONTENT: Timetable Manager */}
      {adminTab === 'timetable' && <TimetableManager />}

      {/* TAB CONTENT: LINE Settings */}
      {adminTab === 'line' && <LineSettingsManager />}

      {/* TAB CONTENT: School Branding & Logo Settings */}
      {adminTab === 'branding' && <SchoolBrandingManager />}

      {/* Confidential Case Modal Component */}
      {activeCaseModalAppointment && (
        <ConfidentialCaseModal
          appointment={activeCaseModalAppointment}
          onClose={() => setActiveCaseModalAppointment(null)}
        />
      )}

      {/* Counselor Confirm / Action Hub Modal Preview */}
      {previewActionModal && (
        <CounselorConfirmModal
          confirmCode={previewActionModal.code}
          initialAction={previewActionModal.action}
          onClose={() => setPreviewActionModal(null)}
        />
      )}

      {/* Venue / Note Quick Edit Modal */}
      {editingVenueAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              สถานที่นัดพบ / ข้อความแจ้งนักเรียน
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              รหัส {editingVenueAppointment.trackingCode} ({editingVenueAppointment.studentName})
            </p>

            <textarea
              rows={3}
              value={venueNoteInput}
              onChange={(e) => setVenueNoteInput(e.target.value)}
              placeholder="เช่น ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2 หรือ ลิงก์ออนไลน์..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 mb-4"
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingVenueAppointment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveVenueNote}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                บันทึกข้อความ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Appointment Confirmation Modal */}
      {deletingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-rose-100 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              ยืนยันการลบรายการนัดหมาย?
            </h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">รหัสติดตาม:</span>
                <span className="font-mono font-bold text-slate-900">{deletingAppointment.trackingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ชื่อนักเรียน:</span>
                <span className="font-semibold text-slate-900">{deletingAppointment.studentName} ({deletingAppointment.studentGrade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ครูที่ปรึกษา:</span>
                <span className="text-slate-700">{deletingAppointment.counselorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วันเวลานัด:</span>
                <span className="text-slate-700">{deletingAppointment.appointmentDay} ({deletingAppointment.appointmentDate})</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 text-center mb-5">
              ⚠️ คำเตือน: เมื่อลบแล้ว ข้อมูลนัดหมายและบันทึกเคสนี้จะถูกลบออกจากฐานข้อมูลอย่างถาวร
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingAppointment(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteSingle}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <span>กำลังลบ...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    ยืนยันลบรายการ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-rose-100 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              ยืนยันการลบ {selectedAptIds.length} รายการที่เลือก?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              คุณกำลังจะลบข้อมูลการนัดหมายจำนวน <strong className="text-slate-900">{selectedAptIds.length} รายการ</strong> ออกจากฐานข้อมูล
            </p>

            <p className="text-[11px] text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 mb-5">
              ⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลนัดหมายและประวัติทั้งหมดจะถูกลบถาวร
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <span>กำลังลบ ({selectedAptIds.length})...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    ยืนยันลบทั้งหมด {selectedAptIds.length} รายการ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
