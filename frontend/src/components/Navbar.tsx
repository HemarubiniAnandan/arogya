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
    <header className="bg-[#07172F] text-white sticky top-0 z-40 shadow-lg border-b-2 border-[#D97706]">
      {/* Official Government Tricolor Top Accent Strip */}
      <div className="govt-tricolor-strip" />

      {/* Top Utility & Accessibility Bar */}
      <div className="bg-[#0A2540] border-b border-blue-900/60 text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Ministry of Health and Family Welfare Logo */}
          <div className="flex items-center gap-3">
            <MohfwLogo className="h-7 sm:h-8" />
            <div className="flex items-center gap-2 text-slate-200">
              <span className="font-bold text-amber-400">
                {language === 'mr' ? 'महाराष्ट्र शासन' : language === 'hi' ? 'महाराष्ट्र सरकार' : 'Government of Maharashtra'}
              </span>
              <span className="text-slate-400">|</span>
              <span className="font-medium text-slate-100 hidden lg:inline">
                {language === 'mr' ? 'सार्वजनिक आरोग्य आणि कुटुंब कल्याण मंत्रालय' : language === 'hi' ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' : 'Ministry of Health and Family Welfare'}
              </span>
            </div>
          </div>

          {/* Right: Accessibility Controls & Emergency Helpline */}
          <div className="flex items-center gap-3 text-[11px]">
            {/* Helpline quick triggers */}
            <div className="hidden lg:flex items-center gap-2 pr-2 border-r border-slate-700/80 text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <PhoneCall className="w-3 h-3" /> 104 Health Helpline
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <PhoneCall className="w-3 h-3" /> 108 Emergency Ambulance
              </span>
            </div>

            {/* Emergency 108 Action Button */}
            <button
              onClick={onOpenEmergency}
              className="px-2.5 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
            >
              <AlertTriangle className="w-3 h-3" /> 108 Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Main Official Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Header with AarogyaRakshak Emblem Logo */}
        <div className="flex items-center gap-3.5">
          <AarogyaRakshakLogo className="w-12 h-12 shrink-0 drop-shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
                {language === 'mr' ? 'आरोग्यरक्षक' : language === 'hi' ? 'आरोग्यरक्षक' : 'AarogyaRakshak'}
                <span className="text-amber-400 font-sans text-xs font-bold uppercase ml-2 px-2 py-0.5 rounded bg-blue-950 border border-amber-500/40">
                  {language === 'mr' ? 'ग्रामीण आरोग्य व्यासपीठ' : language === 'hi' ? 'ग्रामीण स्वास्थ्य मंच' : 'Rural Health Portal'}
                </span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-900 text-amber-300 border border-amber-500/40 rounded tracking-wider uppercase hidden sm:inline-block">
                {language === 'mr' ? 'महाराष्ट्र शासन' : language === 'hi' ? 'महाराष्ट्र सरकार' : 'GOVT OF MAHARASHTRA'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Healthy Villages, Stronger Maharashtra • {language === 'mr' ? 'एक रुग्ण, एक अखंड आरोग्य प्रवास' : language === 'hi' ? 'एक मरीज़, एक जुड़ा हुआ स्वास्थ्य सफर' : 'One Patient, One Connected Health Journey'}
            </p>
          </div>
        </div>

        {/* Clean Official Ministry Header Accent */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-blue-900/80 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
            Public Health Department
          </span>
        </div>

        {/* Right Utility Controls (Language & Rural Offline simulator) */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#0F3460] rounded border border-blue-700/60 px-2 py-1">
            <Globe2 className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-[#07172F]">English</option>
              <option value="mr" className="bg-[#07172F]">मराठी (Marathi)</option>
              <option value="hi" className="bg-[#07172F]">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Rural Connectivity Toggle */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? 'Offline mode active. Click to restore connection.' : 'Connected. Click to simulate rural low connectivity.'}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition ${
              isOffline
                ? 'bg-amber-950 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-[#0F3460] border-blue-700/60 text-slate-200 hover:text-white'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Mode ({pendingQueueCount})</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online Grid</span>
              </>
            )}
          </button>

          {/* SMS / Communication Log Drawer */}
          <button
            onClick={onOpenSmsDrawer}
            title="Twilio SMS & Patient Notification Log"
            className="relative p-1.5 rounded bg-[#0F3460] hover:bg-blue-900 border border-blue-700/60 text-slate-200 transition"
          >
            <MessageSquare className="w-4 h-4" />
            {smsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                {smsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Official Government Workspace Role Navigation Bar */}
      <div className="bg-[#0F2942] border-t border-blue-900/80 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onRoleChange('patient')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                currentRole === 'patient'
                  ? 'bg-blue-600 text-white shadow-md border-b-2 border-amber-400'
                  : 'text-slate-300 hover:bg-blue-950/60 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>{t.rolePatient}</span>
            </button>

            <button
              onClick={() => onRoleChange('asha')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                currentRole === 'asha'
                  ? 'bg-blue-600 text-white shadow-md border-b-2 border-amber-400'
                  : 'text-slate-300 hover:bg-blue-950/60 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{t.roleAsha}</span>
            </button>

            <button
              onClick={() => onRoleChange('staff')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                currentRole === 'staff'
                  ? 'bg-blue-600 text-white shadow-md border-b-2 border-amber-400'
                  : 'text-slate-300 hover:bg-blue-950/60 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{t.roleStaff}</span>
            </button>

            <button
              onClick={() => onRoleChange('doctor')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                currentRole === 'doctor'
                  ? 'bg-blue-600 text-white shadow-md border-b-2 border-amber-400'
                  : 'text-slate-300 hover:bg-blue-950/60 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-amber-400" />
              <span>{t.roleDoctor}</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-md border-b-2 border-amber-400'
                  : 'text-slate-300 hover:bg-blue-950/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>{t.roleAdmin}</span>
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-300 border-l border-blue-800/80 pl-3">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              {language === 'mr' ? 'सुरक्षित शासकीय पोर्टल' : language === 'hi' ? 'सुरक्षित सरकारी पोर्टल' : 'Official Govt Portal'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
