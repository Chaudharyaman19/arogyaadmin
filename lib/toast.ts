import type { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
import { getSwal } from "./swal";

/** Shared dark toast styling used across the admin portal. */
const TOAST_BASE: SweetAlertOptions = {
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
  iconColor: "#4ade80",
  customClass: {
    popup: "swal-toast-popup",
    title: "swal-toast-title",
  },
};

type SwalInstance = Awaited<ReturnType<typeof getSwal>>;

export interface LazyToast {
  fire: (options?: SweetAlertOptions) => Promise<SweetAlertResult>;
}

/**
 * Builds a toast helper whose SweetAlert2 bundle is only fetched on the first
 * `fire()`, so importing this module costs nothing at page load.
 */
export function createToast(extra?: SweetAlertOptions): LazyToast {
  let instance: Promise<SwalInstance> | null = null;

  const resolve = () => {
    if (!instance) {
      instance = getSwal().then((Swal) =>
        Swal.mixin({ ...TOAST_BASE, ...extra } as SweetAlertOptions)
      );
    }
    return instance;
  };

  return {
    fire: (options?: SweetAlertOptions) => resolve().then((toast) => toast.fire(options)),
  };
}

const defaultToast = createToast();

export function showSuccess(message: string) {
  return defaultToast.fire({ icon: "success", title: message });
}

export function showError(message: string) {
  return defaultToast.fire({ icon: "error", title: message, iconColor: "#f87171" });
}

export function showInfo(message: string) {
  return defaultToast.fire({ icon: "info", title: message, iconColor: "#60a5fa" });
}

/**
 * Drop-in stand-in for the `sweetalert2` default export that defers the
 * library download until `fire()` is actually called.
 */
export const lazySwal = {
  fire: (options?: SweetAlertOptions) => getSwal().then((Swal) => Swal.fire(options)),
};
