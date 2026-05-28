import { useState, useEffect } from 'react';
import api from '../api/axios';

const MAINTENANCE_TYPES = [
  'Oil Change','Tire Replacement','Brake Service','Engine Repair',
  'Transmission Service','Battery Replacement','Air Filter',
  'Coolant Flush','Wheel Alignment','General Service',
];

const TYPE_COLORS = {
  'Oil Change':           'bg-yellow-100 text-yellow-700',
  'Tire Replacement':     'bg-slate-100 text-slate-700',
  'Brake Service':        'bg-red-100 text-red-700',
  'Engine Repair':        'bg-orange-100 text-orange-700',
  'Transmission Service': 'bg-purple-100 text-purple-700',
  'Battery Replacement':  'bg-blue-100 text-blue-700',
  'Air Filter':           'bg-sky-100 text-sky-700',
  'Coolant Flush':        'bg-cyan-100 text-cyan-700',
  'Wheel Alignment':      'bg-indigo-100 text-indigo-700',
  'General Service':      'bg-green-100 text-green-700',
};

const emptyForm = { VehicleID: '', MaintenanceType: '', MaintenanceCost: '', MaintenanceDate: '' };

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

export default function Maintenance() {
  const [records, setRecords]   = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage]   = useState({ type: '', text: '' });

  const fetchData = async () => {
    setFetching(true);
    try {
      const [mr, vr] = await Promise.all([api.get('/maintenance'), api.get('/vehicles')]);
      setRecords(mr.data); setVehicles(vr.data);
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
      if (editId) { await api.put(`/maintenance/${editId}`, form); showMsg('success', 'Record updated.'); }
      else        { await api.post('/maintenance', form);          showMsg('success', 'Record added.');   }
      setForm(emptyForm); setEditId(null); fetchData();
    } catch (err) { showMsg('error', err.response?.data?.message || 'Operation failed.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (r) => {
    setForm({ VehicleID: r.VehicleID, MaintenanceType: r.MaintenanceType, MaintenanceCost: r.MaintenanceCost, MaintenanceDate: r.MaintenanceDate?.split('T')[0] || r.MaintenanceDate });
    setEditId(r.MaintenanceID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance record?')) return;
    try { await api.delete(`/maintenance/${id}`); showMsg('success', 'Record deleted.'); fetchData(); }
    catch (err) { showMsg('error', err.response?.data?.message || 'Delete failed.'); }
  };

  const totalCost = records.reduce((s, r) => s + Number(r.MaintenanceCost), 0);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Maintenance Management</h1>
          <p className="text-slate-500 text-xs">Track vehicle maintenance and service records</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Records</p>
            <p className="text-2xl font-bold text-slate-800">{records.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Maintenance Cost</p>
            <p className="text-xl font-bold text-red-600">{fmt(totalCost)}</p>
          </div>
        </div>
      </div>

      <Alert type={message.type} text={message.text} />

      {/* ── Form card ── */}
      <div className="page-card mb-6">
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 ${editId ? 'bg-amber-50' : 'bg-orange-50'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${editId ? 'bg-amber-500' : 'bg-orange-500'}`}>
            {editId
              ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              : <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            }
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">{editId ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</p>
            <p className="text-xs text-slate-500">{editId ? 'Update the maintenance details below' : 'Log a new maintenance or service event'}</p>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Maintenance Type</label>
            <select name="MaintenanceType" value={form.MaintenanceType} onChange={handleChange} required className="input-field select-field">
              <option value="">Select type</option>
              {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Cost (RWF)</label>
            <input type="number" name="MaintenanceCost" value={form.MaintenanceCost} onChange={handleChange} required min="0" step="100" placeholder="e.g. 25000" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Maintenance Date</label>
            <input type="date" name="MaintenanceDate" value={form.MaintenanceDate} onChange={handleChange} required className="input-field" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
            <button type="submit" disabled={loading}
              className={`btn-primary ${editId ? '!bg-amber-500 hover:!bg-amber-600 !shadow-amber-200' : '!bg-orange-500 hover:!bg-orange-600 !shadow-orange-200'}`}>
              {loading ? <><span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span> Saving…</> : editId ? 'Update Record' : 'Add Record'}
            </button>
            {editId && <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }} className="btn-secondary">Cancel</button>}
          </div>
        </form>
      </div>

      {/* ── Table card ── */}
      <div className="page-card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">Maintenance Records</p>
            <p className="text-xs text-slate-400 mt-0.5">{records.length} record{records.length !== 1 ? 's' : ''} logged</p>
          </div>
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">{records.length}</span>
        </div>

        {fetching ? (
          <div className="empty-state gap-3 text-slate-400"><div className="spinner"></div><span className="text-sm">Loading records…</span></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
            </div>
            <p className="text-slate-600 text-sm font-semibold">No maintenance records yet</p>
            <p className="text-slate-400 text-xs mt-1">Log your first maintenance event above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">Vehicle</th>
                  <th className="th">Plate</th>
                  <th className="th">Maintenance Type</th>
                  <th className="th text-right">Cost</th>
                  <th className="th">Date</th>
                  <th className="th text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.MaintenanceID} className="hover:bg-slate-50">
                    <td className="td text-slate-400 text-xs">{i + 1}</td>
                    <td className="td font-semibold text-slate-800">{r.VehicleName}</td>
                    <td className="td"><span className="badge-plate">{r.PlateNumber}</span></td>
                    <td className="td"><span className={`badge ${TYPE_COLORS[r.MaintenanceType] || 'bg-slate-100 text-slate-600'}`}>{r.MaintenanceType}</span></td>
                    <td className="td text-right font-semibold text-red-600">{fmt(r.MaintenanceCost)}</td>
                    <td className="td"><span className="badge bg-slate-100 text-slate-600">{r.MaintenanceDate?.split('T')[0] || r.MaintenanceDate}</span></td>
                    <td className="td">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(r)} className="btn-action btn-edit">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(r.MaintenanceID)} className="btn-action btn-delete">
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
