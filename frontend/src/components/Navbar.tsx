import React, { useState } from 'react';
import {
  User,
  Shield,
  Stethoscope,
  Building2,
  BarChart3,
  Globe2,
  Wifi,
  WifiOff,
  MessageSquare,
  AlertTriangle,
  PlayCircle,
  RotateCcw,
  PhoneCall,
  Lock,
  ChevronDown
} from 'lucide-react';
import { UserRole, LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { AbhaBadge, UWinBadge, MohfwLogo, AarogyaRakshakLogo } from './GovtEmblem';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingQueueCount: number;
  onOpenSmsDrawer: () => void;
  smsCount: number;
  onOpenEmergency: () => void;
  onSelectDemoScenario: (scenario: 'demo1' | 'demo2' | 'demo3' | 'demo4' | 'demo5') => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  isOffline,
  onToggleOffline,
  pendingQueueCount,
  onOpenSmsDrawer,
  smsCount,
  onOpenEmergency,
  onSelectDemoScenario,
  onResetData
}) => {
  const t = translations[language];
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  return (
    <header className="bg-white text-slate-900 sticky top-0 z-40 shadow-xs border-b border-slate-200">
      {/* Official Executive Accent Strip */}
      <div className="govt-tricolor-strip" />

      {/* Top Utility & Accessibility Bar */}
      <div className="bg-slate-50 border-b border-slate-200 text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Ministry of Health and Family Welfare Logo */}
          <div className="flex items-center gap-3">
            <MohfwLogo className="h-7 sm:h-8" />
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-bold text-slate-900">
                {language === 'mr' ? 'महाराष्ट्र शासन' : language === 'hi' ? 'महाराष्ट्र सरकार' : 'Government of Maharashtra'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-600 hidden lg:inline">
                {language === 'mr' ? 'सार्वजनिक आरोग्य आणि कुटुंब कल्याण मंत्रालय' : language === 'hi' ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' : 'Ministry of Health and Family Welfare'}
              </span>
            </div>
          </div>

          {/* Right: Accessibility Controls & Emergency Helpline */}
          <div className="flex items-center gap-3 text-[11px]">
            {/* Helpline quick triggers */}
            <div className="hidden lg:flex items-center gap-2 pr-2 border-r border-slate-200 text-slate-600">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <PhoneCall className="w-3 h-3 text-slate-500" /> 104 Health Helpline
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <PhoneCall className="w-3 h-3 text-slate-500" /> 108 Emergency Ambulance
              </span>
            </div>

            {/* Emergency 108 Action Button */}
            <button
              onClick={onOpenEmergency}
              className="px-2.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" /> 108 Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Main Official Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Header with AarogyaRakshak Emblem Logo */}
        <div className="flex items-center gap-3">
          <AarogyaRakshakLogo className="w-9 h-9 shrink-0 shadow-xs border border-slate-200 rounded-lg" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {language === 'mr' ? 'आरोग्यरक्षक' : language === 'hi' ? 'आरोग्यरक्षक' : 'AarogyaRakshak'}
          </h1>
        </div>

        {/* Right Utility Controls (Language & Rural Offline simulator) */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 px-2 py-1">
            <Globe2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-white">English</option>
              <option value="mr" className="bg-white">मराठी (Marathi)</option>
              <option value="hi" className="bg-white">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Rural Connectivity Toggle */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? 'Offline mode active. Click to restore connection.' : 'Connected. Click to simulate rural low connectivity.'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              isOffline
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline Mode ({pendingQueueCount})</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Online Grid</span>
              </>
            )}
          </button>

          {/* SMS / Communication Log Drawer */}
          <button
            onClick={onOpenSmsDrawer}
            title="Twilio SMS & Patient Notification Log"
            className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            {smsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                {smsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Official Government Workspace Role Navigation Bar */}
      <div className="bg-slate-100/80 border-t border-slate-200 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onRoleChange('patient')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                currentRole === 'patient'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>{t.rolePatient}</span>
            </button>

            <button
              onClick={() => onRoleChange('asha')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                currentRole === 'asha'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>{t.roleAsha}</span>
            </button>

            <button
              onClick={() => onRoleChange('staff')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                currentRole === 'staff'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{t.roleStaff}</span>
            </button>

            <button
              onClick={() => onRoleChange('doctor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                currentRole === 'doctor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-slate-400" />
              <span>{t.roleDoctor}</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>{t.roleAdmin}</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-500 border-l border-slate-200 pl-3">
            <Lock className="w-3 h-3 text-slate-500" />
            <span className="font-semibold text-slate-700">
              {language === 'mr' ? 'सुरक्षित शासकीय पोर्टल' : language === 'hi' ? 'सुरक्षित सरकारी पोर्टल' : 'Official Govt Portal'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
