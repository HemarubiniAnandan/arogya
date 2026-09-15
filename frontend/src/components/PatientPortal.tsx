import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Shield,
  FileText,
  Video,
  Pill,
  Sparkles,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  Building,
  Bed,
  Phone,
  RefreshCw,
  PlusCircle,
  Eye,
  CalendarClock,
  XCircle,
  MessageSquare,
  Activity,
  Heart,
  Baby
} from 'lucide-react';
import { Patient, Appointment, HospitalFacility, Doctor, LanguageCode, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { analyzeSymptomsNLP, NLPTriageResult } from '../services/nlpTriage';
import { eSanjeevaniService, uwinService } from '../services/mockAdapters';
import { AppointmentTracker } from './AppointmentTracker';
import { QRCodeModal } from './QRCodeModal';
import { PrescriptionModal } from './PrescriptionModal';
import { translations } from '../i18n/translations';

interface PatientPortalProps {
  language: LanguageCode;
  onOpenEmergency: () => void;
  onOpenRegistration: () => void;
  defaultActiveTab?: 'dashboard' | 'book' | 'vaccination' | 'records' | 'prescriptions' | 'teleconsult' | 'profile';
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  language,
  onOpenEmergency,
  onOpenRegistration,
  defaultActiveTab = 'dashboard'
}) => {
  const t = translations[language];
  const [patients, setPatients] = useState<Patient[]>(storageService.getPatients());
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-MH-1001'); // default Ramesh Jadhav
  const [appointments, setAppointments] = useState<Appointment[]>(storageService.getAppointments());
  const [hospitals, setHospitals] = useState<HospitalFacility[]>(storageService.getHospitals());
  const [doctors, setDoctors] = useState<Doctor[]>(storageService.getDoctors());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'book' | 'vaccination' | 'records' | 'prescriptions' | 'teleconsult' | 'profile'>(defaultActiveTab);

  // Profile Edit State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('');

  // Active modal controls
  const [selectedQrAppointment, setSelectedQrAppointment] = useState<Appointment | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  // Booking Flow State
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [nlpResult, setNlpResult] = useState<NLPTriageResult | null>(null);
  const [isPreferEConsult, setIsPreferEConsult] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('HOSP-PHC-MOR');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('DOC-MH-01');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [bookingSuccessApt, setBookingSuccessApt] = useState<Appointment | null>(null);

  // U-WIN Vaccination state
  const [vaccineList, setVaccineList] = useState<any[]>([]);
  const [selectedVaccine, setSelectedVaccine] = useState<string>('MR (Measles & Rubella)');
  const [vaccineCentre, setVaccineCentre] = useState('Primary Health Centre (PHC) Morgaon');
  const [vaccineDate, setVaccineDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [vaccineSuccessMsg, setVaccineSuccessMsg] = useState<string | null>(null);

  // Specific doctor search
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

  // Teleconsult state
  const [teleconsultSession, setTeleconsultSession] = useState<any | null>(null);

  // Patient Reschedule Modal State
  const [patientRescheduleApt, setPatientRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleMode, setRescheduleMode] = useState<'DATE_ONLY' | 'DOCTOR_ONLY' | 'BOTH'>('BOTH');
  const [patientRescheduleDoctorId, setPatientRescheduleDoctorId] = useState<string>('');
  const [patientRescheduleDate, setPatientRescheduleDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [patientRescheduleSlot, setPatientRescheduleSlot] = useState('11:00 AM');
  const [patientRescheduleReason, setPatientRescheduleReason] = useState('Personal plan change / family schedule');
  const [patientActionNotice, setPatientActionNotice] = useState<string | null>(null);

  // Patient Cancel Appointment Modal State
  const [patientCancelApt, setPatientCancelApt] = useState<Appointment | null>(null);
  const [patientCancelReason, setPatientCancelReason] = useState('Feeling better / symptoms resolved');

  // SOS Emergency & Filter Search State
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosDispatchData, setSosDispatchData] = useState<any | null>(null);
  const [aptSearchFilter, setAptSearchFilter] = useState('');

  const handleTriggerSOS = () => {
    if (!currentPatient) return;
    const locationStr = 'Morgaon Village (GPS: 18.2325° N, 74.3168° E)';
    const alertId = storageService.triggerEmergencySOS(
      currentPatient.id,
      currentPatient.fullName,
      currentPatient.phone,
      locationStr,
      currentPatient.guardianName,
      currentPatient.emergencyContact?.phone || currentPatient.phone
    );

    setSosDispatchData({
      alertId,
      patientName: currentPatient.fullName,
      phone: currentPatient.phone,
      location: locationStr,
      guardianPhone: currentPatient.emergencyContact?.phone || currentPatient.phone,
      timestamp: new Date().toLocaleTimeString()
    });
    setSosModalOpen(true);
  };

  useEffect(() => {
    const update = () => {
      setPatients(storageService.getPatients());
      setAppointments(storageService.getAppointments());
      setHospitals(storageService.getHospitals());
      setDoctors(storageService.getDoctors());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  useEffect(() => {
    uwinService.getEligibleVaccines(50, false).then(setVaccineList);
  }, []);

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientAppointments = appointments.filter(a => a.patientId === currentPatient?.id);

  // Recently Consulted Doctor (For 1-click re-booking)
  const recentAptWithDoc = patientAppointments.find(
    a => a.doctorId && (a.status === 'COMPLETED' || a.status === 'CONFIRMED' || a.status === 'ARRIVED')
  );
  const recentlyConsultedDoc = recentAptWithDoc
    ? doctors.find(d => d.id === recentAptWithDoc.doctorId) || doctors.find(d => d.name === recentAptWithDoc.doctorName)
    : null;

  const handleOpenEditProfile = () => {
    if (!currentPatient) return;
    setEditPhone(currentPatient.phone || '');
    setEditAddress(currentPatient.address || '');
    setEditVillage(currentPatient.village || '');
    setEditEmergencyName(currentPatient.emergencyContact?.name || '');
    setEditEmergencyPhone(currentPatient.emergencyContact?.phone || '');
    setEditEmergencyRelation(currentPatient.emergencyContact?.relation || '');
    setShowEditProfileModal(true);
  };

  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    storageService.updatePatientProfile(currentPatient.id, {
      phone: editPhone,
      address: editAddress,
      village: editVillage,
      emergencyContact: {
        name: editEmergencyName,
        phone: editEmergencyPhone,
        relation: editEmergencyRelation
      }
    });

    setPatientActionNotice(`Personal Profile updated successfully for ${currentPatient.fullName}!`);
    setTimeout(() => setPatientActionNotice(null), 6000);
    setShowEditProfileModal(false);
  };

  // NLP evaluation as user types symptoms
  const handleSymptomChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setChiefComplaint(text);
    if (text.trim().length >= 3) {
      const result = analyzeSymptomsNLP(text);
      setNlpResult(result);
    } else {
      setNlpResult(null);
    }
  };

  const handleToggleAshaConsent = () => {
    if (!currentPatient) return;
    const nextState = !currentPatient.consent.allowAshaAssistance;
    storageService.updatePatientConsent(currentPatient.id, { allowAshaAssistance: nextState });
  };

  const handleConfirmAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    const hosp = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
    const doc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

    const newApt = storageService.createAppointment({
      patientId: currentPatient.id,
      patientName: currentPatient.fullName,
      patientAge: currentPatient.age,
      patientGender: currentPatient.gender,
      patientPhone: currentPatient.phone,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      hospitalType: hosp.type,
      department: nlpResult?.suggestedDepartment || 'General Medicine',
      doctorId: doc.id,
      doctorName: doc.name,
      date: selectedDate,
      timeSlot: selectedSlot,
      chiefComplaint: chiefComplaint || 'Routine medical evaluation',
      suggestedDepartmentByNLP: nlpResult?.suggestedDepartment,
      isEmergencyAlert: nlpResult?.isEmergencyAlert,
      isEConsultation: isPreferEConsult
    });

    setBookingSuccessApt(newApt);
    setBookingStep(1);
    setChiefComplaint('');
    setNlpResult(null);
  };

  const handleBookVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    const res = storageService.scheduleVaccinationBooking({
      patientId: currentPatient.id,
      patientName: currentPatient.fullName,
      isChild: currentPatient.age < 12,
      guardianName: currentPatient.guardianName,
      vaccineName: selectedVaccine,
      doseNumber: 1,
      centreName: vaccineCentre,
      date: vaccineDate,
      timeSlot: '10:00 AM - 11:30 AM'
    });
    setVaccineSuccessMsg(`Vaccination Confirmed via U-WIN! Token: ${res.tokenNumber}. Scheduled at ${vaccineCentre}.`);
    setTimeout(() => setVaccineSuccessMsg(null), 7000);
  };

  const handleStartTeleconsult = async (apt: Appointment) => {
    const session = await eSanjeevaniService.initiateTeleconsultation(apt.id, apt.patientName);
    setTeleconsultSession(session);
    setActiveTab('teleconsult');
  };

  const handleOpenPatientReschedule = (apt: Appointment) => {
    setPatientRescheduleApt(apt);
    setRescheduleMode('BOTH');
    setPatientRescheduleDoctorId(apt.doctorId || (doctors[0]?.id ?? ''));
    setPatientRescheduleDate(apt.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setPatientRescheduleSlot(apt.timeSlot || '11:00 AM');
    setPatientRescheduleReason('Personal plan change / scheduling preference');
  };

  const handleExecutePatientReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientRescheduleApt || !currentPatient) return;

    const targetDoc = doctors.find(d => d.id === patientRescheduleDoctorId) ||
                      doctors.find(d => d.name === patientRescheduleApt.doctorName) ||
                      doctors[0];

    const finalDate = (rescheduleMode === 'DOCTOR_ONLY') ? patientRescheduleApt.date : patientRescheduleDate;
    const finalSlot = (rescheduleMode === 'DOCTOR_ONLY') ? patientRescheduleApt.timeSlot : patientRescheduleSlot;
    const finalDoc = (rescheduleMode === 'DATE_ONLY') ? undefined : targetDoc;

    storageService.updateAppointmentStatus(
      patientRescheduleApt.id,
      'RESCHEDULED',
      {
        date: finalDate,
        timeSlot: finalSlot,
        doctorId: finalDoc ? finalDoc.id : undefined,
        doctorName: finalDoc ? finalDoc.name : undefined,
        department: finalDoc ? finalDoc.specialization : undefined,
        cancellationReason: `Patient Rescheduled (${rescheduleMode === 'BOTH' ? 'Date & Doctor' : rescheduleMode === 'DOCTOR_ONLY' ? 'Doctor Only' : 'Date Only'}): ${patientRescheduleReason || 'Last-minute plan change'}`
      },
      currentPatient.fullName,
      'patient',
      `Patient rescheduled appointment from portal to ${finalDate} ${finalSlot} with ${finalDoc ? finalDoc.name : patientRescheduleApt.doctorName}`
    );

    const docChanged = finalDoc && finalDoc.name !== patientRescheduleApt.doctorName;
    setPatientActionNotice(
      `Appointment ${patientRescheduleApt.tokenNumber} successfully rescheduled to ${finalDate} at ${finalSlot}${docChanged ? ` with ${finalDoc.name}` : ''}. Doctor and hospital staff alerted via SMS!`
    );
    setTimeout(() => setPatientActionNotice(null), 9000);
    setPatientRescheduleApt(null);
  };

  const handleOpenPatientCancel = (apt: Appointment) => {
    setPatientCancelApt(apt);
    setPatientCancelReason('Feeling better / symptoms resolved');
  };

  const handleExecutePatientCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCancelApt || !currentPatient) return;

    storageService.updateAppointmentStatus(
      patientCancelApt.id,
      'CANCELLED',
      {
        cancellationReason: `Cancelled by patient: ${patientCancelReason || 'Personal reason'}`
      },
      currentPatient.fullName,
      'patient',
      `Patient cancelled appointment from their portal: ${patientCancelReason}`
    );

    setPatientActionNotice(
      `Appointment ${patientCancelApt.tokenNumber} has been CANCELLED. Dr. ${patientCancelApt.doctorName} and ${patientCancelApt.hospitalName} staff have been notified, and the OPD slot has been released.`
    );
    setTimeout(() => setPatientActionNotice(null), 9000);
    setPatientCancelApt(null);
  };

  const handlePatientAcceptAlternative = (apt: Appointment, choice: 'SAME_DOC_ANOTHER_DAY' | 'SAME_DAY_ANOTHER_DOC') => {
    if (!currentPatient) return;

    if (choice === 'SAME_DOC_ANOTHER_DAY') {
      const tomorrowStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
      storageService.updateAppointmentStatus(
        apt.id,
        'REQUESTED',
        {
          date: tomorrowStr,
          timeSlot: '11:00 AM',
          notes: `Patient accepted Alternative Option 1: Same Doctor (${apt.doctorName}) on ${tomorrowStr}`
        },
        currentPatient.fullName,
        'patient',
        `Patient chose Same Doctor on another date: ${tomorrowStr}`
      );
      setPatientActionNotice(
        `Updated request: Booked with ${apt.doctorName} on ${tomorrowStr} at 11:00 AM. Hospital staff notified.`
      );
    } else {
      storageService.updateAppointmentStatus(
        apt.id,
        'REQUESTED',
        {
          notes: `Patient accepted Alternative Option 2: Same day (${apt.date}) with available General OPD Doctor`
        },
        currentPatient.fullName,
        'patient',
        `Patient chose Same Day with alternate available doctor`
      );
      setPatientActionNotice(
        `Updated request: Scheduled for same day (${apt.date}) with alternate on-duty doctor. Hospital staff notified.`
      );
    }
    setTimeout(() => setPatientActionNotice(null), 8000);
  };

  return (
    <div className="space-y-6">
      {/* Patient Switcher & Header Profile Card */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#07172F] to-[#0F3460] text-white p-5 border-b border-amber-500/40">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-xl bg-amber-500 text-[#07172F] flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-300">
                {currentPatient?.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white font-serif">{currentPatient?.fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-900/90 text-amber-300 border border-amber-400/40">
                    {currentPatient?.id}
                  </span>
                  {currentPatient?.isHighRisk && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                      High Risk ({currentPatient.highRiskCategory})
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-200 mt-1 flex flex-wrap items-center gap-3 font-medium">
                  <span>{currentPatient?.age} Yrs • {currentPatient?.gender}</span>
                  <span>•</span>
                  <span className="font-mono text-amber-300">ABHA ID: {currentPatient?.abhaId}</span>
                  <span>•</span>
                  <span>{currentPatient?.village}, Dist. {currentPatient?.district}</span>
                </div>
              </div>
            </div>

            {/* Patient Profile Selector & Add Patient */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <label className="text-xs text-slate-300 font-medium">Switch Citizen:</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded border border-blue-400/50 bg-[#07172F] text-white font-semibold focus:outline-amber-400 cursor-pointer"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#07172F] text-white">
                    {p.fullName} ({p.village}) - {p.id}
                  </option>
                ))}
              </select>
              <button
                onClick={handleTriggerSOS}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md animate-pulse border border-rose-300 cursor-pointer"
                title="Trigger Immediate Emergency 108 Ambulance & Guardian Voice Call Alert"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                EMERGENCY SOS
              </button>
              <button
                onClick={onOpenRegistration}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-xs font-bold flex items-center gap-1 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" /> New ABHA Registration
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Summary & Privacy Toggle */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-xs space-y-1">
            <span className="font-bold text-[#0A2540] uppercase tracking-wider text-[10px]">Chronic Medical Conditions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentPatient?.chronicConditions.length ? (
                currentPatient.chronicConditions.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[11px] font-semibold">
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">None reported</span>
              )}
            </div>
          </div>

          <div className="text-xs space-y-1">
            <span className="font-bold text-[#0A2540] uppercase tracking-wider text-[10px]">Documented Drug Allergies:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentPatient?.allergies.length ? (
                currentPatient.allergies.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-300 rounded text-[11px] font-semibold">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic">No drug allergies recorded</span>
              )}
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="bg-white p-3 rounded-lg border border-slate-300 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-xs font-bold text-[#0A2540] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                ASHA Field Worker Access
              </div>
              <div className="text-[11px] text-slate-500">
                {currentPatient?.consent.allowAshaAssistance
                  ? 'Village ASHA permitted to coordinate visits'
                  : 'ABHA Consent restricted'}
              </div>
            </div>

            <button
              onClick={handleToggleAshaConsent}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                currentPatient?.consent.allowAshaAssistance ? 'bg-blue-800' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  currentPatient?.consent.allowAshaAssistance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Nav Tabs styled as Govt Portal Tabs */}
      <div className="flex border-b-2 border-[#0A2540] bg-[#07172F] rounded-t-xl p-1 shadow-sm overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded transition shrink-0 ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm border-b-2 border-amber-400' : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
          }`}
        >
          Active Appointments & Timeline
        </button>
        <button
          onClick={() => { setActiveTab('book'); setBookingStep(1); }}
          className={`px-4 py-2.5 rounded transition shrink-0 ${
            activeTab === 'book' ? 'bg-blue-600 text-white shadow-sm border-b-2 border-amber-400' : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
          }`}
        >
          Book Appointment (e-Sanjeevani Triage)
        </button>
        <button
          onClick={() => setActiveTab('vaccination')}
          className={`px-4 py-2.5 rounded transition shrink-0 ${
            activeTab === 'vaccination' ? 'bg-blue-600 text-white shadow-sm border-b-2 border-amber-400' : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
          }`}
        >
          Book Vaccination (U-WIN Portal)
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2.5 rounded transition shrink-0 ${
            activeTab === 'prescriptions' ? 'bg-blue-600 text-white shadow-sm border-b-2 border-amber-400' : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
          }`}
        >
          Prescriptions ({patientAppointments.filter(a => a.prescription).length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2.5 rounded transition shrink-0 ${
            activeTab === 'records' ? 'bg-blue-600 text-white shadow-sm border-b-2 border-amber-400' : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
          }`}
        >
          Longitudinal Health Records (ABHA)
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded transition shrink-0 ${
            activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm border-b-2 border-amber-400' : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
          }`}
        >
          My ABHA Health Profile (View & Edit)
        </button>
        <button
          onClick={() => setActiveTab('teleconsult')}
          className={`px-4 py-2.5 rounded transition shrink-0 ${
            activeTab === 'teleconsult' ? 'bg-blue-600 text-white shadow-sm border-b-2 border-amber-400' : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
          }`}
        >
          eSanjeevani Teleconsult Desk
        </button>
      </div>

      {/* SUCCESS BANNER POST BOOKING */}
      {bookingSuccessApt && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 shadow-md animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                Appointment Request Submitted Successfully!
              </div>
              <p className="text-xs text-emerald-950 mt-1">
                Token <strong className="font-mono">{bookingSuccessApt.tokenNumber}</strong> generated for {bookingSuccessApt.hospitalName}.
                Hospital staff is reviewing your request. Show the QR code on arrival.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedQrAppointment(bookingSuccessApt)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-4 h-4" /> View Token & QR
              </button>
              <button
                onClick={() => setBookingSuccessApt(null)}
                className="px-3 py-2 bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Action Notification Banner */}
      {patientActionNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 text-emerald-900 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{patientActionNotice}</span>
          </div>
          <button
            onClick={() => setPatientActionNotice(null)}
            className="text-xs px-2.5 py-1 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-100 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: ACTIVE APPOINTMENTS & TRACKERS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* RISK-BASED SMART HEALTH & VACCINATION REMINDERS PANEL */}
          <div className="bg-gradient-to-r from-blue-900 to-[#0F3460] text-white p-5 rounded-2xl shadow-md border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-700/50 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                  Smart Health & Vaccination Reminders ({currentPatient?.highRiskCategory || 'General Care'})
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950">
                {currentPatient?.isHighRisk ? 'High Priority Attention Required' : 'Active Routine Care'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Chronic Disease Alert */}
              {currentPatient?.chronicConditions && currentPatient.chronicConditions.length > 0 && (
                <div className="bg-blue-950/90 border border-blue-400/40 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" /> Chronic Disease Follow-up Alert
                  </div>
                  <p className="text-slate-200">
                    Monthly BP & Glucose review due for: <strong>{currentPatient.chronicConditions.join(', ')}</strong>. Refill current medications.
                  </p>
                  <button
                    onClick={() => { setActiveTab('book'); setBookingStep(1); }}
                    className="mt-1 text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Schedule Routine OPD Review →
                  </button>
                </div>
              )}

              {/* Maternal / ANC Alert */}
              {currentPatient?.highRiskCategory === 'Maternal' && (
                <div className="bg-pink-950/90 border border-pink-400/40 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-pink-400" /> Pradhan Mantri Surakshit Matritva (ANC)
                  </div>
                  <p className="text-slate-200">
                    ANC Trimester Check-up & Tetanus Toxoid (TT) Immunization due. Session site: PHC Morgaon.
                  </p>
                  <button
                    onClick={() => setActiveTab('vaccination')}
                    className="mt-1 text-[11px] font-bold text-pink-300 hover:underline flex items-center gap-1"
                  >
                    Book ANC Vaccination Slot →
                  </button>
                </div>
              )}

              {/* Pediatric / Child Alert */}
              {currentPatient && currentPatient.age <= 12 && (
                <div className="bg-emerald-950/90 border border-emerald-400/40 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-emerald-400" /> U-WIN Pediatric Immunization Schedule
                  </div>
                  <p className="text-slate-200">
                    Due: MR (Measles & Rubella) Dose 2 & Oral Polio Booster. Location: Morgaon Sub-Centre.
                  </p>
                  <button
                    onClick={() => setActiveTab('vaccination')}
                    className="mt-1 text-[11px] font-bold text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    Book U-WIN Child Slot →
                  </button>
                </div>
              )}

              {/* Adult / Elderly Preventive Care */}
              {currentPatient && currentPatient.age > 40 && (
                <div className="bg-amber-950/80 border border-amber-400/40 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" /> Adult Health & Immunization Check
                  </div>
                  <p className="text-slate-200">
                    Annual Lipid, Diabetes, and Adult Pneumococcal Screening recommended for citizens over 40.
                  </p>
                  <button
                    onClick={() => { setActiveTab('book'); setBookingStep(1); }}
                    className="mt-1 text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1"
                  >
                    Book Health Screening →
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Your Scheduled Visits & Continuity Tracking</h3>
            <button
              onClick={() => { setActiveTab('book'); setBookingStep(1); }}
              className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Book New Visit
            </button>
          </div>

          {patientAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-base">No appointment records yet</div>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Use the Smart NLP Booking assistant to schedule a consult with a nearby PHC or hospital doctor.
              </p>
              <button
                onClick={() => { setActiveTab('book'); setBookingStep(1); }}
                className="px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-800"
              >
                Book Your First Visit
              </button>
            </div>
          ) : (
            patientAppointments.map(apt => (
              <div key={apt.id} className="space-y-3">
                {/* 8-Stage Progress Tracker */}
                <AppointmentTracker appointment={apt} />

                {/* If Hospital Rejected or Doctor Unavailable: Show Direct Choice UI */}
                {(apt.status === 'REJECTED_BY_HOSPITAL' || apt.status === 'DOCTOR_UNAVAILABLE') && (
                  <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-amber-900">
                          Hospital Staff Notification: Request Rejected / Doctor Unavailable
                        </div>
                        <p className="text-xs text-amber-800 mt-0.5">
                          {apt.rejectionReason || 'Doctor on emergency rounds or slots full.'}{' '}
                          {apt.alternateSlotOffered && <span className="font-semibold">Staff suggested: {apt.alternateSlotOffered}</span>}
                        </p>
                        <div className="text-xs font-bold text-slate-800 mt-2">
                          Would you like to re-assign your visit? Choose your preference:
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handlePatientAcceptAlternative(apt, 'SAME_DOC_ANOTHER_DAY')}
                        className="p-3 bg-white hover:bg-amber-100/50 border border-amber-300 rounded-xl text-left transition shadow-xs flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5 text-amber-700" />
                            Option 1: Same Doctor, Another Day
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Keep Dr. {apt.doctorName.split(' ')[1] || apt.doctorName} for next available date
                          </div>
                        </div>
                        <span className="text-xs text-amber-700 font-bold group-hover:translate-x-0.5 transition">Select &rarr;</span>
                      </button>

                      <button
                        onClick={() => handlePatientAcceptAlternative(apt, 'SAME_DAY_ANOTHER_DOC')}
                        className="p-3 bg-white hover:bg-amber-100/50 border border-amber-300 rounded-xl text-left transition shadow-xs flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
                            Option 2: Same Day, Another Doctor
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Keep date {apt.date} with on-duty General OPD doctor
                          </div>
                        </div>
                        <span className="text-xs text-amber-700 font-bold group-hover:translate-x-0.5 transition">Select &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick actions for this appointment */}
                <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      Reason: <strong className="text-slate-800 font-normal">"{apt.chiefComplaint}"</strong>
                    </span>
                    {apt.suggestedDepartmentByNLP && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                        NLP Dept: {apt.suggestedDepartmentByNLP}
                      </span>
                    )}
                    {apt.assistedByAshaName && (
                      <span className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 rounded text-[11px] font-medium">
                        Assisted by ASHA: {apt.assistedByAshaName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Patient Last-Minute Plan Change Reschedule & Cancel Buttons */}
                    {(apt.status === 'REQUESTED' || apt.status === 'CONFIRMED' || apt.status === 'RESCHEDULED') && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPatientReschedule(apt)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg flex items-center gap-1.5 transition"
                          title="Reschedule date, time, or change doctor"
                        >
                          <CalendarClock className="w-3.5 h-3.5 text-amber-700" />
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleOpenPatientCancel(apt)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-lg flex items-center gap-1.5 transition"
                          title="Cancel appointment and notify doctor & hospital staff"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Cancel Appointment
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedQrAppointment(apt)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-600" />
                      Show QR Token
                    </button>

                    {apt.isEConsultation && (
                      <button
                        onClick={() => handleStartTeleconsult(apt)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold rounded-lg flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Enter Teleconsult Room
                      </button>
                    )}

                    {apt.prescription && (
                      <button
                        onClick={() => setSelectedPrescription(apt.prescription)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-lg flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        View Prescription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MULTI-STEP APPOINTMENT BOOKING WITH NLP TRIAGE */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
              Step {bookingStep} of 3 • Smart Appointment Assistant
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {bookingStep === 1 && '1. Describe Symptoms & Medical Details'}
              {bookingStep === 2 && '2. Select Hospital, Facility & Doctor'}
              {bookingStep === 3 && '3. Choose Date, Slot & Verify Request'}
            </h2>
          </div>

          {bookingStep === 1 && (
            <div className="space-y-5">
              {/* General Health Recall */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-700 uppercase">Registered Health Snapshot:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                  <div><strong>Age:</strong> {currentPatient?.age} Yrs</div>
                  <div><strong>Gender:</strong> {currentPatient?.gender}</div>
                  <div><strong>Hypertension/BP:</strong> Controlled</div>
                  <div><strong>Allergies:</strong> {currentPatient?.allergies.join(', ') || 'None'}</div>
                </div>
              </div>

              {/* Chief Complaint Description Box with NLP Recommendation */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
                  What is the reason for your visit? *
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Describe what you are feeling in English, Marathi (मराठी), or Hindi (उदा. "२ दिवसांपासून छातीत दुखत आहे" or "Severe fever and body pain since yesterday").
                </p>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., My chest has been hurting for two days, especially when climbing stairs..."
                  value={chiefComplaint}
                  onChange={handleSymptomChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* NLP Triage Recommendation Box */}
              {nlpResult && (
                <div className={`p-4 rounded-xl border space-y-2 transition ${
                  nlpResult.isEmergencyAlert
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {t.suggestedDepartment}: <strong className="text-emerald-900 font-extrabold">{nlpResult.suggestedDepartment}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Match: {Math.round(nlpResult.confidence * 100)}%
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed">
                    {nlpResult.explanation}
                  </p>

                  {/* EMERGENCY WARNING if triggered */}
                  {nlpResult.isEmergencyAlert && (
                    <div className="mt-2 p-3 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <div>
                        <div>CRITICAL NOTICE: Emergency care may be necessary!</div>
                        <div className="font-normal text-rose-100 mt-0.5">{nlpResult.emergencyNotice}</div>
                        <button
                          type="button"
                          onClick={onOpenEmergency}
                          className="mt-2 px-3 py-1 bg-white text-rose-700 rounded font-bold text-xs hover:bg-rose-50"
                        >
                          Access Emergency Care (Dial 108)
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                    * Non-Diagnostic Disclaimer: This assistant only assists in routing to the appropriate specialty. Clinical diagnosis will be made in person by a certified medical officer.
                  </div>
                </div>
              )}

              {/* E-Consultation Preference (eSanjeevani) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    Would you prefer an E-Consultation via eSanjeevani?
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Consult certified government doctor remotely over video call without traveling to the facility.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreferEConsult(!isPreferEConsult)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    isPreferEConsult
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isPreferEConsult ? 'YES (eSanjeevani)' : 'NO (In-Person OPD)'}
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!chiefComplaint.trim()}
                  onClick={() => setBookingStep(2)}
                  className="px-6 py-2.5 bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 shadow-sm flex items-center gap-1.5"
                >
                  Choose Facility & Doctor <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="space-y-4">
              {/* Recently Consulted Doctor Badge */}
              {recentlyConsultedDoc && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs">
                      🩺
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Recently Consulted Medical Officer</span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] rounded-full font-bold uppercase">
                          Previous Doctor
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-bold">{recentlyConsultedDoc.name} ({recentlyConsultedDoc.specialty})</div>
                      <div className="text-[11px] text-slate-600">{recentlyConsultedDoc.hospitalName}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctorId(recentlyConsultedDoc.id);
                      setSelectedHospitalId(recentlyConsultedDoc.hospitalId);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition shrink-0"
                  >
                    1-Click Re-Book Dr. {recentlyConsultedDoc.name.split(' ').pop()}
                  </button>
                </div>
              )}

              {/* Multi-criteria Doctor & Hospital Search */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search Doctor Name, Specialty or Hospital Facility (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Type doctor name, 'Cardiology', or 'Morgaon PHC'..."
                  value={doctorSearchQuery}
                  onChange={e => setDoctorSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-medium"
                />
              </div>

              {/* Hospital Selection Cards */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Available Healthcare Facilities
                </label>
                {hospitals.map(h => (
                  <label
                    key={h.id}
                    className={`block p-4 rounded-xl border cursor-pointer transition ${
                      selectedHospitalId === h.id
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="hospital"
                          checked={selectedHospitalId === h.id}
                          onChange={() => setSelectedHospitalId(h.id)}
                          className="mt-1 text-emerald-700 focus:ring-emerald-600"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                            <span>{h.type}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {h.distanceKm} km away
                            </span>
                            <span>•</span>
                            <span>Waiting: ~15 mins</span>
                          </div>
                          <div className="text-xs text-slate-600 mt-2 flex items-center gap-4">
                            <span className="font-medium text-emerald-800">
                              Emergency: {h.emergencyStatus}
                            </span>
                            <span className="font-mono text-slate-700">
                              {h.availableBeds} beds free
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Doctors in selected hospital */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Available Medical Officers
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors
                    .filter(d => !doctorSearchQuery || d.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase()))
                    .map(doc => (
                      <label
                        key={doc.id}
                        className={`p-3.5 rounded-xl border cursor-pointer transition block ${
                          selectedDoctorId === doc.id
                            ? 'border-emerald-700 bg-emerald-50/60 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="doctor"
                            checked={selectedDoctorId === doc.id}
                            onChange={() => setSelectedDoctorId(doc.id)}
                            className="text-emerald-700 focus:ring-emerald-600"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{doc.name}</div>
                            <div className="text-[11px] text-emerald-800 font-semibold">{doc.specialty}</div>
                            <div className="text-[10px] text-slate-500">{doc.hospitalName}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStep(3)}
                  className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 shadow-sm flex items-center gap-1.5"
                >
                  Choose Date & Time <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {bookingStep === 3 && (
            <form onSubmit={handleConfirmAppointment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
                  >
                    <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM">03:00 PM - 04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider">Booking Review:</span>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-800">{currentPatient?.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Facility:</span>
                  <span className="font-bold text-slate-800">
                    {hospitals.find(h => h.id === selectedHospitalId)?.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold text-slate-800">
                    {doctors.find(d => d.id === selectedDoctorId)?.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Consultation Type:</span>
                  <span className="font-bold text-emerald-800">
                    {isPreferEConsult ? 'eSanjeevani Video Teleconsult' : 'In-Person PHC Visit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Status:</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    REQUESTED (Staff Verification)
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Booking Request & Generate Token
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: U-WIN VACCINATION BOOKING */}
      {activeTab === 'vaccination' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              U
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">U-WIN National Immunization Adapter</span>
              <h2 className="text-lg font-bold text-slate-900">Child & Adult Vaccination Booking</h2>
            </div>
          </div>

          {vaccineSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{vaccineSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleBookVaccine} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Vaccine Dose</label>
              <select
                value={selectedVaccine}
                onChange={e => setSelectedVaccine(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 bg-slate-50"
              >
                {vaccineList.map((v, i) => (
                  <option key={i} value={v.vaccineName}>
                    {v.vaccineName} ({v.targetGroup}) - {v.diseaseProtected}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Site / PHC Centre</label>
              <select
                value={vaccineCentre}
                onChange={e => setVaccineCentre(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 bg-slate-50"
              >
                <option value="Primary Health Centre (PHC) Morgaon">PHC Morgaon Session Site</option>
                <option value="Sub-Centre Morgaon Ward 2">Sub-Centre Morgaon Ward 2</option>
                <option value="Rural Hospital Baramati">Rural Hospital Baramati Vaccination Cell</option>
                <option value="Sub-District Saswad">Sub-District Hospital Saswad OPD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={vaccineDate}
                onChange={e => setVaccineDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              Automatic SMS reminders will be dispatched 24 hours prior to the session. ASHA workers in your village will receive scheduled roster notifications.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 shadow-sm"
            >
              Confirm U-WIN Vaccination Slot
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Your Electronic Prescriptions & Medication Slips</h3>
          {patientAppointments.filter(a => a.prescription).length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No prescription slips attached yet. Once your doctor completes consultation, digital prescriptions will appear here.
            </div>
          ) : (
            patientAppointments.filter(a => a.prescription).map(a => {
              const rx = a.prescription!;
              return (
                <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Prescription #{rx.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        {rx.date}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Prescribed by <strong className="text-slate-800">{rx.doctorName}</strong> at {rx.hospitalName}
                    </div>
                    <div className="text-xs text-slate-700 mt-2">
                      <strong>Medicines:</strong> {rx.medicines.map(m => `${m.medicineName} (${m.frequency})`).join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPrescription(rx)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Official Slip
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 5: LONGITUDINAL HEALTH RECORD (Section 34) */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Ayushman Bharat Health Record (ABHA)</span>
              <h3 className="text-base font-bold text-slate-900">Unified Longitudinal Patient Timeline</h3>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
              FHIR Compatible
            </span>
          </div>

          <div className="relative pl-6 border-l-2 border-emerald-500/30 space-y-6 text-xs">
            {/* Seed timeline events */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
              <div className="font-bold text-slate-900 text-sm">OPD Consultation & Care Completed</div>
              <div className="text-slate-400 font-mono text-[11px]">Yesterday • Primary Health Centre Morgaon</div>
              <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Dr. Aniruddha Kulkarni reviewed respiratory symptoms. Prescribed Levocetirizine 5mg and Salbutamol Inhaler.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
              <div className="font-bold text-slate-900 text-sm">Clinical Referral Created (Cardiology)</div>
              <div className="text-slate-400 font-mono text-[11px]">2 weeks ago • Morgaon PHC → District Hospital Aundh</div>
              <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Referred for 2D-Echocardiogram and specialist cardiology evaluation due to exertional breathlessness.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
              <div className="font-bold text-slate-900 text-sm">Universal Immunization (U-WIN Record)</div>
              <div className="text-slate-400 font-mono text-[11px]">Tetanus & adult Diphtheria (Td) Dose 1 Administered</div>
              <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Sub-Centre Morgaon. Verified by ANM Smita Waghmare.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-xs" />
              <div className="font-bold text-slate-900 text-sm">Health ID & ABHA Creation</div>
              <div className="text-slate-400 font-mono text-[11px]">UIDAI OTP Authentication • Linked to MahaAarogya</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: eSanjeevani TELECONSULT */}
      {activeTab === 'teleconsult' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">eSanjeevani National Teleconsultation Adapter</span>
            <h2 className="text-lg font-bold text-slate-900">Virtual Doctor Consultation Room</h2>
            <p className="text-xs text-slate-500 mt-1">
              Connected to Government Telemedicine Hub. Video stream encrypted end-to-end.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Patient:</span>
              <span className="font-bold text-slate-800">{currentPatient?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Session ID:</span>
              <span className="font-mono font-bold text-blue-900">{teleconsultSession?.sessionId || 'ESANJ-992140'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Security Passcode:</span>
              <span className="font-mono font-bold text-slate-800">{teleconsultSession?.passCode || '741289'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Doctor In-Charge:</span>
              <span className="font-bold text-slate-800">Dr. Aniruddha Kulkarni (PHC Tele-Hub)</span>
            </div>
          </div>

          <div className="aspect-video bg-slate-950 rounded-xl flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center mb-3 animate-pulse">
              <Video className="w-8 h-8 text-blue-400" />
            </div>
            <div className="font-bold text-sm">Consultation Channel Initialized</div>
            <div className="text-xs text-slate-400 mt-1">Doctor is reviewing patient record before starting audio/video...</div>
          </div>

          <button
            onClick={() => alert('eSanjeevani simulated video link opened with doctor!')}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Launch eSanjeevani Video Interface
          </button>
        </div>
      )}

      {/* TAB 6: MY ABHA PROFILE VIEW & EDIT */}
      {activeTab === 'profile' && currentPatient && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#07172F] text-amber-300 font-extrabold flex items-center justify-center text-xl shadow-md border-2 border-amber-400">
                {currentPatient.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-serif">{currentPatient.fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-900 text-amber-300">
                    {currentPatient.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ABHA ID: <strong className="text-slate-800">{currentPatient.abhaId}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenEditProfile}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              Edit Personal Information & Contacts
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 uppercase text-[11px] text-blue-900 tracking-wider">Demographic Information</div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Age & Gender:</span>
                <span className="font-semibold text-slate-900">{currentPatient.age} Yrs • {currentPatient.gender}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-mono text-slate-900">{currentPatient.dob}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Registered Phone:</span>
                <span className="font-mono font-bold text-slate-900">{currentPatient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aadhaar (Masked):</span>
                <span className="font-mono text-slate-700">{currentPatient.aadhaarMasked}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 uppercase text-[11px] text-blue-900 tracking-wider">Location & Guardian Details</div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Village & District:</span>
                <span className="font-semibold text-slate-900">{currentPatient.village}, {currentPatient.district}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1">
                <span className="text-slate-500">Full Address:</span>
                <span className="font-medium text-slate-900 text-right">{currentPatient.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Contact / Guardian:</span>
                <span className="font-bold text-slate-900">
                  {currentPatient.emergencyContact?.name || currentPatient.guardianName || 'N/A'} ({currentPatient.emergencyContact?.phone || currentPatient.phone})
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 uppercase text-[11px] text-blue-900 tracking-wider">Clinical Summary & Consent Settings</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block font-medium">Chronic Conditions:</span>
                <div className="text-slate-900 font-semibold mt-0.5">
                  {currentPatient.chronicConditions.join(', ') || 'No chronic conditions reported'}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Known Allergies:</span>
                <div className="text-slate-900 font-semibold mt-0.5">
                  {currentPatient.allergies.join(', ') || 'No known drug allergies'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-600">
              <span>ASHA Assistance Consent: <strong className="text-emerald-700">{currentPatient.consent.allowAshaAssistance ? 'ENABLED' : 'RESTRICTED'}</strong></span>
              <span>Longitudinal Record Sharing: <strong className="text-emerald-700">{currentPatient.consent.allowRecordSharing ? 'GRANTED' : 'RESTRICTED'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && currentPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">Self-Service Profile Manager</span>
                <h3 className="text-base font-bold text-slate-900">Edit Details for {currentPatient.fullName}</h3>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Village Name</label>
                <input
                  type="text"
                  required
                  value={editVillage}
                  onChange={e => setEditVillage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-blue-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  required
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-blue-900"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="font-bold text-slate-900 text-xs">Emergency Contact / Guardian Information</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={editEmergencyName}
                      onChange={e => setEditEmergencyName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Relation</label>
                    <input
                      type="text"
                      value={editEmergencyRelation}
                      onChange={e => setEditEmergencyRelation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Phone Number</label>
                  <input
                    type="text"
                    value={editEmergencyPhone}
                    onChange={e => setEditEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedQrAppointment && (
        <QRCodeModal
          title="Patient OPD Appointment Token"
          tokenNumber={selectedQrAppointment.tokenNumber}
          appointmentId={selectedQrAppointment.id}
          patientName={selectedQrAppointment.patientName}
          hospitalName={selectedQrAppointment.hospitalName}
          date={selectedQrAppointment.date}
          timeSlot={selectedQrAppointment.timeSlot}
          doctorName={selectedQrAppointment.doctorName}
          department={selectedQrAppointment.department}
          qrData={selectedQrAppointment.qrCodeData}
          onClose={() => setSelectedQrAppointment(null)}
        />
      )}

      {selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          currentRole="patient"
          onClose={() => setSelectedPrescription(null)}
        />
      )}

      {/* PATIENT LAST-MINUTE RESCHEDULE MODAL (DATE, DOCTOR, OR BOTH) */}
      {patientRescheduleApt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                  Self-Service Rescheduling
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Reschedule Appointment: {patientRescheduleApt.tokenNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current: Dr. {patientRescheduleApt.doctorName} • {patientRescheduleApt.date} ({patientRescheduleApt.timeSlot})
                </p>
              </div>
              <button
                onClick={() => setPatientRescheduleApt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecutePatientReschedule} className="space-y-4">
              {/* Reschedule Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  What would you like to change?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleMode('DATE_ONLY')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      rescheduleMode === 'DATE_ONLY'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Change Date & Slot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRescheduleMode('DOCTOR_ONLY')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      rescheduleMode === 'DOCTOR_ONLY'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Change Doctor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRescheduleMode('BOTH')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      rescheduleMode === 'BOTH'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change Both</span>
                  </button>
                </div>
              </div>

              {/* Doctor Selector if DOCTOR_ONLY or BOTH */}
              {(rescheduleMode === 'DOCTOR_ONLY' || rescheduleMode === 'BOTH') && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
                    Select Preferred Doctor
                  </label>
                  <select
                    value={patientRescheduleDoctorId}
                    onChange={e => setPatientRescheduleDoctorId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-amber-600 font-semibold bg-white"
                  >
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialization} ({doc.hospitalName})
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const docInfo = doctors.find(d => d.id === patientRescheduleDoctorId);
                    if (!docInfo) return null;
                    return (
                      <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                        <span>Specialty: <strong className="text-slate-800">{docInfo.specialization}</strong></span>
                        <span>Experience: {docInfo.experienceYears} yrs • Available: {docInfo.availableDays.join(', ')}</span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Date & Time Slot if DATE_ONLY or BOTH */}
              {(rescheduleMode === 'DATE_ONLY' || rescheduleMode === 'BOTH') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={patientRescheduleDate}
                      onChange={e => setPatientRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-amber-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                    <select
                      value={patientRescheduleSlot}
                      onChange={e => setPatientRescheduleSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-amber-600 font-medium"
                    >
                      <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                      <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                      <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                      <option value="03:30 PM">03:30 PM - 04:30 PM</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Reason with Quick Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rescheduling
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Personal / family plan change',
                    'Prefer specialist consultation',
                    'Transit / bus timing clash',
                    'Need earlier OPD slot',
                    'Work / farm commitments'
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setPatientRescheduleReason(chip)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        patientRescheduleReason === chip
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter reason..."
                  value={patientRescheduleReason}
                  onChange={e => setPatientRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-amber-600"
                />
              </div>

              {/* Schedule Change Comparison Banner */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-amber-600" />
                  <span>Schedule Comparison</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-amber-200 text-slate-700">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Current Booking</span>
                    <div>Dr. {patientRescheduleApt.doctorName}</div>
                    <div className="text-slate-500">{patientRescheduleApt.date} at {patientRescheduleApt.timeSlot}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-300 text-amber-950 font-medium">
                    <span className="font-bold text-amber-700 block text-[10px] uppercase">New Booking</span>
                    <div>
                      Dr. {rescheduleMode === 'DATE_ONLY'
                        ? patientRescheduleApt.doctorName
                        : (doctors.find(d => d.id === patientRescheduleDoctorId)?.name || patientRescheduleApt.doctorName)}
                    </div>
                    <div className="text-amber-800">
                      {rescheduleMode === 'DOCTOR_ONLY' ? patientRescheduleApt.date : patientRescheduleDate} at{' '}
                      {rescheduleMode === 'DOCTOR_ONLY' ? patientRescheduleApt.timeSlot : patientRescheduleSlot}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-amber-900 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Real-time SMS alerts dispatched to Patient, Doctor, and Hospital Reception.</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPatientRescheduleApt(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Confirm Reschedule & Notify All</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PATIENT CANCEL APPOINTMENT MODAL */}
      {patientCancelApt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                  Appointment Cancellation
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Cancel Booking: {patientCancelApt.tokenNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {patientCancelApt.hospitalName}
                </p>
              </div>
              <button
                onClick={() => setPatientCancelApt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecutePatientCancel} className="space-y-4">
              {/* Appointment summary */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Dr. {patientCancelApt.doctorName}</span>
                  <span className="font-mono text-rose-700">{patientCancelApt.tokenNumber}</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Scheduled: {patientCancelApt.date} • {patientCancelApt.timeSlot}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Department: {patientCancelApt.department}
                </div>
              </div>

              {/* Cancellation Reason Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Please let us know the reason for cancellation:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Feeling better / recovered',
                    'Consulted local clinic / ASHA',
                    'Emergency personal travel',
                    'Transport / bus unavailable',
                    'Work / farm conflict'
                  ].map(reasonChip => (
                    <button
                      key={reasonChip}
                      type="button"
                      onClick={() => setPatientCancelReason(reasonChip)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        patientCancelReason === reasonChip
                          ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {reasonChip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Symptoms resolved, visited private clinic"
                  value={patientCancelReason}
                  onChange={e => setPatientCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-rose-600"
                />
              </div>

              {/* Multi-Party Notification Explanation */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5 text-amber-950">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Slot Release & Automatic Notifications</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Cancelling will release your OPD queue token so waiting rural patients can be accommodated. The following parties will be notified immediately:
                </p>
                <ul className="text-[11px] space-y-1 list-disc list-inside text-slate-700 pt-0.5">
                  <li><strong>Hospital Staff:</strong> Roster updated and OPD slot opened for walk-ins</li>
                  <li><strong>Dr. {patientCancelApt.doctorName}:</strong> OPD consultation queue adjusted</li>
                  <li><strong>You ({patientCancelApt.patientPhone}):</strong> Cancellation confirmation SMS</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPatientCancelApt(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation & Release Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
