import type { FieldValue, Timestamp } from "firebase/firestore";
import { swalError } from "./swal";

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
    swalError(
      "Security Check Failed",
      "Unable to initialize secure request. Please try again.",
    );
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

/**
 * Converts a Firestore timestamp object ({ seconds, nanoseconds }) to a Date.
 */
function firebaseTimestampToDate(
  ts:
    | { seconds: number; nanoseconds?: number }
    | { seconds: number; nanoseconds: number }
    | { toDate?: () => Date }
    | null
    | undefined,
): Date | null {
  if (!ts) return null;

  // Firestore Timestamp instance often has toDate()
  if (
    "toDate" in ts &&
    typeof (ts as { toDate?: () => Date }).toDate === "function"
  ) {
    return (ts as { toDate: () => Date }).toDate();
  }

  const s = (ts as { seconds?: number }).seconds;
  const n = (ts as { nanoseconds?: number }).nanoseconds ?? 0;

  if (typeof s === "number") {
    return new Date(s * 1000 + Math.floor(n / 1e6));
  }

  return null;
}

/**
 * Converts an ISO string to a formatted date string.
 * Accepts:
 *  - ISO string: "2025-11-23T12:00:00Z"
 */
type FirestoreTimestamp = Parameters<typeof firebaseTimestampToDate>[0];

export function formatDate(
  iso: string | Timestamp | FieldValue | null | undefined,
): string {
  if (!iso) return "";

  // Handle ISO strings, numbers, and Date directly; otherwise try Firestore timestamp conversion.
  let date: Date | null;
  if (
    typeof iso === "string" ||
    typeof iso === "number" ||
    iso instanceof Date
  ) {
    date = new Date(iso as string | number | Date);
  } else {
    // FieldValue / Firestore timestamp shapes might not match TS types — cast through unknown to the expected timestamp shape.
    date = firebaseTimestampToDate(iso as unknown as FirestoreTimestamp);
  }

  if (!date) return "";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
