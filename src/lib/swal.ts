import Swal from "sweetalert2";

const formatValidationError = (error: unknown): string => {
  if (!error) return "An unexpected error occurred.";

  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    if (err.errors && Array.isArray(err.errors)) {
      return err.errors.join("\n");
    }

    if (err.properties && typeof err.properties === "object") {
      return Object.values(err.properties)
        .flatMap((prop: unknown) => {
          if (prop && typeof prop === "object" && "errors" in prop) {
            const propObj = prop as { errors?: unknown[] };
            return propObj.errors || [];
          }
          return [];
        })
        .join("\n");
    }
  }

  return JSON.stringify(error);
};

const BASE_CONFIG = {
  confirmButtonColor: "#E30022",
};

export const swalSuccess = (
  title: string,
  text?: string,
  onConfirm?: () => void,
) => {
  Swal.fire({
    icon: "success",
    title,
    text,
    ...BASE_CONFIG,
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

export const swalError = (
  title: string,
  text?: unknown,
  onConfirm?: () => void,
) => {
  const formatted =
    typeof text === "string" ? text : formatValidationError(text);

  Swal.fire({
    icon: "error",
    title,
    text: formatted,
    ...BASE_CONFIG,
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

export const swalInfo = (
  title: string,
  text?: string,
  onConfirm?: () => void,
) => {
  Swal.fire({
    icon: "info",
    title,
    text,
    ...BASE_CONFIG,
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

export const swalConfirm = (
  title: string,
  text: string,
  onConfirm: () => void,
) => {
  Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#E30022",
    cancelButtonColor: "#9CA3AF",
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};
