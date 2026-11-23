// Wrapper minimo sobre fetch para la API propia. Siempre por /api (nunca a la URL directa del backend).
export class ApiError extends Error {
  status: number;
  details?: Record<string, string[] | undefined>;

  constructor(status: number, message: string, details?: Record<string, string[] | undefined>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body?.error ?? `Error ${response.status}`, body?.details);
  }

  return body as T;
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.details) {
      const first = Object.entries(error.details).find(([, messages]) => messages?.length);
      if (first) return `${error.message}: ${first[0]} — ${first[1]![0]}`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Error desconocido";
};
