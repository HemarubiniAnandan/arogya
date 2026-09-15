import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface QRCodeModalProps {
  title: string;
  tokenNumber: string;
  appointmentId: string;
  patientName: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  doctorName?: string;
  department?: string;
  qrData: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  title,
  tokenNumber,
  appointmentId,
  patientName,
  hospitalName,
  date,
  timeSlot,
  doctorName,
  department,
  qrData,
  onClose
}) => {
  // Generate a deterministic SVG QR matrix representation
  const renderMockQRMatrix = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const size = 21;
    const cells: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

    // Corner finder patterns
    const setFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            cells[startY + r][startX + c] = true;
          }
        }
      }
    };

    setFinder(0, 0);
    setFinder(size - 7, 0);
    setFinder(0, size - 7);

    // Data bits based on hash
    let h = Math.abs(hash);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const inFinder = (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8);
        if (!inFinder) {
          h = (h * 1664525 + 1013904223) & 0xffffffff;
          cells[r][c] = (h % 3 === 0);
        }
      }
    }

    return (
      <svg viewBox="0 0 21 21" className="w-48 h-48 bg-white p-2 border-4 border-slate-900 rounded-lg shadow-inner">
        {cells.map((row, r) =>
          row.map((cell, c) => (
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="1"
                height="1"
                fill="#0f172a"
              />
            ) : null
          ))
        )}
      </svg>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-100">Official e-Health Token</span>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold mb-3">
            Token Verified • Show at Hospital Reception or OPD
          </div>

          <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1 font-mono">
            {tokenNumber}
          </div>
          <div className="text-xs text-slate-500 font-mono mb-4">
            Appointment ID: {appointmentId}
          </div>

          <div className="flex justify-center mb-5">
            {renderMockQRMatrix(qrData)}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-left text-sm border border-slate-200 space-y-2 mb-4">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-800">{patientName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">Facility:</span>
              <span className="font-semibold text-slate-800 text-right">{hospitalName}</span>
            </div>
            {department && (
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Specialty / Dept:</span>
                <span className="font-semibold text-slate-800">{department}</span>
              </div>
            )}
            {doctorName && (
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-800">{doctorName}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Scheduled:</span>
              <span className="font-semibold text-slate-900">{date} • {timeSlot}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ABDM Compatible • Encrypted Health Token</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition text-sm"
            >
              <Printer className="w-4 h-4" />
              Print Token Slip
            </button>
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition text-sm shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
