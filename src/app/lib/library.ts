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
  let csrfTokenValue = getCookie("csrf_token");
  let csrfResponse;

  if (!csrfTokenValue) {
    try {
      csrfResponse = await fetch("/api/csrf");
      if (!csrfResponse.ok) {
        throw new Error("CSRF token fetch failed");
      }
      const csrfData = await csrfResponse.json();
      csrfTokenValue = csrfData.csrfToken;
    } catch (error) {}
  }
  return csrfTokenValue;
}
