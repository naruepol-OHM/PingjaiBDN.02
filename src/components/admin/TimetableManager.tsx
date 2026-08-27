import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { TimetableEntry, TopicId, DayOfWeek } from '../../types';
import { INITIAL_TIMETABLE } from '../../data/initialData';

export const TimetableManager: React.FC = () => {
  const { timetable, topics, updateTimetable, addToast } = useApp();

  const [entries, setEntries] = useState<TimetableEntry[]>(timetable);

  const handleJuniorTopicChange = (day: DayOfWeek, topicId: TopicId) => {
    setEntries((prev) =>
      prev.map((e) => (e.day === day ? { ...e, juniorTopicId: topicId } : e))
    );
  };

  const handleSeniorTopicChange = (day: DayOfWeek, topicId: TopicId) => {
    setEntries((prev) =>
      prev.map((e) => (e.day === day ? { ...e, seniorTopicId: topicId } : e))
    );
  };

  const handleJuniorTimeSlotChange = (day: DayOfWeek, slot: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.day === day ? { ...e, juniorTimeSlot: slot } : e))
    );
  };

  const handleSeniorTimeSlotChange = (day: DayOfWeek, slot: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.day === day ? { ...e, seniorTimeSlot: slot } : e))
    );
  };

  const handleNotesChange = (day: DayOfWeek, notes: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.day === day ? { ...e, notes } : e))
    );
  };

  const handleSaveAll = () => {
    updateTimetable(entries);
  };

  const handleReset = () => {
    if (window.confirm('ต้องการคืนค่าตารางเวลาตามต้นฉบับโรงเรียนหรือไม่?')) {
      setEntries(INITIAL_TIMETABLE);
      updateTimetable(INITIAL_TIMETABLE);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-900" />
            ระบบจัดการตารางการให้บริการประจำสัปดาห์
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ปรับเปลี่ยนหัวข้อที่เปิดให้บริการในแต่ละวันของ ม.ต้น และ ม.ปลาย
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            คืนค่าเริ่มต้น
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            บันทึกการเปลี่ยนแปลงทั้งหมด
          </button>
        </div>
      </div>

      {/* Editable Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-3 px-4 w-28 text-center">วัน</th>
                <th className="py-3 px-4 w-1/3">
                  ม.ต้น (11.10 – 12.00 น.) หัวข้อที่เปิดรับ
                </th>
                <th className="py-3 px-4 w-1/3">
                  ม.ปลาย (12.00 – 12.50 น.) หัวข้อที่เปิดรับ
                </th>
                <th className="py-3 px-4">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                    <span className="text-xs">{entry.day}</span>
                  </td>

                  {/* Junior Select */}
                  <td className="py-3 px-4 border-r border-slate-100">
                    <div className="space-y-1.5">
                      <select
                        value={entry.juniorTopicId}
                        onChange={(e) => handleJuniorTopicChange(entry.day, e.target.value as TopicId)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-slate-800"
                      >
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} (หัวข้อที่ {t.numericId})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={entry.juniorTimeSlot}
                        onChange={(e) => handleJuniorTimeSlotChange(entry.day, e.target.value)}
                        placeholder="ช่วงเวลา ม.ต้น"
                        className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                      />
                    </div>
                  </td>

                  {/* Senior Select */}
                  <td className="py-3 px-4 border-r border-slate-100">
                    <div className="space-y-1.5">
                      <select
                        value={entry.seniorTopicId}
                        onChange={(e) => handleSeniorTopicChange(entry.day, e.target.value as TopicId)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-slate-800"
                      >
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} (หัวข้อที่ {t.numericId})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={entry.seniorTimeSlot}
                        onChange={(e) => handleSeniorTimeSlotChange(entry.day, e.target.value)}
                        placeholder="ช่วงเวลา ม.ปลาย"
                        className="w-full px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                      />
                    </div>
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={entry.notes || ''}
                      onChange={(e) => handleNotesChange(entry.day, e.target.value)}
                      placeholder="เช่น มีครูพิเศษ..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
