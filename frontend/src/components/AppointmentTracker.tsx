import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  UserCheck,
  Stethoscope,
  FileText,
  CalendarCheck,
  Building2,
  Info
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';

interface AppointmentTrackerProps {
  appointment: Appointment;
}

interface StageDefinition {
  key: AppointmentStatus;
  title: string;
  icon: React.ElementType;
}

const STAGES: StageDefinition[] = [
  { key: 'REQUESTED', title: 'Appointment Requested', icon: Clock },
  { key: 'CONFIRMED', title: 'Hospital Confirmed', icon: Building2 },
  { key: 'PATIENT_ARRIVED', title: 'Patient Arrived', icon: UserCheck },
  { key: 'PATIENT_CHECKED_IN', title: 'Checked In', icon: CheckCircle2 },
  { key: 'IN_CONSULTATION', title: 'Doctor Consultation', icon: Stethoscope },
  { key: 'CONSULTATION_COMPLETED', title: 'Prescription Completed', icon: FileText },
  { key: 'FOLLOW_UP_SCHEDULED', title: 'Follow-up Scheduled', icon: CalendarCheck },
  { key: 'COMPLETED', title: 'Journey Completed', icon: CheckCircle2 }
];

export const AppointmentTracker: React.FC<AppointmentTrackerProps> = ({ appointment }) => {
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);

  const isFailedOrCancelled =
    appointment.status === 'REJECTED_BY_HOSPITAL' ||
    appointment.status === 'DOCTOR_UNAVAILABLE' ||
    appointment.status === 'PATIENT_DID_NOT_ARRIVE' ||
    appointment.status === 'CANCELLED';

  // Map the status progression index
  const getStageIndex = (status: AppointmentStatus): number => {
    switch (status) {
      case 'REQUESTED': return 0;
      case 'CONFIRMED': return 1;
      case 'PATIENT_ARRIVED': return 2;
      case 'PATIENT_CHECKED_IN': return 3;
      case 'IN_CONSULTATION': return 4;
      case 'CONSULTATION_COMPLETED': return 5;
      case 'FOLLOW_UP_SCHEDULED': return 6;
      case 'COMPLETED': return 7;
      default: return 0;
    }
  };

  const currentStageIndex = getStageIndex(appointment.status);

  const getFailureLabel = (status: AppointmentStatus): string => {
    switch (status) {
      case 'REJECTED_BY_HOSPITAL': return 'Hospital Rejected';
      case 'DOCTOR_UNAVAILABLE': return 'Doctor Unavailable / Rejected';
      case 'PATIENT_DID_NOT_ARRIVE': return 'Patient Did Not Arrive';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Request Discontinued';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Continuity Progress Tracker</span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{appointment.hospitalName}</span>
            <span className="text-xs font-mono font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {appointment.tokenNumber}
            </span>
          </h3>
        </div>

        {/* Current status badge */}
        <div>
          {isFailedOrCancelled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              {getFailureLabel(appointment.status)}
            </span>
          ) : appointment.status === 'COMPLETED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Journey Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              In Progress • {STAGES[currentStageIndex]?.title || appointment.status}
            </span>
          )}
        </div>
      </div>

      {/* Failure Banner if cancelled or rejected */}
      {isFailedOrCancelled && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm text-rose-900">
            <span className="font-bold">{getFailureLabel(appointment.status)}: </span>
            <span>
              {appointment.cancellationReason || appointment.rejectionReason || 'The scheduled visit was halted. Re-schedule or contact your local ASHA worker.'}
            </span>
            {appointment.status === 'CANCELLED' && (
              <div className="mt-1 text-xs text-rose-800 font-medium">
                [CONFIRMED] Hospital staff and Dr. {appointment.doctorName} were notified. OPD queue slot has been released.
              </div>
            )}
            {appointment.alternateSlotOffered && (
              <div className="mt-1 text-xs font-semibold text-rose-800">
                Suggested alternative slot: {appointment.alternateSlotOffered}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Timeline Bar */}
      <div className="relative mb-6">
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex items-center min-w-[680px] justify-between relative">
            {/* Connecting background line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 z-0" />

            {STAGES.map((stage, idx) => {
              const isPast = !isFailedOrCancelled && idx < currentStageIndex;
              const isCurrent = !isFailedOrCancelled && idx === currentStageIndex;
              const isFailedStep = isFailedOrCancelled && idx === currentStageIndex;

              const Icon = stage.icon;

              // Find matching history item
              const historyLog = appointment.statusHistory.find(h => h.stage === stage.key);

              let circleClass = 'bg-white border-2 border-slate-200 text-slate-400';
              let titleClass = 'text-slate-400';

              if (isPast || (!isFailedOrCancelled && idx <= currentStageIndex && historyLog)) {
                circleClass = 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-xs';
                titleClass = 'text-slate-800 font-semibold';
              } else if (isCurrent) {
                circleClass = 'bg-amber-500 border-2 border-amber-600 text-white shadow-md ring-4 ring-amber-100';
                titleClass = 'text-amber-900 font-bold';
              } else if (isFailedStep) {
                circleClass = 'bg-rose-600 border-2 border-rose-700 text-white shadow-md ring-4 ring-rose-100';
                titleClass = 'text-rose-900 font-bold';
              }

              return (
                <div
                  key={stage.key}
                  className="flex flex-col items-center text-center z-10 cursor-pointer group px-1"
                  onClick={() => historyLog && setSelectedLogIndex(idx)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 max-w-[85px] leading-tight transition-colors ${titleClass}`}>
                    {stage.title}
                  </span>
                  {historyLog ? (
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">
                      {historyLog.timestamp}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300 mt-1 font-mono">--</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable Accordion: Stage Verification & Timestamp Audit Log */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setSelectedLogIndex(selectedLogIndex === 1 ? null : 1)}
          className="w-full flex items-center justify-between p-3.5 text-xs text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Stage Verification & Timestamp Audit History ({appointment.statusHistory.length} Verified Logs)</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
            {selectedLogIndex === 1 ? 'Collapse ▲' : 'Expand Timeline ▼'}
          </span>
        </button>

        {selectedLogIndex === 1 && (
          <div className="p-4 pt-0 space-y-2 border-t border-slate-200/80 animate-in fade-in">
            {appointment.statusHistory.map((h, i) => (
              <div
                key={i}
                className="text-xs flex flex-col sm:flex-row justify-between sm:items-center bg-white p-2.5 rounded-lg border border-slate-200/80 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800">{h.stage}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{h.notes || 'Status confirmed'}</span>
                </div>
                <div className="text-slate-500 mt-1 sm:mt-0 font-mono text-[11px]">
                  by <span className="font-medium text-slate-700">{h.updatedBy}</span> ({h.role}) @ {h.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
