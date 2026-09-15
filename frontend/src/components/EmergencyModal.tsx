import React from 'react';
import { X, AlertTriangle, Phone, Activity, Navigation, Bed, HeartPulse } from 'lucide-react';
import { HospitalFacility } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: HospitalFacility[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, hospitals }) => {
  if (!isOpen) return null;

  // Filter emergency facilities
  const emergencyHospitals = hospitals.filter(h => h.emergencyStatus === 'Accepting');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-rose-500 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Emergency Alert Banner */}
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-rose-200">
                Immediate Emergency Protocol
              </span>
              <h2 className="text-xl font-black">CRITICAL HEALTHCARE ESCALATION</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-rose-200 hover:text-white hover:bg-rose-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Helpline Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:108"
              className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 hover:bg-rose-100 transition group"
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600">Free Ambulance Helpline</div>
                <div className="text-2xl font-black flex items-center gap-1.5">
                  <Phone className="w-5 h-5 text-rose-600" /> Dial 108
                </div>
                <div className="text-xs text-rose-700">Toll-free Maharashtra Emergency Medical Services</div>
              </div>
              <span className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold group-hover:bg-rose-700">
                Call Now
              </span>
            </a>

            <a
              href="tel:102"
              className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 hover:bg-amber-100 transition group"
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Janani Shishu Suraksha (Maternal)</div>
                <div className="text-2xl font-black flex items-center gap-1.5">
                  <HeartPulse className="w-5 h-5 text-amber-600" /> Dial 102
                </div>
                <div className="text-xs text-amber-800">For pregnant mothers & newborns transport</div>
              </div>
              <span className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold group-hover:bg-amber-700">
                Call Now
              </span>
            </a>
          </div>

          {/* Clinical Non-diagnostic notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Emergency Care Guidance: </span>
            Severe chest pain radiating to the jaw/arm, sudden loss of consciousness, uncontrolled bleeding, acute shortness of breath, snakebite, or severe trauma require direct hospital stabilization. Do NOT wait for regular OPD slots.
          </div>

          {/* Nearest Emergency Facilities Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              Participating Emergency Facilities with Live Bed Status
            </h3>

            <div className="space-y-2.5">
              {emergencyHospitals.map(h => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-400 bg-white transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{h.name}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {h.emergencyStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                      <span>{h.type} • {h.taluka}, {h.district}</span>
                      <span className="font-semibold text-slate-700">{h.distanceKm} km away</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-700">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{h.availableBeds}</strong> beds available
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono text-emerald-700">
                        <strong>{h.icuBedsAvailable}</strong> ICU beds
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono text-blue-700">
                        <strong>{h.oxygenBedsAvailable}</strong> Oxygen beds
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <a
                      href={`tel:${h.contactPhone}`}
                      className="flex-1 sm:flex-none px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {h.contactPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
};
