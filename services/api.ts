import axios from "axios";

export const TOKEN_KEY = "cafze_access_token";
export const AUTH_CHANGED_EVENT = "cafze-auth-changed";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: getApiOrigin(configuredApiUrl),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (
    typeof FormData !== "undefined" &&
    config.data instanceof FormData
  ) {
    delete config.headers["Content-Type"];
  }
  config.headers["x-tenant-id"] =
    process.env.NEXT_PUBLIC_TENANT_ID || "free4mood";
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = ["/auth/login", "/users/create-user"].some(
      (path) => error.config?.url?.includes(path),
    );
    if (error.response?.status === 401 && !isAuthRequest && getAccessToken()) {
      clearAccessToken();
    }
    return Promise.reject(error);
  },
);

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  const localToken = window.localStorage.getItem(TOKEN_KEY);
  if (localToken) return localToken;
  const cookieToken = document.cookie
    .split("; ")
    .find((item) => item.startsWith("accessToken="))
    ?.split("=")
    .slice(1)
    .join("=");
  return cookieToken ? decodeURIComponent(cookieToken) : null;
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=lax${secure}`;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  const hadToken = Boolean(getAccessToken());
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
  if (hadToken) {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function unwrap<T>(payload: unknown): T {
  let value = payload;

  for (let depth = 0; depth < 3; depth += 1) {
    if (!isRecord(value) || !("data" in value)) break;
    value = value.data;
  }

  return value as T;
}

export function unwrapCollection<T>(
  payload: unknown,
  keys: string[] = ["result", "items", "records"],
): T[] {
  const value = unwrap<unknown>(payload);
  if (Array.isArray(value)) return value as T[];
  if (!isRecord(value)) return [];

  for (const key of keys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate as T[];
    if (isRecord(candidate) && Array.isArray(candidate.data)) {
      return candidate.data as T[];
    }
  }

  return [];
}

export function unwrapEntity<T>(
  payload: unknown,
  keys: string[] = ["result", "item"],
): T {
  const value = unwrap<unknown>(payload);
  if (isRecord(value)) {
    for (const key of keys) {
      if (value[key] !== undefined) return value[key] as T;
    }
  }
  return value as T;
}

export function normalizeId<T extends { id?: string; _id?: string }>(
  item: T,
): T & { id: string } {
  return { ...item, id: item.id || item._id || "" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getApiOrigin(value: string) {
  const normalized = value.trim().replace(/\/+$/, "");
  try {
    return new URL(normalized).origin;
  } catch {
    return normalized.replace(/\/api\/v1$/i, "");
  }
}
