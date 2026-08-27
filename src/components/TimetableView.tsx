import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  HeartHandshake,
  GraduationCap,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { DayOfWeek, GradeLevel, TopicId } from '../types';

export const TimetableView: React.FC = () => {
  const {
    timetable,
    topics,
    setActiveTab,
    setSelectedTopicForBooking,
    setSelectedDayForBooking,
    setSelectedGradeLevelForBooking
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'm_junior' | 'm_senior'>('all');

  const getTopicDetails = (id: TopicId) => {
    return topics.find((t) => t.id === id) || topics[0];
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
        return Info;
    }
  };

  const handleBookFromSlot = (day: DayOfWeek, gradeLevel: GradeLevel, topicId: TopicId) => {
    setSelectedDayForBooking(day);
    setSelectedGradeLevelForBooking(gradeLevel);
    setSelectedTopicForBooking(topicId);
    setActiveTab('booking');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white mb-8 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              ตารางเวลาให้บริการประจำสัปดาห์
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              ตารางการให้บริการ ศูนย์พิงใจ บ.ด.น.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              เปิดให้บริการทุกวันจันทร์ - ศุกร์ ในช่วงเวลาพักกลางวัน แยกตามระดับชั้น ม.ต้น และ ม.ปลาย เพื่อความสะดวกและเป็นส่วนตัวของนักเรียน
            </p>
          </div>

          {/* Filter Pills */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 shrink-0 border border-slate-700 self-start md:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ทุกระดับชั้น
            </button>
            <button
              onClick={() => setActiveFilter('m_junior')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'm_junior'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              เฉพาะ ม.ต้น
            </button>
            <button
              onClick={() => setActiveFilter('m_senior')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'm_senior'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              เฉพาะ ม.ปลาย
            </button>
          </div>
        </div>
      </div>

      {/* Main Timetable Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-10 shadow-xs">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              ตารางเวลาการให้คำปรึกษาประจำวัน
            </h3>
            <p className="text-xs text-slate-500">
              คลิกที่ช่องเวลาของแต่ละวัน เพื่อลงทะเบียนนัดหมายได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              ม.ต้น: 11.10 – 12.00 น.
            </span>
            <span className="flex items-center gap-1.5 text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              ม.ปลาย: 12.00 – 12.50 น.
            </span>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 text-slate-700 text-xs font-semibold border-b border-slate-200">
                <th className="py-3 px-4 sm:px-6 w-24 sm:w-32 text-center border-r border-slate-200">
                  วัน
                </th>
                {(activeFilter === 'all' || activeFilter === 'm_junior') && (
                  <th className="py-3 px-4 sm:px-6 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>11.10 – 12.00 น.</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-semibold ml-1">
                        ม.ต้น
                      </span>
                    </div>
                  </th>
                )}
                {(activeFilter === 'all' || activeFilter === 'm_senior') && (
                  <th className="py-4 px-4 sm:px-6 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>12.00 – 12.50 น.</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded font-semibold ml-1">
                        ม.ปลาย
                      </span>
                    </div>
                  </th>
                )}
                <th className="py-3 px-4 sm:px-6 w-32 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {timetable.map((entry, idx) => {
                const juniorTopic = getTopicDetails(entry.juniorTopicId);
                const seniorTopic = getTopicDetails(entry.seniorTopicId);

                const JuniorIcon = getTopicIcon(entry.juniorTopicId);
                const SeniorIcon = getTopicIcon(entry.seniorTopicId);

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Day Column */}
                    <td className="py-4 px-4 sm:px-6 text-center border-r border-slate-100 font-bold text-slate-800">
                      <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200">
                        {entry.day}
                      </span>
                    </td>

                    {/* Junior High Slot */}
                    {(activeFilter === 'all' || activeFilter === 'm_junior') && (
                      <td className="py-3 px-4 sm:px-6 border-r border-slate-100">
                        <div
                          onClick={() => handleBookFromSlot(entry.day, 'm_junior', entry.juniorTopicId)}
                          className="group p-3 rounded-xl border border-slate-200 hover:border-rose-400 bg-white hover:bg-rose-50/20 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                                <JuniorIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                                {juniorTopic.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50 px-2 py-0.5 rounded">
                              จองนัด →
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {juniorTopic.scopeDescription}
                          </p>
                        </div>
                      </td>
                    )}

                    {/* Senior High Slot */}
                    {(activeFilter === 'all' || activeFilter === 'm_senior') && (
                      <td className="py-3 px-4 sm:px-6 border-r border-slate-100">
                        <div
                          onClick={() => handleBookFromSlot(entry.day, 'm_senior', entry.seniorTopicId)}
                          className="group p-3 rounded-xl border border-slate-200 hover:border-rose-400 bg-white hover:bg-rose-50/20 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                                <SeniorIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                                {seniorTopic.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50 px-2 py-0.5 rounded">
                              จองนัด →
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {seniorTopic.scopeDescription}
                          </p>
                        </div>
                      </td>
                    )}

                    {/* Notes Column */}
                    <td className="py-3 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-medium border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        เปิดรับนัด
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope Details Section */}
      <div className="mb-10">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-1 rounded-full mb-2 border border-slate-200">
            ขอบข่ายการให้บริการคำปรึกษา 4 ด้าน
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            รายละเอียดเรื่องที่สามารถขอรับคำปรึกษาได้
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => {
            const Icon = getTopicIcon(topic.id);
            return (
              <div
                key={topic.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-700">
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      หัวข้อที่ {topic.numericId}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTopicForBooking(topic.id);
                        setActiveTab('booking');
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      นัดหมาย <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {topic.scopeDescription}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Booking Helper */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-300 mb-3 border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            นัดหมายล่วงหน้าง่าย ๆ ผ่านระบบออนไลน์
          </div>
          <h3 className="text-xl font-bold mb-1.5">
            นักเรียนสามารถเลือก วัน เวลา และบุคลากรที่ต้องการปรึกษา
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            เลือกพบคุณครูท่านใดก็ได้ที่นักเรียนรู้สึกสบายใจที่จะพูดคุย โดยไม่มีการเปิดเผยข้อมูลต่อผู้อื่น
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-lg p-1.5 flex items-center justify-center text-white">
              <QrCode className="w-16 h-16 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-slate-700 mt-1">
              QR Code ศูนย์พิงใจ
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedTopicForBooking(null);
              setActiveTab('booking');
            }}
            className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            ไปที่หน้าลงทะเบียนนัดหมาย →
          </button>
        </div>
      </div>
    </div>
  );
};
