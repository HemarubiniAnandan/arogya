import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  Clock,
  FileText,
  Pill,
  Send,
  Plus,
  Trash2,
  Lock,
  Eye,
  AlertTriangle,
  Microscope,
  CheckCircle2,
  QrCode,
  Building,
  UserCheck,
  Search,
  History,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  PhoneCall,
  FileCheck,
  Calendar,
  ChevronRight,
  Unlock,
  KeyRound
} from 'lucide-react';
import { Appointment, Patient, Prescription, MedicineItem, Referral, LanguageCode } from '../types';
import { storageService } from '../services/storageService';
import { eaushadhiService } from '../services/mockAdapters';
import { PrescriptionModal } from './PrescriptionModal';
import { QRCodeModal } from './QRCodeModal';

interface DoctorPortalProps {
  language: LanguageCode;
  onOpenSmsDrawer?: () => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ language, onOpenSmsDrawer }) => {
  const doctorsList = storageService.getDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('DOC-MH-01');

  const currentDoctor = doctorsList.find(d => d.id === selectedDoctorId) || doctorsList[0];
  const doctorId = currentDoctor?.id || 'DOC-MH-01';
  const doctorName = currentDoctor?.name || 'Dr. Aniruddha Kulkarni';
  const hospitalName = currentDoctor?.hospitalName || 'Primary Health Centre (PHC) Morgaon';

  // Sub-Navigation Tabs State
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'search' | 'referrals'>('queue');
  const [referralSubTab, setReferralSubTab] = useState<'outgoing' | 'incoming'>('outgoing');

  // Master Data State
  const [appointments, setAppointments] = useState<Appointment[]>(storageService.getAppointments());
  const [patients, setPatients] = useState<Patient[]>(storageService.getPatients());
  const [referrals, setReferrals] = useState<Referral[]>(storageService.getReferrals());
  const [selectedAptId, setSelectedAptId] = useState<string>('');

  // Clinical Consultation Workspace State
  const [openNotes, setOpenNotes] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1 (After Food)', durationDays: 3, instructions: 'Take with warm water' }
  ]);
  const [orderedDiagnostics, setOrderedDiagnostics] = useState<string[]>([]);

  // Patient Vault Search & Privacy OTP Guard State
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [unlockedPatientIds, setUnlockedPatientIds] = useState<string[]>([]);
  const [otpError, setOtpError] = useState<Record<string, string>>({});

  // History Search Query State
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Referral Creation Form
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralTargetHosp, setReferralTargetHosp] = useState('HOSP-DH-AUNDH');
  const [referralDept, setReferralDept] = useState('Cardiology');
  const [referralUrgency, setReferralUrgency] = useState<'ROUTINE' | 'URGENT' | 'EMERGENCY'>('URGENT');
  const [referralClinicalSummary, setReferralClinicalSummary] = useState('');

  // Drug inventory cache
  const [drugStockList, setDrugStockList] = useState<any[]>([]);

  // Modals & Feedback
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);
  const [viewingQrData, setViewingQrData] = useState<{ title: string; qr: string; token: string } | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setAppointments(storageService.getAppointments());
      setPatients(storageService.getPatients());
      setReferrals(storageService.getReferrals());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  useEffect(() => {
    eaushadhiService.searchMedicineStock('', 'Pune').then(setDrugStockList);
  }, []);

  // Doctor surname / match key
  const docLastName = doctorName.split(' ').slice(-1)[0] || doctorName;

  // Queue of active patients assigned to this doctor (Emergency Patients Pinned to Top)
  const myQueue = appointments
    .filter(a =>
      ['ARRIVED', 'IN_CONSULTATION', 'CONFIRMED', 'REQUESTED'].includes(a.status) &&
      (a.doctorId === doctorId || a.doctorName?.toLowerCase().includes(docLastName.toLowerCase()))
    )
    .sort((a, b) => (b.isEmergencyAlert ? 1 : 0) - (a.isEmergencyAlert ? 1 : 0));

  // Completed Consultations by this doctor
  const myCompletedConsultations = appointments.filter(a =>
    a.status === 'COMPLETED' &&
    (a.doctorId === doctorId || a.doctorName?.toLowerCase().includes(docLastName.toLowerCase()) || a.prescription?.doctorName?.toLowerCase().includes(docLastName.toLowerCase()))
  );

  // Cancellations and Reschedules for this doctor
  const cancelledForDoctor = appointments.filter(
    a => (a.doctorId === doctorId || a.doctorName?.toLowerCase().includes(docLastName.toLowerCase())) && a.status === 'CANCELLED'
  );
  const rescheduledForDoctor = appointments.filter(
    a => (a.doctorId === doctorId || a.doctorName?.toLowerCase().includes(docLastName.toLowerCase())) && a.status === 'RESCHEDULED'
  );

  // Active appointment being consulted
  const activeApt = appointments.find(a => a.id === selectedAptId) || myQueue[0];
  const activePatient = patients.find(p => p.id === activeApt?.patientId);

  // When active appointment changes, initialize forms
  useEffect(() => {
    if (activeApt) {
      if (activeApt.prescription) {
        setMedicines(activeApt.prescription.medicines || []);
        setOpenNotes(activeApt.prescription.openNotes || '');
        setConfidentialNotes(activeApt.prescription.confidentialDoctorNotes || activeApt.prescription.closedNotes || '');
      } else {
        setMedicines([
          {
            medicineName: 'Paracetamol 500mg',
            dosage: '500mg',
            frequency: '1-0-1 (After Food)',
            durationDays: 3,
            instructions: language === 'mr' ? 'जेवणानंतर घ्या' : language === 'hi' ? 'खाने के बाद लें' : 'Take after meals'
          }
        ]);
        setOpenNotes(`Patient evaluated for "${activeApt.chiefComplaint}". Chest clear, vitals stable.`);
        setConfidentialNotes('');
      }
    }
  }, [activeApt?.id]);

  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      { medicineName: 'Amoxicillin 500mg', dosage: '500mg', frequency: '1-1-1', durationDays: 5, instructions: 'Complete full course' }
    ]);
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicine = (index: number, field: string, value: any) => {
    setMedicines(prev => {
      const copy: any[] = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const toggleDiagnosticTest = (testName: string) => {
    setOrderedDiagnostics(prev =>
      prev.includes(testName) ? prev.filter(t => t !== testName) : [...prev, testName]
    );
  };

  // Complete Consultation & Archive Patient Record
  const handleCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApt) return;

    const newRx: Prescription = {
      id: `RX-MH-${Math.floor(10000 + Math.random() * 90000)}`,
      appointmentId: activeApt.id,
      patientId: activeApt.patientId,
      patientName: activeApt.patientName,
      doctorName,
      doctorId,
      hospitalName,
      date: new Date().toISOString().split('T')[0],
      medicines,
      openNotes: openNotes || 'Standard symptomatic recovery course advised.',
      confidentialDoctorNotes: confidentialNotes || undefined
    };

    // 1. Mark consultation as COMPLETED with prescription
    storageService.completeConsultation(activeApt.id, newRx, doctorName);

    // 2. Move completed patient profile to Archive
    storageService.archiveConsultation(activeApt.id, doctorName);

    // 3. Auto-advance queue to next waiting patient
    const remainingQueue = myQueue.filter(a => a.id !== activeApt.id);
    const nextPatient = remainingQueue.length > 0 ? remainingQueue[0] : null;

    if (nextPatient) {
      setSelectedAptId(nextPatient.id);
    } else {
      setSelectedAptId('');
    }

    setViewingRx(newRx);
    setFeedbackMsg(
      `Consultation for ${activeApt.patientName} COMPLETED & ARCHIVED. Digital Rx issued and SMS sent. ${
        nextPatient ? `OPD Queue auto-advanced to ${nextPatient.patientName} (Token ${nextPatient.tokenNumber}).` : 'OPD queue is now empty!'
      }`
    );
    setTimeout(() => setFeedbackMsg(null), 8000);
  };

  // Create Clinical Referral
  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApt || !activePatient) return;

    const targetHosp = storageService.getHospitals().find(h => h.id === referralTargetHosp) || storageService.getHospitals()[1];

    const ref = storageService.createReferral({
      patientId: activeApt.patientId,
      patientName: activeApt.patientName,
      patientAge: activeApt.patientAge,
      patientPhone: activeApt.patientPhone,
      sourceHospitalId: 'HOSP-PHC-MOR',
      sourceHospitalName: hospitalName,
      targetHospitalId: targetHosp.id,
      targetHospitalName: targetHosp.name,
      referringDoctorName: doctorName,
      specialtyRequired: referralDept,
      urgency: referralUrgency,
      clinicalSummary: referralClinicalSummary || `Referred by ${doctorName} for secondary specialty evaluation.`
    });

    setShowReferralForm(false);
    setViewingQrData({
      title: 'Digital Referral QR Token',
      qr: ref.qrCodeData,
      token: ref.id
    });
    setFeedbackMsg(`Referral ${ref.id} issued to ${targetHosp.name} (${referralUrgency}). SMS dispatched.`);
    setTimeout(() => setFeedbackMsg(null), 8000);
  };

  // Verify Patient Consent OTP
  const handleVerifyOtp = (patientId: string) => {
    const enteredOtp = otpInputs[patientId] || '';
    if (enteredOtp === '1234' || enteredOtp.trim().length === 4) {
      setUnlockedPatientIds(prev => [...prev, patientId]);
      setOtpError(prev => ({ ...prev, [patientId]: '' }));
      setFeedbackMsg(`ABHA Access Granted: Privacy consent OTP verified for patient ${patientId}. Longitudinal record unlocked.`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setOtpError(prev => ({ ...prev, [patientId]: 'Invalid OTP. Please enter 4-digit token provided by patient (Demo OTP: 1234).' }));
    }
  };

  // Accept Incoming Referral Action
  const handleAcceptIncomingReferral = (referralId: string, patientName: string) => {
    storageService.updateReferralStatus(referralId, 'ACCEPTED', `Accepted by ${doctorName} at ${hospitalName}`);
    setFeedbackMsg(`Incoming Referral ${referralId} for ${patientName} ACCEPTED. Patient priority OPD token created.`);
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  // Filtered outgoing & incoming referrals
  const outgoingReferrals = referrals.filter(r =>
    r.fromHospital === hospitalName ||
    r.sourceHospitalName === hospitalName ||
    r.referredByDoctor === doctorName ||
    r.referringDoctorName === doctorName
  );

  const incomingReferrals = referrals.filter(r =>
    r.toHospital === hospitalName ||
    r.targetHospitalName === hospitalName ||
    r.toHospital?.toLowerCase().includes('morgaon')
  );

  // Filtered vault patient search
  const vaultSearchResults = storageService.searchPatients(vaultSearchQuery.length > 0 ? vaultSearchQuery : 'a');

  // Filtered completed consultations
  const filteredCompletedConsultations = myCompletedConsultations.filter(apt => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.id.toLowerCase().includes(q) ||
      apt.tokenNumber.toLowerCase().includes(q) ||
      apt.patientId.toLowerCase().includes(q) ||
      (apt.prescription?.openNotes && apt.prescription.openNotes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#07172F] to-[#0F3460] text-white p-5 border-b border-amber-500/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-xl bg-amber-500 text-[#07172F] flex items-center justify-center font-bold text-xl shadow-md border-2 border-amber-300 shrink-0">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-serif">{doctorName}</h2>
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-900 text-amber-300 border border-amber-400/40">
                  e-Sanjeevani OPD Officer
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-1 flex flex-wrap items-center gap-2 font-medium">
                <span>{hospitalName}</span>
                <span>•</span>
                <span>General Medicine & Pediatrics</span>
                <span>•</span>
                <span className="font-mono text-amber-300">Reg. MMC/2012/04491</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Doctor Switcher Dropdown & Active Status Toggle */}
            <div className="flex items-center gap-2 bg-blue-950/80 p-2 rounded-xl border border-amber-500/40">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-0.5">
                  Active Doctor Login
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="bg-[#07172F] text-xs font-semibold text-white px-2 py-1 rounded border border-blue-600 focus:outline-none cursor-pointer"
                >
                  {doctorsList.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-l border-amber-500/30 pl-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-0.5">
                  Duty Status
                </label>
                <select
                  value={currentDoctor?.status || 'Available'}
                  onChange={e => {
                    const status = e.target.value as any;
                    storageService.updateDoctorStatus(doctorId, status);
                    setFeedbackMsg(`Doctor duty status updated to '${status}'. Hospital staff notified.`);
                    setTimeout(() => setFeedbackMsg(null), 5000);
                  }}
                  className={`text-xs font-bold px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                    currentDoctor?.status === 'Available'
                      ? 'bg-emerald-900 text-emerald-200 border-emerald-500'
                      : currentDoctor?.status === 'Busy'
                      ? 'bg-rose-900 text-rose-200 border-rose-500'
                      : currentDoctor?.status === 'Emergency Duty'
                      ? 'bg-amber-900 text-amber-200 border-amber-500'
                      : 'bg-slate-800 text-slate-300 border-slate-600'
                  }`}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy (Notify Staff)</option>
                  <option value="Emergency Duty">Emergency Duty</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            {onOpenSmsDrawer && (
              <button
                onClick={onOpenSmsDrawer}
                className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border border-emerald-400/40 flex items-center gap-1.5 shadow-xs transition"
                title="Open Twilio SMS & Notification Dispatch Log"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                Live SMS Logs
              </button>
            )}

            <span className="px-3.5 py-2.5 rounded-xl bg-blue-900/90 text-white text-xs font-bold border border-blue-500/40 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              {myQueue.length} Active Patients Waiting
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="flex overflow-x-auto border-t border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'queue'
                ? 'border-[#07172F] text-[#07172F] bg-white font-extrabold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-blue-700" />
            Active OPD Queue ({myQueue.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'history'
                ? 'border-[#07172F] text-[#07172F] bg-white font-extrabold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-emerald-700" />
            My Treated Patients & Confidential Remarks ({myCompletedConsultations.length})
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'search'
                ? 'border-[#07172F] text-[#07172F] bg-white font-extrabold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4 text-amber-700" />
            Patient Vault & ABHA Security Search
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-5 py-3.5 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'referrals'
                ? 'border-[#07172F] text-[#07172F] bg-white font-extrabold shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4 text-indigo-700" />
            Referrals Directory ({outgoingReferrals.length + incomingReferrals.length})
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Patient Cancellation & Reschedule Notification for Doctor */}
      {(cancelledForDoctor.length > 0 || rescheduledForDoctor.length > 0) && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 shadow-xs space-y-2.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>OPD Roster Updates — Patient Cancellations & Rescheduling</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {cancelledForDoctor.map(ca => (
              <div key={ca.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white px-3 py-2 rounded-xl border border-rose-200 text-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold text-[10px]">
                    CANCELLED
                  </span>
                  <span className="font-mono font-bold text-slate-900">{ca.tokenNumber}</span>
                  <span className="font-semibold">{ca.patientName}</span>
                  <span className="text-slate-500 text-[11px]">({ca.date} • {ca.timeSlot})</span>
                </div>
                <span className="text-[11px] text-rose-700 font-medium italic">
                  Slot freed for walk-ins ({ca.cancellationReason || 'Patient cancelled'})
                </span>
              </div>
            ))}
            {rescheduledForDoctor.map(ra => (
              <div key={ra.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-white px-3 py-2 rounded-xl border border-amber-200 text-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[10px]">
                    RESCHEDULED
                  </span>
                  <span className="font-mono font-bold text-slate-900">{ra.tokenNumber}</span>
                  <span className="font-semibold">{ra.patientName}</span>
                  <span className="text-slate-600 text-[11px]">
                    Moved to: <strong>{ra.date} at {ra.timeSlot}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-amber-900 font-medium">
                  {ra.cancellationReason || 'Patient last-minute plan change'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: ACTIVE OPD QUEUE & CONSULTATION WORKSPACE */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Waiting Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-700" /> OPD Patient Queue
              </h3>
              <span className="text-[11px] text-slate-400">Select patient</span>
            </div>

          {myQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No patients waiting in queue right now.
            </div>
          ) : (
            myQueue.map(apt => {
              const isSelected = (activeApt?.id === apt.id);
              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAptId(apt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-900 text-xs">{apt.tokenNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      apt.status === 'IN_CONSULTATION'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'ARRIVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 text-sm">{apt.patientName}</div>
                  <div className="text-xs text-slate-500">
                    {apt.patientAge} Yrs • {apt.patientGender}
                  </div>
                  <div className="text-[11px] text-slate-700 font-medium truncate">
                    Reason: "{apt.chiefComplaint}"
                  </div>

                  {apt.assistedByAshaName && (
                    <div className="text-[10px] text-pink-700 font-semibold">
                      Assisted by: {apt.assistedByAshaName}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (2 cols): Clinical Consultation & Rx Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {activeApt ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Active Patient Card with Past Medical History */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{activeApt.patientName}</h3>
                      <span className="text-xs font-mono text-slate-500 font-semibold">{activeApt.patientId}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        Token {activeApt.tokenNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {activeApt.patientAge} Yrs • {activeApt.patientGender} • Phone: {activeApt.patientPhone}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReferralForm(true)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Building className="w-3.5 h-3.5" /> Refer to Secondary Facility
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Chronic:</span>{' '}
                    <span className="text-slate-800 font-medium">
                      {activePatient?.chronicConditions.join(', ') || 'None reported'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Allergies:</span>{' '}
                    <span className="text-rose-700 font-medium">
                      {activePatient?.allergies.join(', ') || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Reported Symptoms:</span>{' '}
                    <span className="text-slate-800 font-medium">"{activeApt.chiefComplaint}"</span>
                  </div>
                </div>
              </div>

              {/* Consultation Form */}
              <form onSubmit={handleCompleteConsultation} className="space-y-6">
                {/* SECTION 27: CLINICAL NOTES (Open vs Confidential) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        Open Clinical Notes (Patient & Referral Visible)
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={openNotes}
                      onChange={e => setOpenNotes(e.target.value)}
                      placeholder="Examination observations, provisional diagnosis, diet & lifestyle instructions..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        Confidential Doctor-Only Notes (Strictly Doctor Restricted)
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={confidentialNotes}
                      onChange={e => setConfidentialNotes(e.target.value)}
                      placeholder="Doctor-only differential diagnosis, mental health notes, or sensitive clinical remarks..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-amber-50/40 focus:outline-amber-700"
                    />
                  </div>
                </div>

                {/* SECTION 28: DIAGNOSTIC TEST ORDERING */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Order Rural Diagnostics / Laboratory Investigations
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      'Complete Blood Count (CBC)',
                      'Blood Sugar (F & PP)',
                      'Chest X-Ray (PA View)',
                      'Obstetric Ultrasound (USG)',
                      '12-Lead ECG',
                      'Sputum for AFB (TB Test)'
                    ].map(test => {
                      const selected = orderedDiagnostics.includes(test);
                      return (
                        <button
                          key={test}
                          type="button"
                          onClick={() => toggleDiagnosticTest(test)}
                          className={`p-2 rounded-xl border text-left font-semibold transition ${
                            selected
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-[11px]">{test}</div>
                          <div className="text-[9px] text-slate-400 font-normal mt-0.5">
                            {selected ? '✓ Ordered' : '+ Add Test'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 27: DIGITAL PRESCRIPTION WRITING WITH e-Aushadhi INVENTORY CHECK */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-700" />
                        Digital Prescription & Medication Schedule
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Verify generic stock in PHC warehouse before prescribing.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Medicine
                    </button>
                  </div>

                  <div className="space-y-2">
                    {medicines.map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Medicine name & strength"
                            value={m.medicineName}
                            onChange={e => handleUpdateMedicine(idx, 'medicineName', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Frequency (e.g. 1-0-1)"
                            value={m.frequency}
                            onChange={e => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            placeholder="Days"
                            value={m.durationDays}
                            onChange={e => handleUpdateMedicine(idx, 'durationDays', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Instructions"
                            value={m.instructions}
                            onChange={e => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-300 text-[11px]"
                          />
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Finalize Button */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    Signing consultation as <strong>{doctorName}</strong>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete Consultation & Sign Prescription
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select an arrived patient from the OPD queue to start clinical consultation.
            </div>
          )}
        </div>
      </div>
      )}

      {/* TAB 2: MY TREATED PATIENTS & CONFIDENTIAL REMARKS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-700" />
                Doctor Consultation History & Confidential Remarks
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Archived medical diagnoses, open notes, confidential doctor-only remarks, and digital prescriptions.
              </p>
            </div>

            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                placeholder="Search patient name, token, ID..."
                value={historySearchQuery}
                onChange={e => setHistorySearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:outline-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {filteredCompletedConsultations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-300 p-12 text-center text-slate-500 text-xs">
              No previous completed consultations match your query.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompletedConsultations.map(apt => (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#07172F] flex items-center justify-center font-bold text-xs">
                        <FileCheck className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{apt.patientName}</h4>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                            Token {apt.tokenNumber}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            COMPLETED
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Consulted on: <strong>{apt.date}</strong> ({apt.timeSlot}) • {apt.patientAge} Yrs • {apt.patientGender} • ID: {apt.patientId}
                        </div>
                      </div>
                    </div>

                    {apt.prescription && (
                      <button
                        onClick={() => setViewingRx(apt.prescription!)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-700" /> View Signed Digital Rx
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Open Notes */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-700" /> Open Clinical Record Notes
                      </span>
                      <p className="text-slate-800 leading-relaxed">
                        {apt.prescription?.openNotes || apt.chiefComplaint || 'Standard consultation executed.'}
                      </p>
                    </div>

                    {/* Confidential Doctor Remarks */}
                    <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-950 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-700" /> Confidential Doctor-Only Remarks
                      </span>
                      <p className="text-amber-950 font-medium leading-relaxed">
                        {apt.prescription?.confidentialDoctorNotes || apt.prescription?.closedNotes || 'No restricted doctor notes recorded for this visit.'}
                      </p>
                    </div>
                  </div>

                  {/* Prescribed Medicines Summary */}
                  {apt.prescription?.medicines && apt.prescription.medicines.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                        Prescribed Medications:
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {apt.prescription.medicines.map((med, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md font-medium text-blue-950 flex items-center gap-1">
                            <Pill className="w-3 h-3 text-blue-700" />
                            {med.medicineName} ({med.frequency} • {med.durationDays || 3} days)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PATIENT VAULT & ABHA SECURITY SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-700" />
                ABDM Patient Vault & Medical Record Search
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Search longitudinal patient records. Medical history access is protected by ABHA privacy consent protocols.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search patient by Name, ABHA ID (e.g. 91-4412-8819-2041), Phone, or Patient ID..."
                value={vaultSearchQuery}
                onChange={e => setVaultSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-blue-600 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-4">
            {vaultSearchResults.map(pt => {
              const isAttendingInQueue = myQueue.some(a => a.patientId === pt.id);
              const isUnlocked = isAttendingInQueue || unlockedPatientIds.includes(pt.id);

              return (
                <div key={pt.id} className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{pt.fullName}</h4>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200">
                          ABHA: {pt.abhaId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {pt.age} Yrs • {pt.gender} • Phone: {pt.phone} • Village: {pt.village}, {pt.district}
                      </div>
                    </div>

                    {isUnlocked ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                        <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                        {isAttendingInQueue ? 'Unlocked (Active Queue)' : 'Unlocked via OTP Consent'}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        Privacy Locked (Requires Consent)
                      </span>
                    )}
                  </div>

                  {isUnlocked ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <span className="font-bold text-slate-600 block mb-0.5">Chronic Conditions:</span>
                          <span className="font-medium text-slate-900">
                            {pt.chronicConditions.length > 0 ? pt.chronicConditions.join(', ') : 'None documented'}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-600 block mb-0.5">Allergies:</span>
                          <span className="font-semibold text-rose-700">
                            {pt.allergies.length > 0 ? pt.allergies.join(', ') : 'No known allergies'}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-600 block mb-0.5">Emergency Contact:</span>
                          <span className="font-medium text-slate-900">
                            {pt.emergencyContact.name} ({pt.emergencyContact.relation}) • {pt.emergencyContact.phone}
                          </span>
                        </div>
                      </div>

                      {/* Past Consultations for this patient */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                          <History className="w-3.5 h-3.5 text-blue-700" /> Longitudinal Visit Timeline
                        </h5>

                        {appointments.filter(a => a.patientId === pt.id).map(a => (
                          <div key={a.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between font-semibold text-slate-800">
                              <span>{a.date} — {a.hospitalName} ({a.doctorName})</span>
                              <span className="font-mono text-slate-500">{a.status}</span>
                            </div>
                            <div className="text-slate-600">Complaint: "{a.chiefComplaint}"</div>
                            {a.prescription && (
                              <div className="text-emerald-800 font-medium">
                                Notes: {a.prescription.openNotes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">ABHA Health Data Privacy Guard</h5>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            Under ABDM health data regulations, doctor access to longitudinal records is locked unless the patient is attending an active consultation or provides a 4-digit consent OTP.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 border-t border-slate-200">
                        <div className="relative flex-1 w-full sm:w-auto">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter 4-Digit Patient OTP (Demo: 1234)"
                            value={otpInputs[pt.id] || ''}
                            onChange={e => setOtpInputs({ ...otpInputs, [pt.id]: e.target.value })}
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold focus:outline-blue-600"
                          />
                          <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleVerifyOtp(pt.id)}
                          className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Unlock className="w-3.5 h-3.5 text-amber-400" /> Verify & Unlock Record
                        </button>
                      </div>

                      {otpError[pt.id] && (
                        <div className="text-xs font-bold text-rose-700">{otpError[pt.id]}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: REFERRALS DIRECTORY */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-700" />
                Continuity Referral Management Protocol
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track secondary and tertiary facility referrals issued from or assigned to {hospitalName}.
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-300 text-xs font-bold">
              <button
                onClick={() => setReferralSubTab('outgoing')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                  referralSubTab === 'outgoing'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-700" /> Outgoing ({outgoingReferrals.length})
              </button>
              <button
                onClick={() => setReferralSubTab('incoming')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                  referralSubTab === 'incoming'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" /> Incoming ({incomingReferrals.length})
              </button>
            </div>
          </div>

          {referralSubTab === 'outgoing' ? (
            outgoingReferrals.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-300 p-12 text-center text-slate-400 text-xs">
                No outgoing referrals created yet. Create a referral during an active consultation.
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingReferrals.map(ref => (
                  <div key={ref.id} className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{ref.patientName}</h4>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                            {ref.id}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            ref.priority === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {ref.priority || ref.urgency}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                            {ref.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Target Hospital: <strong>{ref.toHospital || ref.targetHospitalName}</strong> • Department: {ref.department || ref.specialtyRequired}
                        </div>
                      </div>

                      <button
                        onClick={() => setViewingQrData({ title: 'Digital Referral QR Slip', qr: ref.qrCodeData, token: ref.id })}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-700" /> Referral QR Slip
                      </button>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="font-bold text-slate-600 block mb-0.5">Clinical Reason & Summary:</span>
                      <p className="text-slate-800">{ref.reason || ref.clinicalSummary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            incomingReferrals.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-300 p-12 text-center text-slate-400 text-xs">
                No incoming referrals registered for {hospitalName}.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingReferrals.map(ref => (
                  <div key={ref.id} className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{ref.patientName}</h4>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                            {ref.id}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            {ref.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          From: <strong>{ref.fromHospital || ref.sourceHospitalName}</strong> • Referring Doctor: {ref.referredByDoctor || ref.referringDoctorName}
                        </div>
                      </div>

                      {ref.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => handleAcceptIncomingReferral(ref.id, ref.patientName)}
                          className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Schedule Priority Token
                        </button>
                      )}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="font-bold text-slate-600 block mb-0.5">Handover Summary:</span>
                      <p className="text-slate-800">{ref.reason || ref.clinicalSummary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* SECTION 29: CLINICAL REFERRAL MODAL */}
      {showReferralForm && activeApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
                Continuity Referral Protocol (Section 29)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Create Clinical Referral for {activeApt.patientName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                From {hospitalName} to Higher Tier Secondary / Tertiary Center.
              </p>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Healthcare Facility</label>
                <select
                  value={referralTargetHosp}
                  onChange={e => setReferralTargetHosp(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-blue-600 bg-slate-50"
                >
                  <option value="HOSP-RH-BAR">Rural Hospital Baramati (Secondary Care • 18 km)</option>
                  <option value="HOSP-DH-AUNDH">District Hospital Aundh, Pune (Tertiary Center • 62 km)</option>
                  <option value="HOSP-SDH-SAS">Sub-District Hospital Saswad (32 km)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty Required</label>
                  <select
                    value={referralDept}
                    onChange={e => setReferralDept(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Obstetrics & High Risk Gynecology">Obstetrics / High Risk ANC</option>
                    <option value="Pulmonology / Chest Medicine">Pulmonology</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Level</label>
                  <select
                    value={referralUrgency}
                    onChange={e => setReferralUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="ROUTINE">ROUTINE (Within 7 days)</option>
                    <option value="URGENT">URGENT (Within 24-48 hrs)</option>
                    <option value="EMERGENCY">EMERGENCY (Immediate 108 Transfer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Summary & Handover Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize reasons for escalation, initial vital stability, and requested diagnostic/intervention..."
                  value={referralClinicalSummary}
                  onChange={e => setReferralClinicalSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                The receiving facility will instantly see this referral on their intake dashboard. An escalation timer starts immediately.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReferralForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Generate Digital Referral & QR Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingRx && (
        <PrescriptionModal
          prescription={viewingRx}
          currentRole="doctor"
          onClose={() => setViewingRx(null)}
        />
      )}

      {viewingQrData && (
        <QRCodeModal
          title={viewingQrData.title}
          tokenNumber={viewingQrData.token}
          appointmentId={viewingQrData.token}
          patientName={activeApt?.patientName || 'Citizen'}
          hospitalName="Higher Secondary Facility"
          date={new Date().toISOString().split('T')[0]}
          timeSlot="Priority Intake"
          qrData={viewingQrData.qr}
          onClose={() => setViewingQrData(null)}
        />
      )}
    </div>
  );
};
