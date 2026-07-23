const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const TOKEN_KEY = 'examgov-token'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

type ApiFetchOptions = {
  method?: string
  body?: unknown
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let body: BodyInit | undefined
  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data = await response.json()
      message = data.message ?? message
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message)
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}
