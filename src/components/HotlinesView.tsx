import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PhoneCall,
  ShieldAlert,
  Heart,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const HotlinesView: React.FC = () => {
  const { schoolInfo, setActiveTab, setSelectedTopicForBooking } = useApp();

  // Simple 2Q mood self-check
  const [q1, setQ1] = useState<boolean | null>(null);
  const [q2, setQ2] = useState<boolean | null>(null);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q1 !== null && q2 !== null) {
      setShowAssessmentResult(true);
    }
  };

  const isPositive2Q = q1 === true || q2 === true;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          <PhoneCall className="w-3.5 h-3.5" />
          สายด่วนฉุกเฉินและช่องทางช่วยเหลือ
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          หากคุณต้องการความช่วยเหลืออย่างเร่งด่วน
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          มีคนพร้อมรับฟังและช่วยเหลือคุณเสมอ ทั้งในโรงเรียนบดินทรเดชา นนทบุรี และหน่วยงานผู้เชี่ยวชาญตลอด 24 ชั่วโมง
        </p>
      </div>

      {/* Hotlines Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schoolInfo.emergencyHotlines.map((hotline, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  สายด่วนทางการ
                </span>
                <span className="text-xs text-slate-400 font-mono">ฟรี 24 ชม.</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{hotline.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{hotline.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`tel:${hotline.number.replace(/-/g, '')}`}
                className="text-2xl font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2"
              >
                <PhoneCall className="w-5 h-5" />
                {hotline.number}
              </a>
              <a
                href={`tel:${hotline.number.replace(/-/g, '')}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                กดโทรออก
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Self-Check Questionnaire (2Q Mental Health Check) */}
      <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-xs tracking-wider">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            แบบประเมินความรู้สึกเบื้องต้น (2Q)
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
            ใน 2 สัปดาห์ที่ผ่านมารวมถึงวันนี้ ท่านมีความรู้สึกเหล่านี้หรือไม่?
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            แบบคัดกรองเบื้องต้นเพื่อประเมินความต้องการการรับฟังและดูแลจิตใจ
          </p>

          <form onSubmit={handleAssessmentSubmit} className="space-y-4">
            {/* Q1 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3">
                1. รู้สึกหดหู่ เศร้า หรือท้อแท้สิ้นหวังเกือบทุกวันหรือไม่?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="q1"
                    checked={q1 === true}
                    onChange={() => setQ1(true)}
                    className="accent-slate-900 w-4 h-4"
                  />
                  มี (ใช่)
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="q1"
                    checked={q1 === false}
                    onChange={() => setQ1(false)}
                    className="accent-slate-900 w-4 h-4"
                  />
                  ไม่มี (ไม่ใช่)
                </label>
              </div>
            </div>

            {/* Q2 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3">
                2. รู้สึกเบื่อ ทำอะไรก็ไม่เพลิดเพลิน หรือหมดความสนใจในสิ่งที่เคยชอบหรือไม่?
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="q2"
                    checked={q2 === true}
                    onChange={() => setQ2(true)}
                    className="accent-slate-900 w-4 h-4"
                  />
                  มี (ใช่)
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="q2"
                    checked={q2 === false}
                    onChange={() => setQ2(false)}
                    className="accent-slate-900 w-4 h-4"
                  />
                  ไม่มี (ไม่ใช่)
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={q1 === null || q2 === null}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                q1 !== null && q2 !== null
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              ดูคำแนะนำและผลประเมิน
            </button>
          </form>

          {/* Assessment Result Box */}
          {showAssessmentResult && (
            <div className="mt-6 p-5 rounded-xl border transition-all bg-white border-slate-200 shadow-xs">
              {isPositive2Q ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    ช่วงนี้คุณอาจกำลังเผชิญกับภาวะความเครียดหรือความเหนื่อยล้าทางใจ
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    คุณไม่ได้อยู่คนเดียว การมีคนที่พร้อมรับฟังอย่างเข้าใจจะช่วยให้คุณรู้สึกเบาใจขึ้นได้อย่างมาก ศูนย์พิงใจ บ.ด.น. ขอเชิญชวนคุณมาพูดคุยกับคุณครูที่ปรึกษาอย่างสบายใจ
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTopicForBooking('mental_health');
                      setActiveTab('booking');
                    }}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    นัดหมายพูดคุยกับครูด้านสุขภาพจิตทันที
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    สภาพอารมณ์ของคุณอยู่ในเกณฑ์ปกติ
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    อย่างไรก็ตาม หากในอนาคตมีเรื่องใดที่อยากพูดคุย ไม่ว่าจะเป็นเรื่องการเรียน เพื่อน หรือความสัมพันธ์ ศูนย์พิงใจพร้อมต้อนรับเสมอครับ/ค่ะ
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
