import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  AlertTriangle,
  Heart,
  Baby,
  Calendar,
  CheckCircle2,
  Clock,
  UserPlus,
  PlusCircle,
  Phone,
  Lock,
  ChevronRight,
  Eye,
  Building,
  Check,
  QrCode
} from 'lucide-react';
import { Patient, Appointment, HighRiskAlert, MaternalRecord, LanguageCode } from '../types';
import { storageService } from '../services/storageService';
import { QRCodeModal } from './QRCodeModal';
import { RegistrationModal } from './RegistrationModal';

interface AshaPortalProps {
  language: LanguageCode;
  onOpenEmergency: () => void;
}

export const AshaPortal: React.FC<AshaPortalProps> = ({ language, onOpenEmergency }) => {
  const ashaName = 'Surekha Tai Shinde';
  const ashaId = 'ASHA-MH-PN-042';
  const ashaVillage = 'Morgaon';

  const [patients, setPatients] = useState<Patient[]>(storageService.getPatients());
  const [appointments, setAppointments] = useState<Appointment[]>(storageService.getAppointments());
  const [highRiskAlerts, setHighRiskAlerts] = useState<HighRiskAlert[]>(storageService.getHighRiskAlerts());
  const [maternalRecords, setMaternalRecords] = useState<MaternalRecord[]>(storageService.getMaternalRecords());

  // Search & Auto-complete state (Section 11)
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingSuggestions, setMatchingSuggestions] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Assisted Booking Form State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [assistedReason, setAssistedReason] = useState('');
  const [assistedDate, setAssistedDate] = useState(new Date().toISOString().split('T')[0]);
  const [assistedSlot, setAssistedSlot] = useState('10:00 AM');
  const [assistedHospital, setAssistedHospital] = useState('HOSP-PHC-MOR');
  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

  // New patient registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [viewingQrApt, setViewingQrApt] = useState<Appointment | null>(null);

  useEffect(() => {
    const update = () => {
      setPatients(storageService.getPatients());
      setAppointments(storageService.getAppointments());
      setHighRiskAlerts(storageService.getHighRiskAlerts());
      setMaternalRecords(storageService.getMaternalRecords());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  // Filtered patients: ONLY those who have authorized ASHA assistance OR were registered by this ASHA
  const authorizedPatients = patients.filter(p => p.consent.allowAshaAssistance || p.registeredViaAshaId === ashaId);

  // Autocomplete typing logic
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 1) {
      const results = authorizedPatients.filter(p =>
        p.fullName.toLowerCase().includes(val.toLowerCase()) ||
        p.phone.includes(val) ||
        p.id.toLowerCase().includes(val.toLowerCase()) ||
        p.abhaId.includes(val)
      );
      setMatchingSuggestions(results);
    } else {
      setMatchingSuggestions([]);
    }
  };

  const selectPatientSuggestion = (p: Patient) => {
    setSelectedPatient(p);
    setSearchQuery(p.fullName);
    setMatchingSuggestions([]);
  };

  const handleCreateAssistedAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const hosp = storageService.getHospitals().find(h => h.id === assistedHospital) || storageService.getHospitals()[0];
    const doc = storageService.getDoctors()[0];

    const apt = storageService.createAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      hospitalType: hosp.type,
      department: 'General Medicine',
      doctorId: doc.id,
      doctorName: doc.name,
      date: assistedDate,
      timeSlot: assistedSlot,
      chiefComplaint: assistedReason || 'Assisted visit scheduled by ASHA worker',
      assistedByAshaId: ashaId,
      assistedByAshaName: ashaName
    });

    setBookingFeedback(`Appointment ${apt.id} booked with assistance from ASHA Worker: ${ashaName}! Token: ${apt.tokenNumber}`);
    setShowBookingModal(false);
    setAssistedReason('');
    setTimeout(() => setBookingFeedback(null), 8000);
  };

  const handleMarkAlertAttended = (alertId: string) => {
    storageService.updateHighRiskStatus(alertId, 'ATTENDED');
  };

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#07172F] to-[#0F3460] text-white p-5 border-b border-amber-500/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-xl bg-amber-500 text-[#07172F] flex items-center justify-center font-bold text-xl shadow-md border-2 border-amber-300 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-serif">{ashaName}</h2>
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-900 text-amber-300 border border-amber-400/40">
                  {ashaId}
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-1 flex flex-wrap items-center gap-2 font-medium">
                <span>Assigned Village: <strong className="text-amber-300">{ashaVillage}</strong></span>
                <span>•</span>
                <span>124 Households Supervised</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Sub-Centre Morgaon</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex-1 md:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Register New Citizen (ABHA)
            </button>
          </div>
        </div>
      </div>

      {bookingFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{bookingFeedback}</span>
        </div>
      )}

      {/* SECTION 11: ASHA PATIENT SEARCH WITH INSTANT RELEVANCE SUGGESTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-700">Assisted Access Engine</span>
            <h3 className="text-base font-bold text-slate-900">Search Authorized Village Patients</h3>
          </div>
          <span className="text-xs text-slate-500">
            {authorizedPatients.length} Patients Authorized for ASHA Assistance
          </span>
        </div>

        {/* Search Input with Auto-complete Popover */}
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder='Search by name, mobile, ABHA ID or Patient ID (e.g. type "Ravi" or "Meena")...'
              value={searchQuery}
              onChange={e => handleSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-pink-700 bg-slate-50"
            />
          </div>

          {/* Suggestions Dropdown (Section 11 requirements) */}
          {matchingSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              {matchingSuggestions.map(p => (
                <div
                  key={p.id}
                  onClick={() => selectPatientSuggestion(p)}
                  className="p-3 hover:bg-pink-50/70 cursor-pointer flex justify-between items-center transition"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.fullName}</div>
                    <div className="text-xs text-slate-500 flex gap-2">
                      <span>ID: <strong className="font-mono text-slate-700">{p.id}</strong></span>
                      <span>•</span>
                      <span>Phone: {p.phone}</span>
                      <span>•</span>
                      <span>{p.village}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-semibold rounded-lg">
                    Select Patient
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Patient Card & Assisted Booking Trigger */}
        {selectedPatient && (
          <div className="bg-pink-50/50 border border-pink-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{selectedPatient.fullName}</span>
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-pink-200 text-pink-800 font-semibold">
                  {selectedPatient.id}
                </span>
                <span className="text-xs font-mono text-slate-500">ABHA: {selectedPatient.abhaId}</span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {selectedPatient.age} Yrs • {selectedPatient.gender} • {selectedPatient.address}
              </div>
              <div className="text-xs text-slate-700 mt-1">
                <strong>Conditions:</strong> {selectedPatient.chronicConditions.join(', ') || 'None reported'}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Book Appointment on Behalf of {selectedPatient.fullName.split(' ')[0]}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 10 & 20: PRIORITY ALERTS & HIGH-RISK FOLLOW-UPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: High-Risk Action List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-base">High-Risk & Maternal Priority Alerts</h3>
            </div>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
              {highRiskAlerts.filter(a => a.status === 'PENDING').length} Action Required
            </span>
          </div>

          <div className="space-y-3">
            {highRiskAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition ${
                  alert.status === 'ATTENDED'
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : alert.priority === 'HIGH'
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-amber-50/30 border-amber-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{alert.patientName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        alert.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {alert.priority} Priority • {alert.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-medium">
                      Condition: {alert.condition}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Due Date: <strong className="text-slate-700">{alert.dueDate}</strong> • Village: {alert.village}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 bg-white/80 p-2 rounded border border-slate-200">
                      {alert.notes}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-1.5">
                    {alert.status === 'PENDING' ? (
                      <button
                        onClick={() => handleMarkAlertAttended(alert.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition"
                      >
                        Mark Visited
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Visited
                      </span>
                    )}
                    <a
                      href={`tel:${alert.patientPhone}`}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-slate-200"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Maternal Follow-Up & Child Immunization Reminders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              <h3 className="font-bold text-slate-900 text-base">Maternal Health (ANC) Tracker</h3>
            </div>
            <span className="text-xs text-slate-500">Pradhan Mantri Surakshit Matritva</span>
          </div>

          <div className="space-y-3">
            {maternalRecords.map((m, idx) => (
              <div key={idx} className="bg-pink-50/40 p-4 rounded-xl border border-pink-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.patientName} (Age {m.age})</h4>
                    <div className="text-xs text-slate-600">
                      Expected Delivery (EDD): <strong className="text-pink-800 font-bold">{m.edd}</strong> • Trimester: {m.trimester}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full uppercase">
                    High Risk Flag
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <span className="font-semibold">Risk Factors:</span> {m.highRiskFlags.join(', ')}
                </div>

                {/* ANC checkups progress */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-pink-100 text-center text-xs">
                  {m.scheduledCheckups.map(c => (
                    <div
                      key={c.checkupNo}
                      className={`p-1.5 rounded-lg border ${
                        c.status === 'COMPLETED'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold">ANC {c.checkupNo}</div>
                      <div className="text-[10px]">{c.status}</div>
                      {c.hemoglobin && <div className="text-[9px] text-slate-500">Hb: {c.hemoglobin}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Child Immunization Schedule */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
              <Baby className="w-4 h-4 text-emerald-600" />
              <span>Authorized Child Immunization Follow-Ups (U-WIN)</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">Aarav Pawar (Son of Sunita Pawar)</div>
                <div className="text-slate-500 text-[11px]">Due: MR (Measles & Rubella) Dose 2 • Session Site: PHC Morgaon</div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold">
                Due in 2 Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 12: APPOINTMENTS BOOKED WITH ASHA ASSISTANCE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">
            Appointments Coordinated by ASHA ({appointments.filter(a => a.assistedByAshaId === ashaId).length})
          </h3>
          <span className="text-xs text-slate-500">
            Real-time status updates sync directly with the treating hospital OPD
          </span>
        </div>

        <div className="space-y-3">
          {appointments.filter(a => a.assistedByAshaId === ashaId).map(apt => (
            <div
              key={apt.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                  <span className="font-mono text-xs text-slate-500">({apt.tokenNumber})</span>
                  <span className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 rounded text-[10px] font-bold">
                    Booked with assistance from ASHA Worker: {ashaName}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Facility: {apt.hospitalName}</span>
                  <span>•</span>
                  <span>Dr. {apt.doctorName}</span>
                  <span>•</span>
                  <span>{apt.date} ({apt.timeSlot})</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Reason: "{apt.chiefComplaint}"
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  apt.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : apt.status === 'CONFIRMED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {apt.status}
                </span>

                <button
                  onClick={() => setViewingQrApt(apt)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" /> Token
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ASSISTED APPOINTMENT BOOKING (SECTION 12) */}
      {showBookingModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs uppercase font-bold text-pink-700 tracking-wider">
                Assisted Village Health Booking
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Book Visit for {selectedPatient.fullName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Appointment will be marked as: <strong>Booked with assistance from ASHA Worker: {ashaName}</strong>
              </p>
            </div>

            <form onSubmit={handleCreateAssistedAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility / Hospital</label>
                <select
                  value={assistedHospital}
                  onChange={e => setAssistedHospital(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-pink-700 bg-slate-50"
                >
                  {storageService.getHospitals().map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.type} • {h.distanceKm} km away)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Follow up for high BP check and routine blood sugar evaluation..."
                  value={assistedReason}
                  onChange={e => setAssistedReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-pink-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={assistedDate}
                    onChange={e => setAssistedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slot</label>
                  <select
                    value={assistedSlot}
                    onChange={e => setAssistedSlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Confirm Assisted Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PATIENT REGISTRATION MODAL (SECTION 13) */}
      <RegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegistered={newP => {
          setSelectedPatient(newP);
          setBookingFeedback(`Registered new citizen ${newP.fullName} (ID: ${newP.id}). Initialized with ASHA assistance linkage.`);
        }}
        creatorRole="asha"
        creatorName={ashaName}
      />

      {viewingQrApt && (
        <QRCodeModal
          title="ASHA Assisted Appointment Token"
          tokenNumber={viewingQrApt.tokenNumber}
          appointmentId={viewingQrApt.id}
          patientName={viewingQrApt.patientName}
          hospitalName={viewingQrApt.hospitalName}
          date={viewingQrApt.date}
          timeSlot={viewingQrApt.timeSlot}
          doctorName={viewingQrApt.doctorName}
          qrData={viewingQrApt.qrCodeData}
          onClose={() => setViewingQrApt(null)}
        />
      )}
    </div>
  );
};
