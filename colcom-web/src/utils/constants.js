export const COUNTRY_SLUGS = ['argentina', 'chile'];
export const CONTENT_STATES = ['borrador', 'publicado', 'despublicado'];
export const REQUEST_STATES = ['pendiente', 'leido', 'respondido'];
export const CONTACT_PURPOSES = ['Cotizacion', 'Informacion', 'Alianza', 'Soporte'];

export const canDeleteContent = (role) => ['superadmin', 'admin_pais'].includes(role);
export const canManageRequests = (role) => role === 'superadmin';
export const canManageCountries = (role) => role === 'superadmin';
