// lib/swal.ts
import Swal from "sweetalert2";

const BASE_CONFIG = {
  confirmButtonColor: "#E30022",
};

export const swalSuccess = (
  title: string,
  text?: string,
  onConfirm?: () => void
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

export const swalError = (title: string, text?: string) => {
  Swal.fire({
    icon: "error",
    title,
    text,
    ...BASE_CONFIG,
  });
};

export const swalInfo = (title: string, text?: string) => {
  Swal.fire({
    icon: "info",
    title,
    text,
    ...BASE_CONFIG,
  });
};

export const swalConfirm = (
  title: string,
  text: string,
  onConfirm: () => void
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
