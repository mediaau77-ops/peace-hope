import type { ApiResult } from '../shared/api';
import type { EndpointBody, EndpointKey, EndpointParams, EndpointResponse, Endpoints, RequestOptions } from '../shared/endpoints';

function buildUrl<K extends EndpointKey>(key: K, options?: RequestOptions<K>): string {
  const path = key.replace(/:([A-Za-z0-9_]+)/g, (_, param: string) => {
    const value = (options?.params as Record<string, string>)?.[param];
    return encodeURIComponent(String(value ?? ''));
  });

  const query = options?.query ? new URLSearchParams(
    Object.entries(options.query)
      .filter(([, value]) => value !== undefined)
      .map(([keyName, value]) => [keyName, String(value)]),
  ).toString() : '';

  return query ? `${path}?${query}` : path;
}

export async function apiCall<K extends EndpointKey>(
  key: K,
  options: RequestOptions<K> = {},
): Promise<ApiResult<EndpointResponse<K>>> {
  const response = await fetch(buildUrl(key, options), {
    method: key.startsWith('GET ') ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    signal: options.signal,
    credentials: 'include',
  });

  const result = (await response.json()) as ApiResult<EndpointResponse<K>>;

  if (!response.ok && (!result || typeof result !== 'object' || !('ok' in result) || result.ok !== false)) {
    return {
      ok: false,
      error: {
        code: 'HTTP_' + response.status,
        message: response.statusText || 'Request failed',
      },
    } satisfies ApiResult<EndpointResponse<K>>;
  }

  return result;
}

export type ApiCallOptions<K extends EndpointKey> = RequestOptions<K>;
export type ApiCallParams<K extends EndpointKey> = EndpointParams<K>;
export type ApiCallBody<K extends EndpointKey> = EndpointBody<K>;
