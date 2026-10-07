/**
 * sweetalert2 is ~70KB gzipped and only ever needed after a user action
 * (confirm dialogs, toasts). Importing it eagerly bloats every page bundle,
 * so we load it on first use and cache the module for later calls.
 */
type SwalModule = typeof import("sweetalert2").default;

let swalPromise: Promise<SwalModule> | null = null;

export function getSwal(): Promise<SwalModule> {
  if (!swalPromise) {
    swalPromise = import("sweetalert2").then((mod) => mod.default);
  }
  return swalPromise;
}
