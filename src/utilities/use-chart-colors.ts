import {useAppConfiguration} from "@/store";

export function useChartColors() {
  const { theme } = useAppConfiguration()

  const isDark = theme === 'dark'
  const textColor = isDark ? 'rgb(156 163 175 )' : ''
  const gridColor = isDark ? 'rgb(156 163 175 / 0.2)' : 'rgb(156 163 175 / 0.3)'

  return [textColor, gridColor]
}
