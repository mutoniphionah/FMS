import { useState, useEffect } from 'react';
import api from '../api/axios';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const CATEGORIES = ['Bus', 'Truck', 'Van', 'Pickup', 'Sedan', 'SUV', 'Minibus'];

const FUEL_COLORS = {
  Petrol:   'bg-orange-100 text-orange-700',
  Diesel:   'bg-yellow-100 text-yellow-700',
  Electric: 'bg-green-100 text-green-700',
  Hybrid:   'bg-teal-100 text-teal-700',
  CNG:      'bg-sky-100 text-sky-700',
};

const emptyForm = { VehicleName: '', PlateNumber: '', Category: '', FuelType: '', Capacity: '' };

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

export default function Vehicles() {
  const [vehicles, setVehicles]   = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [message, setMessage]     = useState({ type: '', text: '' });

  const fetchVehicles = async () => {
    setFetching(true);
    try { const r = await api.get('/vehicles'); setVehicles(r.data); }
    catch { showMsg('error', 'Failed to load vehicles.'); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) { await api.put(`/vehicles/${editId}`, form); showMsg('success', 'Vehicle updated.'); }
      else        { await api.post('/vehicles', form);          showMsg('success', 'Vehicle added.');   }
      setForm(emptyForm); setEditId(null); fetchVehicles();
    } catch (err) { showMsg('error', err.response?.data?.message || 'Operation failed.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (v) => {
    setForm({ VehicleName: v.VehicleName, PlateNumber: v.PlateNumber, Category: v.Category, FuelType: v.FuelType, Capacity: v.Capacity });
    setEditId(v.VehicleID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle? All related trips and maintenance records will also be removed.')) return;
    try { await api.delete(`/vehicles/${id}`); showMsg('success', 'Vehicle deleted.'); fetchVehicles(); }
    catch (err) { showMsg('error', err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div>
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM3 9l1.5-5h15L21 9M3 9h18M3 9l-1 5h20l-1-5"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Vehicle Management</h1>
          <p className="text-slate-500 text-xs">Register and manage fleet vehicles</p>
        </div>
      </div>

      <Alert type={message.type} text={message.text} />

      {/* ── Form card ── */}
      <div className="page-card mb-6">
        {/* Card header */}
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 ${editId ? 'bg-amber-50' : 'bg-blue-50'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${editId ? 'bg-amber-500' : 'bg-blue-600'}`}>
            {editId
              ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              : <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            }
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</p>
            <p className="text-xs text-slate-500">{editId ? 'Update vehicle information below' : 'Fill in the details to register a new vehicle'}</p>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Vehicle Name</label>
            <input type="text" name="VehicleName" value={form.VehicleName} onChange={handleChange} required placeholder="e.g. Toyota Coaster" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Plate Number</label>
            <input type="text" name="PlateNumber" value={form.PlateNumber} onChange={handleChange} required placeholder="e.g. RAB 123A" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Category</label>
            <select name="Category" value={form.Category} onChange={handleChange} required className="input-field select-field">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fuel Type</label>
            <select name="FuelType" value={form.FuelType} onChange={handleChange} required className="input-field select-field">
              <option value="">Select fuel type</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Capacity (seats)</label>
            <input type="number" name="Capacity" value={form.Capacity} onChange={handleChange} required min="1" placeholder="e.g. 30" className="input-field" />
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" disabled={loading}
              className={`btn-primary flex-1 ${editId ? '!bg-amber-500 hover:!bg-amber-600 !shadow-amber-200' : ''}`}>
              {loading
                ? <><span className="spinner !w-4 !h-4 !border-white/30 !border-t-white"></span> Saving...</>
                : editId ? 'Update Vehicle' : 'Add Vehicle'
              }
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }} className="btn-secondary flex-1">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table card ── */}
      <div className="page-card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">Registered Vehicles</p>
            <p className="text-xs text-slate-400 mt-0.5">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in fleet</p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{vehicles.length}</span>
        </div>

        {fetching ? (
          <div className="empty-state gap-3 text-slate-400">
            <div className="spinner"></div>
            <span className="text-sm">Loading vehicles…</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM3 9l1.5-5h15L21 9M3 9h18M3 9l-1 5h20l-1-5"/>
              </svg>
            </div>
            <p className="text-slate-600 text-sm font-semibold">No vehicles registered yet</p>
            <p className="text-slate-400 text-xs mt-1">Add your first vehicle using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">Vehicle Name</th>
                  <th className="th">Plate Number</th>
                  <th className="th">Category</th>
                  <th className="th">Fuel Type</th>
                  <th className="th">Capacity</th>
                  <th className="th text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, i) => (
                  <tr key={v.VehicleID} className="hover:bg-slate-50">
                    <td className="td text-slate-400 text-xs">{i + 1}</td>
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM3 9l1.5-5h15L21 9M3 9h18M3 9l-1 5h20l-1-5"/>
                          </svg>
                        </div>
                        <span className="font-semibold text-slate-800">{v.VehicleName}</span>
                      </div>
                    </td>
                    <td className="td"><span className="badge-plate">{v.PlateNumber}</span></td>
                    <td className="td"><span className="badge bg-purple-100 text-purple-700">{v.Category}</span></td>
                    <td className="td"><span className={`badge ${FUEL_COLORS[v.FuelType] || 'bg-slate-100 text-slate-600'}`}>{v.FuelType}</span></td>
                    <td className="td text-slate-700 font-medium">{v.Capacity} <span className="text-slate-400 text-xs">seats</span></td>
                    <td className="td">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(v)} className="btn-action btn-edit">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(v.VehicleID)} className="btn-action btn-delete">
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
