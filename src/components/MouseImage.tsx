import { useTheme } from './ThemeProvider'
import darkMouse from '@/assets/dark-mouse.webp'
import lightMouse from '@/assets/light-mouse.webp'

type MouseImageProps = {
  className?: string
  alt?: string
}

export function MouseImage({ className = '', alt = 'Mouse' }: MouseImageProps) {
  const { theme } = useTheme()

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return <img src={isDark ? darkMouse : lightMouse} alt={alt} className={className} />
}
