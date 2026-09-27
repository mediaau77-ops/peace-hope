export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  code: string;
  details?: unknown;
  status?: number;

  constructor(payload: ApiErrorPayload, status?: number) {
    super(payload.message || 'API request failed');
    this.name = 'ApiError';
    this.code = payload.code || 'UNKNOWN_ERROR';
    this.details = payload.details;
    this.status = status;
  }
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: ApiErrorPayload;
}

/**
 * Get headers including auth token from localStorage if present
 */
function getHeaders(init?: RequestInit): HeadersInit {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // If a JWT token was saved from Supabase OAuth or auth session
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ph_auth_token') || sessionStorage.getItem('ph_auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    method: 'GET',
    credentials: 'include',
    ...init,
    headers: getHeaders(init),
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    ok: false,
    error: { code: 'PARSE_ERROR', message: 'Failed to parse JSON response' },
  }));

  if (!json.ok) {
    throw new ApiError(json.error || { code: 'HTTP_' + res.status, message: res.statusText }, res.status);
  }

  return json.data as T;
}

export async function apiPost<T>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    ...init,
    headers: getHeaders(init),
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    ok: false,
    error: { code: 'PARSE_ERROR', message: 'Failed to parse JSON response' },
  }));

  if (!json.ok) {
    throw new ApiError(json.error || { code: 'HTTP_' + res.status, message: res.statusText }, res.status);
  }

  return json.data as T;
}

export async function apiPatch<T>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    ...init,
    headers: getHeaders(init),
    body: body ? JSON.stringify(body) : undefined,
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    ok: false,
    error: { code: 'PARSE_ERROR', message: 'Failed to parse JSON response' },
  }));

  if (!json.ok) {
    throw new ApiError(json.error || { code: 'HTTP_' + res.status, message: res.statusText }, res.status);
  }

  return json.data as T;
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    method: 'DELETE',
    credentials: 'include',
    ...init,
    headers: getHeaders(init),
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    ok: false,
    error: { code: 'PARSE_ERROR', message: 'Failed to parse JSON response' },
  }));

  if (!json.ok) {
    throw new ApiError(json.error || { code: 'HTTP_' + res.status, message: res.statusText }, res.status);
  }

  return json.data as T;
}
