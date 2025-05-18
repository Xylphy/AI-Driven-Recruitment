// Note: Cannot be used for getting HTTP-only cookies
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    // This code is running on the server, so we can't access document.cookie
    return null;
  }
  const value = `; ${document.cookie}`;
  for (const cookie of value.split(";")) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(`${name}=`)) {
      return trimmedCookie.substring(name.length + 1);
    }
  }
  return null;
}

// Note: Can't be used for clearing HTTP-only cookies
export function clearCookies() {
  if (typeof document === "undefined") {
    // This code is running on the server, so we can't access document.cookie
    return;
  }
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
}

export async function getCsrfToken(): Promise<string | null> {
  if (typeof document === "undefined") {
    // This code is running on the server, so we can't access document.cookie
    return null;
  }

  try {
    const csrfResponse = await fetch("/api/csrf");

    if (!csrfResponse.ok) {
      throw new Error("CSRF token fetch failed");
    }

    const csrfData = await csrfResponse.json();
    return csrfData.csrfToken;
  } catch {
    alert("Failed to fetch CSRF token");
    return null;
  }
}

export async function checkAuthStatus(csrfToken: string): Promise<boolean> {
  if (typeof document === "undefined") {
    // This code is running on the server, so we can't access document.cookie
    return false;
  }

  try {
    const response = await fetch("/api/auth/status", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
    });

    if (response.ok) {
      return true;
    }

    return await refreshToken(csrfToken);
  } catch {
    return false;
  }
}

export async function refreshToken(csrfToken: string): Promise<boolean> {
  if (typeof document === "undefined") {
    // This code is running on the server, so we can't access document.cookie
    return false;
  }
  return await fetch("/api/auth/refresh", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Token refresh failed");
      }
      return true;
    })
    .catch(() => {
      return false;
    });
}
