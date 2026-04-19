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
    try {
      const response = await axios.get('/api/now-playing')
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
    } catch (error) {
      console.error('Failed to fetch now playing:', error)
      throw error
    }
  }

  return {
    nowPlaying,
    lastUpdated,
    fetchNowPlaying,
  }
})