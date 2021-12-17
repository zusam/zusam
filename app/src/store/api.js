export const apiStore = store => {
  store.on('@init', () => ({api: {}}))

  store.on('api/update', (state, api) => {
    return {api};
  })
}
