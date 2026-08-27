import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolEmblem } from './SchoolEmblem';
import {
  HeartHandshake,
  Calendar,
  Search,
  UserCheck,
  PhoneCall,
  Shield,
  Lock,
  LogOut,
  Sparkles,
  Menu,
  X,
  Clock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    trackingQuery,
    setTrackingQuery,
    isAdminAuthenticated,
    logoutAdmin,
    appointments,
    schoolInfo
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchInput, setNavSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchInput.trim()) {
      setTrackingQuery(navSearchInput.trim());
      setActiveTab('tracking');
      setNavSearchInput('');
      setMobileMenuOpen(false);
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  const navItems = [
    { id: 'home', label: 'หน้าหลัก', icon: HeartHandshake },
    { id: 'timetable', label: 'ตารางบริการ', fullLabel: 'ตารางการให้บริการ', icon: Clock },
    { id: 'booking', label: 'ลงทะเบียนนัดหมาย', fullLabel: 'ลงทะเบียนนัดหมาย', icon: Calendar, highlight: true },
    { id: 'tracking', label: 'ติดตามสถานะ', fullLabel: 'ติดตามสถานะ', icon: Search },
    { id: 'counselors', label: 'ครูที่ปรึกษา', fullLabel: 'รายชื่อครูที่ปรึกษา', icon: UserCheck },
    { id: 'hotlines', label: 'สายด่วนช่วยเหลือ', fullLabel: 'สายด่วนและช่วยเหลือ', icon: PhoneCall }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top School Bar: Royal Blue -> Sky Blue -> Pink */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-700 to-pink-600 text-white px-3 sm:px-4 py-1 text-xs font-medium shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold tracking-wide backdrop-blur-xs border border-white/30 whitespace-nowrap shrink-0">
              {schoolInfo.shortName?.includes('บ.ด.น.') ? 'บ.ด.น.' : (schoolInfo.shortName || 'บ.ด.น.')}
            </span>
            <span className="truncate text-white font-medium text-[11px] sm:text-xs">
              {schoolInfo.schoolName}
            </span>
            <span className="hidden lg:inline text-white/40 shrink-0">|</span>
            <span className="hidden lg:inline text-sky-100 text-[11px] italic truncate max-w-xs xl:max-w-sm">
              "{schoolInfo.slogan}"
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0 whitespace-nowrap">
            <span className="hidden sm:flex items-center gap-1.5 text-emerald-300 font-medium text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ศูนย์พิงใจ ออนไลน์ 24 ชม.
            </span>
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1.5 bg-black/25 px-2 py-0.5 rounded-md border border-white/20 text-[10px] sm:text-[11px]">
                <Shield className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="font-semibold text-amber-200">โหมดครู</span>
                <button
                  id="navbar-logout-btn"
                  onClick={logoutAdmin}
                  className="text-pink-200 hover:text-white ml-0.5 flex items-center gap-0.5 underline cursor-pointer"
                  title="ออกจากระบบครู"
                >
                  <LogOut className="w-3 h-3 shrink-0" />
                  ออก
                </button>
              </div>
            ) : (
              <button
                id="navbar-admin-login-btn"
                onClick={() => setActiveTab('admin')}
                className="text-pink-100 hover:text-white flex items-center gap-1 transition-colors cursor-pointer bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px]"
              >
                <Lock className="w-3 h-3 text-pink-200 shrink-0" />
                สำหรับครู/แอดมิน
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Center Title with Official Emblem */}
          <div
            id="brand-logo-btn"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 min-w-0"
          >
            {/* Official School Emblem Component */}
            <div className="p-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs group-hover:scale-105 group-hover:shadow-xs transition-all overflow-hidden flex items-center justify-center shrink-0">
              <SchoolEmblem size="md" variant="shield" shape="rounded" />
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <h1 className="text-sm sm:text-base lg:text-base xl:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap flex items-center gap-1">
                  <span>ศูนย์พิงใจ</span>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md whitespace-nowrap">
                    บ.ด.น.
                  </span>
                </h1>
                <span className="hidden 2xl:inline-flex whitespace-nowrap bg-gradient-to-r from-blue-50 via-sky-50 to-pink-50 text-blue-900 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-sky-200">
                  พิทักษ์สิทธิ & ความปลอดภัย
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 whitespace-nowrap truncate max-w-[150px] xs:max-w-[200px] sm:max-w-[260px] md:max-w-xs lg:max-w-[220px] xl:max-w-sm">
                บริการให้คำปรึกษานักเรียน โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) นนทบุรี
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] xl:text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-pink-600 text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 shadow-xs'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  <span className="hidden xl:inline">{item.fullLabel}</span>
                  <span className="xl:hidden">{item.label}</span>
                  {item.id === 'booking' && !isActive && (
                    <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}

            {/* Admin Portal Tab */}
            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] xl:text-xs font-medium transition-all cursor-pointer ml-0.5 whitespace-nowrap shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>ระบบหลังบ้าน</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shrink-0">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Tracking Search Box (Shown on wider desktop) */}
          <div className="hidden xl:flex items-center shrink-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="quick-tracking-search-input"
                type="text"
                value={navSearchInput}
                onChange={(e) => setNavSearchInput(e.target.value)}
                placeholder="ค้นหารหัส BDN-XXXX..."
                className="w-36 2xl:w-44 pl-7 pr-11 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white text-slate-800 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <button
                type="submit"
                className="absolute right-1 top-1 text-[10px] bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white px-1.5 py-0.5 rounded-lg font-medium cursor-pointer"
              >
                เช็ค
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-md animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={navSearchInput}
              onChange={(e) => setNavSearchInput(e.target.value)}
              placeholder="ค้นหารหัส BDN-XXXX เพื่อเช็คสถานะ..."
              className="w-full pl-9 pr-14 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 text-xs bg-gradient-to-r from-blue-600 to-pink-600 text-white px-3 py-1 rounded-lg font-medium cursor-pointer"
            >
              ค้นหา
            </button>
          </form>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-pink-600 text-white font-semibold'
                      : item.highlight
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 flex justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.fullLabel}</span>
                  </div>
                  {item.highlight && <Sparkles className="w-3.5 h-3.5 text-yellow-200 shrink-0" />}
                </button>
              );
            })}

            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 flex justify-center shrink-0">
                  <Shield className="w-4 h-4 text-amber-500" />
                </div>
                <span>ระบบจัดการหลังบ้าน (ครู/แอดมิน)</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] rounded-full font-bold shrink-0">
                  {pendingCount} ใหม่
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

