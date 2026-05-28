import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { navigate } from '../../routes/navigation';
import { useCountry } from '../../hooks/useCountry';
import latLogo from '../../assets/imgs/latComparte.png';
import quieto from '../../assets/imgs/quieto.png';
import ojosTapados from '../../assets/imgs/ojosTapados.png';
import tapados from '../../assets/imgs/tapados.gif';
import destapados from '../../assets/imgs/destapados.gif';

export function LoginPage() {
  const { login } = useAuth();
  const { activeCountry, setCountryBySlug } = useCountry();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordActive, setPasswordActive] = useState(false);
  const [mascotState, setMascotState] = useState<'idle' | 'covering' | 'covered' | 'uncovering'>('idle');

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (passwordActive) {
      setMascotState('covering');
      // Asumimos que el gif de taparse dura unos 800ms
      timeout = setTimeout(() => {
        setMascotState('covered');
      }, 800);
    } else {
      setMascotState(prev => {
        if (prev === 'idle') return 'idle';
        return 'uncovering';
      });
      timeout = setTimeout(() => {
        setMascotState('idle');
      }, 800);
    }
    return () => clearTimeout(timeout);
  }, [passwordActive]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(credentials.username, credentials.password);
      if (user?.rol === 'superadmin') {
        setCountryBySlug('latam');
      } else if (user?.pais_slug) {
        setCountryBySlug(user.pais_slug);
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = activeCountry?.colors?.[0] || '#7A0A83';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4"
      style={{
        background: `radial-gradient(circle at center, ${primaryColor} 0%, #2A044A 100%)`,
      }}
    >
      {/* Botón regresar */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white font-semibold text-sm backdrop-blur-md border border-white/25 hover:bg-white/25 transition-all hover:scale-105"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Regresar
      </button>

      {/* Faint Background Mesh / Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Contenedor Principal (Form centrado) */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center mt-12">
        
        {/* Formulario con Mascota asomándose */}
        <div className="relative w-full">
          {/* Mascota Interactiva posicionada sobre el form */}
          <div className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-64 h-64 flex items-center justify-center select-none pointer-events-none z-20">
            {mascotState === 'idle' && <img src={quieto} alt="Mascot Idle" className="w-full h-full object-contain drop-shadow-2xl" />}
            {mascotState === 'covering' && <img key="covering" src={tapados} alt="Mascot Covering" className="w-full h-full object-contain drop-shadow-2xl" />}
            {mascotState === 'covered' && <img src={ojosTapados} alt="Mascot Covered" className="w-full h-full object-contain drop-shadow-2xl" />}
            {mascotState === 'uncovering' && <img key="uncovering" src={destapados} alt="Mascot Uncovering" className="w-full h-full object-contain drop-shadow-2xl" />}
          </div>

          <form
            onSubmit={submit}
            className="relative z-10 bg-white/90 rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full flex flex-col items-center border border-white backdrop-blur-xl pt-16"
          >
        <img
          src={latLogo}
          alt="Latinoamérica Comparte"
          className="h-16 w-auto mb-6"
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Bienvenido de nuevo
        </h1>

        <div className="w-full space-y-5 mb-2">
          {/* Username Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Nombre de usuario"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              style={{ '--color-primary': primaryColor } as any}
              value={credentials.username}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  username: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
              style={{ '--color-primary': primaryColor } as any}
              value={credentials.password}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  password: e.target.value,
                })
              }
              onFocus={() => setPasswordActive(true)}
              onBlur={() => setPasswordActive(false)}
              onMouseEnter={() => setPasswordActive(true)}
              onMouseLeave={() => setPasswordActive(false)}
              required
            />

            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="w-full flex justify-end mb-8 mt-2">
          <button
            type="button"
            onClick={() => navigate('/recuperar')}
            className="text-sm font-semibold hover:underline"
            style={{ color: primaryColor }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {error && (
          <div className="w-full text-red-500 text-sm text-center mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white font-bold rounded-full transition-transform hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:hover:scale-100"
          style={{
            background: `linear-gradient(90deg, ${primaryColor} 0%, #A81B85 100%)`,
          }}
        >
          {loading ? 'INGRESANDO...' : 'INGRESAR'}
        </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;