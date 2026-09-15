import React, { useState, useEffect } from 'react';
import {
  Pill,
  Microscope,
  WifiOff,
  Sparkles,
  ShieldCheck,
  Building,
  PhoneCall,
  Info,
  ExternalLink
} from 'lucide-react';
import { UserRole, LanguageCode } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { PatientPortal } from './components/PatientPortal';
import { AshaPortal } from './components/AshaPortal';
import { StaffPortal } from './components/StaffPortal';
import { DoctorPortal } from './components/DoctorPortal';
import { AdminPortal } from './components/AdminPortal';
import { MedicineSearchModule } from './components/MedicineSearchModule';
import { DiagnosticsModule } from './components/DiagnosticsModule';
import { EmergencyModal } from './components/EmergencyModal';
import { SmsDrawer } from './components/SmsDrawer';
import { RegistrationModal } from './components/RegistrationModal';
import { AarogyaRakshakLogo, MohfwLogo } from './components/GovtEmblem';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);

  // Active top-level subview
  const [specialModule, setSpecialModule] = useState<'none' | 'medicine' | 'diagnostics'>('none');

  // Modals
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isSmsDrawerOpen, setIsSmsDrawerOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [smsLogs, setSmsLogs] = useState(storageService.getSMSLogs());

  // Demo notification banner
  const [demoBanner, setDemoBanner] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setSmsLogs(storageService.getSMSLogs());
      setPendingQueueCount(storageService.getOfflineQueue().length);
      setIsOffline(storageService.isOfflineMode());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    storageService.setOfflineMode(nextState);
    setIsOffline(nextState);
    if (!nextState) {
      setDemoBanner('Back online! Synced all queued rural transactions to Maharashtra State Health Database.');
      setTimeout(() => setDemoBanner(null), 5000);
    }
  };

  const handleResetData = () => {
    storageService.resetToSeedData();
    setDemoBanner('Platform state reset to initial seed data with demo patients, PHCs, and doctors.');
    setTimeout(() => setDemoBanner(null), 5000);
  };

  const handleSelectDemoScenario = (scenario: 'demo1' | 'demo2' | 'demo3' | 'demo4' | 'demo5') => {
    setSpecialModule('none');

    if (scenario === 'demo1') {
      setCurrentRole('patient');
      setDemoBanner('Scenario 1 Active: Chest Pain triage. Click "Smart Triage & Book Appointment", fill chief complaint, then switch to Doctor e-Sanjeevani portal to inspect.');
    } else if (scenario === 'demo2') {
      setCurrentRole('patient');
      setDemoBanner('Scenario 2 Active: Universal Immunization (U-WIN). Open "Book Vaccination (U-WIN)" tab to schedule child vaccines with cold chain tracking.');
    } else if (scenario === 'demo3') {
      setCurrentRole('doctor');
      setDemoBanner('Scenario 3 Active: Clinical Continuity Referral. As Doctor, click "Refer to Secondary Facility" to escalate care to Rural/District hospital with QR token.');
    } else if (scenario === 'demo4') {
      setCurrentRole('asha');
      setDemoBanner('Scenario 4 Active: ASHA Worker Assisted Portal. Search "Ravi" or "Meena" for instant autocomplete suggestions, view high-risk maternal alerts, and book on behalf.');
    } else if (scenario === 'demo5') {
      setCurrentRole('admin');
      setDemoBanner('Scenario 5 Active: State Health Directorate. Review real-time monsoon disease trends, PHC bed availability, e-Aushadhi drug stock, and audit logs.');
    }

    setTimeout(() => setDemoBanner(null), 10000);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex flex-col font-sans antialiased">
      {/* Official Government Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          setSpecialModule('none');
        }}
        language={language}
        onLanguageChange={setLanguage}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingQueueCount={pendingQueueCount}
        onOpenSmsDrawer={() => setIsSmsDrawerOpen(true)}
        smsCount={smsLogs.length}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onSelectDemoScenario={handleSelectDemoScenario}
        onResetData={handleResetData}
      />

      {/* Offline Rural Grid Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-sm border-b border-amber-700">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" />
            <span>
              Low Connectivity / Rural Offline Mode Active. Transactions & triage notes are queued locally in browser memory and will auto-sync to Maharashtra Health Directorate upon reconnection ({pendingQueueCount} items queued).
            </span>
          </div>
        </div>
      )}

      {/* Interactive Scenario / Feedback Banner */}
      {demoBanner && (
        <div className="bg-[#0B2545] text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b-2 border-amber-500 shadow-md">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{demoBanner}</span>
            </div>
            <button
              onClick={() => setDemoBanner(null)}
              className="text-xs text-amber-300 hover:text-white font-bold ml-3 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Official Services Toolbar Bar */}
      <div className="bg-[#1E293B] border-b border-slate-700/80 py-2.5 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Integrated Portals:
            </span>
            <button
              onClick={() => setSpecialModule(specialModule === 'medicine' ? 'none' : 'medicine')}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition border cursor-pointer ${
                specialModule === 'medicine'
                  ? 'bg-[#0F172A] text-white border-slate-600 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-slate-400" />
              e-Aushadhi Drug Inventory
            </button>

            <button
              onClick={() => setSpecialModule(specialModule === 'diagnostics' ? 'none' : 'diagnostics')}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition border cursor-pointer ${
                specialModule === 'diagnostics'
                  ? 'bg-[#0F172A] text-white border-slate-600 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Microscope className="w-3.5 h-3.5 text-slate-400" />
              NABL Diagnostic Coordination
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px] font-medium">
            <span className="font-semibold text-slate-300">Government Health Directorate Services</span>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {specialModule === 'medicine' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setSpecialModule('none')}
                className="text-xs text-slate-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Return to {currentRole.toUpperCase()} Workspace
              </button>
              <span className="text-xs font-semibold text-slate-600">e-Aushadhi State Pharmaceutical Portal</span>
            </div>
            <MedicineSearchModule />
          </div>
        ) : specialModule === 'diagnostics' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setSpecialModule('none')}
                className="text-xs text-slate-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Return to {currentRole.toUpperCase()} Workspace
              </button>
              <span className="text-xs font-semibold text-slate-600">NABL Accredited Diagnostics Coordination Desk</span>
            </div>
            <DiagnosticsModule currentRole={currentRole} />
          </div>
        ) : (
          <>
            {currentRole === 'patient' && (
              <PatientPortal
                language={language}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
                onOpenRegistration={() => setIsRegisterOpen(true)}
              />
            )}

            {currentRole === 'asha' && (
              <AshaPortal
                language={language}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {currentRole === 'staff' && (
              <StaffPortal
                language={language}
                onOpenSmsDrawer={() => setIsSmsDrawerOpen(true)}
              />
            )}

            {currentRole === 'doctor' && (
              <DoctorPortal
                language={language}
                onOpenSmsDrawer={() => setIsSmsDrawerOpen(true)}
              />
            )}

            {currentRole === 'admin' && (
              <AdminPortal language={language} />
            )}
          </>
        )}
      </main>

      {/* Official Government Footer */}
      <footer className="bg-[#0F172A] text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <AarogyaRakshakLogo className="w-11 h-11 shrink-0 border border-slate-700" />
              <MohfwLogo className="h-8 shrink-0 hidden sm:block" />
              <div>
                <h2 className="text-base font-bold text-white">
                  {language === 'mr' ? 'सार्वजनिक आरोग्य आणि कुटुंब कल्याण मंत्रालय' : language === 'hi' ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' : 'Ministry of Health and Family Welfare'} • {language === 'mr' ? 'महाराष्ट्र शासन' : language === 'hi' ? 'महाराष्ट्र सरकार' : 'Govt of Maharashtra'}
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'mr' ? 'आरोग्यरक्षक - ग्रामीण आरोग्य निरंतरता प्रणाली' : language === 'hi' ? 'आरोग्यरक्षक - ग्रामीण स्वास्थ्य निरंतरता मंच' : 'AarogyaRakshak - Rural Health Continuity Platform'}
                </p>
                <p className="text-[11px] text-slate-300 font-semibold mt-0.5">
                  Healthy Villages, Stronger Maharashtra
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                <Info className="w-3.5 h-3.5 text-slate-400" /> Terms of Service
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Privacy Policy (ABDM Data Privacy)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> Toll Free: 104 / 1800-233-0244
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
            <div>
              Designed & Developed for Public Health Services in Maharashtra. Mapped to National Health Authority standards.
            </div>
            <div>
              © 2026 Public Health Department, Government of Maharashtra. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <SmsDrawer
        isOpen={isSmsDrawerOpen}
        onClose={() => setIsSmsDrawerOpen(false)}
      />

      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(pat) => {
          setDemoBanner(`Citizen ${pat.fullName} registered under ABHA ID ${pat.abhaId}! Record generated in Maharashtra Health Registry.`);
          setTimeout(() => setDemoBanner(null), 6000);
        }}
        creatorRole={currentRole}
        creatorName={currentRole === 'asha' ? 'Surekha Tai Shinde (ASHA)' : 'Self Registration'}
      />
    </div>
  );
}
