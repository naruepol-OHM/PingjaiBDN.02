import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolEmblem } from './SchoolEmblem';
import {
  HeartHandshake,
  GraduationCap,
  Heart,
  Users,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Phone,
  MessageSquare,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Info,
  Building,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TopicId, GradeLevel, DayOfWeek, Counselor, Appointment } from '../types';

export const BookingForm: React.FC = () => {
  const {
    topics,
    counselors,
    timetable,
    selectedTopicForBooking,
    setSelectedTopicForBooking,
    selectedCounselorForBooking,
    setSelectedCounselorForBooking,
    selectedDayForBooking,
    setSelectedDayForBooking,
    selectedGradeLevelForBooking,
    setSelectedGradeLevelForBooking,
    createAppointment,
    setActiveTab,
    setTrackingQuery,
    addToast
  } = useApp();

  // Wizard Step: 1 = Topic & Level, 2 = Day & Time, 3 = Choose Counselor (with photos!), 4 = Student Info, 5 = Success Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [topicId, setTopicId] = useState<TopicId>(selectedTopicForBooking || 'mental_health');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(selectedGradeLevelForBooking || 'm_junior');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(selectedDayForBooking || 'จันทร์');
  const [timeSlot, setTimeSlot] = useState<string>('11.10 – 12.00 น. (ช่วงพัก ม.ต้น)');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(selectedCounselorForBooking || null);

  // Student Info
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('');
  const [studentNickname, setStudentNickname] = useState<string>('');
  const [studentGrade, setStudentGrade] = useState<string>('ม.3');
  const [studentRoom, setStudentRoom] = useState<string>('ม.3/1');
  const [studentIdNumber, setStudentIdNumber] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactLineId, setContactLineId] = useState<string>('');
  const [meetingFormat, setMeetingFormat] = useState<'in_person' | 'online' | 'phone'>('in_person');
  const [meetingLocation, setMeetingLocation] = useState<string>('ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์');
  const [customLocationInput, setCustomLocationInput] = useState<string>('');
  const [briefIssueDescription, setBriefIssueDescription] = useState<string>('');

  // Result state
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter counselors by selected topic
  const filteredCounselors = counselors.filter(
    (c) => c.isActive && c.topicIds.includes(topicId)
  );

  // Sync with context pre-selections
  useEffect(() => {
    if (selectedTopicForBooking) {
      setTopicId(selectedTopicForBooking);
    }
  }, [selectedTopicForBooking]);

  useEffect(() => {
    if (selectedGradeLevelForBooking) {
      setGradeLevel(selectedGradeLevelForBooking);
      if (selectedGradeLevelForBooking === 'm_junior') {
        setTimeSlot('11.10 – 12.00 น. (ช่วงพัก ม.ต้น)');
        setStudentGrade('ม.2');
      } else {
        setTimeSlot('12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)');
        setStudentGrade('ม.5');
      }
    }
  }, [selectedGradeLevelForBooking]);

  useEffect(() => {
    if (selectedDayForBooking) {
      setSelectedDay(selectedDayForBooking);
    }
  }, [selectedDayForBooking]);

  useEffect(() => {
    if (selectedCounselorForBooking) {
      setSelectedCounselor(selectedCounselorForBooking);
    }
  }, [selectedCounselorForBooking]);

  // Adjust time slot whenever grade level changes
  const handleGradeLevelChange = (lvl: GradeLevel) => {
    setGradeLevel(lvl);
    if (lvl === 'm_junior') {
      setTimeSlot('11.10 – 12.00 น. (ช่วงพัก ม.ต้น)');
      if (['ม.4', 'ม.5', 'ม.6'].includes(studentGrade)) {
        setStudentGrade('ม.2');
      }
    } else {
      setTimeSlot('12.00 – 12.50 น. (ช่วงพัก ม.ปลาย)');
      if (['ม.1', 'ม.2', 'ม.3'].includes(studentGrade)) {
        setStudentGrade('ม.5');
      }
    }
  };

  const calculateTargetDate = (dayName: DayOfWeek): string => {
    const daysMap: Record<DayOfWeek, number> = {
      'จันทร์': 1,
      'อังคาร': 2,
      'พุธ': 3,
      'พฤหัสบดี': 4,
      'ศุกร์': 5
    };

    const targetDayNumber = daysMap[dayName];
    const today = new Date();
    const currentDayNumber = today.getDay(); // 0 is Sun, 1 is Mon...

    let daysUntilTarget = targetDayNumber - currentDayNumber;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  };

  const handleNextFromStep1 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSelectCounselorAndNext = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setCurrentStep(4);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCounselor) {
      addToast({
        type: 'warning',
        title: 'กรุณาเลือกคุณครูที่ปรึกษา',
        message: 'โปรดคลิกเลือกคุณครูที่ท่านต้องการปรึกษาในขั้นตอนที่ 3'
      });
      setCurrentStep(3);
      return;
    }

    if (!isAnonymous && !studentName.trim()) {
      addToast({
        type: 'warning',
        title: 'กรุณาระบุชื่อ-นามสกุล',
        message: 'หรือเลือกตัวเลือก "ใช้นามสมมุติ / ปกปิดชื่อ" หากต้องการความเป็นส่วนตัว'
      });
      return;
    }

    if (!contactPhone.trim() && !contactLineId.trim()) {
      addToast({
        type: 'warning',
        title: 'กรุณาระบุช่องทางติดต่อ',
        message: 'โปรดใส่เบอร์โทรศัพท์หรือ LINE ID เพื่อรับการยืนยันนัดหมาย'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedDate = calculateTargetDate(selectedDay);

      const displayName = isAnonymous
        ? `นักเรียนไม่ประสงค์ออกนาม (${studentNickname ? `ชื่อเล่น: ${studentNickname}` : 'นิรนาม'})`
        : studentName.trim();

      const appointment = await createAppointment({
        studentName: displayName,
        studentNickname: studentNickname.trim() || undefined,
        isAnonymous,
        studentGrade,
        studentRoom: studentRoom.trim() || undefined,
        studentIdNumber: studentIdNumber.trim() || undefined,
        contactPhone: contactPhone.trim() || '08x-xxx-xxxx',
        contactLineId: contactLineId.trim() || undefined,
        topicId,
        counselorId: selectedCounselor.id,
        counselorName: selectedCounselor.name,
        gradeLevel,
        appointmentDate: calculatedDate,
        appointmentDay: selectedDay,
        appointmentTimeSlot: timeSlot,
        meetingFormat,
        meetingLocation: meetingFormat === 'in_person' ? (meetingLocation === 'custom' ? (customLocationInput.trim() || 'สถานที่ที่นักเรียนระบุ') : meetingLocation) : undefined,
        briefIssueDescription: briefIssueDescription.trim() || 'ขอรับคำปรึกษาทั่วไป',
        statusNotes: meetingFormat === 'in_person' ? `สถานที่นัดพบ: ${meetingLocation === 'custom' ? (customLocationInput.trim() || 'สถานที่ที่นักเรียนระบุ') : meetingLocation}` : 'รอครูผู้ให้คำปรึกษาตรวจสอบและยืนยันนัดหมาย'
      });

      setCreatedAppointment(appointment);
      setCurrentStep(5);

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignored if canvas context fails
      }

      window.scrollTo({ top: 80, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdAppointment?.trackingCode) {
      navigator.clipboard.writeText(createdAppointment.trackingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      addToast({
        type: 'success',
        title: 'คัดลอกรหัสติดตามแล้ว',
        message: `คัดลอก ${createdAppointment.trackingCode} ไปยังคลิปบอร์ด`
      });
    }
  };

  const currentTopicObj = topics.find((t) => t.id === topicId) || topics[0];

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
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Step Indicator Header */}
      {currentStep < 5 && (
        <div className="mb-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="flex justify-center mb-2">
              <div className="p-1 rounded-full bg-white border border-sky-200 shadow-2xs overflow-hidden flex items-center justify-center">
                <SchoolEmblem size="sm" variant="shield" shape="circle" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-blue-50 via-sky-50 to-pink-50 text-blue-900 text-xs font-semibold px-3 py-1 rounded-full border border-sky-200">
              ขั้นตอนการลงทะเบียน {currentStep}/4
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              แบบฟอร์มนัดหมายขอรับคำปรึกษา “ศูนย์พิงใจ”
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี
            </p>
          </div>

          {/* Steps Progress Pills */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 1
                  ? 'bg-gradient-to-r from-blue-700 to-sky-600 text-white font-semibold border-sky-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              1. เลือกหัวข้อ
            </div>
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 2
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold border-sky-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              2. วัน & เวลา
            </div>
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 3
                  ? 'bg-gradient-to-r from-blue-600 to-pink-600 text-white font-semibold border-pink-500 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              3. เลือกคุณครู
            </div>
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                currentStep >= 4
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold border-rose-500 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              4. ข้อมูล & ยืนยัน
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Select Topic & Grade Level */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                1
              </span>
              เลือกระดับชั้นและหัวข้อที่ต้องการรับคำปรึกษา
            </h3>
            <p className="text-xs text-slate-500">
              เลือกกลุ่มหัวข้อที่ตรงกับเรื่องที่คุณต้องการพูดคุยมากที่สุด
            </p>
          </div>

          {/* Level Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              ระดับชั้นของผู้ขอรับคำปรึกษา:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGradeLevelChange('m_junior')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  gradeLevel === 'm_junior'
                    ? 'border-slate-900 bg-slate-50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">ระดับมัธยมศึกษาตอนต้น</span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    ม.1 - ม.3
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  รอบบริการเวลาพัก: 11.10 – 12.00 น.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleGradeLevelChange('m_senior')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  gradeLevel === 'm_senior'
                    ? 'border-slate-900 bg-slate-50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">ระดับมัธยมศึกษาตอนปลาย</span>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                    ม.4 - ม.6
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  รอบบริการเวลาพัก: 12.00 – 12.50 น.
                </p>
              </button>
            </div>
          </div>

          {/* 4 Topic Choices */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              เลือกหัวข้อเรื่องที่ต้องการปรึกษา:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topics.map((t) => {
                const Icon = getTopicIcon(t.id);
                const isSelected = topicId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTopicId(t.id)}
                    className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold bg-slate-100 text-slate-700"
                    >
                      <Icon className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t.title}</h4>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {t.scopeDescription}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              id="booking-step1-next-btn"
              type="button"
              onClick={handleNextFromStep1}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              ถัดไป: เลือกวันและเวลา
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Day & Time Slot */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                เลือกวันและช่วงเวลาที่สะดวก
              </h3>
              <p className="text-xs text-slate-500">
                เลือกวันที่เปิดให้บริการตามตารางของศูนย์พิงใจ
              </p>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                หัวข้อ: {currentTopicObj.title}
              </span>
            </div>
          </div>

          {/* Days Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              เลือกวันในสัปดาห์:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'] as DayOfWeek[]).map((day) => {
                const isSelected = selectedDay === day;
                const targetDate = calculateTargetDate(day);
                const timetableRow = timetable.find((t) => t.day === day);
                const isMatchingTopic =
                  gradeLevel === 'm_junior'
                    ? timetableRow?.juniorTopicId === topicId
                    : timetableRow?.seniorTopicId === topicId;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{day}</span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {targetDate.split('-').slice(1).reverse().join('/')}
                    </span>
                    {isMatchingTopic && (
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded mt-1.5 ${
                        isSelected ? 'bg-slate-800 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        ตรงรอบบริการ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              ช่วงเวลาที่ต้องการนัดหมาย:
            </label>
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{timeSlot}</span>
                    <p className="text-xs text-slate-500">
                      {gradeLevel === 'm_junior'
                        ? 'ช่วงพักกลางวัน ม.ต้น (ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์)'
                        : 'ช่วงพักกลางวัน ม.ปลาย (ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์)'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-900 text-white font-semibold px-2.5 py-1 rounded-md">
                  รอบปกติ
                </span>
              </div>
            </div>
          </div>

          {/* Meeting Format */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              ช่องทางการรับคำปรึกษาที่สะดวก:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMeetingFormat('in_person')}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  meetingFormat === 'in_person'
                    ? 'border-slate-900 bg-slate-50 font-bold text-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold">พบตัวจริงที่โรงเรียน</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">อาคารประชาสัมพันธ์ (เป็นส่วนตัว)</p>
              </button>

              <button
                type="button"
                onClick={() => setMeetingFormat('online')}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  meetingFormat === 'online'
                    ? 'border-slate-900 bg-slate-50 font-bold text-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold">พูดคุยออนไลน์ (Chat/Call)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">ผ่านระบบ LINE ปลอดภัย</p>
              </button>

              <button
                type="button"
                onClick={() => setMeetingFormat('phone')}
                className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  meetingFormat === 'phone'
                    ? 'border-slate-900 bg-slate-50 font-bold text-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold">โทรศัพท์พูดคุย</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">ครูโทรติดต่อตามเวลา</p>
              </button>
            </div>

            {/* Custom / Selectable Location for In-Person meetings */}
            {meetingFormat === 'in_person' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-700" />
                    เลือกหรือปรับเปลี่ยนสถานที่นัดพบ (ตามความสะดวกของนักเรียน):
                  </span>
                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    ปลอดภัย & สบายใจ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      meetingLocation === 'ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์'
                        ? 'border-slate-900 bg-white font-semibold text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meeting-location-radio"
                      checked={meetingLocation === 'ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์'}
                      onChange={() => setMeetingLocation('ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์')}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <div className="font-semibold">ห้องศูนย์พิงใจ อาคารประชาสัมพันธ์</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        แนะนำ — พื้นที่ปลอดภัย เป็นส่วนตัว มีบรรยากาศผ่อนคลาย
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      meetingLocation === 'ห้องแนะแนว อาคาร 1'
                        ? 'border-slate-900 bg-white font-semibold text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meeting-location-radio"
                      checked={meetingLocation === 'ห้องแนะแนว อาคาร 1'}
                      onChange={() => setMeetingLocation('ห้องแนะแนว อาคาร 1')}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <div className="font-semibold">ห้องแนะแนว อาคาร 1</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        ห้องพักครูแนะแนว / ห้องกิจกรรมพัฒนาผู้เรียน
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      meetingLocation === 'ศาลาเรือนไทย / ลานกิจกรรมสงบ'
                        ? 'border-slate-900 bg-white font-semibold text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meeting-location-radio"
                      checked={meetingLocation === 'ศาลาเรือนไทย / ลานกิจกรรมสงบ'}
                      onChange={() => setMeetingLocation('ศาลาเรือนไทย / ลานกิจกรรมสงบ')}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <div className="font-semibold">ศาลาเรือนไทย / ลานสงบ</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        พื้นที่เปิดโล่ง อากาศถ่ายเท บรรยากาศร่มรื่น
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      meetingLocation === 'custom'
                        ? 'border-slate-900 bg-white font-semibold text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meeting-location-radio"
                      checked={meetingLocation === 'custom'}
                      onChange={() => setMeetingLocation('custom')}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div className="w-full">
                      <div className="font-semibold">ระบุสถานที่อื่นที่นักเรียนสะดวก</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        เช่น ม้านั่งหน้าห้องสมุด, โรงอาหาร ฯลฯ
                      </div>
                    </div>
                  </label>
                </div>

                {meetingLocation === 'custom' && (
                  <div className="pt-2 animate-fade-in">
                    <input
                      type="text"
                      value={customLocationInput}
                      onChange={(e) => setCustomLocationInput(e.target.value)}
                      placeholder="พิมพ์สถานที่นัดพบที่ต้องการ (เช่น โต๊ะหินอ่อนข้างเสาธง, หน้าร้านค้าสหกรณ์)..."
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 font-medium placeholder:font-normal"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </button>
            <button
              id="booking-step2-next-btn"
              type="button"
              onClick={handleNextFromStep2}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              ถัดไป: เลือกคุณครูที่ปรึกษา
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Choose Counselor */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-slate-200">
              <UserCheck className="w-3.5 h-3.5" />
              ขั้นตอนสำคัญ: ดูภาพถ่ายและเลือกคุณครู
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              เลือกคุณครูผู้ให้คำปรึกษาประจำหัวข้อ "{currentTopicObj.title}"
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              นักเรียนสามารถดูภาพและประวัติของคุณครูแต่ละท่านก่อนตัดสินใจเลือก เพื่อความสบายใจและความไว้วางใจสูงสุด
            </p>
          </div>

          {/* Teacher Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCounselors.map((c) => {
              const isSelected = selectedCounselor?.id === c.id;
              return (
                <div
                  key={c.id}
                  id={`counselor-card-${c.id}`}
                  onClick={() => setSelectedCounselor(c)}
                  className={`rounded-2xl border p-4 transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Photo Container */}
                  <div>
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
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-slate-900 text-white rounded-md p-1 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {c.name}
                    </h4>

                    {c.department && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {c.department}
                      </p>
                    )}

                    {c.bio && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg line-clamp-2 italic border border-slate-100">
                        "{c.bio}"
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      พร้อมรับฟัง
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCounselorAndNext(c);
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'เลือกท่านนี้แล้ว ✓' : 'เลือกครูท่านนี้'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </button>
            <button
              id="booking-step3-next-btn"
              type="button"
              disabled={!selectedCounselor}
              onClick={() => {
                if (selectedCounselor) {
                  setCurrentStep(4);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }
              }}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer ${
                selectedCounselor
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              ถัดไป: กรอกข้อมูลผู้รับคำปรึกษา
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Student Details & Privacy Options */}
      {currentStep === 4 && (
        <form onSubmit={handleFinalSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                4
              </span>
              ข้อมูลผู้ขอรับคำปรึกษาและรายละเอียด
            </h3>
            <p className="text-xs text-slate-500">
              ข้อมูลจะถูกเก็บเป็นความลับเฉพาะคุณครูผู้ให้คำปรึกษาและศูนย์พิงใจเท่านั้น
            </p>
          </div>

          {/* Privacy Choice Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">ต้องการปกปิดชื่อ / ใช้นามสมมุติหรือไม่?</h4>
                <p className="text-xs text-slate-500">
                  หากนักเรียนกังวลใจ สามารถเลือกใช้นามสมมุติได้โดยไม่ต้องระบุชื่อจริง
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                isAnonymous
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isAnonymous ? '✓ ใช้นามสมมุติอยู่' : 'เลือกใช้นามสมมุติ'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isAnonymous ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อ - นามสกุล นักเรียน <span className="text-rose-600">*</span>
                </label>
                <input
                  id="booking-student-name"
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="เช่น ด.ช.รักเรียน ขยันยิ่ง"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  นามสมมุติ / ชื่อเล่นที่ต้องการให้ครูเรียก
                </label>
                <input
                  id="booking-student-alias"
                  type="text"
                  value={studentNickname}
                  onChange={(e) => setStudentNickname(e.target.value)}
                  placeholder="เช่น น้องฟ้า, น้องเอ (นามสมมุติ)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ระดับชั้นและห้องเรียน
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="booking-student-grade"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 cursor-pointer"
                >
                  <option value="ม.1">ม.1</option>
                  <option value="ม.2">ม.2</option>
                  <option value="ม.3">ม.3</option>
                  <option value="ม.4">ม.4</option>
                  <option value="ม.5">ม.5</option>
                  <option value="ม.6">ม.6</option>
                </select>

                <input
                  id="booking-student-room"
                  type="text"
                  value={studentRoom}
                  onChange={(e) => setStudentRoom(e.target.value)}
                  placeholder="ห้อง เช่น ม.3/4"
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เบอร์โทรศัพท์สำหรับติดต่อ / รับการแจ้งเตือน <span className="text-rose-600">*</span>
              </label>
              <input
                id="booking-student-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="เช่น 089-123-4567"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                LINE ID (สำหรับรับข้อความแจ้งเตือนสถานะ)
              </label>
              <input
                id="booking-student-line"
                type="text"
                value={contactLineId}
                onChange={(e) => setContactLineId(e.target.value)}
                placeholder="เช่น student_line_id"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Brief Issue Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เรื่องที่ต้องการปรึกษาโดยย่อ (ไม่บังคับ แต่ช่วยให้คุณครูเตรียมตัวได้ดียิ่งขึ้น)
            </label>
            <textarea
              id="booking-brief-description"
              rows={3}
              value={briefIssueDescription}
              onChange={(e) => setBriefIssueDescription(e.target.value)}
              placeholder="เช่น รู้สึกเครียดเรื่องการสอบเข้ามหาวิทยาลัย หรือ มีเรื่องไม่เข้าใจกับเพื่อนสนิท..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all"
            ></textarea>
          </div>

          {/* Summary Box */}
          {selectedCounselor && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between">
                <span>สรุปข้อมูลการนัดหมาย:</span>
                <span className="text-rose-600 font-bold">
                  {selectedDay} ที่ {calculateTargetDate(selectedDay)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>
                  <strong>หัวข้อ:</strong> {currentTopicObj.title}
                </div>
                <div>
                  <strong>ช่วงเวลา:</strong> {timeSlot}
                </div>
                <div className="flex items-center gap-2">
                  <strong>ครูที่ปรึกษา:</strong>
                  <img
                    src={selectedCounselor.imageUrl}
                    alt={selectedCounselor.name}
                    className="w-4 h-4 rounded-full object-cover inline-block"
                  />
                  <span>{selectedCounselor.name}</span>
                </div>
                <div>
                  <strong>รูปแบบ:</strong>{' '}
                  {meetingFormat === 'in_person'
                    ? `พบตัวจริง (${meetingLocation === 'custom' ? (customLocationInput || 'สถานที่ที่ระบุ') : meetingLocation})`
                    : meetingFormat === 'online'
                    ? 'ออนไลน์ผ่านระบบ'
                    : 'โทรศัพท์'}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </button>
            <button
              id="booking-confirm-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 text-rose-300 ${isSubmitting ? 'animate-spin' : ''}`} />
              {isSubmitting ? 'กำลังบันทึกและส่งแจ้งเตือน...' : 'ยืนยันการลงทะเบียนนัดหมาย'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Success Confirmation & Tracking Slip */}
      {currentStep === 5 && createdAppointment && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-200 text-center relative overflow-hidden shadow-md">
            {/* Top gradient ribbon */}
            <div className="h-2 bg-gradient-to-r from-blue-700 via-sky-500 to-pink-500 -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6" />

            <div className="flex justify-center mb-3">
              <SchoolEmblem size="lg" variant="glow" />
            </div>

            <span className="bg-gradient-to-r from-blue-50 via-sky-50 to-pink-50 text-blue-900 text-xs font-bold px-3.5 py-1 rounded-full border border-sky-200">
              ✓ ลงทะเบียนขอรับคำปรึกษาสำเร็จ
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-1">
              ขอบคุณที่ไว้วางใจศูนย์พิงใจ <span className="text-pink-600">บ.ด.น.</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              ระบบได้บันทึกคำขอของคุณเรียบร้อยแล้ว และได้ส่งการแจ้งเตือนไปยังคุณครู {createdAppointment.counselorName}
            </p>

            {/* Tracking Code Highlight Box */}
            <div className="bg-gradient-to-br from-blue-50/70 via-sky-50/70 to-pink-50/70 p-5 rounded-2xl border-2 border-sky-300 max-w-md mx-auto mb-6 text-left shadow-xs">
              <span className="text-[11px] font-bold text-blue-900 block uppercase tracking-wider">
                รหัสติดตามสถานะการนัดหมายของคุณ:
              </span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-widest font-mono">
                  {createdAppointment.trackingCode}
                </span>
                <button
                  id="copy-tracking-code-btn"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-white hover:bg-sky-50 text-blue-900 border border-sky-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'คัดลอกแล้ว' : 'คัดลอกรหัส'}
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mt-2">
                * กรุณาบันทึกหรือแคปหน้าจอรหัสนี้ไว้ เพื่อใช้ติดตามสถานะนัดหมายแบบเรียลไทม์
              </p>
            </div>

            {/* Details Summary Card */}
            <div className="bg-slate-50 p-4 rounded-xl text-left text-xs max-w-md mx-auto space-y-2 border border-slate-200 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">ผู้ขอรับคำปรึกษา:</span>
                <span className="font-semibold text-slate-900">{createdAppointment.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">ครูที่ปรึกษา:</span>
                <span className="font-semibold text-slate-900">{createdAppointment.counselorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">วันและเวลานัดหมาย:</span>
                <span className="font-semibold text-slate-900">
                  {createdAppointment.appointmentDay} ({createdAppointment.appointmentDate}) {createdAppointment.appointmentTimeSlot}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">สถานะปัจจุบัน:</span>
                <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⏳ รอการยืนยันจากครู
                </span>
              </div>
            </div>

            {/* Simulated LINE Notification Preview */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-md mx-auto mb-6">
              <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ระบบส่งการแจ้งเตือนไปยัง LINE ครูที่ปรึกษาแล้ว (อัตโนมัติ)
              </div>
              <p className="text-[11px] text-slate-800 font-mono bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                🔔 [ศูนย์พิงใจ บ.ด.น.] ส่งข้อความแจ้ง {createdAppointment.counselorName} แล้ว<br />
                รหัสนัดหมาย: {createdAppointment.trackingCode}<br />
                🔗 แนบลิงก์สำหรับครูกดยืนยันนัดหมาย 1-Click ทันที
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="track-immediately-btn"
                onClick={() => {
                  setTrackingQuery(createdAppointment.trackingCode);
                  setActiveTab('tracking');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                ไปที่หน้าติดตามสถานะแบบเรียลไทม์
              </button>

              <button
                onClick={() => {
                  setCurrentStep(1);
                  setCreatedAppointment(null);
                  setSelectedCounselor(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                ลงทะเบียนนัดหมายอีกรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
