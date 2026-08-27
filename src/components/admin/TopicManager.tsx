import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  GraduationCap,
  Heart,
  Users
} from 'lucide-react';
import { Topic, TopicId } from '../../types';

export const TopicManager: React.FC = () => {
  const { topics, updateTopic } = useApp();

  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [color, setColor] = useState('');

  const startEdit = (t: Topic) => {
    setEditingTopic(t);
    setTitle(t.title);
    setShortDescription(t.shortDescription);
    setScopeDescription(t.scopeDescription);
    setColor(t.color);
  };

  const cancelEdit = () => {
    setEditingTopic(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopic) {
      updateTopic({
        ...editingTopic,
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        scopeDescription: scopeDescription.trim(),
        color
      });
      setEditingTopic(null);
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
        return Layers;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-900" />
          ระบบจัดการหัวข้อและขอบข่ายการให้คำปรึกษา (4 ด้านหลัก)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          แก้ไขชื่อหัวข้อ คำอธิบายขอบข่าย และข้อความแนะนำสำหรับนักเรียน
        </p>
      </div>

      {/* Edit Form Modal/Drawer */}
      {editingTopic && (
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-xs animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-slate-700" />
              แก้ไขหัวข้อที่ {editingTopic.numericId}: {editingTopic.title}
            </h4>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อหัวข้อการให้คำปรึกษา
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สีธีมประจำหัวข้อ
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-8 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คำอธิบายแบบย่อ (Short Summary)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ขอบข่ายการให้บริการคำปรึกษา (แสดงในตารางและแผ่นพับโปสเตอร์)
              </label>
              <textarea
                rows={3}
                required
                value={scopeDescription}
                onChange={(e) => setScopeDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => {
          const Icon = getTopicIcon(t.id);
          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: t.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        หัวข้อลำดับที่ {t.numericId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{t.title}</h4>
                    </div>
                  </div>

                  <button
                    onClick={() => startEdit(t)}
                    className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    แก้ไข
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    <strong>ขอบข่าย:</strong> {t.scopeDescription}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>ID: {t.id}</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
                  {t.color}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
