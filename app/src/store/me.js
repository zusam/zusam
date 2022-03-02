//import { http } from "/src/core";

export const meStore = store => {
  store.on("@init", () => ({me: {}}));

  store.on("me/update", (state, me) => {
    return {me};
  });
};
