// Minimal auth helper for token storage, refresh, and authorized fetch

const API_BASE = "http://localhost:5000/api/users";

export function getAccessToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch (_) {
    return null;
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem("refreshToken");
  } catch (_) {
    return null;
  }
}

export function setTokens(accessToken, refreshToken) {
  try {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  } catch (_) {
    // ignore storage errors
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (_) {
    // ignore storage errors
  }
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) {
    // If refresh fails, clear tokens to avoid stuck state
    clearTokens();
    return null;
  }
  const data = await res.json();
  // Persist new tokens
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

// apiFetch: attaches Authorization, retries once on 401 using refresh
export async function apiFetch(url, options = {}) {
  const opts = { ...options };
  const token = getAccessToken();
  opts.headers = {
    ...(options.headers || {}),
    "Content-Type": options.headers?.["Content-Type"] || "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(url, opts);
  if (res.status === 401) {
    // try to refresh token once
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryOpts = { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${newToken}` } };
      res = await fetch(url, retryOpts);
    } else {
      // Ensure headers no longer carry a bad Authorization
      const cleanOpts = { ...opts };
      if (cleanOpts.headers) {
        const { Authorization, ...rest } = cleanOpts.headers;
        cleanOpts.headers = rest;
      }
      // Optionally, retry without auth for endpoints that allow public access
      // If the endpoint requires auth, this will still be 401 and the caller can handle it.
      try {
        res = await fetch(url, cleanOpts);
      } catch (_) {
        // swallow network errors here; caller will handle via res.ok check
      }
    }
  }
  return res;
}

export async function serverLogout() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return { ok: true };
  }
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  // Clear tokens locally regardless of server response
  clearTokens();
  return { ok: res.ok };
}
