import React from 'react';
import { X, Printer, Download, Stethoscope, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Prescription, UserRole } from '../types';

interface PrescriptionModalProps {
  prescription: Prescription;
  currentRole: UserRole;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  prescription,
  currentRole,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isDoctorOrStaff = currentRole === 'doctor' || currentRole === 'staff' || currentRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs text-slate-400 font-mono">RX-{prescription.id}</span>
              <h3 className="text-lg font-bold">Official e-Prescription & Care Summary</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Paper Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Government Emblem / Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
                Government of Maharashtra • Public Health Department
              </div>
              <h2 className="text-xl font-black text-slate-900">{prescription.hospitalName}</h2>
              <div className="text-xs text-slate-500">
                Primary Health Care Network • Rural Health Continuity Protocol
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <div><span className="font-semibold">Prescription ID:</span> {prescription.id}</div>
              <div><span className="font-semibold">Date:</span> {prescription.date}</div>
              <div><span className="font-semibold">Appointment:</span> {prescription.appointmentId}</div>
            </div>
          </div>

          {/* Doctor & Patient Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-sm">
            <div>
              <div className="text-xs font-semibold text-emerald-900 uppercase">Doctor In-Charge</div>
              <div className="font-bold text-slate-900">{prescription.doctorName}</div>
              <div className="text-xs text-slate-600 font-mono">Reg No: {prescription.doctorRegistrationNo}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-900 uppercase">Patient Information</div>
              <div className="font-bold text-slate-900">{prescription.patientName}</div>
              <div className="text-xs text-slate-600 font-mono">Patient ID: {prescription.patientId}</div>
            </div>
          </div>

          {/* Rx Symbol & Medication Table */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-serif text-2xl font-bold text-slate-900">
              <span className="text-emerald-700 italic">℞</span>
              <span className="text-sm font-sans font-semibold tracking-normal text-slate-700">Prescribed Medications</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Medicine & Strength</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medicines.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{m.medicineName}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-xs">{m.dosage}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 font-mono text-xs rounded-md text-slate-800">
                          {m.frequency}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 text-xs">{m.duration}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-600">{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Open Note (Patient & Caregiver Advice) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              General Advice & Dietary Instructions (Open Note)
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {prescription.openNotes || 'Take medications regularly as directed. Keep hydrated and follow up if symptoms persist.'}
            </p>
            {prescription.suggestedFollowUpDays && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium">
                <span>Follow-up Recommended: In {prescription.suggestedFollowUpDays} days</span>
              </div>
            )}
          </div>

          {/* Closed Note (DOCTORS / MEDICAL STAFF ONLY) */}
          {isDoctorOrStaff ? (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Confidential Clinical Impression (Closed Note - Medical Staff Only)</span>
              </div>
              <p className="text-sm text-rose-900 font-mono text-xs leading-relaxed bg-white/70 p-2.5 rounded-lg border border-rose-100">
                {prescription.closedNotes || 'No private clinical notes recorded.'}
              </p>
              <div className="text-[11px] text-rose-600 mt-1">
                Restricted access under Healthcare Data Privacy Rules. Never revealed to patient or non-clinical personnel.
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              * Confidential internal clinical observations are archived securely with the treating hospital.
            </div>
          )}

          {/* Doctor Signature & Dispensing Stamp */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div className="text-xs text-slate-500">
              <div className="font-semibold text-slate-700">Dispensed via e-Aushadhi / PHC Pharmacy:</div>
              <div>Available for electronic verification with Token ID</div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-mono mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Digitally Signed
              </div>
              <div className="font-bold text-slate-900 text-sm">{prescription.doctorName}</div>
              <div className="text-xs text-slate-500">Medical Officer In-Charge</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Prescription
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
