async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiGet = <T>(url: string) => request<T>('GET', url);
export const apiPost = <T>(url: string, body?: unknown) => request<T>('POST', url, body ?? {});
export const apiPatch = <T>(url: string, body?: unknown) => request<T>('PATCH', url, body ?? {});
export const apiPut = <T>(url: string, body?: unknown) => request<T>('PUT', url, body ?? {});
export const apiDelete = <T>(url: string) => request<T>('DELETE', url);

export async function apiUpload<T>(url: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(url, { method: 'POST', credentials: 'include', body: formData });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) message = data.detail;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
