import { useEffect, useState } from 'react';
import { solicitudesApi } from '../../api/solicitudes.api.js';
import { paisesApi } from '../../api/paises.api.js';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/AsyncState.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ConfirmButton } from '../../components/common/ConfirmButton.jsx';
import { REQUEST_STATES } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatDate.js';
import { useAuth } from '../../hooks/useAuth.js';
import { navigate } from '../../routes/navigation.js';
import { motion } from 'framer-motion';
import { useCountry } from '../../hooks/useCountry.js';

export function RequestsPage() {
  const { user } = useAuth();
  const { activeCountry } = useCountry();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ estado: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const query = { ...filters };
    if (activeCountry?.id) query.pais_id = activeCountry.id;

    solicitudesApi.getAll(query)
      .then((response) => setItems(response.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filters.estado, activeCountry?.id]);



  const remove = async (id) => {
    await solicitudesApi.remove(id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-semibold text-[#7A0A83] tracking-wide uppercase mb-1">Contacto</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Solicitudes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83] focus:border-transparent outline-none shadow-sm transition-all"
            value={filters.estado} 
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            {REQUEST_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
      </div>
      
      <ErrorState message={error} />
      
      {loading ? <LoadingState /> : items.length === 0 ? <EmptyState /> : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 font-semibold">
                  <th className="py-4 px-6 whitespace-nowrap">Nombre</th>
                  <th className="py-4 px-6 whitespace-nowrap">Correo</th>
                  <th className="py-4 px-6 whitespace-nowrap">Finalidad</th>
                  <th className="py-4 px-6 whitespace-nowrap">País</th>
                  <th className="py-4 px-6 whitespace-nowrap">Estado</th>
                  <th className="py-4 px-6 whitespace-nowrap">Fecha</th>
                  <th className="py-4 px-6 whitespace-nowrap text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900 group-hover:text-[#7A0A83] transition-colors">{item.nombre}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{item.correo}</td>
                    <td className="py-4 px-6 text-gray-600 max-w-[200px] truncate" title={item.finalidad}>{item.finalidad}</td>
                    <td className="py-4 px-6 text-gray-600">{item.paises?.nombre || 'General'}</td>
                    <td className="py-4 px-6"><StatusBadge value={item.estado} /></td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{formatDate(item.created_at)}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        className="px-3 py-1.5 text-sm font-medium text-[#7A0A83] bg-[#7A0A83]/10 hover:bg-[#7A0A83]/20 rounded-lg transition-colors"
                        onClick={() => navigate(`/admin/solicitudes/${item.id}`)}
                      >
                        Ver
                      </button>
                      <ConfirmButton 
                        message="¿Eliminar solicitud?" 
                        onConfirm={() => remove(item.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Eliminar
                      </ConfirmButton>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
