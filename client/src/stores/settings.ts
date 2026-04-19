import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Settings {
  apiKey: string
  username: string
}

export const useSettingsStore = defineStore('settings', () => {
  const apiKey = ref(localStorage.getItem('lastfm_api_key') || '')
  const username = ref(localStorage.getItem('lastfm_username') || '')

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

  return {
    apiKey,
    username,
    updateSettings,
  }
})