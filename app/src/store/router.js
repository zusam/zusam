export const routerStore = store => {
  store.on('@init', () => ({
    route: "",
    id: "",
    action: "",
    backUrl: "",
    entityType: "",
    search: "",
    entity: {},
  }))

  store.on('router/update', (_, newState) => {
    return {
      entity: newState.entity,
      backUrl: newState.backUrl,
    };
  })
}
