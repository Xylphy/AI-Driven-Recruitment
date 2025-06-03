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

// Parses FormData and converts specified fields to JSON
export function parseFormData(formData: FormData, jsonFields: string[] = []) {
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (jsonFields.includes(key)) {
      try {
        data[key] = JSON.parse(value as string);
      } catch {
        data[key] = value; // Fallback to string if parsing fails
      }
    } else if (value instanceof File) {
      data[key] = value.size > 0 ? value : undefined;
    } else if (typeof value === "string") {
      data[key] = value === "" ? undefined : value;
    } else {
      data[key] = value;
    }
  }

  return data;
}

// Supported file types across the application
export function isValidFile(file: File | null): boolean {
  return (
    !!file &&
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ].includes(file.type) &&
    file.size <= 10 * 1024 * 1024 &&
    file.size > 0
  );
}

/**
 * Cleans string fields in an array of objects
 * @param items Array of objects to clean
 * @param stringFields Fields that should be trimmed and empty strings converted to undefined
 * @param filterEmptyObjects If true, objects with all empty string fields will be removed
 */
export function cleanArrayData<T extends Record<string, unknown>>(
  items: T[],
  stringFields: (keyof T)[],
  filterEmptyObjects: boolean = false
): T[] {
  return items
    .map((item) => {
      const cleanedItem = { ...item };
      for (const field of stringFields) {
        if (!cleanedItem[field]) {
          delete cleanedItem[field]; // Remove the field if it is falsy
        }
      }

      return cleanedItem;
    })
    .filter((item) => {
      if (!filterEmptyObjects) return true;

      // Keep items that have at least one non-empty string field
      return stringFields.some(
        (field) => item[field] && item[field] !== undefined
      );
    });
}
