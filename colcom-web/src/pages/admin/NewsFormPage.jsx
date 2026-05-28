import { useEffect, useMemo, useState } from 'react';
import { noticiasApi } from '../../api/noticias.api.js';
import { archivosApi } from '../../api/archivos.api.js';
import { paisesApi } from '../../api/paises.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { CONTENT_STATES } from '../../utils/constants.js';
import { slugify } from '../../utils/slugify.js';
import { navigate } from '../../routes/navigation.js';
import { ErrorState, LoadingState } from '../../components/common/AsyncState.jsx';
import { motion } from 'framer-motion';

const initial = {
  pais_id: '',
  titulo: '',
  slug: '',
  resumen: '',
  contenido: '',
  imagen_principal_url: '',
  estado: 'borrador',
};

export function NewsFormPage({ id }) {
  const editing = Boolean(id);
  const { user } = useAuth();
  const [form, setForm] = useState(initial);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const userCountryId = useMemo(() => user?.pais_id || user?.pais?.id || '', [user]);

  useEffect(() => {
    if (user?.rol === 'superadmin') {
      paisesApi.all().then((data) => setCountries(Array.isArray(data) ? data : [])).catch(() => setCountries([]));
    } else if (userCountryId) {
      setForm((current) => ({ ...current, pais_id: userCountryId }));
    }
  }, [user?.rol, userCountryId]);

  useEffect(() => {
    if (!editing) return;
    noticiasApi.getById(id)
      .then((response) => {
        const item = response.data;
        setForm({
          pais_id: item.pais_id || item.paises?.id || '',
          titulo: item.titulo || '',
          slug: item.slug || '',
          resumen: item.resumen || '',
          contenido: item.contenido || '',
          imagen_principal_url: item.imagen_principal_url || '',
          estado: item.estado || 'borrador',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'titulo' && !editing && !current.slug ? { slug: slugify(value) } : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const finalPaisId = form.pais_id || userCountryId;
    const payload = {
      titulo: form.titulo,
      estado: form.estado,
      slug: form.slug || slugify(form.titulo),
    };
    if (form.resumen) payload.resumen = form.resumen;
    if (form.contenido) payload.contenido = form.contenido;
    if (finalPaisId) payload.pais_id = finalPaisId;
    try {
      let currentId = id;
      if (editing) {
        await noticiasApi.update(id, payload);
      } else {
        const res = await noticiasApi.create(payload);
        currentId = res.data?.id;
      }
      
      if (imageFile && currentId) {
        await archivosApi.upload(imageFile, 'noticias', currentId);
      }
      
      navigate('/admin/noticias');
    } catch (err) {
      const msgs = err.errors ? err.errors.join(', ') : err.message;
      setError(msgs || 'Error al guardar la noticia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-8"><LoadingState /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-sm font-semibold text-[#7A0A83] tracking-wide uppercase mb-1">Noticias</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{editing ? 'Editar Noticia' : 'Nueva Noticia'}</h1>
        </div>
        <button 
          className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          onClick={() => navigate('/admin/noticias')}
        >
          Volver
        </button>
      </div>

      <ErrorState message={error} />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
      >
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user?.rol === 'superadmin' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">País <span className="text-red-500">*</span></label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all"
                  value={form.pais_id} 
                  onChange={(e) => update('pais_id', e.target.value)} 
                  required
                >
                  <option value="">Seleccionar</option>
                  {countries.map((country) => <option key={country.id} value={country.id}>{country.nombre}</option>)}
                </select>
              </div>
            ) : <input type="hidden" value={form.pais_id} />}
            
            <div className={user?.rol !== 'superadmin' ? "md:col-span-2" : ""}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all"
                value={form.estado} 
                onChange={(e) => update('estado', e.target.value)}
              >
                {CONTENT_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Título <span className="text-red-500">*</span></label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all"
                value={form.titulo} 
                onChange={(e) => update('titulo', e.target.value)} 
                required 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 text-gray-500 font-mono text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all"
                value={form.slug} 
                onChange={(e) => update('slug', e.target.value)} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resumen <span className="text-red-500">*</span></label>
              <textarea 
                rows="3" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all resize-y"
                value={form.resumen} 
                onChange={(e) => update('resumen', e.target.value)} 
                required 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contenido <span className="text-red-500">*</span></label>
              <textarea 
                rows="10" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all resize-y"
                value={form.contenido} 
                onChange={(e) => update('contenido', e.target.value)} 
                required 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen Principal</label>
              {form.imagen_principal_url && !imageFile && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Imagen actual:</p>
                  <img src={form.imagen_principal_url} alt="Actual" className="h-32 object-contain rounded-lg border border-gray-200" />
                </div>
              )}
              <input 
                type="file"
                accept="image/*"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#7A0A83]/50 focus:border-[#7A0A83] outline-none transition-all"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
              />
              <p className="text-xs text-gray-500 mt-2">Selecciona una nueva imagen para reemplazar la actual. Formatos soportados: JPG, PNG, GIF, WebP.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              className={`px-8 py-3 bg-[#7A0A83] text-white font-bold rounded-xl shadow-lg shadow-[#7A0A83]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Guardando...
                </>
              ) : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
