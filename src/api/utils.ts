import { API_BASE, API_KEY } from "./config";

// builds a full URL with query params — skips null/undefined
export function buildUrl(
  path: string,
  params: Record<string, string | number | boolean> = {}
) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.append(key, String(val));
    }
  });
  return url.toString();
}

// standard headers — adds token if logged in
export function authHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  // only attach if it exists
  if (API_KEY) headers["X-Noroff-API-Key"] = API_KEY;

  // only attach if user is logged-in
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
}

// parses JSON + throws clean error message if request failed
export async function safeJSON<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (json as any).errors?.[0]?.message ?? res.statusText;
    throw new Error(err);
  }
  return (json as any).data as T;
}

// basic GET with optional params and token
export async function getJSON<T>(
  path: string,
  params?: Record<string, any>,
  token?: string
): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, { headers: authHeaders(token) });
  return safeJSON<T>(res);
}

// POST wrapper — sends JSON, returns typed data
export async function postJSON<T>(
  path: string,
  body: any,
  params?: Record<string, any>,
  token?: string
): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return safeJSON<T>(res);
}

// same deal as above but PUT
export async function putJSON<T>(
  path: string,
  body: any,
  params?: Record<string, any>,
  token?: string
): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return safeJSON<T>(res);
}

// basic DELETE — throws if not 204 or ok
export async function deleteJSON(
  path: string,
  params?: Record<string, any>,
  token?: string
): Promise<void> {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(res.statusText || "Delete failed");
  }
}

// handles paginated GETs (used for bookings, venues, etc.)
export async function fetchAllPages<T>(
  path: string,
  extractPage: (data: any) => T[],
  headers: HeadersInit,
  extraParams: Record<string, string | number | boolean> = {}
): Promise<T[]> {
  const collected: T[] = [];
  let page = 1;
  while (true) {
    const params = { ...extraParams, page };
    const url = buildUrl(path, params);
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to fetch");
    const { data, meta } = await res.json();
    collected.push(...extractPage(data));
    if (meta.isLastPage) break;
    page = meta.nextPage;
  }
  return collected;
}
