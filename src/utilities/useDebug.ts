export const isDebug = () => {
  return localStorage.getItem('useDebug') === 'true' ? { useDebug: true } : {}
}
