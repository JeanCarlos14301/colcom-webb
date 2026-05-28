import type { ApiEnvelope, Pagination, Role, User } from '../types';
import { mockApiRequest } from './mockApi';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
export const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
export const TOKEN_KEY = 'colcom_access_token';
export const USER_KEY = 'colcom_user';

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const saveSession = (accessToken: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('colcom:logout'));
};

const normalizeHeaders = (body?: BodyInit | Record<string, unknown>) => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export async function apiRequest<T>(
  path: string,
  options: Omit<RequestInit, 'body'> & { body?: BodyInit | Record<string, unknown> } = {},
): Promise<ApiEnvelope<T>> {
  if (USE_MOCK) {
    const envelope = await mockApiRequest<T>(path, {
      ...options,
      headers: { ...normalizeHeaders(options.body), ...(options.headers as any) }
    });
    
    if (envelope?.statusCode === 401 && !path.startsWith('/public/')) {
      clearSession();
      if (!location.pathname.includes('/login')) {
        history.pushState({}, '', '/login');
        window.dispatchEvent(new Event('colcom:navigate'));
      }
    }
    
    if (!envelope?.ok) {
      throw new ApiError(
        envelope?.message || `Error HTTP ${envelope?.statusCode}`,
        envelope?.statusCode || 500,
        (envelope as any)?.errors,
      );
    }
    return envelope;
  }

  const body = options.body instanceof FormData || typeof options.body === 'string'
    ? options.body
    : options.body
      ? JSON.stringify(options.body)
      : undefined;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    body,
    headers: {
      ...normalizeHeaders(options.body),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const envelope = await response.json().catch(() => null) as ApiEnvelope<T> | null;

  if (response.status === 401 && !path.startsWith('/public/')) {
    clearSession();
    if (!location.pathname.includes('/login')) {
      history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('colcom:navigate'));
    }
  }

  if (!response.ok || !envelope?.ok) {
    throw new ApiError(
      envelope?.message || `Error HTTP ${response.status}`,
      envelope?.statusCode || response.status,
      envelope?.errors,
    );
  }

  return envelope;
}

export const toQuery = (params?: Record<string, string | number | boolean | undefined | null>) => {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : '';
};

export const canDelete = (role?: Role | null) => role === 'admin_pais' || role === 'superadmin';
export const isAdmin = (role?: Role | null) => role === 'admin_pais' || role === 'superadmin';

export async function listResource<T>(path: string, page: number, limit = 12) {
  const res = await apiRequest<T[]>(`${path}${toQuery({ page, limit })}`);
  return {
    items: res.data,
    pagination: res.pagination || null as Pagination | null,
  };
}

export const healthCheck = () => apiRequest<{ status?: string }>('/health');
