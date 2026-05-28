import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountry } from '../../hooks/useCountry.js';
import { navigate } from '../../routes/navigation.js';
import latLogo from '../../assets/imgs/latComparte.png';
import america from '../../assets/imgs/america.png';
import { BrandLogo } from './BrandLogo';

interface NavLinkConfig {
  id: string;
  label: string;
  path: string;
}

export function PublicHeader() {
  const { activeCountry, activeSlug } = useCountry();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getThemeColor = (slug: string) => {
    if (slug === 'colombia') return 'var(--color-colombia)';
    if (slug === 'ecuador') return 'var(--color-ecuador)';
    if (slug === 'chile') return 'var(--color-chile)';
    if (slug === 'argentina') return 'var(--color-argentina)';
    return 'var(--cyan)';
  };

  const themeColor = getThemeColor(activeSlug);

  const basePath = activeSlug === 'latam' ? '/' : `/${activeSlug}`;
  
  

  const navLinks: NavLinkConfig[] = [
  //  {id: 'inicio', label: 'Inicio', path: `${basePath}` },
    { id: 'somos', label: 'Quiénes somos', path: `${basePath}#somos` },
    { id: 'impacto', label: 'Nuestro impacto', path: `${basePath}#impacto` },
    { id: 'equipo', label: 'Equipo', path: `${basePath}#equipo` },
    { id: 'noticias', label: 'Noticias', path: `${basePath}#noticias` },
    { id: 'contacto', label: 'Contáctenos', path: `${basePath}#contacto` },
  ];

  return (
    <>
      <header
        className={`public-header premium-navbar ${scrolled ? 'scrolled' : ''} flex items-center justify-between min-h-[72px] px-[5vw] sticky top-0 z-[100] transition-colors duration-300`}
        style={{ '--theme-color': themeColor } as React.CSSProperties}
      >
        {/* Brand logo mark */}
        <button
          type="button"
          onClick={() => navigate(activeSlug === 'latam' ? '/' : `/${activeSlug}`)}
          aria-label="Ir al inicio"
          className="brand group flex items-center gap-3 bg-transparent border-0 p-0 cursor-pointer shrink-0"
        >
          <BrandLogo slug={activeSlug} isHeader={true} />
        </button>

        {/* Morphing hamburger toggler */}
        <button
          className="menu-toggle flex flex-col justify-center items-center w-11 h-11 bg-transparent border-0 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Abrir menú"
        >
          <motion.span
            animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block w-6 h-[2px] bg-white mb-[5px] origin-center"
            transition={{ duration: 0.25 }}
          />
          <motion.span
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-[2px] bg-white mb-[5px] origin-center"
            transition={{ duration: 0.2 }}
          />
          <motion.span
            animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block w-6 h-[2px] bg-white origin-center"
            transition={{ duration: 0.25 }}
          />
        </button>

        {/* Desktop links navigation with spring underline indicator */}
        <nav className="public-nav hidden md:flex items-center gap-[0.35rem]">
          {navLinks.map((link) => (
            <motion.button
              key={link.id}
              className="nav-link relative px-3 py-2 bg-transparent text-white/70 font-semibold focus:outline-none transition-colors duration-200 hover:text-white"
              onClick={() => navigate(link.path)}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
              whileTap={{ scale: 0.95 }}
            >
              {link.label}
              {hoveredLink === link.id && (
                <motion.span
                  layoutId="header-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-brand-chile"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </header>

      {/* Fullscreen Mobile Overlay Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mobile-menu-overlay flex flex-col justify-center items-center gap-6 fixed inset-0 w-full h-full bg-brand-bg/98 backdrop-blur-3xl z-[90] md:hidden"
            style={{ '--theme-color': themeColor } as React.CSSProperties}
          >
            {navLinks.map((link, idx) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + idx * 0.05, duration: 0.35 }}
                className="nav-link text-white/80 font-bold text-2xl hover:text-white"
                onClick={() => {
                  setOpen(false);
                  navigate(link.path);
                }}
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
