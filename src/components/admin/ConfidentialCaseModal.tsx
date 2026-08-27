import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Unlock,
  Shield,
  FileText,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  HeartHandshake,
  Printer
} from 'lucide-react';
import { Appointment, ConfidentialCaseSummary } from '../../types';

interface ConfidentialCaseModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const ConfidentialCaseModal: React.FC<ConfidentialCaseModalProps> = ({
  appointment,
  onClose
}) => {
  const { saveCaseSummary, topics } = useApp();

  const existingSummary = appointment.caseSummary;

  const [counselorName, setCounselorName] = useState(
    existingSummary?.counselorName || appointment.counselorName
  );
  const [keyIssues, setKeyIssues] = useState(existingSummary?.keyIssues || '');
  const [sessionSummary, setSessionSummary] = useState(existingSummary?.sessionSummary || '');
  const [actionPlan, setActionPlan] = useState(existingSummary?.actionPlan || '');
  const [followUpNeeded, setFollowUpNeeded] = useState(existingSummary?.followUpNeeded || false);
  const [followUpDate, setFollowUpDate] = useState(existingSummary?.followUpDate || '');
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'watch' | 'critical'>(
    existingSummary?.urgencyLevel || 'normal'
  );
  const [mentalHealthScore, setMentalHealthScore] = useState<number>(
    existingSummary?.mentalHealthScore || 7
  );
  const [isLocked, setIsLocked] = useState(existingSummary?.isLocked !== undefined ? existingSummary.isLocked : true);

  const topicObj = topics.find((t) => t.id === appointment.topicId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCaseSummary(appointment.id, {
      counselorId: appointment.counselorId,
      counselorName,
      keyIssues,
      sessionSummary,
      actionPlan,
      followUpNeeded,
      followUpDate: followUpNeeded ? followUpDate : undefined,
      urgencyLevel,
      mentalHealthScore,
      isLocked,
      lastEditedBy: counselorName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-lg border border-slate-200 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full">
                  ลับเฉพาะ (Confidential)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  รหัส: {appointment.trackingCode}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                บันทึกสรุปผลการให้คำปรึกษาศูนย์พิงใจ
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Student Info Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-slate-500">ผู้รับคำปรึกษา: </span>
            <strong className="text-slate-900">{appointment.studentName} ({appointment.studentGrade})</strong>
            <span className="text-slate-300 mx-2">|</span>
            <span className="text-slate-500">หัวข้อ: </span>
            <strong className="text-slate-900">{topicObj?.title}</strong>
          </div>
          <div>
            <span className="text-slate-500">นัดหมาย: </span>
            <strong className="text-slate-900">{appointment.appointmentDay} ({appointment.appointmentDate})</strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Key Issues */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ประเด็นปัญหาสำคัญที่พบ (Key Issues) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={keyIssues}
              onChange={(e) => setKeyIssues(e.target.value)}
              placeholder="ระบุประเด็นปัญหาหลัก เช่น ความเครียดเรื่องการเตรียมสอบ, ความสัมพันธ์กับเพื่อนร่วมห้อง, ปัญหาครอบครัว..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            ></textarea>
          </div>

          {/* Session Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สรุปเนื้อหาการพูดคุยและคำปรึกษาที่ให้ (Session Summary) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={sessionSummary}
              onChange={(e) => setSessionSummary(e.target.value)}
              placeholder="สรุปสาระสำคัญจากการรับฟัง มุมมองของนักเรียน คำแนะนำและเทคนิคที่ได้มอบให้..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            ></textarea>
          </div>

          {/* Action Plan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              แนวทางการช่วยเหลือ / การส่งต่อ (Action Plan & Recommendations)
            </label>
            <textarea
              rows={2}
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="เช่น มอบหมายการบ้านบันทึกอารมณ์, ติดตามผลกับครูประจำชั้น, หรือประสานงานกลุ่มแนะแนว..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            ></textarea>
          </div>

          {/* Ratings and Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความเร่งด่วนของเคส
              </label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium text-slate-800"
              >
                <option value="normal">🟢 ปกติ (ให้คำปรึกษาตามรอบ)</option>
                <option value="watch">🟡 เฝ้าระวัง (ติดตามอาการใกล้ชิด)</option>
                <option value="critical">🔴 วิกฤติเร่งด่วน (ส่งต่อผู้เชี่ยวชาญ/แพทย์)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                การประเมินสภาพจิตใจ (1 - 10): <span className="text-slate-900 font-bold">{mentalHealthScore}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={mentalHealthScore}
                onChange={(e) => setMentalHealthScore(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1 (วิกฤติ/ซึมเศร้าหนัก)</span>
                <span>5 (ปานกลาง)</span>
                <span>10 (แจ่มใสดีมาก)</span>
              </div>
            </div>
          </div>

          {/* Follow Up */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={followUpNeeded}
                onChange={(e) => setFollowUpNeeded(e.target.checked)}
                className="accent-slate-900 w-4 h-4 rounded"
              />
              ต้องการนัดติดตามผลต่อเนื่อง (Follow-up)
            </label>

            {followUpNeeded && (
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
              />
            )}
          </div>

          {/* Confidential Lock Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-300" />
              <span className="text-xs font-semibold">ล็อกรหัสป้องกันการเข้าถึงแบบลับเฉพาะ</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                isLocked ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isLocked ? '🔒 ล็อกสมบูรณ์' : '🔓 ปลดล็อก'}
            </button>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์เอกสารสรุปเคส
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                บันทึกผลเคสลับเฉพาะ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
