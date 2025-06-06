import { create } from "zustand";

interface CsrfStore {
  csrfToken: string | null;
  setCsrfToken: (token: string | null) => void;
}

export const useCsrfStore = create<CsrfStore>((set) => ({
  csrfToken: null,
  setCsrfToken: (token: string | null) => set({ csrfToken: token }),
}));
