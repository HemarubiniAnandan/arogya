import React, { useState } from 'react';
import { Microscope, Search, Calendar, MapPin, CheckCircle2, Clock, AlertTriangle, FileText, Building } from 'lucide-react';
import { storageService } from '../services/storageService';
import { HospitalFacility, UserRole } from '../types';

interface DiagnosticsModuleProps {
  currentRole: UserRole;
  patientId?: string;
  patientName?: string;
}

interface DiagnosticTest {
  name: string;
  category: string;
  description: string;
  normalTurnaround: string;
}

const TESTS: DiagnosticTest[] = [
  { name: 'Complete Blood Count (CBC) & Hemoglobin', category: 'Pathology', description: 'Checks anemia, infections, platelet count.', normalTurnaround: '2 - 4 Hours' },
  { name: 'Fasting & Postprandial Blood Sugar', category: 'Pathology', description: 'Diabetes evaluation and glycemic control monitoring.', normalTurnaround: '2 Hours' },
  { name: 'Chest X-Ray (PA View)', category: 'Radiology', description: 'Tuberculosis screening, pneumonia, lung evaluation.', normalTurnaround: 'Same Day' },
  { name: 'Obstetric / Abdominal Ultrasound (USG)', category: 'Radiology', description: 'Fetal growth monitoring, gestational age, anomaly check.', normalTurnaround: '24 Hours' },
  { name: 'Brain / Spine MRI (1.5 Tesla)', category: 'Radiology', description: 'Advanced neurological scan, disc herniation, stroke assessment.', normalTurnaround: '24 - 48 Hours' },
  { name: '12-Lead Electrocardiogram (ECG)', category: 'Cardiology', description: 'Ischemia detection, arrhythmia, acute coronary evaluation.', normalTurnaround: 'Immediate (15 mins)' }
];

export const DiagnosticsModule: React.FC<DiagnosticsModuleProps> = ({ currentRole, patientId, patientName }) => {
  const [hospitals, setHospitals] = useState<HospitalFacility[]>(storageService.getHospitals());
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest>(TESTS[0]);
  const [filterQuery, setFilterQuery] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const getTestStatus = (hosp: HospitalFacility, testName: string) => {
    if (testName.includes('Blood')) return hosp.diagnostics.bloodTest;
    if (testName.includes('X-Ray')) return hosp.diagnostics.xRay;
    if (testName.includes('Ultrasound')) return hosp.diagnostics.ultrasound;
    if (testName.includes('MRI')) return hosp.diagnostics.mri;
    return 'Available';
  };

  const handleBookDiagnostic = (hospital: HospitalFacility) => {
    const bookingRef = `DX-${Math.floor(10000 + Math.random() * 90000)}`;
    setBookingSuccess(`Diagnostic Slot Confirmed: ${selectedTest.name} at ${hospital.name}. Reference: ${bookingRef}. Report will auto-link to longitudinal ABDM record.`);
    storageService.addAuditLog(
      patientName || 'Citizen',
      currentRole,
      'BOOK_DIAGNOSTIC_SLOT',
      bookingRef,
      `Booked ${selectedTest.name} at ${hospital.name}`
    );
    setTimeout(() => setBookingSuccess(null), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Microscope className="w-6 h-6 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Rural Diagnostic Coordination & Tele-Radiology Grid</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time public laboratory slots across PHCs, Rural Hospitals, and District Facilities in Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search diagnostic tests..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* Main Grid: Test Selection + Available Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Test Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Diagnostic Tests</h3>
          {TESTS.filter(t => t.name.toLowerCase().includes(filterQuery.toLowerCase()) || t.category.toLowerCase().includes(filterQuery.toLowerCase())).map(t => (
            <button
              key={t.name}
              onClick={() => setSelectedTest(t)}
              className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                selectedTest.name === t.name
                  ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">{t.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                  {t.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal line-clamp-2">{t.description}</p>
              <div className="text-[11px] text-emerald-700 font-medium">Turnaround: {t.normalTurnaround}</div>
            </button>
          ))}
        </div>

        {/* Right: Hospital Status & Alternative Locations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Viewing Availability For:</span>
                <h3 className="text-base font-bold text-slate-900">{selectedTest.name}</h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full">
                Free Under Government Health Mission
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">{selectedTest.description}</p>

            {/* Facilities status list */}
            <div className="space-y-3">
              {hospitals.map(hosp => {
                const status = getTestStatus(hosp, selectedTest.name);
                const isAvail = status === 'Available';
                const isLimited = status === 'Limited';

                return (
                  <div
                    key={hosp.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      isAvail
                        ? 'bg-white border-slate-200 hover:border-emerald-300'
                        : isLimited
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-100/70 border-slate-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-slate-900 text-sm">{hosp.name}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isAvail
                            ? 'bg-emerald-100 text-emerald-800'
                            : isLimited
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {hosp.distanceKm} km away • {hosp.taluka}
                        </span>
                        <span>•</span>
                        <span>{hosp.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isAvail ? (
                        <button
                          onClick={() => handleBookDiagnostic(hosp)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          Book Lab Slot
                        </button>
                      ) : isLimited ? (
                        <button
                          onClick={() => handleBookDiagnostic(hosp)}
                          className="w-full sm:w-auto px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition"
                        >
                          Request Limited Slot
                        </button>
                      ) : (
                        <div className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Refer to District Hospital
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Lifecycle Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
              Diagnostic Continuity Protocol:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800">1. Slot Requested</div>
                <div className="text-[10px] text-slate-500">Token auto-generated</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800">2. Sample Drawn</div>
                <div className="text-[10px] text-slate-500">Barcode attached</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800">3. Test Processed</div>
                <div className="text-[10px] text-slate-500">Pathologist verified</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="font-bold">4. Report Linked</div>
                <div className="text-[10px] text-emerald-700">In ABDM EHR Record</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
