import { useState, useEffect } from 'react';
import api from '../api/axios';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(val);

export default function DailyTripReport() {
  const [trips, setTrips] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trips/report/daily')
      .then((res) => { setTrips(res.data); setFiltered(res.data); })
      .catch(() => setError('Failed to load report.'))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (e) => {
    const date = e.target.value;
    setFilterDate(date);
    setFiltered(!date ? trips : trips.filter((t) => (t.TripDate?.split('T')[0] || t.TripDate) === date));
  };

  const totalDistance = filtered.reduce((s, t) => s + Number(t.TripDistance), 0);
  const totalCost = filtered.reduce((s, t) => s + Number(t.TransportCost), 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Daily Trip Report</h1>
            <p className="text-slate-500 text-xs">Overview of all recorded trips by date</p>
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

      {/* Filter bar */}
      <div className="print:hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={handleFilter}
              className="border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => { setFilterDate(''); setFiltered(trips); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear filter
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Trips</p>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{filtered.length}</p>
          <p className="text-xs text-slate-400 mt-1">{filterDate ? `on ${filterDate}` : 'all time'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Distance</p>
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalDistance.toFixed(1)}</p>
          <p className="text-xs text-slate-400 mt-1">kilometres covered</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Revenue</p>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-slate-400 mt-1">transport earnings</p>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold">SwiftWheels Fleet Management System</h2>
        <p className="text-sm text-gray-600 mt-1">Daily Trip Report — Generated: {new Date().toLocaleDateString('en-RW', { dateStyle: 'full' })}</p>
        {filterDate && <p className="text-sm font-semibold mt-1">Filtered Date: {filterDate}</p>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-700">
              {filterDate ? `Trips on ${filterDate}` : 'All Trip Records'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} trip{filtered.length !== 1 ? 's' : ''} shown</p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{filtered.length}</span>
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
            <p className="text-slate-500 text-sm font-medium">No trips found</p>
            <p className="text-slate-400 text-xs mt-1">{filterDate ? 'No trips recorded on this date' : 'No trip data available'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plate Number</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance (km)</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Transport Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((t, i) => (
                  <tr key={t.TripID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{t.TripDate?.split('T')[0] || t.TripDate}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{t.VehicleName}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-800 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider">{t.PlateNumber}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-semibold text-slate-700">{Number(t.TripDistance).toFixed(1)}</span>
                      <span className="text-slate-400 text-xs ml-1">km</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-700">{formatCurrency(t.TransportCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800 text-white">
                  <td colSpan={4} className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Grand Total</td>
                  <td className="px-5 py-3.5 text-right font-bold">{totalDistance.toFixed(1)} km</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-300">{formatCurrency(totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
