import { API_BASE } from '../config';

/**
 * Centralized fetch wrapper for all API calls.
 * 
 * Handles:
 * - M5: Prepends the centralized API_BASE URL (no more hardcoded localhost)
 * - M2: Automatically attaches Authorization header when a token is provided
 * - M2/M8: Intercepts 401/403 responses and forces logout + redirect
 * 
 * @param endpoint - API endpoint path (e.g., '/api/cars' or '/api/auth/login')
 * @param options  - Standard fetch options (method, headers, body, etc.)
 * @param token    - Optional JWT token to attach as Bearer header
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {};

  // Preserve any existing headers from the caller
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => { headers[key] = value; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => { headers[key] = value; });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  // Attach auth token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Global 401/403 interception — force logout on auth failures
  if (response.status === 401 || response.status === 403) {
    // Only force-logout for authenticated requests (those that sent a token)
    // Public endpoints (login, register, public car list) should not trigger logout
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      // Redirect to login — but only if we're not already on a login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  return response;
}
