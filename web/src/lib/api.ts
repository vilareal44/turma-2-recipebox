class ApiClient {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return res.json();
  }
  get<T>(e: string) { return this.fetch<T>(e); }
  post<T>(e: string, d: unknown) { return this.fetch<T>(e, { method: 'POST', body: JSON.stringify(d) }); }
  put<T>(e: string, d: unknown) { return this.fetch<T>(e, { method: 'PUT', body: JSON.stringify(d) }); }
  delete<T>(e: string) { return this.fetch<T>(e, { method: 'DELETE' }); }
}
export const api = new ApiClient();
