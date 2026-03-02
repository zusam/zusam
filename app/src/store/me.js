import { atom } from "nanostores";

export const $me = atom({});

export function updateMe(me) {
  $me.set(me);
}

export function resetMe() {
  $me.set({});
}
