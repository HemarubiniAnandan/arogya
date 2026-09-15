import React, { useState, useEffect } from 'react';
import { Pill, Search, MapPin, Phone, CheckCircle2, Clock, Building2, AlertCircle } from 'lucide-react';
import { eaushadhiService } from '../services/mockAdapters';

export const MedicineSearchModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedicines = async (query: string) => {
    setLoading(true);
    const data = await eaushadhiService.searchMedicineStock(query, 'Pune');
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMedicines('');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines(searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">e-Aushadhi Rural Medicine Inventory Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock visibility across Primary Health Centres, Rural Hospitals, and Jan Aushadhi Kendras.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by brand or generic name (e.g., Paracetamol, Amoxicillin)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 bg-slate-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shrink-0 transition"
          >
            Search Stock
          </button>
        </form>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-sm">
            Querying Maharashtra Drug Warehouses & Sub-centres...
          </div>
        ) : results.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No stock records found for "{searchQuery}"</div>
            <div className="text-xs text-slate-500 mt-1">Try searching for common generics like Paracetamol, Metformin, or IFA.</div>
          </div>
        ) : (
          results.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{item.brandName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide shrink-0">
                    In Stock ({item.stock} units)
                  </span>
                </div>

                <div className="text-xs text-emerald-800 font-semibold mb-2">
                  Generic: {item.genericName} • <span className="text-slate-500 font-normal">{item.category}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.facilityName}</span>
                    <span className="text-[10px] text-slate-500">({item.facilityType})</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.distanceKm} km from your village
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                <a
                  href={`tel:${item.phone}`}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {item.phone}
                </a>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Free via Govt Scheme
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
