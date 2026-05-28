import { useState, useEffect } from 'react';
import api from '../api/axios';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(val);

export default function MaintenanceStatusReport() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/maintenance/report/status')
      .then((res) => setRecords(res.data))
      .catch(() => setError('Failed to load maintenance report.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) =>
    r.VehicleName?.toLowerCase().includes(search.toLowerCase()) ||
    r.MaintenanceType?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = filtered.reduce((s, r) => s + Number(r.MaintenanceCost), 0);
  const totalDistance = filtered.reduce((s, r) => s + Number(r.TotalTripDistance), 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Maintenance Status Report</h1>
            <p className="text-slate-500 text-xs">Vehicle name, trip distance, maintenance cost and date</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Search bar */}
      <div className="print:hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle or maintenance type..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Records</p>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{filtered.length}</p>
          <p className="text-xs text-slate-400 mt-1">maintenance events</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Trip Distance</p>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalDistance.toFixed(1)}</p>
          <p className="text-xs text-slate-400 mt-1">kilometres driven</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Maintenance Cost</p>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-slate-400 mt-1">total spent on maintenance</p>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold">SwiftWheels Fleet Management System</h2>
        <p className="text-sm text-gray-600 mt-1">Maintenance Status Report — Generated: {new Date().toLocaleDateString('en-RW', { dateStyle: 'full' })}</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-700">Maintenance Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</p>
          </div>
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">{filtered.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading report...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm font-medium">No records found</p>
            <p className="text-slate-400 text-xs mt-1">{search ? 'Try a different search term' : 'No maintenance data available'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plate Number</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Type</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Trip Distance (km)</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Cost</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r, i) => (
                  <tr key={r.MaintenanceID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{r.VehicleName}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-800 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider">{r.PlateNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-medium">{r.MaintenanceType}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold text-slate-700">{Number(r.TotalTripDistance).toFixed(1)}</span>
                      <span className="text-slate-400 text-xs ml-1">km</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-600">{formatCurrency(r.MaintenanceCost)}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">{r.MaintenanceDate?.split('T')[0] || r.MaintenanceDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800 text-white">
                  <td colSpan={4} className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Grand Total</td>
                  <td className="px-5 py-3.5 text-right font-bold">{totalDistance.toFixed(1)} km</td>
                  <td className="px-5 py-3.5 text-right font-bold text-red-300">{formatCurrency(totalCost)}</td>
                  <td className="px-5 py-3.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
