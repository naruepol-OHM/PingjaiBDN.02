import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { compressImageFile, COUNSELOR_PRESET_AVATARS } from '../../utils/imageUtils';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Save,
  X,
  CheckCircle2,
  Search,
  Upload,
  Sparkles,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { Counselor, TopicId } from '../../types';

export const TeacherManager: React.FC = () => {
  const { counselors, topics, addCounselor, updateCounselor, deleteCounselor, addToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('ครูผู้ให้คำปรึกษา');
  const [department, setDepartment] = useState('กลุ่มสาระการเรียนรู้...');
  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>(['mental_health']);
  const [imageUrl, setImageUrl] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const startEdit = (c: Counselor) => {
    setEditingCounselor(c);
    setIsCreatingNew(false);
    setName(c.name);
    setRoleTitle(c.roleTitle || 'ครูผู้ให้คำปรึกษา');
    setDepartment(c.department || '');
    setSelectedTopics(c.topicIds);
    setImageUrl(c.imageUrl);
    setBio(c.bio || '');
    setPhone(c.phone || '');
    setLineId(c.lineId || '');
    setIsActive(c.isActive);
  };

  const startNew = () => {
    setEditingCounselor(null);
    setIsCreatingNew(true);
    setName('');
    setRoleTitle('ครูผู้ให้คำปรึกษา');
    setDepartment('กลุ่มสาระการเรียนรู้...');
    setSelectedTopics(['mental_health']);
    setImageUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400');
    setBio('พร้อมรับฟังและให้คำปรึกษาด้วยความเข้าใจและเป็นความลับ');
    setPhone('');
    setLineId('');
    setIsActive(true);
  };

  const cancelForm = () => {
    setEditingCounselor(null);
    setIsCreatingNew(false);
  };

  const handleTopicToggle = (topicId: TopicId) => {
    if (selectedTopics.includes(topicId)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topicId));
      } else {
        addToast({
          type: 'warning',
          title: 'ต้องมีอย่างน้อย 1 หัวข้อ',
          message: 'คุณครูต้องสังกัดอย่างน้อยหนึ่งกลุ่มหัวข้อ'
        });
      }
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // Use compressed image upload to avoid thread freeze and huge payloads
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.84,
        mimeType: 'image/jpeg'
      });

      setImageUrl(compressedDataUrl);
      addToast({
        type: 'success',
        title: 'อัปโหลดรูปถ่ายเรียบร้อย',
        message: 'รูปถ่ายถูกย่อขนาดและบันทึกในระบบเรียบร้อยแล้ว'
      });
    } catch (err: any) {
      console.error('Teacher photo upload error:', err);
      addToast({
        type: 'error',
        title: 'อัปโหลดรูปไม่สำเร็จ',
        message: err.message || 'เกิดข้อผิดพลาดในการโหลดรูปภาพ'
      });
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast({
        type: 'warning',
        title: 'กรุณากรอกชื่อครู',
        message: 'โปรดระบุชื่อและนามสกุลของคุณครู'
      });
      return;
    }

    if (isCreatingNew) {
      addCounselor({
        name: name.trim(),
        roleTitle: roleTitle.trim(),
        department: department.trim(),
        topicIds: selectedTopics,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        bio: bio.trim(),
        phone: phone.trim(),
        lineId: lineId.trim(),
        isActive
      });
    } else if (editingCounselor) {
      updateCounselor({
        ...editingCounselor,
        name: name.trim(),
        roleTitle: roleTitle.trim(),
        department: department.trim(),
        topicIds: selectedTopics,
        imageUrl: imageUrl || editingCounselor.imageUrl,
        bio: bio.trim(),
        phone: phone.trim(),
        lineId: lineId.trim(),
        isActive
      });
    }

    cancelForm();
  };

  const filteredList = counselors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.department && c.department.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-900" />
            ระบบจัดการรายชื่อและรูปภาพครูที่ปรึกษา ({counselors.length} ท่าน)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            สามารถเพิ่ม ลบ แก้ไขข้อมูล อัปโหลดรูปภาพ และกำหนดหัวข้อที่เชี่ยวชาญได้
          </p>
        </div>

        <button
          id="add-new-counselor-btn"
          onClick={startNew}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มคุณครูท่านใหม่
        </button>
      </div>

      {/* Edit / Create Form Modal or Inline Panel */}
      {(isCreatingNew || editingCounselor) && (
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700" />
              {isCreatingNew ? 'เพิ่มคุณครูผู้ให้คำปรึกษาท่านใหม่' : `แก้ไขข้อมูล: ${editingCounselor?.name}`}
            </h4>
            <button onClick={cancelForm} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Upload and Preview Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    รูปถ่ายคุณครู (Photo Preview)
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400')}
                      className="text-[10px] text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      รูปเริ่มต้น
                    </button>
                  )}
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 hover:border-slate-400 relative group cursor-pointer shadow-2xs transition-all"
                >
                  <img
                    src={imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isUploadingPhoto ? (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-medium gap-1.5">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                      <span>กำลังประมวลผลรูป...</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
                      <Upload className="w-5 h-5" />
                      <span>คลิกเพื่อเปลี่ยนรูป</span>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {isUploadingPhoto ? 'กำลังโหลดรูปภาพ...' : 'อัปโหลดรูปจากเครื่อง'}
                  </button>
                </div>

                {/* Preset Avatars Picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    หรือเลือกรูปโปรไฟล์สำเร็จรูป:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {COUNSELOR_PRESET_AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(avatar.url)}
                        title={avatar.name}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          imageUrl === avatar.url
                            ? 'border-slate-900 ring-1 ring-slate-900 scale-95'
                            : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    หรือระบุ URL รูปภาพ:
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... หรือ data:image/..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Information Fields Column */}
              <div className="md:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อ - นามสกุล คุณครู <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น นางสาววิภาดา สิงหเสนี"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ตำแหน่ง / บทบาท
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="เช่น ครูผู้ให้คำปรึกษา, รองผู้อำนวยการ"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      กลุ่มสาระฯ / ฝ่ายงาน
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="เช่น งานแนะแนว / กลุ่มสาระการเรียนรู้..."
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ / LINE ID
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08x-xxx-xxxx"
                        className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                      <input
                        type="text"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        placeholder="@line_id"
                        className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    หัวข้อที่ประจำการ / เชี่ยวชาญ (สามารถเลือกได้มากกว่า 1 ข้อ):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {topics.map((t) => {
                      const isSelected = selectedTopics.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTopicToggle(t.id)}
                          className={`p-2 rounded-xl text-[11px] font-semibold border transition-colors text-left cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {t.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คำแนะนำสั้น ๆ หรือความเชี่ยวชาญพิเศษ (Bio)
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="เช่น ยินดีรับฟังทุกปัญหาความเครียด เทคนิคการจัดการอารมณ์..."
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-slate-900 w-4 h-4 rounded"
                    />
                    เปิดสถานะพร้อมให้คำปรึกษา (Active)
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                id="save-counselor-form-btn"
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                บันทึกข้อมูลคุณครู
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Field */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="ค้นหาชื่อครูในระบบหลังบ้าน..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {/* Teachers List Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-3 px-4 w-16 text-center">รูปภาพ</th>
                <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4">ตำแหน่ง / กลุ่มสาระ</th>
                <th className="py-3 px-4">หัวข้อที่สังกัด</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((c) => {
                const assignedTopics = topics.filter((t) => c.topicIds.includes(t.id));
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-center">
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      <div>{c.name}</div>
                      {c.roleTitle && (
                        <span className="text-[10px] text-slate-500 font-normal">
                          {c.roleTitle}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {c.department || '-'}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedTopics.map((at) => (
                          <span
                            key={at.id}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: at.bgColor,
                              color: at.color,
                              borderColor: at.borderColor
                            }}
                          >
                            {at.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {c.isActive ? 'เปิดรับนัด' : 'ปิดชั่วคราว'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบคุณครู ${c.name}?`)) {
                              deleteCounselor(c.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="ลบคุณครู"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
