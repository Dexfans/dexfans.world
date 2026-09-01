const API_URL =
  "https://dexfans-api.dwf6zb4bd6.workers.dev";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(
      `API error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

export async function getHealth() {
  return apiFetch<{
    status: string;
    service?: string;
  }>("/");
}

export { API_URL };
