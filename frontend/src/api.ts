const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type Profile = {
  name: string
  firstName: string
  age: string
  email: string
  pseudo: string
  gender?: string
}

type ApiOptions = RequestInit & { token?: string | null }

async function request<T>(
  path: string,
  { token, headers, ...options }: ApiOptions = {},
) {
  const response = await fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    },
  )

  const contentType = response.headers.get("content-type") || ""
  const body = contentType.includes("application/json")
    ? await response.json()
    : null
  if (!response.ok) {
    throw new Error(
      body?.message ||
        body?.error ||
        "Le serveur est momentanément indisponible.",
    )
  }
  return body as T
}

export const api = {
  login: (email: string, password: string) =>
    request<{ status: string; token?: string; message?: string }>('/login', {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (profile: Profile & { password: string }) =>
    request<{ status: string; token?: string; message?: string }>('/signup', {
      method: "POST",
      body: JSON.stringify(profile),
    }),
  verifyToken: (token: string) =>
    request<{ status: string }>("/verify-token", { method: "POST", token }),
  getProfile: (token: string) => request<Profile>("/profile", { token }),
  updateProfile: (token: string, profile: Profile) =>
    request<{ message?: string }>("/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(profile),
    }),
}
