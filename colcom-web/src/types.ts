export type Role = 'editor' | 'admin_pais' | 'superadmin';
export type EstadoContenido = 'borrador' | 'publicado' | 'despublicado';
export type EstadoSolicitud = 'pendiente' | 'leido' | 'respondido';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
  pagination?: Pagination;
  statusCode?: number;
  message?: string;
  errors?: string[];
}

export interface User {
  id: string;
  username: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol: Role;
  pais_id: string | null;
  pais_slug?: string;
  estado?: 'activo' | 'inactivo';
}

export interface Pais {
  id: string;
  nombre: string;
  slug: string;
  codigo?: string;
  estado?: 'activo' | 'inactivo' | string;
}

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumen?: string;
  contenido: string;
  estado: EstadoContenido;
  pais_id?: string;
  imagen_url?: string;
  created_at?: string;
}

export interface Testimonio {
  id: string;
  nombre: string;
  cargo?: string;
  empresa?: string;
  contenido: string;
  instagram_url?: string;
  facebook_url?: string;
  destacado?: boolean;
  estado: EstadoContenido;
  foto_url?: string;
}

export interface Solicitud {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  finalidad?: string;
  mensaje?: string;
  estado: EstadoSolicitud;
  pais_id?: string;
}

export interface Archivo {
  id: string;
  nombre_archivo: string;
  url: string;
  tipo_archivo?: string;
  modulo?: string;
  referencia_id?: string;
}

export interface Auditoria {
  id: string;
  modulo?: string;
  accion?: string;
  usuario_id?: string;
  registro_id?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export interface ListState<T> {
  items: T[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}
