import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { paisesApi } from '../api/paises.api.js';
import { countryLogos } from '../data/countryLogos';

const FALLBACK_SLUG = 'latam';
const STORAGE_KEY = 'colcom_country_slug';
const RESERVED_PATHS = new Set(['admin', 'noticias', 'testimonios', 'contacto', 'donaciones']);

export const CountryContext = createContext(null);

const getSlugFromPath = () => {
  if (window.location.pathname === '/') return 'latam';
  const first = window.location.pathname.split('/').filter(Boolean)[0];
  return first && !RESERVED_PATHS.has(first) ? first : null;
};

export function CountryProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [activeSlug, setActiveSlug] = useState(
    getSlugFromPath() || localStorage.getItem(STORAGE_KEY) || FALLBACK_SLUG
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    paisesApi.publicActive()
      .then((data) => {
        if (!mounted) return;
        setCountries(Array.isArray(data) ? data : []);
      })
      .catch(() => setCountries([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onPop = () => {
      const slug = getSlugFromPath();
      if (slug) setActiveSlug(slug);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeSlug);
  }, [activeSlug]);

  const setCountryBySlug = useCallback((slug) => {
    setActiveSlug(slug || FALLBACK_SLUG);
  }, []);

  const activeCountry = useMemo(() => {
    const cleanSlug = (activeSlug || '').toLowerCase().trim();
    const foundStatic = countryLogos.find((c) => c.slug.toLowerCase() === cleanSlug) || countryLogos.find((c) => c.slug === FALLBACK_SLUG) || countryLogos[0];
    
    if (cleanSlug === 'latam' || !countries.length) {
      return {
        id: null,
        nombre: foundStatic?.name || 'Latinoamérica',
        codigo: foundStatic?.slug.substring(0, 2).toUpperCase() || 'LA',
        slug: foundStatic?.slug || FALLBACK_SLUG,
        ...foundStatic,
      };
    }

    const foundApi = countries.find((c) => c.slug.toLowerCase() === cleanSlug) || countries.find((c) => c.slug === FALLBACK_SLUG) || countries[0];
    
    if (foundApi) {
      return { ...foundStatic, ...foundApi, colors: foundStatic?.colors || [] };
    }
    
    return {
      id: null,
      nombre: foundStatic?.name || 'Latinoamérica',
      codigo: foundStatic?.slug.substring(0, 2).toUpperCase() || 'LA',
      slug: foundStatic?.slug || FALLBACK_SLUG,
      ...foundStatic,
    };
  }, [activeSlug, countries]);

  const value = useMemo(() => ({
    countries,
    activeCountry,
    activeSlug: activeCountry?.slug || activeSlug,
    loading,
    setCountryBySlug,
  }), [countries, activeCountry, activeSlug, loading, setCountryBySlug]);

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}
