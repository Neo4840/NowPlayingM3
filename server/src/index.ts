import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

// Last.fm API configuration
const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/'

// Persistent storage for user settings
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SETTINGS_FILE = path.join(__dirname, 'settings.json')

// Load settings from file
const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8')
      const settings = JSON.parse(data)
      console.log('Settings loaded from file:', {
        apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 4)}...` : 'missing',
        username: settings.username
      })
      return settings
    }
  } catch (error) {
    console.error('Failed to load settings from file:', error)
  }
  // Default settings from environment or empty
  return {
    apiKey: process.env.LASTFM_API_KEY || '',
    username: process.env.LASTFM_USERNAME || '',
  }
}

// Save settings to file
const saveSettings = (settings: any) => {
  try {
    const data = JSON.stringify(settings, null, 2)
    fs.writeFileSync(SETTINGS_FILE, data, 'utf-8')
    console.log('Settings saved to file:', {
      apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 4)}...` : 'missing',
      username: settings.username
    })
  } catch (error) {
    console.error('Failed to save settings to file:', error)
    throw error
  }
}

// Initialize user settings
let userSettings = loadSettings()

// Validate settings endpoint
app.get('/api/settings', (req, res) => {
  res.json(userSettings)
})

app.post('/api/settings', (req, res) => {
  const { apiKey, username } = req.body
  console.log('Updating settings:', {
    apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing',
    username
  })

  // Update in-memory settings
  if (apiKey !== undefined) userSettings.apiKey = apiKey
  if (username !== undefined) userSettings.username = username

  // Save to file
  try {
    saveSettings(userSettings)
    res.json({ success: true })
  } catch (error) {
    console.error('Failed to save settings:', error)
    res.status(500).json({ error: 'Failed to save settings' })
  }
})

// Fetch now playing track from Last.fm
app.get('/api/now-playing', async (req, res) => {
  const { apiKey, username } = userSettings

  console.log('Now playing request with settings:', {
    apiKey: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing',
    username
  })

  if (!apiKey || !username) {
    return res.status(400).json({
      error: 'Missing API key or username. Please configure in settings.',
    })
  }

  try {
    const response = await axios.get(LASTFM_API_BASE, {
      params: {
        method: 'user.getrecenttracks',
        user: username,
        api_key: apiKey,
        format: 'json',
        limit: 1,
      },
    })

    const recentTracks = response.data.recenttracks?.track
    if (!recentTracks || recentTracks.length === 0) {
      return res.json({
        nowPlaying: false,
        message: 'No recent tracks found.',
      })
    }

    const track = recentTracks[0]
    const nowPlaying = track['@attr']?.nowplaying === 'true'

    const trackData = {
      nowPlaying,
      name: track.name,
      artist: track.artist?.['#text'] || track.artist?.name || 'Unknown Artist',
      album: track.album?.['#text'] || track.album?.name || 'Unknown Album',
      image: track.image?.[2]?.['#text'] || track.image?.[1]?.['#text'] || '',
      url: track.url,
      timestamp: track.date?.uts ? parseInt(track.date.uts) : undefined,
    }

    res.json(trackData)
  } catch (error: any) {
    console.error('Last.fm API error:', error.response?.data || error.message)
    const status = error.response?.status || 500
    const message = error.response?.data?.message || 'Failed to fetch from Last.fm'
    res.status(status).json({ error: message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})