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

// Last.fm API error codes
const LASTFM_ERRORS: Record<number, string> = {
  2: 'Invalid service - This service does not exist',
  3: 'Invalid Method - No method with that name in this package',
  4: 'Authentication Failed - You do not have permissions to access the service',
  5: 'Invalid format - This service doesn\'t exist in that format',
  6: 'Invalid parameters - Your request is missing a required parameter',
  7: 'Invalid resource specified',
  8: 'Operation failed - Something else went wrong',
  9: 'Invalid session key - Please re-authenticate',
  10: 'Invalid API key - You must be granted a valid key by last.fm',
  11: 'Service Offline - This service is temporarily offline. Try again later.',
  13: 'Invalid method signature supplied',
  16: 'There was a temporary error processing your request. Please try again',
  26: 'Suspended API key - Access for your account has been suspended, please contact Last.fm',
  29: 'Rate limit exceeded - Your IP has made too many requests in a short period',
};
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
      timeout: 10000,
    })

    // Check for Last.fm API error
    if (response.data.error) {
      const errorCode = response.data.error;
      const errorMessage = response.data.message || LASTFM_ERRORS[errorCode] || 'Unknown Last.fm error';
      console.error(`Last.fm API error ${errorCode}: ${errorMessage}`);
      // Special handling for suspended API key
      if (errorCode === 26) {
        return res.status(403).json({
          error: 'API key suspended. Please update your Last.fm API key in settings.',
          errorCode,
        });
      }
      return res.status(400).json({
        error: errorMessage,
        errorCode,
      });
    }

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
  const { apiKey, username } = userSettings;
  const lastfmConfigured = !!(apiKey && username);
  const settingsFileExists = fs.existsSync(SETTINGS_FILE);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    lastfm: {
      configured: lastfmConfigured,
      hasApiKey: !!apiKey,
      hasUsername: !!username,
    },
    settings: {
      fileExists: settingsFileExists,
      path: SETTINGS_FILE,
    },
    server: {
      port: PORT,
      uptime: process.uptime(),
    },
  });
})

// Global error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Uncaught exception and rejection handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})