import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TimetableView } from './components/TimetableView';
import { CounselorCatalog } from './components/CounselorCatalog';
import { BookingForm } from './components/BookingForm';
import { TrackingView } from './components/TrackingView';
import { HotlinesView } from './components/HotlinesView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SchoolEmblem } from './components/SchoolEmblem';
import { CounselorConfirmModal } from './components/CounselorConfirmModal';
import {
  ShieldCheck,
  Heart,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Lock,
  Sparkles
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toasts, removeToast, schoolInfo, setActiveTab, setTrackingQuery } = useApp();
  const [counselorActionState, setCounselorActionState] = useState<{
    code: string;
    action: 'confirm' | 'in_session' | 'complete' | 'reschedule';
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rawAction = (params.get('action') || '').toLowerCase();
      const code = params.get('code') || params.get('confirmCode') || params.get('trackingCode');
      const tab = params.get('tab');

      let parsedAction: 'confirm' | 'in_session' | 'complete' | 'reschedule' = 'confirm';
      if (rawAction === 'in_session' || rawAction === 'in_consultation' || rawAction === 'session' || rawAction === 'consulting') {
        parsedAction = 'in_session';
      } else if (rawAction === 'complete' || rawAction === 'completed' || rawAction === 'done' || rawAction === 'finish') {
        parsedAction = 'complete';
      } else if (rawAction === 'reschedule' || rawAction === 'postpone' || rawAction === 'change_date' || rawAction === 'delay') {
        parsedAction = 'reschedule';
      }

      if (code && (params.has('action') || params.has('confirmCode'))) {
        setCounselorActionState({
          code,
          action: parsedAction
        });
      } else if (tab === 'tracking' && code) {
        setTrackingQuery(code);
        setActiveTab('tracking');
      }
    }
  }, [setTrackingQuery, setActiveTab]);

  return (
    <div className="min-h-screen flex flex-col bg-bdn-ambient text-slate-900 font-sans selection:bg-pink-200 selection:text-pink-900 relative overflow-x-hidden">
      {/* Background Decorative Gradient Orbs (Blue, Sky, Pink) */}
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/15 to-sky-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-pink-500/15 via-rose-400/15 to-sky-300/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed -bottom-40 left-1/4 w-[650px] h-[650px] bg-gradient-to-tr from-blue-700/10 via-sky-500/15 to-pink-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Subtle School Emblem Watermark */}
      <div className="fixed right-4 bottom-20 pointer-events-none select-none opacity-[0.035] -z-10 hidden md:block">
        <SchoolEmblem size="watermark" />
      </div>

      {/* Top Main Navigation Bar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'home' && <HeroSection />}
        {activeTab === 'timetable' && <TimetableView />}
        {activeTab === 'counselors' && <CounselorCatalog />}
        {activeTab === 'booking' && <BookingForm />}
        {activeTab === 'tracking' && <TrackingView />}
        {activeTab === 'hotlines' && <HotlinesView />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Counselor Direct Action Modal (From LINE Notify Direct Links) */}
      {counselorActionState && (
        <CounselorConfirmModal
          confirmCode={counselorActionState.code}
          initialAction={counselorActionState.action}
          onClose={() => {
            setCounselorActionState(null);
            if (typeof window !== 'undefined' && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
        />
      )}

      {/* School Footer with Enhanced Blue-Sky-Pink Brand Elements */}
      <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-gray-300 pt-14 pb-8 border-t-2 border-slate-800 text-xs relative overflow-hidden">
        {/* Subtle footer decorative light strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-pink-500" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Column 1: School Brand & Emblem */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center gap-3.5">
                <div className="p-1 rounded-2xl bg-white border border-white/40 shadow-md flex items-center justify-center overflow-hidden">
                  <SchoolEmblem size="md" variant="glow" shape="rounded" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                    {schoolInfo.centerName || 'ศูนย์พิงใจ'}
                    <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-400/30 px-2 py-0.5 rounded-full font-semibold">
                      {schoolInfo.shortName || 'บ.ด.น.'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-pink-400 to-rose-300 font-medium">
                    {schoolInfo.schoolName}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed text-[11px] max-w-md">
                โครงการเพื่อสร้างพื้นที่ปลอดภัย (Safe Zone) ทางจิตใจ ส่งเสริมสุขภาวะที่ดี
                คุ้มครองสิทธิ เสรีภาพ และความปลอดภัยของนักเรียนทุกคน ด้วยความลับและมาตรฐานวิชาชีพ
              </p>
              <div className="flex items-center gap-2 text-[10px] text-amber-300 font-semibold bg-slate-800/90 px-3.5 py-1.5 rounded-xl w-fit border border-amber-500/30 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                ข้อมูลการปรึกษาทุกกรณีถูกเก็บเป็นความลับสูงสุดตามมาตรฐานจรรยาบรรณวิชาชีพ
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-3.5 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-pink-500 rounded-full"></span>
                เมนูด่วน
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="text-gray-400 hover:text-pink-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    • นัดหมายขอคำปรึกษา
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('tracking')}
                    className="text-gray-400 hover:text-pink-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    • ตรวจสอบสถานะการนัดหมาย
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="text-gray-400 hover:text-pink-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    • ตารางการให้บริการประจำสัปดาห์
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('counselors')}
                    className="text-gray-400 hover:text-pink-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    • ทำเนียบครูที่ปรึกษา (36 ท่าน)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    • ระบบหลังบ้านสำหรับครู (เข้าสู่ระบบ)
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Location */}
            <div>
              <h4 className="text-white font-bold mb-3.5 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-sky-400 rounded-full"></span>
                สถานที่และเวลาทำการ
              </h4>
              <div className="space-y-2.5 text-[11px] text-gray-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                  <span>{schoolInfo.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>{schoolInfo.serviceHours}</span>
                </div>
                <div className="flex items-start gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                  <span>โทร: {schoolInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
              <p>
                © 2026 ศูนย์พิทักษ์สิทธิ เสรีภาพ และความปลอดภัย "ศูนย์พิงใจ" {schoolInfo.schoolName}. สงวนลิขสิทธิ์
              </p>
            </div>
            <p className="text-gray-400 font-medium">
              สีประจำโรงเรียน: <span className="text-blue-400 font-semibold">น้ำเงิน</span> • <span className="text-sky-300 font-semibold">ฟ้า</span> • <span className="text-pink-400 font-semibold">ชมพู</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Toast Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start justify-between gap-3 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-50 border-amber-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-50 border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}

              <div>
                <h4 className="text-xs font-semibold">{toast.title}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
