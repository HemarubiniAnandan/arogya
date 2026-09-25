import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Building2,
  Shield,
  Pill,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { storageService } from '../services/storageService';
import { AuditLogViewer } from './AuditLogViewer';
import { HospitalFacility, LanguageCode } from '../types';

interface AdminPortalProps {
  language: LanguageCode;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ language }) => {
  const [stats, setStats] = useState(storageService.getAdminStats());
  const [hospitals, setHospitals] = useState<HospitalFacility[]>(storageService.getHospitals());
  const [activeTab, setActiveTab] = useState<'analytics' | 'referrals' | 'inventory' | 'audit'>('analytics');

  useEffect(() => {
    const update = () => {
      setStats(storageService.getAdminStats());
      setHospitals(storageService.getHospitals());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  // Disease Trend Data
  const diseaseTrends = [
    { month: 'May', respiratory: 42, fever: 35, hypertension: 58, maternal: 24 },
    { month: 'Jun', respiratory: 48, fever: 45, hypertension: 60, maternal: 26 },
    { month: 'Jul', respiratory: 65, fever: 78, hypertension: 62, maternal: 28 },
    { month: 'Aug', respiratory: 80, fever: 95, hypertension: 64, maternal: 31 },
    { month: 'Sep', respiratory: 94, fever: 88, hypertension: 67, maternal: 34 }
  ];

  // Appointment Status distribution
  const appointmentBreakdown = [
    { name: 'Completed', value: stats.completedAppointments, color: '#059669' },
    { name: 'Arrived / Active', value: stats.totalAppointments - stats.completedAppointments - 1, color: '#2563eb' },
    { name: 'Requested', value: 3, color: '#d97706' },
    { name: 'Cancelled', value: 1, color: '#e11d48' }
  ];

  // Facility Bed Utilization
  const facilityUtilization = hospitals.map(h => ({
    name: h.name.split(' ')[0] + ' ' + (h.name.split(' ')[1] || ''),
    occupancyRate: Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100),
    availableBeds: h.availableBeds,
    totalBeds: h.totalBeds,
    icuBeds: h.icuBedsAvailable
  }));

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#07172F] to-[#0F3460] text-white p-5 border-b border-amber-500/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-xl bg-amber-500 text-[#07172F] flex items-center justify-center font-bold text-xl shadow-md border-2 border-amber-300 shrink-0">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-serif">State Health Directorate Dashboard</h2>
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-900 text-amber-300 border border-amber-400/40">
                  Pune Rural Health Mission
                </span>
              </div>
              <div className="text-xs text-slate-200 mt-1 flex flex-wrap gap-2 font-medium">
                <span>District Health Office (DHO) • 26 PHCs • 4 Rural Hospitals • 1 District Hospital</span>
              </div>
            </div>
          </div>

          {/* Tab Controls */}
          <div className="flex bg-[#07172F] p-1 rounded-lg border border-blue-400/40 text-xs font-bold">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded transition ${
                activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Clinical KPIs
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-3.5 py-1.5 rounded transition ${
                activeTab === 'referrals' ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Continuity Referrals
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded transition ${
                activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Drug Supply Grid
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded transition ${
                activeTab === 'audit' ? 'bg-blue-600 text-white shadow-xs border-b-2 border-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Security & Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS (SECTION 32) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>Total OPD Visits</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalAppointments}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +14% vs last week
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>ASHA Assisted</span>
            <Shield className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.ashaAssistedCount}</div>
          <div className="text-[11px] text-pink-700 font-semibold mt-1">
            {Math.round((stats.ashaAssistedCount / (stats.totalAppointments || 1)) * 100)}% rural penetration
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>eSanjeevani Teleconsults</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.eConsultationsCount}</div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">Zero-travel care</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>Clinical Referrals</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.totalReferrals}</div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-1">
            {stats.completedReferrals} closed loops
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>High-Risk Patients</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">{stats.highRiskCount}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">Actively tracked by ASHA</div>
        </div>
      </div>

      {/* TAB 1: CLINICAL KPIS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Disease Epidemiology Trends */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Monsoon Disease Surveillance Trends</h3>
                  <p className="text-xs text-slate-500">Syndromic surveillance across PHC outpatient departments</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Respiratory</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Fever/Malaria</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hypertension</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={diseaseTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="respiratory" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="fever" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="hypertension" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: OPD Status Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Appointment Funnel</h3>
                <p className="text-xs text-slate-500">Live operational status</p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentBreakdown}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {appointmentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {appointmentBreakdown.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate">{item.name}:</span>
                    <strong className="text-slate-900">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Facility Utilization Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Facility Bed Availability & Capacity Grid</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hospitals.map(h => (
                <div key={h.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                      <div className="text-xs text-slate-500">{h.type} • {h.taluka}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {h.emergencyStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bed Occupancy:</span>
                      <strong className="text-slate-800">
                        {h.totalBeds - h.availableBeds} / {h.totalBeds} ({Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100)}%)
                      </strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200 text-slate-600">
                    <div>ICU Beds Free: <strong>{h.icuBedsAvailable}</strong></div>
                    <div>Oxygen Plant: <strong>Operational</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTINUITY REFERRALS MONITOR */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inter-Facility Referral Continuity Grid (Section 29)</h3>
              <p className="text-xs text-slate-500">Tracking patients moving from PHC up to District Hospitals</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">Real-time Escalation Monitor</span>
          </div>

          <div className="space-y-3">
            {storageService.getReferrals().map(ref => (
              <div key={ref.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ref.patientName}</span>
                    <span className="font-mono text-slate-500">({ref.id})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ref.urgency === 'EMERGENCY'
                        ? 'bg-rose-100 text-rose-800'
                        : ref.urgency === 'URGENT'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ref.urgency}
                    </span>
                  </div>

                  <div className="text-slate-600 mt-1">
                    Route: <strong>{ref.sourceHospitalName}</strong> → <strong>{ref.targetHospitalName}</strong> ({ref.specialtyRequired})
                  </div>

                  <div className="text-slate-500 mt-0.5">
                    Summary: "{ref.clinicalSummary}"
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                    {ref.status}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{ref.createdDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY ALERTS */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">e-Aushadhi Rural Stock Distribution</h3>
              <p className="text-xs text-slate-500">Critical drug levels at peripheral primary health centres</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              Live Warehouse Sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Paracetamol 500mg (Tablets)</span>
                <span className="text-emerald-700 font-bold">1,850 in Stock</span>
              </div>
              <div className="text-slate-500">PHC Morgaon Central Drug Room • Sufficient for 32 days</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Iron & Folic Acid (IFA) Tablets</span>
                <span className="text-emerald-700 font-bold">2,400 in Stock</span>
              </div>
              <div className="text-slate-500">Reserved for Maternal Health & Adolescent Anemia programs</div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-900">Anti-Snake Venom (ASV) Vials</span>
                <span className="text-amber-800 font-bold">14 Vials (Re-order Recommended)</span>
              </div>
              <div className="text-amber-700">Rural Hospital Baramati Cold Chain Unit</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Salbutamol 100mcg Inhalers</span>
                <span className="text-emerald-700 font-bold">64 Units in Stock</span>
              </div>
              <div className="text-slate-500">Sub-Centre Morgaon Emergency Chest Box</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG VIEWER (SECTION 33) */}
      {activeTab === 'audit' && (
        <AuditLogViewer />
      )}
    </div>
  );
};
