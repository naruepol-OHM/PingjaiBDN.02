import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  Clock,
  MessageCircle,
  AlertCircle,
  Building,
  Phone,
  User,
  Calendar,
  XCircle,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  BellRing,
  Send,
  Printer,
  Loader2
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const TrackingView: React.FC = () => {
  const {
    appointments,
    trackingQuery,
    setTrackingQuery,
    cancelAppointment,
    topics,
    sendLineNotification,
    addToast
  } = useApp();

  const [searchCode, setSearchCode] = useState(trackingQuery || '');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [messageToTeacher, setMessageToTeacher] = useState('');
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  const performSearch = useCallback(async (queryStr: string, showToastOnNotFound = false) => {
    const q = queryStr.trim().toUpperCase();
    if (!q) return;

    setIsSearching(true);

    // 1. Check in-memory appointments
    const foundInMemory = appointments.find(
      (a) =>
        a.trackingCode.toUpperCase().includes(q) ||
        (a.studentIdNumber && a.studentIdNumber.includes(q)) ||
        a.contactPhone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        a.id === q
    );

    if (foundInMemory) {
      setSelectedAppointment(foundInMemory);
      setIsSearching(false);
      return;
    }

    // 2. Direct Firestore fallback query (especially useful when opened directly on mobile from LINE)
    try {
      // Query by exact trackingCode
      const trackingQ = query(
        collection(db, 'appointments'),
        where('trackingCode', '==', q)
      );
      const snapshot = await getDocs(trackingQ);

      if (!snapshot.empty) {
        const aptDoc = snapshot.docs[0];
        setSelectedAppointment(aptDoc.data() as Appointment);
        setIsSearching(false);
        return;
      }

      // Try by document ID
      const directDoc = await getDoc(doc(db, 'appointments', q));
      if (directDoc.exists()) {
        setSelectedAppointment(directDoc.data() as Appointment);
        setIsSearching(false);
        return;
      }
    } catch (err) {
      console.warn('Firestore tracking search error:', err);
    }

    // If still not found
    setIsSearching(false);
    if (showToastOnNotFound) {
      setSelectedAppointment(null);
      addToast({
        type: 'warning',
        title: 'ไม่พบข้อมูลการนัดหมาย',
        message: `ไม่พบรหัสนัดหมาย "${queryStr}" กรุณาตรวจสอบรหัสอีกครั้ง`
      });
    }
  }, [appointments, addToast]);

  // Auto-search if query exists in context or from URL
  useEffect(() => {
    if (trackingQuery) {
      setSearchCode(trackingQuery);
      performSearch(trackingQuery, false);
    } else if (appointments.length > 0 && !selectedAppointment) {
      // Default to first appointment for convenience
      setSelectedAppointment(appointments[0]);
    }
  }, [trackingQuery, appointments, performSearch, selectedAppointment]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchCode, true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCancelSubmit = () => {
    if (selectedAppointment) {
      cancelAppointment(selectedAppointment.id, cancelReason);
      setCancelModalOpen(false);
      setCancelReason('');
    }
  };

  const handleSendMessageToTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageToTeacher.trim() && selectedAppointment) {
      sendLineNotification(selectedAppointment, 'STATUS_CHANGE');
      setMessageSentSuccess(true);
      setTimeout(() => {
        setMessageSentSuccess(false);
        setMessageToTeacher('');
      }, 3000);
      addToast({
        type: 'success',
        title: 'ส่งข้อความถึงคุณครูแล้ว',
        message: 'ระบบได้ส่งข้อความเพิ่มเติมไปยังครูผู้ให้คำปรึกษา'
      });
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'รอครูยืนยันการนัดหมาย',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
          stepIndex: 1
        };
      case 'confirmed':
        return {
          label: 'ยืนยันการนัดหมายแล้ว',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          stepIndex: 2
        };
      case 'in_session':
        return {
          label: 'กำลังเข้ารับคำปรึกษา',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: MessageCircle,
          stepIndex: 3
        };
      case 'completed':
        return {
          label: 'ให้คำปรึกษาเสร็จสิ้น',
          color: 'bg-slate-900 text-white border-slate-900',
          icon: CheckCircle2,
          stepIndex: 4
        };
      case 'cancelled':
        return {
          label: 'ยกเลิกการนัดหมาย',
          color: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: XCircle,
          stepIndex: 0
        };
    }
  };

  const activeTopic = selectedAppointment
    ? topics.find((t) => t.id === selectedAppointment.topicId)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto mb-6">
        <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
          Real-time Status Tracking
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
          ระบบติดตามสถานะการนัดหมายแบบเรียลไทม์
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          กรอกรหัสติดตามที่ได้รับ (เช่น BDN-2608-8821) หรือเบอร์โทรศัพท์เพื่อตรวจสอบสถานะ
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-xs border border-slate-200 mb-8 max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="tracking-search-field"
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="กรอกรหัส BDN-XXXX หรือเบอร์โทรศัพท์..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 font-medium"
            />
          </div>
          <button
            type="submit"
            id="tracking-submit-btn"
            disabled={isSearching}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                กำลังค้นหา...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                ค้นหาสถานะ
              </>
            )}
          </button>
        </form>

        {/* Quick Click Demo Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px]">ตัวอย่างคลิกตรวจ:</span>
          {appointments.slice(0, 3).map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setSearchCode(a.trackingCode);
                setSelectedAppointment(a);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-mono text-[11px] cursor-pointer"
            >
              {a.trackingCode} ({a.status === 'confirmed' ? 'ยืนยันแล้ว' : a.status === 'completed' ? 'เสร็จสิ้น' : 'รอครู'})
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {selectedAppointment ? (
        <div className="space-y-6">
          {/* Status Progress Timeline */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {selectedAppointment.trackingCode}
                  </span>
                  <button
                    onClick={() => handleCopyCode(selectedAppointment.trackingCode)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title="คัดลอกรหัส"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  ยื่นคำขอเมื่อ {new Date(selectedAppointment.createdAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                </p>
              </div>

              <div>
                {(() => {
                  const badge = getStatusBadge(selectedAppointment.status);
                  const Icon = badge.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${badge.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Visual Step Timeline */}
            <div className="py-8">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-1/8 right-1/8 h-0.5 bg-slate-200 -z-0"></div>
                <div
                  className="absolute top-4 left-1/8 h-0.5 bg-slate-900 transition-all duration-500 -z-0"
                  style={{
                    width:
                      selectedAppointment.status === 'pending' ? '10%' :
                      selectedAppointment.status === 'confirmed' ? '40%' :
                      selectedAppointment.status === 'in_session' ? '70%' :
                      selectedAppointment.status === 'completed' ? '100%' : '0%'
                  }}
                ></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedAppointment.status !== 'cancelled'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    ✓
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">ยื่นคำขอแล้ว</span>
                  <span className="text-[10px] text-slate-400">ระบบบันทึกคำขอ</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      ['confirmed', 'in_session', 'completed'].includes(selectedAppointment.status)
                        ? 'bg-slate-900 text-white'
                        : selectedAppointment.status === 'pending'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">ครูยืนยันนัด</span>
                  <span className="text-[10px] text-slate-400">
                    {selectedAppointment.confirmedAt ? 'ยืนยันแล้ว' : 'กำลังรอครู'}
                  </span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      ['in_session', 'completed'].includes(selectedAppointment.status)
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">เข้ารับคำปรึกษา</span>
                  <span className="text-[10px] text-slate-400">ตามเวลานัด</span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedAppointment.status === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    4
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-2">เสร็จสิ้น</span>
                  <span className="text-[10px] text-slate-400">บันทึกผลปลอดภัย</span>
                </div>
              </div>
            </div>

            {/* Reschedule Notification Banner */}
            {selectedAppointment.rescheduledAt && selectedAppointment.previousSchedule && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span>แจ้งเตือน: นัดหมายนี้ได้รับการเลื่อนวันเวลา</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                      ปรับปรุงใหม่
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    เดิมนัดไว้: <span className="line-through">{selectedAppointment.previousSchedule.day} ({selectedAppointment.previousSchedule.date}) เวลา {selectedAppointment.previousSchedule.timeSlot}</span>
                  </p>
                  <p className="text-xs font-bold text-amber-950 mt-0.5">
                    👉 กำหนดนัดใหม่: {selectedAppointment.appointmentDay} ({selectedAppointment.appointmentDate}) เวลา {selectedAppointment.appointmentTimeSlot}
                  </p>
                  {selectedAppointment.rescheduleReason && (
                    <p className="text-[11px] text-amber-700 mt-1 italic">
                      เหตุผล: {selectedAppointment.rescheduleReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Status Message / Teacher Note Callout */}
            {selectedAppointment.statusNotes && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                <Building className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    ข้อความแจ้งจากครูผู้ให้คำปรึกษา / สถานที่นัดพบ:
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 font-medium">
                    {selectedAppointment.statusNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Appointment Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">ผู้ขอรับคำปรึกษา:</span>
                  <span className="font-semibold text-slate-900">{selectedAppointment.studentName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">วันนัดหมาย:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedAppointment.appointmentDay} ({selectedAppointment.appointmentDate})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">ช่วงเวลา:</span>
                  <span className="font-semibold text-slate-900">{selectedAppointment.appointmentTimeSlot}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">หัวข้อ:</span>
                  <span className="font-semibold text-slate-900">{activeTopic?.title || selectedAppointment.topicId}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">ครูที่ปรึกษา:</span>
                  <span className="font-semibold text-slate-900">{selectedAppointment.counselorName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">รูปแบบ:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedAppointment.meetingFormat === 'in_person'
                      ? 'พบตัวจริงที่ห้องศูนย์พิงใจ (อาคาร 1 ชั้น 2)'
                      : selectedAppointment.meetingFormat === 'online'
                      ? 'ออนไลน์ผ่านระบบ'
                      : 'โทรศัพท์'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Student */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  พิมพ์ใบนัดหมาย
                </button>
                <button
                  onClick={() => {
                    performSearch(selectedAppointment.trackingCode);
                    addToast({ type: 'info', title: 'รีเฟรชข้อมูลแล้ว', message: 'ดึงสถานะล่าสุดเรียบร้อย' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  อัปเดตสถานะสด
                </button>
              </div>

              {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                <button
                  id="cancel-appointment-btn"
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 text-xs font-semibold border border-rose-200 flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  ขอยกเลิกนัดหมาย
                </button>
              )}
            </div>
          </div>

          {/* Send Additional Note to Counselor */}
          {selectedAppointment.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-slate-600" />
                ส่งข้อความเพิ่มเติมถึงครู {selectedAppointment.counselorName}
              </h4>
              <form onSubmit={handleSendMessageToTeacher} className="flex gap-2">
                <input
                  type="text"
                  value={messageToTeacher}
                  onChange={(e) => setMessageToTeacher(e.target.value)}
                  placeholder="เช่น ขอเลื่อนเวลาเข้าพบ 10 นาที หรือ แจ้งรายละเอียดเพิ่มเติม..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  ส่งข้อความ
                </button>
              </form>
              {messageSentSuccess && (
                <p className="text-[11px] text-emerald-700 font-medium mt-2">
                  ✓ ส่งข้อความและแจ้งเตือนเข้าสู่ระบบเรียบร้อยแล้ว
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
          <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">ยังไม่ได้ระบุรหัสการนัดหมาย</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            กรุณากรอกรหัสติดตาม BDN-XXXX หรือเบอร์โทรศัพท์ในช่องค้นหาด้านบนเพื่อดูข้อมูล
          </p>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              ยืนยันการยกเลิกนัดหมาย?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              หากยกเลิกแล้ว คุณสามารถลงทะเบียนนัดหมายรอบใหม่ได้ทุกเมื่อ
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เหตุผลที่ขอยกเลิก (ไม่บังคับ):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="เช่น ติดเรียนเสริม หรือ ติดกิจกรรมห้องเรียน..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ไม่ยกเลิก
              </button>
              <button
                id="confirm-cancel-action-btn"
                type="button"
                onClick={handleCancelSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                ยืนยันยกเลิกนัด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
