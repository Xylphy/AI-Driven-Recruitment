import Swal from "sweetalert2";

const formatValidationError = (error: any): string => {
  if (!error) return "An unexpected error occurred.";

  if (typeof error === "string") return error;

  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.join("\n");
  }

  if (error.properties) {
    return Object.values(error.properties)
      .flatMap((prop: any) => prop.errors || [])
      .join("\n");
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
