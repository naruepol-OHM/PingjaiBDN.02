import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  X,
  Sliders,
  Maximize2,
  RefreshCw,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface ImageAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (adjustedDataUrl: string) => void;
  aspectRatio?: '3:4' | '1:1' | '4:3';
  title?: string;
}

export const ImageAdjustModal: React.FC<ImageAdjustModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  aspectRatio = '4:3',
  title = 'ปรับขนาดและจัดตำแหน่งรูปถ่ายคุณครู'
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [activeRatio, setActiveRatio] = useState<'3:4' | '1:1' | '4:3'>(aspectRatio);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(imageUrl);

  useEffect(() => {
    setCurrentImageSrc(imageUrl);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  }, [imageUrl, isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
    setScale((prev) => Math.min(Math.max(0.4, Number((prev + zoomStep).toFixed(2))), 3.5));
  };

  const handleNudge = (dx: number, dy: number) => {
    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentImageSrc(event.target.result as string);
          handleReset();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    if (!imageRef.current) return;

    // Target dimensions based on ratio
    let targetWidth = 600;
    let targetHeight = 450; // 4:3 default

    if (activeRatio === '1:1') {
      targetWidth = 500;
      targetHeight = 500;
    } else if (activeRatio === '3:4') {
      targetWidth = 450;
      targetHeight = 600;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Calculate transformations
    ctx.save();
    ctx.translate(targetWidth / 2 + position.x, targetHeight / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    const img = imageRef.current;
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    // Draw centered
    ctx.drawImage(
      img,
      -naturalWidth / 2,
      -naturalHeight / 2,
      naturalWidth,
      naturalHeight
    );
    ctx.restore();

    const outputDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onSave(outputDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  const getAspectRatioClasses = () => {
    switch (activeRatio) {
      case '1:1':
        return 'aspect-square max-w-[320px] sm:max-w-[360px]';
      case '3:4':
        return 'aspect-3/4 max-w-[300px] sm:max-w-[330px]';
      case '4:3':
      default:
        return 'aspect-4/3 max-w-[360px] sm:max-w-[420px]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        id="image-adjust-modal-container"
        className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-rose-300" />
            <h3 className="text-sm sm:text-base font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Ratio Selector & Helper text */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">สัดส่วนกรอบ:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveRatio('4:3')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeRatio === '4:3' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  4:3 (แนวนอนมาตรฐาน)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRatio('1:1')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeRatio === '1:1' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1:1 (จัตุรัส)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRatio('3:4')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeRatio === '3:4' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3:4 (รูปถ่ายทางการ)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
              >
                <Upload className="w-3 h-3 text-slate-600" />
                เปลี่ยนรูปอื่น
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Interactive Canvas / Crop Area */}
          <div className="flex flex-col items-center justify-center bg-slate-950/5 rounded-2xl p-3 sm:p-4 border border-dashed border-slate-300 select-none">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              className={`w-full mx-auto relative overflow-hidden rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-inner cursor-grab active:cursor-grabbing flex items-center justify-center ${getAspectRatioClasses()}`}
            >
              {/* Guidelines Grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-30">
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-white/50" />
                <div className="border-r border-white/50" />
                <div />
              </div>

              {/* Transformable Image */}
              <img
                ref={imageRef}
                src={currentImageSrc}
                alt="Adjustable Preview"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  transition: isDragging ? 'none' : 'transform 0.08s ease-out'
                }}
                className="max-w-none origin-center pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />

              {/* Tooltip Overlay */}
              <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none z-20">
                <span className="text-[10px] bg-black/60 backdrop-blur-xs text-white/90 px-2 py-0.5 rounded-md font-mono">
                  {Math.round(scale * 100)}% | X:{position.x} Y:{position.y}
                </span>
                <span className="text-[10px] bg-black/60 backdrop-blur-xs text-white/90 px-2 py-0.5 rounded-md">
                  คลิกค้างแล้วลากเพื่อขยับรูป
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Sliders & Precise Controls */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                  ปรับขนาดรูป (Zoom / Scale)
                </span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                  <span>{Math.round(scale * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  title="ย่อขนาด"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="0.4"
                  max="3.5"
                  step="0.02"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 accent-slate-900 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.min(3.5, Number((prev + 0.1).toFixed(2))))}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  title="ขยายขนาด"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Position Nudge Pad & Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              {/* Nudge Buttons */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Move className="w-3.5 h-3.5 text-slate-500" />
                  เลื่อนตำแหน่ง:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudge(-10, 0)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    title="เลื่อนซ้าย"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudge(0, -10)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    title="เลื่อนขึ้น"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudge(0, 10)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    title="เลื่อนลง"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudge(10, 0)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    title="เลื่อนขวา"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rotate & Reset */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                  หมุนรูป ({rotation}°)
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="รีเซ็ตตำแหน่งและขนาดเดิม"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  รีเซ็ต
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-100 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            ยกเลิก
          </button>
          <button
            id="apply-image-adjust-btn"
            type="button"
            onClick={handleApply}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            นำรูปภาพที่ปรับแล้วไปใช้
          </button>
        </div>
      </div>
    </div>
  );
};
