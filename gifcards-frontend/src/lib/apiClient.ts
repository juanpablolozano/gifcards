export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
  }
}

type ApiFetchOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let code = "request_failed";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        code = body.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, code);
  }

  return response.json() as Promise<T>;
}
