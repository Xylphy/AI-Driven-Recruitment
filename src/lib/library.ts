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

// Refreshes access and refresh token
export async function refreshToken(): Promise<boolean> {
  if (typeof document === "undefined") {
    // This code is running on the server, so we can't access document.cookie
    return false;
  }

  return await fetch("/api/auth/refresh", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  }).then((res) => res.ok);
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

/**
 * Cleans an array of objects by trimming specified string fields and optionally removing objects with all empty string fields.
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

/**
 * Converts an ISO string to a formatted date string.
 * @param iso ISO String
 * @returns Formatted Date
 */
export function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
