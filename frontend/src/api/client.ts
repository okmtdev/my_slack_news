import type { Bot, ExecutionLog, RunResult } from "../types/bot";

const BASE = import.meta.env.VITE_API_BASE ?? "";

function authHeader(): HeadersInit {
  const creds = localStorage.getItem("auth");
  if (!creds) return {};
  return { Authorization: `Basic ${creds}` };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeader(), ...init?.headers },
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

export const api = {
  bots: {
    list: () => request<{ bots: Bot[] }>("/api/bots").then((r) => r.bots),
    get: (id: string) => request<Bot>(`/api/bots/${id}`),
    create: (data: Omit<Bot, "id" | "created_at" | "updated_at">) =>
      request<Bot>("/api/bots", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Omit<Bot, "id" | "created_at" | "updated_at">) =>
      request<Bot>(`/api/bots/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/bots/${id}`, { method: "DELETE" }),
    toggle: (id: string, enabled: boolean) =>
      request<Bot>(`/api/bots/${id}/toggle?enabled=${enabled}`, { method: "PUT" }),
    run: (id: string) =>
      request<RunResult>(`/api/bots/${id}/run`, { method: "POST" }),
  },
  logs: {
    list: (botId?: string, limit = 50) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (botId) params.set("bot_id", botId);
      return request<{ logs: ExecutionLog[]; total: number }>(`/api/logs?${params}`);
    },
  },
};

export function setAuthCredentials(username: string, password: string) {
  localStorage.setItem("auth", btoa(`${username}:${password}`));
}

export function clearAuthCredentials() {
  localStorage.removeItem("auth");
}
