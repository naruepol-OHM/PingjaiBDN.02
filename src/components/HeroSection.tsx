import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolEmblem } from './SchoolEmblem';
import {
  HeartHandshake,
  Calendar,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  GraduationCap,
  Heart,
  MessageCircle,
  BellRing,
  ArrowRight,
  Lock,
  Award
} from 'lucide-react';
import { TopicId } from '../types';

export const HeroSection: React.FC = () => {
  const {
    topics,
    counselors,
    setActiveTab,
    setSelectedTopicForBooking,
    setTrackingQuery,
    schoolInfo
  } = useApp();

  const [trackInput, setTrackInput] = useState('');

  const handleTopicClick = (topicId: TopicId) => {
    setSelectedTopicForBooking(topicId);
    setActiveTab('booking');
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      setTrackingQuery(trackInput.trim());
      setActiveTab('tracking');
    }
  };

  const getTopicIcon = (id: TopicId) => {
    switch (id) {
      case 'mental_health':
        return HeartHandshake;
      case 'studies_future':
        return GraduationCap;
      case 'love_sex_ed':
        return Heart;
      case 'friends_social':
        return Users;
      default:
        return MessageCircle;
    }
  };

  return (
    <section className="relative bg-bdn-hero-mesh pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-sky-100/80 overflow-hidden">
      {/* Ambient Gradient Flares */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-r from-blue-400/20 via-sky-300/25 to-pink-400/20 blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-blue-500/10 blur-3xl -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-pink-500/15 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Banner Header with Official School Emblem */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          
          {/* School Emblem Hero Display with Triple Color Rim */}
          <div className="flex flex-col items-center justify-center mb-5 animate-fade-in">
            <div className="relative group">
              {/* Outer Glowing Rings in School Colors */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 via-sky-400 to-pink-500 rounded-full blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
              
              <div className="relative p-2 bg-white rounded-full shadow-lg border-2 border-white/90 backdrop-blur-xs flex items-center justify-center overflow-hidden">
                <SchoolEmblem size="xl" variant="glow" shape="circle" />
              </div>
            </div>

            <div className="mt-3.5 inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-sky-200/80 shadow-xs px-4 py-1.5 rounded-full text-xs font-medium text-slate-800">
              <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping" />
              <span className="font-semibold text-blue-900">{schoolInfo.centerName}</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-pink-600">
                {schoolInfo.schoolName}
              </span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            ศูนย์พิงใจ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-pink-600">
              “พื้นที่ปลอดภัย”
            </span>
            <br />
            <span className="text-2xl sm:text-3xl font-bold text-slate-700">
              สำหรับลูกบดินทร นนท์ ทุกคน
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-950 font-semibold italic mb-3">
            “{schoolInfo.slogan}”
          </p>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            ยินดีต้อนรับนักเรียน ม.ต้น และ ม.ปลาย ลงทะเบียนจองเวลารับคำปรึกษากับคุณครูที่ไว้วางใจ เลือกหัวข้อ วันเวลา และดูภาพคุณครูก่อนเลือกได้อย่างสบายใจ ข้อมูลทุกอย่างถูกเก็บเป็นความลับ 100%
          </p>

          {/* Main Action Buttons with School Brand Gradients */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <button
              id="hero-book-now-btn"
              onClick={() => {
                setSelectedTopicForBooking(null);
                setActiveTab('booking');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-700 via-sky-600 to-pink-600 hover:from-blue-800 hover:via-sky-700 hover:to-pink-700 text-white text-sm sm:text-base font-bold shadow-md shadow-blue-900/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ลงทะเบียนขอรับคำปรึกษา
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            </button>

            <button
              id="hero-view-timetable-btn"
              onClick={() => setActiveTab('timetable')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/95 border-2 border-sky-200 text-blue-900 text-sm sm:text-base font-bold hover:bg-sky-50/80 hover:border-sky-300 shadow-xs transition-all cursor-pointer"
            >
              ดูตารางเวลาและรอบบริการ
              <ArrowRight className="w-4 h-4 text-sky-600" />
            </button>
          </div>

          {/* Quick Tracking Bar */}
          <div className="bg-white/90 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-sky-200/80 shadow-md max-w-lg mx-auto">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
                <input
                  id="hero-tracking-input"
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder="กรอกรหัสติดตาม เช่น BDN-2608-8821 หรือเบอร์โทร..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white text-slate-800 transition-all"
                />
              </div>
              <button
                type="submit"
                id="hero-track-submit-btn"
                className="w-full sm:w-auto shrink-0 px-5 py-2 bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5" />
                ติดตามสถานะ
              </button>
            </form>
          </div>
        </div>

        {/* 4 Topic Quick Cards */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 bg-gradient-to-b from-blue-600 to-pink-600 rounded-full inline-block"></span>
                4 ขอบข่ายหัวข้อการให้บริการคำปรึกษา
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกเลือกหัวข้อที่ต้องการเพื่อเริ่มนัดหมายกับครูผู้เชี่ยวชาญทันที
              </p>
            </div>
            <button
              onClick={() => setActiveTab('counselors')}
              className="text-xs font-semibold text-blue-700 hover:text-pink-600 flex items-center gap-1 cursor-pointer"
            >
              ดูครูทั้งหมด ({counselors.length} ท่าน) →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topics.map((topic) => {
              const Icon = getTopicIcon(topic.id);
              const counselorCount = counselors.filter((c) => c.topicIds.includes(topic.id)).length;
              return (
                <div
                  key={topic.id}
                  id={`topic-card-${topic.id}`}
                  onClick={() => handleTopicClick(topic.id)}
                  className="group bg-white/95 rounded-2xl p-5 border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                >
                  {/* Top Color Accent Line */}
                  <div
                    className="h-1 -mt-5 -mx-5 mb-4 rounded-t-2xl"
                    style={{ backgroundColor: topic.color }}
                  />

                  <div>
                    <div className="flex items-start justify-between mb-3.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
                        style={{ backgroundColor: topic.bgColor, color: topic.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-pink-50 group-hover:text-pink-700 transition-colors whitespace-nowrap">
                        หัวข้อที่ {topic.numericId}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1.5">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                      {topic.scopeDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {counselorCount} ครูพร้อมรับฟัง
                    </span>
                    <span
                      className="font-bold inline-flex items-center gap-1 text-xs whitespace-nowrap"
                      style={{ color: topic.color }}
                    >
                      เลือกปรึกษา <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence and Feature Badges in School Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-xs">
          <div className="flex items-start gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 border border-pink-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">ความลับ 100% & ปลอดภัย</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                เลือกใช้นามสมมุติได้ ข้อมูลทุกอย่างได้รับการคุ้มครองตามจรรยาบรรณวิชาชีพ
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">แจ้งเตือนผ่าน LINE ทันใจ</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                รับการแจ้งเตือนเมื่อครูกดยืนยันนัดหมาย พร้อมแจ้งเตือนก่อนถึงเวลา
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">ครูที่ปรึกษาพร้อมภาพถ่ายจริง</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ดูหน้าตาและประวัติคุณครูทั้ง 36 ท่านก่อนตัดสินใจเลือกได้อย่างมั่นใจ
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

