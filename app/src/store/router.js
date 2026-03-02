import { atom } from "nanostores";

export const $router = atom({
  route: "",
  id: "",
  action: "",
  backUrl: "",
  entityType: "",
  search: "",
  entity: {},
});

export function updateRouter(newState) {
  $router.set({
    ...$router.get(),
    entity: newState.entity,
    backUrl: newState.backUrl,
  });
}
