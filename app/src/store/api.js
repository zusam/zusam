import { atom } from "nanostores";

export const $api = atom({});

export function updateApi(api) {
  $api.set(api);
}
