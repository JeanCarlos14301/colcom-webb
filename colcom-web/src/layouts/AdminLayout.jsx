import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { canManageCountries, canManageRequests } from '../utils/constants.js';
import { navigate } from '../routes/navigation.js';
import { useCountry } from '../hooks/useCountry.js';
import latLogo from '../assets/imgs/latComparte.png';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../api/auth.api.js';

export function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { activeCountry, countries, setCountryBySlug } = useCountry();
  const [needsSecuritySetup, setNeedsSecuritySetup] = useState(false);
  const [isSyncingLogo, setIsSyncingLogo] = useState(true);

  useEffect(() => {
    // Only check if we are not already on the security page
    if (window.location.pathname !== '/admin/seguridad') {
      authApi.getSecurityQuestionMe()
        .then(res => {
          if (!res.data?.pregunta_seguridad) {
            setNeedsSecuritySetup(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Enforce user country if not superadmin
  useEffect(() => {
    if (user?.rol && user.rol !== 'superadmin' && user.pais_id) {
      // If we already know the user's slug from login, and it matches, we are done syncing!
      if (user.pais_slug && activeCountry?.slug === user.pais_slug) {
        setIsSyncingLogo(false);
        return;
      }
      if (countries.length > 0) {
        const userCountry = countries.find(c => c.id === user.pais_id);
        if (userCountry && activeCountry?.slug !== userCountry.slug) {
          setCountryBySlug(userCountry.slug);
        } else {
          setIsSyncingLogo(false); // Sync finished
        }
      }
    } else {
      setIsSyncingLogo(false); // Superadmin doesn't need to sync
    }
  }, [user, countries, activeCountry?.slug, setCountryBySlug]);

  const navItems = [
    ['Dashboard', '/admin/dashboard', true, (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )],
    ['News', '/admin/noticias', true, (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
      </svg>
    )],
    ['Testimonials', '/admin/testimonios', true, (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )],
    ['Requests', '/admin/solicitudes', canManageRequests(user?.rol), (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )],
    ['Files', '/admin/archivos', true, (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )],
    ['Users', '/admin/usuarios', canManageCountries(user?.rol), (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )],
    ['Auditoría', '/admin/auditoria', canManageRequests(user?.rol), (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    )],
    ['Seguridad', '/admin/seguridad', true, (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )],
  ].filter((item) => item[2]);

  const currentPath = window.location.pathname;

  return (
    <div className="flex h-screen bg-[#F8F9FE] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a0525] border-r border-[#3a1555] flex flex-col pt-6 flex-shrink-0 z-20">
        <div className="px-6 mb-10 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
          <div className="bg-white/95 p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow min-h-[60px] flex items-center justify-center">
            {isSyncingLogo ? (
              <div className="w-full h-8 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : (
              <img src={activeCountry?.logoSrc || latLogo} alt="Logo" className="w-full object-contain" />
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.filter(([, , visible]) => visible).map(([label, path, visible, icon], idx) => {
            const isActive = currentPath.startsWith(path);
            return (
              <motion.button
                key={path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => navigate(path)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${
                  isActive 
                    ? 'bg-[#7A0A83] text-white shadow-lg shadow-[#7A0A83]/40' 
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {icon}
                {label}
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">
              {user?.nombre} {user?.apellido}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium text-sm">Country</span>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 bg-gray-200">
                  {/* Just a color placeholder for flag, or use actual flag if available */}
                  <div className="w-full h-full" style={{ background: activeCountry?.colors?.[0] || '#ccc' }}></div>
                </div>
                <select 
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none appearance-none pr-4 cursor-pointer"
                  value={activeCountry?.slug || ''}
                  onChange={(e) => setCountryBySlug(e.target.value)}
                  disabled={!canManageCountries(user?.rol)}
                >
                  <option value="latam">Latinoamérica</option>
                  {countries.filter(c => c.slug !== 'latam').map(c => (
                    <option key={c.slug} value={c.slug}>{c.nombre}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-gray-500 -ml-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>



            <button onClick={logout} className="text-gray-400 hover:text-[#7A0A83] transition-colors ml-2" title="Cerrar Sesión">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-auto bg-[#F8F9FE] p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        {/* Mandatory Security Setup Modal */}
        {needsSecuritySetup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seguridad Requerida</h2>
              <p className="text-gray-500 mb-6">Por tu seguridad y para poder recuperar tu contraseña en caso de olvido, es obligatorio configurar una pregunta de seguridad antes de continuar.</p>
              <button
                onClick={() => {
                  setNeedsSecuritySetup(false);
                  navigate('/admin/seguridad');
                }}
                className="w-full py-3.5 bg-[#7A0A83] text-white rounded-xl font-bold hover:bg-[#610769] transition-all"
              >
                Configurar ahora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLayout;
