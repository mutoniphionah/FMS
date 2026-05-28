import { useState, useEffect } from 'react';
import api from '../api/axios';

const emptyForm = { VehicleID: '', TripDistance: '', TransportCost: '', TripDate: '' };

const fmt = (val) =>
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(val);

function Alert({ type, text }) {
  if (!text) return null;
  return (
    <div className={`alert ${type === 'success' ? 'alert-success' : 'alert-error'}`}>
      {type === 'success'
        ? <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
        : <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
      }
      {text}
    </div>
  );
}

export default function Trips() {
  const [trips, setTrips]       = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage]   = useState({ type: '', text: '' });

  const fetchData = async () => {
    setFetching(true);
    try {
      const [tr, vr] = await Promise.all([api.get('/trips'), api.get('/vehicles')]);
      setTrips(tr.data); setVehicles(vr.data);
    } catch { showMsg('error', 'Failed to load data.'); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editId) { await api.put(`/trips/${editId}`, form); showMsg('success', 'Trip updated.'); }
      else        { await api.post('/trips', form);          showMsg('success', 'Trip recorded.'); }
      setForm(emptyForm); setEditId(null); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'Operation failed.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (t) => {
    setForm({ VehicleID: t.VehicleID, TripDistance: t.TripDistance, TransportCost: t.TransportCost, TripDate: t.TripDate?.split('T')[0] || t.TripDate });
    setEditId(t.TripID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip record?')) return;
    try { await api.delete(`/trips/${id}`); showMsg('success', 'Trip deleted.'); fetchData(); }
    catch (err) { showMsg('error', err.response?.data?.message || 'Delete failed.'); }
  };

  const totalDist = trips.reduce((s, t) => s + Number(t.TripDistance), 0);
  const totalCost = trips.reduce((s, t) => s + Number(t.TransportCost), 0);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Trip Management</h1>
          <p className="text-slate-500 text-xs">Record and track all vehicle trips</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Trips</p>
            <p className="text-2xl font-bold text-slate-800">{trips.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Distance</p>
            <p className="text-2xl font-bold text-slate-800">{totalDist.toFixed(1)} <span className="text-sm font-normal text-slate-400">km</span></p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Revenue</p>
            <p className="text-xl font-bold text-emerald-700">{fmt(totalCost)}</p>
          </div>
        </div>
      </div>

      <Alert type={message.type} text={message.text} />

      {/* ── Form card ── */}
      <div className="page-card mb-6">
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 ${editId ? 'bg-amber-50' : 'bg-indigo-50'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${editId ? 'bg-amber-500' : 'bg-indigo-600'}`}>
            {editId
              ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              : <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            }
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">{editId ? 'Edit Trip' : 'Record New Trip'}</p>
            <p className="text-xs text-slate-500">{editId ? 'Update trip details below' : 'Enter trip information to record it'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Vehicle</label>
            <select name="VehicleID" value={form.VehicleID} onChange={handleChange} required className="input-field select-field">
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.VehicleID} value={v.VehicleID}>{v.VehicleName} — {v.PlateNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Distance (km)</label>
            <input type="number" name="TripDistance" value={form.TripDistance} onChange={handleChange} required min="0.1" step="0.1" placeholder="e.g. 150.5" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Transport Cost (RWF)</label>
            <input type="number" name="TransportCost" value={form.TransportCost} onChange={handleChange} required min="0" step="100" placeholder="e.g. 50000" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Trip Date</label>
            <input type="date" name="TripDate" value={form.TripDate} onChange={handleChange} required className="input-field" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
            <button type="submit" disabled={loading}
              className={`btn-primary ${editId ? '!bg-amber-500 hover:!bg-amber-600 !shadow-amber-200' : '!bg-indigo-600 hover:!bg-indigo-700 !shadow-indigo-200'}`}>
              {loading ? <><span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span> Saving…</> : editId ? 'Update Trip' : 'Record Trip'}
            </button>
            {editId && <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }} className="btn-secondary">Cancel</button>}
          </div>
        </form>
      </div>

      {/* ── Table card ── */}
      <div className="page-card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">Trip Records</p>
            <p className="text-xs text-slate-400 mt-0.5">{trips.length} trip{trips.length !== 1 ? 's' : ''} recorded</p>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{trips.length}</span>
        </div>

        {fetching ? (
          <div className="empty-state gap-3 text-slate-400"><div className="spinner"></div><span className="text-sm">Loading trips…</span></div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
            </div>
            <p className="text-slate-600 text-sm font-semibold">No trips recorded yet</p>
            <p className="text-slate-400 text-xs mt-1">Record your first trip using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">Vehicle</th>
                  <th className="th">Plate</th>
                  <th className="th text-right">Distance (km)</th>
                  <th className="th text-right">Transport Cost</th>
                  <th className="th">Trip Date</th>
                  <th className="th text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t, i) => (
                  <tr key={t.TripID} className="hover:bg-slate-50">
                    <td className="td text-slate-400 text-xs">{i + 1}</td>
                    <td className="td font-semibold text-slate-800">{t.VehicleName}</td>
                    <td className="td"><span className="badge-plate">{t.PlateNumber}</span></td>
                    <td className="td text-right font-semibold text-slate-700">{Number(t.TripDistance).toFixed(1)} <span className="text-slate-400 text-xs font-normal">km</span></td>
                    <td className="td text-right font-semibold text-emerald-700">{fmt(t.TransportCost)}</td>
                    <td className="td"><span className="badge bg-slate-100 text-slate-600">{t.TripDate?.split('T')[0] || t.TripDate}</span></td>
                    <td className="td">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(t)} className="btn-action btn-edit">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(t.TripID)} className="btn-action btn-delete">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
