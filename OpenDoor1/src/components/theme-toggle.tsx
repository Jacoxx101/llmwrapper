'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    
    // Apply theme to document
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Don't render anything until after hydration
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm">
        <div className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleThemeToggle}>
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}