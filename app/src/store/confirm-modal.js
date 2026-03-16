import { atom } from "nanostores";

const DEFAULT_CONFIRM = {
  open: false,
  title: "",
  message: "",
  confirmText: "",
  cancelText: "",
  variant: "danger", // Bootstrap button variant
  resolve: null
};

export const $confirm = atom(DEFAULT_CONFIRM);

export function confirm(options) {
  const opts = typeof options === "string" ? { message: options } : options;

  return new Promise((resolve) => {
    $confirm.set({
      ...DEFAULT_CONFIRM,
      ...opts,
      open: true,
      resolve
    });
  });
}

export function closeConfirm(result) {
  const { resolve } = $confirm.get();
  $confirm.set(DEFAULT_CONFIRM);
  if (resolve) resolve(result);
}