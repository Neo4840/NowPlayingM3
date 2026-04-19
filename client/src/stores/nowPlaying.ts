import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Track {
  name: string
  artist: string
  album: string
  image: string
  url: string
  nowPlaying: boolean
  timestamp?: number
}

export const useNowPlayingStore = defineStore('nowPlaying', () => {
  const nowPlaying = ref<Track | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const fetchNowPlaying = async () => {
    // Check if API key and username are configured
    const apiKey = localStorage.getItem('lastfm_api_key')
    const username = localStorage.getItem('lastfm_username')
    if (!apiKey || !username) {
      const error = new Error('API key or username not configured. Please go to Settings to configure.')
      console.error('Missing configuration:', error.message)
      throw error
    }

    const maxRetries = 3
    const retryDelay = 1000 // 1 second
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get('/api/now-playing', {
          timeout: 10000, // 10 second timeout
        })
        const data = response.data
        if (data.nowPlaying) {
          nowPlaying.value = {
            name: data.name,
            artist: data.artist,
            album: data.album,
            image: data.image,
            url: data.url,
            nowPlaying: true,
            timestamp: data.timestamp,
          }
        } else {
          nowPlaying.value = null
        }
        lastUpdated.value = new Date()
        return // success, exit function
      } catch (error: any) {
        lastError = error
        console.error(`Attempt ${attempt} failed to fetch now playing:`, error)

        // Determine if we should retry
        const isNetworkError = !error.response
        const isServerError = error.response?.status >= 500
        const isClientError = error.response?.status >= 400 && error.response?.status < 500

        // Do not retry on client errors (e.g., 400, 401, 404)
        if (isClientError) {
          console.error('Client error, not retrying:', error.response?.status)
          break
        }

        // Retry on network errors or server errors
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    // All retries exhausted
    console.error('All retries failed:', lastError)
    throw lastError
  }

  return {
    nowPlaying,
    lastUpdated,
    fetchNowPlaying,
  }
})