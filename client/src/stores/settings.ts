import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface Settings {
  apiKey: string
  username: string
  theme: 'light' | 'dark' | 'auto'
}

export const useSettingsStore = defineStore('settings', () => {
  const apiKey = ref(localStorage.getItem('lastfm_api_key') || '')
  const username = ref(localStorage.getItem('lastfm_username') || '')
  const theme = ref<'light' | 'dark' | 'auto'>(localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'light')

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      // Send to server
      console.log('Saving settings to server:', {
        apiKey: newSettings.apiKey ? `${newSettings.apiKey.substring(0, 4)}...` : 'missing',
        username: newSettings.username
      })
      await axios.post('/api/settings', newSettings)

      // Update local state only if server request succeeds
      if (newSettings.apiKey !== undefined) {
        apiKey.value = newSettings.apiKey
        localStorage.setItem('lastfm_api_key', newSettings.apiKey)
      }
      if (newSettings.username !== undefined) {
        username.value = newSettings.username
        localStorage.setItem('lastfm_username', newSettings.username)
      }
    } catch (error) {
      console.error('Failed to save settings to server:', error)
      // Optionally keep local storage anyway? We'll still store locally
      // but throw error to be handled by UI
      throw error
    }
  }

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }

  // Listen for system preference changes for auto mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemChange = () => {
    if (theme.value === 'auto') {
      applyTheme('auto')
    }
  }
  mediaQuery.addEventListener('change', handleSystemChange)

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const nextTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
  }

  const isDark = computed(() => {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    // auto mode
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply initial theme
  applyTheme(theme.value)

  return {
    apiKey,
    username,
    theme,
    setTheme,
    toggleTheme,
    isDark,
    updateSettings,
  }
})