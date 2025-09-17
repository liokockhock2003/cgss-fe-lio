export const useTheme = () => {
  return localStorage.getItem('theme') ?? 'light'
}
