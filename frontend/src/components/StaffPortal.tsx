import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  QrCode,
  Volume2,
  Users,
  DoorOpen,
  ArrowRight,
  XCircle,
  RotateCcw,
  Sparkles,
  Phone,
  MessageSquare,
  Bed,
  UploadCloud,
  FileCheck,
  Check,
  CalendarClock
} from 'lucide-react';
import { Appointment, LanguageCode, AppointmentStatus, DoctorSlotRoster } from '../types';
import { storageService } from '../services/storageService';
import { QRCodeModal } from './QRCodeModal';

interface StaffPortalProps {
  language: LanguageCode;
  onOpenSmsDrawer?: () => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({ language, onOpenSmsDrawer }) => {
  const hospitalList = storageService.getHospitals();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('HOSP-PHC-MOR');

  const currentHospital = hospitalList.find(h => h.id === selectedHospitalId) || hospitalList[0];
  const staffFacility = currentHospital.name;
  const staffName = 'Pramod Gaikwad (OPD Registration Desk)';

  const [appointments, setAppointments] = useState<Appointment[]>(storageService.getAppointments());
  const [activeTab, setActiveTab] = useState<'incoming' | 'queue' | 'capacity' | 'roster'>('incoming');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [verificationInput, setVerificationInput] = useState('');
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);

  // Doctor Excel Roster Upload State
  const [parsedRosterList, setParsedRosterList] = useState<DoctorSlotRoster[]>([]);
  const [activeRosters, setActiveRosters] = useState<DoctorSlotRoster[]>(storageService.getDoctorRosters());

  // Reschedule / Action modal state
  const [activeActionApt, setActiveActionApt] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<'CONFIRM' | 'RESCHEDULE' | 'CANCEL' | 'REJECT' | 'ASSIGN_ROOM' | null>(null);
  const [assignedRoom, setAssignedRoom] = useState('Room 3 (General OPD)');
  const [rescheduleDate, setRescheduleDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [rescheduleSlot, setRescheduleSlot] = useState('11:00 AM');
  const [actionReason, setActionReason] = useState('');
  const [alternateOptionType, setAlternateOptionType] = useState<'SAME_DOC_OTHER_DAY' | 'SAME_DAY_OTHER_DOC'>('SAME_DOC_OTHER_DAY');
  const [suggestedAlternativeSlot, setSuggestedAlternativeSlot] = useState('Tomorrow 11:00 AM with same doctor');

  // Audio / Flash state for token queue
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState<string | null>(null);
  const [selectedQrApt, setSelectedQrApt] = useState<Appointment | null>(null);
  const [recentActionNotice, setRecentActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setAppointments(storageService.getAppointments());
      setActiveRosters(storageService.getDoctorRosters());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  const handleDownloadRosterTemplate = () => {
    const csvContent = "Doctor Name,Specialty,Hospital Name,Date,Slot Timings,Max Capacity\n" +
      "Dr. Aniruddha Kulkarni,General Medicine,Primary Health Centre (PHC) Morgaon,2026-09-16,09:00 AM - 10:00 AM,10\n" +
      "Dr. Aniruddha Kulkarni,General Medicine,Primary Health Centre (PHC) Morgaon,2026-09-16,10:00 AM - 11:00 AM,10\n" +
      "Dr. Snehal Deshmukh,Obstetrics & Gynecology,Rural Hospital (RH) Baramati,2026-09-16,11:00 AM - 12:00 PM,8\n" +
      "Dr. Thorat,Pediatrics,Primary Health Centre (PHC) Morgaon,2026-09-16,02:00 PM - 03:00 PM,12\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'doctor_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) return;

      const items: DoctorSlotRoster[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 5) {
            items.push({
              id: `ROS-${Date.now()}-${i}`,
              doctorId: `DOC-${parts[0].replace(/\s+/g, '-').toUpperCase()}`,
              doctorName: parts[0] || 'Medical Officer',
              specialty: parts[1] || 'General Medicine',
              hospitalId: selectedHospitalId,
              hospitalName: parts[2] || currentHospital.name,
              date: parts[3] || new Date().toISOString().split('T')[0],
              timeSlot: parts[4] || '09:00 AM',
              maxCapacity: parseInt(parts[5]) || 10,
              bookedCount: 0,
              status: 'AVAILABLE'
            });
        }
      }

      setParsedRosterList(items);
      setRecentActionNotice(`Excel roster parsed successfully! Previewing ${items.length} slot timing records.`);
      setTimeout(() => setRecentActionNotice(null), 5000);
    };

    reader.readAsText(file);
  };

  const handleSaveRosterBatch = () => {
    if (parsedRosterList.length === 0) return;
    storageService.saveDoctorRosterBatch(parsedRosterList, staffName);
    setActiveRosters(storageService.getDoctorRosters());
    setParsedRosterList([]);
    setRecentActionNotice(`Successfully imported ${parsedRosterList.length} doctor timing slots to facility roster!`);
    setTimeout(() => setRecentActionNotice(null), 8000);
  };

  // Filter appointments by selected hospital facility
  const facilityAppointments = appointments.filter(a =>
    a.hospitalId === selectedHospitalId ||
    a.hospitalName?.toLowerCase().includes(currentHospital.name.split(' ')[0].toLowerCase())
  );

  // Filter appointments by status within this facility
  const filteredAppointments = facilityAppointments.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const requestedCount = facilityAppointments.filter(a => a.status === 'REQUESTED').length;
  const confirmedCount = facilityAppointments.filter(a => a.status === 'CONFIRMED').length;
  const arrivedCount = facilityAppointments.filter(a => a.status === 'ARRIVED').length;
  const inConsultCount = appointments.filter(a => a.status === 'IN_CONSULTATION').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

  const patientCancelledAppointments = appointments.filter(
    a => a.status === 'CANCELLED' && (a.cancellationReason?.toLowerCase().includes('patient') || a.statusHistory?.some(h => h.role === 'patient'))
  );

  // Quick 1-click Confirm Booking
  const handleQuickConfirm = (apt: Appointment) => {
    const room = apt.roomAssigned || 'Room 3 (General OPD)';
    storageService.updateAppointmentStatus(apt.id, 'CONFIRMED', {
      roomAssigned: room
    }, staffName, 'staff');

    setRecentActionNotice(`Appointment ${apt.tokenNumber} for ${apt.patientName} CONFIRMED! Automated confirmation SMS dispatched to ${apt.patientPhone}.`);
    setTimeout(() => setRecentActionNotice(null), 8000);
  };

  // Open Reschedule Modal directly
  const handleOpenReschedule = (apt: Appointment) => {
    setActiveActionApt(apt);
    setActionType('RESCHEDULE');
    setRescheduleDate(apt.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setRescheduleSlot(apt.timeSlot || '11:00 AM');
    setActionReason('Doctor emergency rural visit');
  };

  // Verify patient on arrival (Section 23)
  const handleVerifyArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationInput.trim()) return;

    const query = verificationInput.trim().toUpperCase();
    const apt = appointments.find(a =>
      a.id.toUpperCase() === query ||
      a.tokenNumber.toUpperCase() === query ||
      a.patientPhone.includes(query) ||
      a.patientName.toUpperCase().includes(query)
    );

    if (apt) {
      storageService.updateAppointmentStatus(apt.id, 'ARRIVED', {
        roomAssigned: apt.roomAssigned || 'Room 3 (General OPD)',
        queuePosition: 2,
        estimatedWaitMins: 10
      }, staffName, 'staff');

      setVerifyFeedback(`Patient ${apt.patientName} verified! Status set to ARRIVED. SMS dispatched with Token ${apt.tokenNumber} and assigned to Room 3.`);
      setVerificationInput('');
      announceToken(apt.tokenNumber);
      setTimeout(() => setVerifyFeedback(null), 8000);
    } else {
      setVerifyFeedback(`No appointment record found matching "${verificationInput}". Check spelling or token.`);
    }
  };

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionApt || !actionType) return;

    if (actionType === 'CONFIRM') {
      storageService.updateAppointmentStatus(activeActionApt.id, 'CONFIRMED', {
        roomAssigned: assignedRoom
      }, staffName, 'staff');
      setRecentActionNotice(`Appointment ${activeActionApt.tokenNumber} CONFIRMED. SMS dispatched to ${activeActionApt.patientPhone}.`);
    } else if (actionType === 'RESCHEDULE') {
      storageService.updateAppointmentStatus(activeActionApt.id, 'RESCHEDULED', {
        date: rescheduleDate,
        timeSlot: rescheduleSlot,
        cancellationReason: actionReason || 'Doctor on emergency duty'
      }, staffName, 'staff');
      setRecentActionNotice(`Appointment ${activeActionApt.tokenNumber} RESCHEDULED to ${rescheduleDate} at ${rescheduleSlot}. Patient alerted via SMS.`);
    } else if (actionType === 'REJECT') {
      const altPrompt = alternateOptionType === 'SAME_DOC_OTHER_DAY'
        ? `Same doctor on another day (${suggestedAlternativeSlot || 'Next available day'})`
        : `Same day with another doctor (${suggestedAlternativeSlot || 'General OPD Dr. Kulkarni'})`;

      storageService.updateAppointmentStatus(
        activeActionApt.id,
        'REJECTED_BY_HOSPITAL',
        {
          cancellationReason: actionReason || 'Doctor on emergency duty / OPD slot at full capacity'
        },
        staffName,
        'staff',
        actionReason || 'Doctor on emergency duty',
        altPrompt
      );
      setRecentActionNotice(`Appointment ${activeActionApt.tokenNumber} REJECTED. SMS dispatched offering options (same doctor another day / same day another doctor).`);
    } else if (actionType === 'CANCEL') {
      storageService.updateAppointmentStatus(activeActionApt.id, 'CANCELLED', {
        cancellationReason: actionReason || 'Patient unavailable / requested cancellation'
      }, staffName, 'staff');
      setRecentActionNotice(`Appointment ${activeActionApt.tokenNumber} CANCELLED. Cancellation notification sent via SMS.`);
    } else if (actionType === 'ASSIGN_ROOM') {
      storageService.updateAppointmentStatus(activeActionApt.id, activeActionApt.status, {
        roomAssigned: assignedRoom
      }, staffName, 'staff');
    }

    setTimeout(() => setRecentActionNotice(null), 8000);
    setActiveActionApt(null);
    setActionType(null);
    setActionReason('');
  };

  const announceToken = (token: string) => {
    setLastAnnouncedToken(token);
    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(`Token ${token}, please proceed to Room 3`);
        utter.lang = 'en-IN';
        window.speechSynthesis.speak(utter);
      }
    } catch {
      // ignore
    }
    setTimeout(() => setLastAnnouncedToken(null), 6000);
  };

  // Mask patient name for public waiting hall privacy (e.g., "R***h J***v")
  const maskNameForPublicBoard = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => {
      if (p.length <= 2) return p;
      return `${p[0]}***${p[p.length - 1]}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Quick Status and Notice Banner */}
      {recentActionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{recentActionNotice}</span>
          </div>
          {onOpenSmsDrawer && (
            <button
              onClick={onOpenSmsDrawer}
              className="ml-3 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
            >
              <MessageSquare className="w-3 h-3" /> View SMS Log
            </button>
          )}
        </div>
      )}

      {/* Facility Switcher & Facility Header Banner */}
      {/* Facility Switcher, Emergency Admissions Toggle & Facility Header Banner */}
      <div className="bg-gradient-to-r from-[#07172F] to-[#0F3460] text-white p-4 rounded-xl border border-amber-500/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-[#07172F] flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {staffFacility}
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-900 text-amber-300 border border-amber-400/40 font-mono">
                {currentHospital.type}
              </span>
            </h2>
            <p className="text-xs text-slate-300">{currentHospital.address} • Phone: {currentHospital.contactPhone}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Active Hospital Emergency Admissions Toggle */}
          <div className="bg-blue-950/90 px-3 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Emergency Admissions:
            </span>
            <button
              onClick={() => {
                const nextStatus = currentHospital.emergencyStatus === 'Accepting' ? 'Temporarily Unavailable' : 'Accepting';
                storageService.updateHospitalEmergencyStatus(selectedHospitalId, nextStatus);
                setRecentActionNotice(`Hospital Emergency Admission status updated to '${nextStatus}'.`);
                setTimeout(() => setRecentActionNotice(null), 5000);
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition shadow-xs ${
                currentHospital.emergencyStatus === 'Accepting'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              }`}
            >
              {currentHospital.emergencyStatus === 'Accepting' ? 'ACCEPTING' : 'TEMPORARILY UNAVAILABLE'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-amber-300 whitespace-nowrap">Switch Facility:</label>
            <select
              value={selectedHospitalId}
              onChange={e => setSelectedHospitalId(e.target.value)}
              className="bg-[#07172F] text-xs font-semibold text-white px-3 py-1.5 rounded-lg border border-blue-600 focus:outline-none cursor-pointer"
            >
              {hospitalList.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DOCTOR DUTY STATUS & BUSY/LEAVE ALERT BANNER FOR STAFF */}
      {storageService.getDoctors().some(d => d.status === 'Busy' || d.status === 'On Leave' || d.status === 'Emergency Duty') && (
        <div className="bg-amber-900/90 text-amber-100 border border-amber-500 p-3.5 rounded-xl text-xs space-y-1.5 animate-in fade-in">
          <div className="font-bold flex items-center gap-2 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Doctor Duty Status Alerts — Staff Attention Required</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {storageService.getDoctors()
              .filter(d => d.status === 'Busy' || d.status === 'On Leave' || d.status === 'Emergency Duty')
              .map(doc => (
                <div key={doc.id} className="bg-black/40 px-3 py-1 rounded-lg border border-amber-400/40 text-[11px] flex items-center gap-2">
                  <span className="font-bold text-white">{doc.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    doc.status === 'Busy'
                      ? 'bg-rose-800 text-rose-200'
                      : doc.status === 'Emergency Duty'
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {doc.status}
                  </span>
                  <span className="text-amber-300 text-[10px]">
                    (Staff: Please adjust OPD token estimates or offer alternate doctor)
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Staff Operational View Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#07172F] p-2 rounded-xl border border-slate-300 shadow-sm text-white">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('incoming'); setFilterStatus('ALL'); }}
            className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'incoming' && filterStatus === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>All OPD Bookings</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-900 text-amber-300 font-mono border border-amber-400/30 font-bold">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('incoming'); setFilterStatus('REQUESTED'); }}
            className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'incoming' && filterStatus === 'REQUESTED'
                ? 'bg-amber-600 text-slate-950 shadow-xs border-b-2 border-amber-300 font-black'
                : 'text-amber-300 hover:bg-blue-900/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Requests</span>
            {requestedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-slate-950 font-mono font-bold animate-pulse">
                {requestedCount} to Confirm
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('incoming'); setFilterStatus('CONFIRMED'); }}
            className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'incoming' && filterStatus === 'CONFIRMED'
                ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirmed</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-900 text-slate-200 font-mono">
              {confirmedCount}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('incoming'); setFilterStatus('CANCELLED'); }}
            className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'incoming' && filterStatus === 'CANCELLED'
                ? 'bg-rose-700 text-white shadow-xs border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled / Released</span>
            {cancelledCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-900 text-rose-200 font-mono font-bold">
                {cancelledCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>OPD Hall Display Board</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-900 text-amber-300 font-mono font-bold">
              {arrivedCount + inConsultCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/50'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
            <span>Doctor Roster & Timings (Excel Upload)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-900 text-amber-300 font-mono font-bold">
              {activeRosters.length} Slots
            </span>
          </button>
        </div>

        {onOpenSmsDrawer && (
          <button
            onClick={onOpenSmsDrawer}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Outbound SMS Dispatcher</span>
          </button>
        )}
      </div>

      {/* PATIENT CANCELLATION & SLOT RELEASE ALERT */}
      {patientCancelledAppointments.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-rose-950">
                Patient Cancellation Alert — {patientCancelledAppointments.length} OPD Slot(s) Released
              </div>
              <p className="text-rose-800 mt-0.5">
                The patient cancelled their booking via portal. Doctor and reception schedules have been updated and tokens released for walk-in patients:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {patientCancelledAppointments.map(pca => (
                  <div key={pca.id} className="bg-white px-2.5 py-1 rounded-lg border border-rose-200 text-[11px] text-slate-800 flex items-center gap-1.5">
                    <span className="font-mono font-bold text-rose-700">{pca.tokenNumber}</span>
                    <span>{pca.patientName}</span>
                    <span className="text-slate-500">• Dr. {pca.doctorName}</span>
                    <span className="text-rose-600 italic">({pca.cancellationReason || 'Patient cancelled'})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab('incoming'); setFilterStatus('CANCELLED'); }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 self-start sm:self-center transition"
          >
            View Cancelled List
          </button>
        </div>
      )}

      {/* PENDING APPROVALS HIGHLIGHT CARDS (For quick review & confirmation) */}
      {requestedCount > 0 && filterStatus !== 'ARRIVED' && activeTab === 'incoming' && (
        <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="font-bold text-slate-900 text-sm">
                Action Required: {requestedCount} Incoming Appointment Request{requestedCount > 1 ? 's' : ''} Awaiting Staff Confirmation
              </h3>
            </div>
            <span className="text-[11px] text-amber-900 font-medium">
              Click "Confirm Booking" to verify slot and trigger instant SMS notification.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appointments
              .filter(a => a.status === 'REQUESTED')
              .map(reqApt => (
                <div key={reqApt.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[10px]">
                        {reqApt.tokenNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {reqApt.date} • {reqApt.timeSlot}
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <div className="font-bold text-slate-900 text-sm">{reqApt.patientName}</div>
                      <div className="text-xs text-slate-500">
                        {reqApt.patientAge} Yrs • {reqApt.patientGender} • Tel: {reqApt.patientPhone}
                      </div>
                    </div>

                    <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-700">
                      <div className="font-semibold text-slate-900">Dr. {reqApt.doctorName.split(' ')[1] || reqApt.doctorName} ({reqApt.department})</div>
                      <div className="italic text-slate-600 mt-0.5 text-[11px]">"{reqApt.chiefComplaint}"</div>
                    </div>
                  </div>

                  {/* Primary Staff Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleQuickConfirm(reqApt)}
                      className="flex-1 py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Booking</span>
                    </button>
                    <button
                      onClick={() => handleOpenReschedule(reqApt)}
                      className="py-1.5 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveActionApt(reqApt);
                        setActionType('REJECT');
                        setActionReason('Doctor on emergency duty / OPD slot full');
                      }}
                      className="py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      title="Reject request with SMS options"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => { setActiveActionApt(reqApt); setActionType('CANCEL'); }}
                      className="py-1.5 px-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-medium"
                      title="Cancel Request"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION 23: PATIENT ARRIVAL VERIFICATION & CHECK-IN */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Counter Arrival Desk (Section 23)
            </span>
            <h3 className="text-base font-bold">Fast Patient Arrival Check-In</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Scan appointment QR code, or enter Token Number, Appointment ID, or 10-digit Phone Number.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" /> Barcode & QR Scanner Armed
            </span>
          </div>
        </div>

        <form onSubmit={handleVerifyArrival} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              placeholder="e.g. MH-TKN-401, APT-MH-2026-001, or 9822014491..."
              value={verificationInput}
              onChange={e => setVerificationInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark Patient Arrived
          </button>
        </form>

        {verifyFeedback && (
          <div className="mt-3 p-3 bg-slate-800 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{verifyFeedback}</span>
          </div>
        )}
      </div>

      {/* SECTION 25 & 26: REAL-TIME QUEUE DISPLAY BOARD (WAITING HALL TV) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-base">OPD Waiting Hall Token Display Board</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live synchronized queue display with privacy-preserving name masking and audio chime.
            </p>
          </div>

          {lastAnnouncedToken && (
            <div className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold flex items-center gap-1.5 animate-bounce">
              <Volume2 className="w-4 h-4 text-amber-700" /> Calling Token {lastAnnouncedToken}
            </div>
          )}
        </div>

        {/* Live Queue Tokens Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {appointments
            .filter(a => ['CONFIRMED', 'ARRIVED', 'IN_CONSULTATION'].includes(a.status))
            .slice(0, 4)
            .map((apt, idx) => (
              <div
                key={apt.id}
                className={`p-4 rounded-xl border text-center transition ${
                  apt.status === 'IN_CONSULTATION'
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                    : apt.status === 'ARRIVED'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Queue Position #{idx + 1}
                </div>
                <div className="text-xl font-black font-mono my-1 text-slate-900">
                  {apt.tokenNumber}
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {maskNameForPublicBoard(apt.patientName)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {apt.roomAssigned || 'Room 3'} • Dr. {apt.doctorName.split(' ')[1] || 'Kulkarni'}
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    apt.status === 'IN_CONSULTATION'
                      ? 'bg-blue-200 text-blue-900'
                      : apt.status === 'ARRIVED'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SECTION 22: INCOMING APPOINTMENTS MANAGEMENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Manage Incoming Appointments</h3>
            <span className="text-xs text-slate-400">({filteredAppointments.length} records)</span>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'REQUESTED', 'CONFIRMED', 'ARRIVED', 'IN_CONSULTATION', 'COMPLETED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterStatus === status ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment records table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Token / ID</th>
                <th className="px-4 py-3">Patient Details</th>
                <th className="px-4 py-3">Doctor & Dept</th>
                <th className="px-4 py-3">Date & Slot</th>
                <th className="px-4 py-3">Reason / NLP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Staff Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900">{apt.tokenNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{apt.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{apt.patientName}</div>
                    <div className="text-[11px] text-slate-500">{apt.patientAge} Yrs • {apt.patientPhone}</div>
                    {apt.assistedByAshaName && (
                      <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 rounded font-semibold">
                        ASHA: {apt.assistedByAshaName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                    <div className="text-[10px] text-slate-500">{apt.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{apt.date}</div>
                    <div className="text-[10px] text-slate-500">{apt.timeSlot}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="truncate text-slate-800 font-medium">"{apt.chiefComplaint}"</div>
                    {apt.suggestedDepartmentByNLP && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        NLP: {apt.suggestedDepartmentByNLP}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      apt.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'ARRIVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'IN_CONSULTATION'
                        ? 'bg-purple-100 text-purple-800'
                        : apt.status === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-700'
                        : apt.status === 'RESCHEDULED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {apt.status}
                    </span>
                    {apt.roomAssigned && (
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{apt.roomAssigned}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Action buttons depending on state */}
                      {apt.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => { setActiveActionApt(apt); setActionType('CONFIRM'); }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => { setActiveActionApt(apt); setActionType('RESCHEDULE'); }}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              setActiveActionApt(apt);
                              setActionType('REJECT');
                              setActionReason('Doctor on emergency duty / OPD slot full');
                            }}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold"
                            title="Reject request with SMS options"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => { setActiveActionApt(apt); setActionType('CANCEL'); }}
                            className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {apt.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => {
                              storageService.updateAppointmentStatus(apt.id, 'ARRIVED', {
                                roomAssigned: apt.roomAssigned || 'Room 3',
                                queuePosition: 1,
                                estimatedWaitMins: 5
                              }, staffName, 'staff');
                              announceToken(apt.tokenNumber);
                            }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold"
                          >
                            Check-In (Arrived)
                          </button>
                          <button
                            onClick={() => { setActiveActionApt(apt); setActionType('RESCHEDULE'); }}
                            className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-bold"
                            title="Reschedule this confirmed booking"
                          >
                            Reschedule
                          </button>
                        </>
                      )}

                      {apt.status === 'RESCHEDULED' && (
                        <>
                          <button
                            onClick={() => { setActiveActionApt(apt); setActionType('CONFIRM'); }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold"
                          >
                            Re-Confirm
                          </button>
                          <button
                            onClick={() => { setActiveActionApt(apt); setActionType('RESCHEDULE'); }}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold"
                          >
                            Change Slot
                          </button>
                        </>
                      )}

                      {apt.status === 'ARRIVED' && (
                        <button
                          onClick={() => {
                            storageService.updateAppointmentStatus(apt.id, 'IN_CONSULTATION', {}, staffName, 'staff');
                          }}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold"
                        >
                          Send to Doctor
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedQrApt(apt)}
                        title="View QR Token"
                        className="p-1 text-slate-500 hover:text-slate-800"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TAB: DOCTOR SLOT ROSTER EXCEL / CSV UPLOAD & TIMINGS CONFIGURATION */}
      {activeTab === 'roster' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-700" />
                  Doctor Slot Timings & Roster Upload (Excel / CSV)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload hospital doctor schedules and available slot timings. Patients can only select slots according to this uploaded roster.
                </p>
              </div>

              <button
                onClick={handleDownloadRosterTemplate}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-700" />
                Download Sample Roster CSV Template
              </button>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/50 p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Select or Drag Excel (.xlsx) / CSV Doctor Roster File</span>
                <span className="text-[11px] text-slate-500">Columns: Doctor Name, Specialty, Hospital, Date (YYYY-MM-DD), Slot Timings, Max Capacity</span>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleRosterFileChange}
                className="hidden"
                id="roster-file-input"
              />
              <label
                htmlFor="roster-file-input"
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition"
              >
                <UploadCloud className="w-4 h-4" /> Browse Excel File
              </label>
            </div>

            {/* Parsed Preview Table */}
            {parsedRosterList.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Parsed Roster Preview ({parsedRosterList.length} Slot Timings Found)
                  </h4>
                  <button
                    onClick={handleSaveRosterBatch}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Import Roster to Live System
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Doctor Name</th>
                        <th className="p-3">Specialty</th>
                        <th className="p-3">Hospital</th>
                        <th className="p-3">Available Date</th>
                        <th className="p-3">Slot Timings</th>
                        <th className="p-3">Max Capacity</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      {parsedRosterList.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-bold">{r.doctorName}</td>
                          <td className="p-3">{r.specialty}</td>
                          <td className="p-3">{r.hospitalName}</td>
                          <td className="p-3">{r.date}</td>
                          <td className="p-3 font-mono font-bold text-blue-900">{r.timeSlot}</td>
                          <td className="p-3">{r.maxCapacity} Patients</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                              READY TO IMPORT
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Currently Saved Live Doctor Rosters */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-emerald-700" /> Current Active Hospital Slot Rosters
              </h4>
              {activeRosters.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  No custom Excel rosters uploaded yet. Default doctor schedules are active.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeRosters.map((ros, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{ros.doctorName}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] rounded font-mono">
                          {ros.timeSlot}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">{ros.specialty} • {ros.date}</div>
                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Capacity: {ros.bookedCount}/{ros.maxCapacity} Booked</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          ros.status === 'FROZEN' ? 'bg-amber-100 text-amber-900' : ros.status === 'FULL' ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {ros.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL (CONFIRM / RESCHEDULE / CANCEL) */}
      {activeActionApt && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs uppercase font-bold text-slate-500">
                Staff Action • Token {activeActionApt.tokenNumber}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {actionType === 'CONFIRM' && 'Confirm Appointment & Assign Room'}
                {actionType === 'RESCHEDULE' && 'Reschedule Patient Appointment'}
                {actionType === 'CANCEL' && 'Cancel Appointment with Reason'}
              </h3>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              {actionType === 'CONFIRM' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Room / Counter</label>
                  <select
                    value={assignedRoom}
                    onChange={e => setAssignedRoom(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  >
                    <option value="Room 1 (Triage / Vitals Desk)">Room 1 (Triage / Vitals Desk)</option>
                    <option value="Room 2 (General OPD - Dr. Kulkarni)">Room 2 (General OPD - Dr. Kulkarni)</option>
                    <option value="Room 3 (Maternal & Child Health)">Room 3 (Maternal & Child Health)</option>
                    <option value="Room 4 (Immunization & Injections)">Room 4 (Immunization & Injections)</option>
                    <option value="Counter 2 (Pharmacy / e-Aushadhi)">Counter 2 (Pharmacy / e-Aushadhi)</option>
                  </select>
                </div>
              )}

              {actionType === 'RESCHEDULE' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={e => setRescheduleDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">New Slot</label>
                      <select
                        value={rescheduleSlot}
                        onChange={e => setRescheduleSlot(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rescheduling</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Doctor on rural emergency round"
                      value={actionReason}
                      onChange={e => setActionReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </>
              )}

              {actionType === 'REJECT' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Doctor on emergency duty / OPD slots full"
                      value={actionReason}
                      onChange={e => setActionReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Patient Options to Offer via SMS
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                        alternateOptionType === 'SAME_DOC_OTHER_DAY'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="altOption"
                          checked={alternateOptionType === 'SAME_DOC_OTHER_DAY'}
                          onChange={() => {
                            setAlternateOptionType('SAME_DOC_OTHER_DAY');
                            setSuggestedAlternativeSlot('Tomorrow 11:00 AM with same doctor');
                          }}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-bold">Option 1: Same Doctor, Another Day</div>
                          <div className="text-[11px] text-slate-500">Suggest next available day with {activeActionApt.doctorName}</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                        alternateOptionType === 'SAME_DAY_OTHER_DOC'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="altOption"
                          checked={alternateOptionType === 'SAME_DAY_OTHER_DOC'}
                          onChange={() => {
                            setAlternateOptionType('SAME_DAY_OTHER_DOC');
                            setSuggestedAlternativeSlot('Today 02:00 PM with Dr. Kulkarni (General OPD)');
                          }}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-bold">Option 2: Same Day, Another Doctor</div>
                          <div className="text-[11px] text-slate-500">Same date with available on-duty colleague</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Suggested Slot Details for SMS</label>
                    <input
                      type="text"
                      value={suggestedAlternativeSlot}
                      onChange={e => setSuggestedAlternativeSlot(e.target.value)}
                      placeholder="e.g. Tomorrow 11:00 AM or Dr. Kulkarni today at 2 PM"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {actionType === 'CANCEL' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter reason for cancelling request (dispatched via SMS)..."
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              )}

              {/* SMS Notification Live Preview */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-800 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated Outbound SMS Preview to {activeActionApt.patientPhone}</span>
                </div>
                <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-100 text-slate-700">
                  {actionType === 'CONFIRM' && (
                    `"PHC Alert: Dear ${activeActionApt.patientName}, your OPD appointment is CONFIRMED with ${activeActionApt.doctorName} on ${activeActionApt.date} at ${activeActionApt.timeSlot}. Token: ${activeActionApt.tokenNumber}, Assigned: ${assignedRoom}."`
                  )}
                  {actionType === 'RESCHEDULE' && (
                    `"PHC Alert: Dear ${activeActionApt.patientName}, your appointment has been RESCHEDULED to ${rescheduleDate} at ${rescheduleSlot}. Reason: ${actionReason || 'Doctor on emergency duty'}. Token: ${activeActionApt.tokenNumber}."`
                  )}
                  {actionType === 'REJECT' && (
                    `"MahaAarogya ALERT: Dear ${activeActionApt.patientName}, your appointment request ${activeActionApt.id} at ${activeActionApt.hospitalName} was REJECTED. Reason: \"${actionReason || 'Doctor on emergency duty / OPD slot full'}\". Would you like: [1] Same doctor another day, or [2] Same day another doctor? Offered slot: ${suggestedAlternativeSlot}. Reply 1 or 2 or re-book via portal."`
                  )}
                  {actionType === 'CANCEL' && (
                    `"PHC Notice: Dear ${activeActionApt.patientName}, your appointment ${activeActionApt.tokenNumber} has been CANCELLED. Reason: ${actionReason || 'Requested by staff'}. Contact PHC or your ASHA to re-book."`
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setActiveActionApt(null); setActionType(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execute & Dispatch SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedQrApt && (
        <QRCodeModal
          title="Hospital OPD Token Verification"
          tokenNumber={selectedQrApt.tokenNumber}
          appointmentId={selectedQrApt.id}
          patientName={selectedQrApt.patientName}
          hospitalName={selectedQrApt.hospitalName}
          date={selectedQrApt.date}
          timeSlot={selectedQrApt.timeSlot}
          doctorName={selectedQrApt.doctorName}
          qrData={selectedQrApt.qrCodeData}
          onClose={() => setSelectedQrApt(null)}
        />
      )}
    </div>
  );
};
