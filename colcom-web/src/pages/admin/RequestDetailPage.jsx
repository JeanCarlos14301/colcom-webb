import { useEffect, useState } from 'react';
import { solicitudesApi } from '../../api/solicitudes.api.js';
import { ErrorState, LoadingState } from '../../components/common/AsyncState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { REQUEST_STATES } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatDate.js';
import { navigate } from '../../routes/navigation.js';
import { motion } from 'framer-motion';

export function RequestDetailPage({ id }) {
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({ estado: '', observaciones_admin: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    solicitudesApi.getById(id)
      .then((response) => {
        setItem(response.data);
        setForm({ estado: response.data.estado, observaciones_admin: response.data.observaciones_admin || '' });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (event) => {
    event.preventDefault();
    setStatus('');
    try {
      const response = await solicitudesApi.updateStatus(id, form);
      setItem(response.data);
      setStatus('Solicitud actualizada correctamente.');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-8"><LoadingState /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-semibold text-[#7A0A83] tracking-wide uppercase mb-1">Detalle de Solicitud</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{item?.nombre}</h1>
        </div>
        <button 
          className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          onClick={() => navigate('/admin/solicitudes')}
        >
          Volver
        </button>
      </div>

      <ErrorState message={error} />

      {item && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Información de Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Correo Electrónico</p>
                <p className="text-gray-900 font-semibold">{item.correo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Teléfono</p>
                <p className="text-gray-900 font-semibold">{item.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">País</p>
                <p className="text-gray-900 font-semibold">{item.paises?.nombre || 'General'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Finalidad</p>
                <p className="text-gray-900 font-semibold">{item.finalidad}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Fecha</p>
                <p className="text-gray-900 font-semibold">{formatDate(item.created_at)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-2">Mensaje</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800">
                {item.mensaje || <span className="text-gray-400 italic">Sin mensaje adjunto.</span>}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
          >
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Gestión</h3>
            
            <form onSubmit={save} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado Actual</label>
                <div className="mb-3"><StatusBadge value={item.estado} /></div>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all"
                  value={form.estado} 
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  {REQUEST_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notas Administrativas</label>
                <textarea 
                  rows="5" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all resize-y"
                  value={form.observaciones_admin} 
                  onChange={(e) => setForm({ ...form, observaciones_admin: e.target.value })} 
                  placeholder="Notas internas..."
                />
              </div>

              {status && (
                <div className={`p-3 rounded-lg text-sm font-medium ${status.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {status}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3 bg-[#7A0A83] text-white font-bold rounded-xl shadow-lg shadow-[#7A0A83]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Guardar Cambios
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default RequestDetailPage;
