import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Calendar,
  Sparkles,
  HeartHandshake,
  GraduationCap,
  Heart,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Counselor, TopicId } from '../types';

export const CounselorCatalog: React.FC = () => {
  const {
    counselors,
    topics,
    setSelectedCounselorForBooking,
    setSelectedTopicForBooking,
    setActiveTab
  } = useApp();

  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const filteredCounselors = counselors.filter((c) => {
    if (!c.isActive) return false;
    const matchesTopic =
      selectedTopicFilter === 'all' || c.topicIds.includes(selectedTopicFilter as TopicId);
    const matchesSearch =
      c.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (c.department && c.department.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (c.roleTitle && c.roleTitle.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (c.bio && c.bio.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  const handleBookWithCounselor = (counselor: Counselor) => {
    setSelectedCounselorForBooking(counselor);
    if (counselor.topicIds.length > 0) {
      setSelectedTopicForBooking(counselor.topicIds[0]);
    }
    setActiveTab('booking');
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
        return Sparkles;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white mb-8 border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            คณะครูและบุคลากรผู้ให้คำปรึกษา ศูนย์พิงใจ
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            ทำเนียบครูที่ปรึกษา ({counselors.length} ท่าน)
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            นักเรียนสามารถดูภาพและข้อมูลของคณะผู้บริหารและคุณครูทุกท่าน พร้อมเลือกนัดหมายกับครูที่ไว้วางใจได้โดยตรง
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 mb-8 space-y-4 shadow-xs">
        {/* Search input */}
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="counselor-search-input"
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="ค้นหาชื่อครู, ตำแหน่ง, กลุ่มสาระฯ หรือประเด็น..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
          />
        </div>

        {/* Topic Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedTopicFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedTopicFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ครูทั้งหมด ({counselors.length})
          </button>

          {topics.map((t) => {
            const Icon = getTopicIcon(t.id);
            const count = counselors.filter((c) => c.topicIds.includes(t.id)).length;
            const isSelected = selectedTopicFilter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopicFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.title} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Counselors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCounselors.map((c) => {
          const counselorTopics = topics.filter((t) => c.topicIds.includes(t.id));
          return (
            <div
              key={c.id}
              id={`counselor-catalog-card-${c.id}`}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Role Tag */}
                <div className="relative mb-3 aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {c.roleTitle && (
                    <span className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      {c.roleTitle}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    พร้อมให้คำปรึกษา
                  </span>
                </div>

                {/* Name & Department */}
                <h3 className="text-sm font-bold text-slate-900">
                  {c.name}
                </h3>
                {c.department && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.department}
                  </p>
                )}

                {/* Bio / Advice Focus */}
                {c.bio && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed italic">
                    "{c.bio}"
                  </p>
                )}

                {/* Topics Tag Pills */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {counselorTopics.map((ct) => (
                    <span
                      key={ct.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {ct.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  id={`book-with-${c.id}-btn`}
                  onClick={() => handleBookWithCounselor(c)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  นัดหมายกับครูท่านนี้
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCounselors.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">ไม่พบรายชื่อคุณครูที่ตรงกับคำค้นหา</h3>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหัวข้อ "ครูทั้งหมด"</p>
        </div>
      )}
    </div>
  );
};
