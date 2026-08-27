import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolEmblem } from '../SchoolEmblem';
import { compressImageFile } from '../../utils/imageUtils';
import {
  Building2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Save,
  Eye,
  AlertCircle,
  Link as LinkIcon,
  Shield,
  Layers,
  HelpCircle,
  Loader2,
  X
} from 'lucide-react';
import { SchoolInfo } from '../../types';

export const SchoolBrandingManager: React.FC = () => {
  const { schoolInfo, updateSchoolInfo, resetSchoolInfoToDefault, addToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [logoType, setLogoType] = useState<'vector' | 'image'>(
    schoolInfo.customLogoType || (schoolInfo.logoUrl ? 'image' : 'vector')
  );
  const [logoUrl, setLogoUrl] = useState<string>(schoolInfo.logoUrl || '');
  const [logoShape, setLogoShape] = useState<'circle' | 'rounded' | 'original'>(schoolInfo.logoShape || 'circle');
  const [logoFit, setLogoFit] = useState<'contain' | 'cover'>(schoolInfo.logoFit || 'contain');
  const [logoPadding, setLogoPadding] = useState<'none' | 'small' | 'medium'>(schoolInfo.logoPadding || 'small');
  const [schoolName, setSchoolName] = useState<string>(schoolInfo.schoolName);
  const [centerName, setCenterName] = useState<string>(schoolInfo.centerName);
  const [shortName, setShortName] = useState<string>(schoolInfo.shortName);
  const [slogan, setSlogan] = useState<string>(schoolInfo.slogan);
  const [location, setLocation] = useState<string>(schoolInfo.location);

  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewTab, setPreviewTab] = useState<'navbar' | 'hero' | 'badge'>('hero');

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'ไฟล์ไม่ถูกต้อง',
        message: 'กรุณาเลือกไฟล์รูปภาพ เช่น PNG, JPG, WebP หรือ SVG'
      });
      return;
    }

    setIsProcessingFile(true);
    try {
      // Compress image safely (max 800px, 0.88 quality)
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.88,
        mimeType: 'image/jpeg'
      });

      setLogoUrl(compressedDataUrl);
      setLogoType('image');
      addToast({
        type: 'success',
        title: 'อัปโหลดรูปโลโก้เรียบร้อย',
        message: 'ประมวลผลและปรับขนาดภาพให้เหมาะสมพร้อมใช้งานทันที'
      });
    } catch (err: any) {
      console.error('Error processing logo image:', err);
      addToast({
        type: 'error',
        title: 'ไม่สามารถโหลดรูปภาพได้',
        message: err.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ'
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // reset input value so re-selecting same file triggers change
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolName.trim()) {
      addToast({
        type: 'warning',
        title: 'กรุณาระบุชื่อโรงเรียน',
        message: 'ชื่อโรงเรียนไม่สามารถเว้นว่างได้'
      });
      return;
    }

    const updatedInfo: SchoolInfo = {
      ...schoolInfo,
      schoolName: schoolName.trim(),
      centerName: centerName.trim(),
      shortName: shortName.trim(),
      slogan: slogan.trim(),
      location: location.trim(),
      logoUrl: logoType === 'image' ? logoUrl.trim() : undefined,
      customLogoType: logoType,
      logoShape,
      logoFit,
      logoPadding
    };

    updateSchoolInfo(updatedInfo);
  };

  const handleResetToDefault = () => {
    if (window.confirm('คุณต้องการคืนค่าตราสัญลักษณ์พระเกี้ยวและข้อมูลโรงเรียนตั้งต้นใช่หรือไม่?')) {
      resetSchoolInfoToDefault();
      setLogoType('vector');
      setLogoUrl('');
      setLogoShape('circle');
      setLogoFit('contain');
      setLogoPadding('small');
      setSchoolName('โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี');
      setCenterName('ศูนย์พิทักษ์สิทธิ เสรีภาพ และความปลอดภัย "ศูนย์พิงใจ"');
      setShortName('ศูนย์พิงใจ บ.ด.น.');
      setSlogan('เพราะทุกเรื่องที่อยากคุย มีคนพร้อมรับฟัง');
      setLocation('ห้องศูนย์พิงใจ อาคาร 1 ชั้น 2 โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-900" />
            ตั้งค่าตราสัญลักษณ์ (โลโก้) & ข้อมูลโรงเรียน
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ปรับแต่งตราสัญลักษณ์ประจำโรงเรียน โลโก้เว็บ และข้อมูลติดต่อที่ปรากฏทั่วทั้งระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          คืนค่าโลโก้ต้นฉบับ บ.ด.น.
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Logo Selection & Uploader (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: Select Logo Display Mode */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-700" />
                1. เลือกรูปแบบตราสัญลักษณ์ / โลโก้
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Official Vector Phra Kiao */}
                <div
                  onClick={() => setLogoType('vector')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2.5 ${
                    logoType === 'vector'
                      ? 'border-slate-900 bg-slate-50/80 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-14 h-14 p-1 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                    <SchoolEmblem size="md" forceVector={true} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                      ตราสัญลักษณ์พระเกี้ยวทางการ
                      {logoType === 'vector' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ตราพระเกี้ยว บ.ด.น. คมชัดระดับ Vector
                    </p>
                  </div>
                </div>

                {/* Option B: Custom Uploaded Logo */}
                <div
                  onClick={() => setLogoType('image')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2.5 ${
                    logoType === 'image'
                      ? 'border-slate-900 bg-slate-50/80 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-14 h-14 p-1 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Custom Logo"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                      อัปโหลดโลโก้โรงเรียนเอง
                      {logoType === 'image' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ใช้ไฟล์รูปภาพ PNG / JPG ของท่าน
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Card if Custom Logo is selected */}
              {logoType === 'image' && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    อัปโหลดรูปภาพตราสัญลักษณ์ / โลโก้โรงเรียน
                  </label>

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-slate-900 bg-slate-100'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {isProcessingFile ? (
                      <div className="flex flex-col items-center justify-center py-2 text-slate-600">
                        <Loader2 className="w-7 h-7 animate-spin mb-2 text-slate-900" />
                        <span className="text-xs font-medium">กำลังประมวลผลรูปภาพ...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            คลิกเพื่อเลือกไฟล์รูป หรือ ลากรูปมาวางที่นี่
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            รองรับไฟล์ PNG, JPG, JPEG, WebP (ระบบจะย่อขนาดและปรับให้คมชัดอัตโนมัติ)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct URL input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      หรือระบุ URL รูปภาพโลโก้:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="ล้างค่า"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logo Display Customization: Shape, Fit, Padding */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        ปรับแต่งการจัดวางให้พอดีกรอบ (Fit & Framing)
                      </label>
                      <span className="text-[10px] text-slate-500">แก้ปัญหาโลโก้ล้นหรือมุมไม่เข้ากรอบ</span>
                    </div>

                    {/* Shape Selector */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                        รูปทรงการตัดมุมภาพ (Logo Shape):
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setLogoShape('circle')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            logoShape === 'circle'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full border border-current"></div>
                          วงกลม (Circle)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoShape('rounded')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            logoShape === 'rounded'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-3 h-3 rounded-xs border border-current"></div>
                          มุมมน (Rounded)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoShape('original')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            logoShape === 'original'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-3 h-3 border border-current"></div>
                          ต้นฉบับ (Original)
                        </button>
                      </div>
                    </div>

                    {/* Fit Mode Selector */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                        การจัดสเกลรูปภาพ (Image Fit):
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLogoFit('contain')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                            logoFit === 'contain'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          พอดีกรอบ (Contain - แสดงครบทุกส่วน)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoFit('cover')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                            logoFit === 'cover'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          เติมเต็มพื้นที่ (Cover - ครอปเต็มกรอบ)
                        </button>
                      </div>
                    </div>

                    {/* Padding Selector */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                        ระยะขอบด้านใน (Internal Padding):
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setLogoPadding('none')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                            logoPadding === 'none'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          ไม่มีขอบ (ชิดขอบ)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoPadding('small')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                            logoPadding === 'small'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          พอดี (แนะนำ)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoPadding('medium')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                            logoPadding === 'medium'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          ระยะขอบกว้าง
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: School Information Fields */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                2. ข้อมูลโรงเรียนและศูนย์พิงใจ
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อโรงเรียนแบบเต็ม:
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อย่อ / อักษรย่อ:
                  </label>
                  <input
                    type="text"
                    required
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อศูนย์ให้คำปรึกษา:
                  </label>
                  <input
                    type="text"
                    required
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สโลแกน / คติพจน์ประจำศูนย์:
                  </label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่ตั้งห้องศูนย์พิงใจ:
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-time Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-700" />
                  ตัวอย่างการแสดงผลจริง (Live Preview)
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  อัปเดตแบบเรียลไทม์
                </span>
              </div>

              {/* Preview Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPreviewTab('hero')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    previewTab === 'hero'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  หน้าหลัก Hero
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('navbar')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    previewTab === 'navbar'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  แถบเมนูด้านบน
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('badge')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                    previewTab === 'badge'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ตราขนาดใหญ่
                </button>
              </div>

              {/* Preview Canvas */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center min-h-[220px]">
                {previewTab === 'hero' && (
                  <div className="w-full text-center space-y-3">
                    <div className="inline-flex p-2.5 bg-white rounded-full shadow-md border border-slate-200 overflow-hidden">
                      <SchoolEmblem
                        size="lg"
                        shape={logoShape}
                        fit={logoFit}
                        padding={logoPadding}
                        overrideLogoUrl={logoType === 'image' ? logoUrl : undefined}
                        forceVector={logoType === 'vector'}
                      />
                    </div>
                    <div>
                      <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 mb-1">
                        {shortName || 'บ.ด.น.'}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900">{schoolName}</h5>
                      <p className="text-xs text-slate-500 italic mt-0.5">"{slogan}"</p>
                    </div>
                  </div>
                )}

                {previewTab === 'navbar' && (
                  <div className="w-full bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="p-1 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                      <SchoolEmblem
                        size="sm"
                        shape={logoShape}
                        fit={logoFit}
                        padding={logoPadding}
                        overrideLogoUrl={logoType === 'image' ? logoUrl : undefined}
                        forceVector={logoType === 'vector'}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {centerName || 'ศูนย์พิงใจ'} <span className="text-slate-700 font-extrabold">{shortName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {schoolName}
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === 'badge' && (
                  <div className="flex flex-col items-center justify-center p-4">
                    <SchoolEmblem
                      size="xl"
                      variant="glow"
                      shape={logoShape}
                      fit={logoFit}
                      padding={logoPadding}
                      overrideLogoUrl={logoType === 'image' ? logoUrl : undefined}
                      forceVector={logoType === 'vector'}
                    />
                    <div className="mt-3 text-xs font-bold text-slate-700">
                      ขนาดใหญ่ (High Resolution Display)
                    </div>
                  </div>
                )}
              </div>

              {/* Status summary */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>โหมดโลโก้ที่เลือก:</span>
                  <span className="font-semibold text-slate-900">
                    {logoType === 'vector' ? 'ตราพระเกี้ยวทางการ (Vector SVG)' : 'รูปภาพที่อัปโหลดเอง'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>สถานะการบันทึก:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> พร้อมใช้งาน
                  </span>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="pt-4 mt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  บันทึกการตั้งค่าตราสัญลักษณ์ & ข้อมูลโรงเรียน
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
