<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useNowPlayingStore } from '../stores/nowPlaying'
import { useSettingsStore } from '../stores/settings'
import NowPlayingCard from '../components/NowPlayingCard.vue'

const store = useNowPlayingStore()
const settingsStore = useSettingsStore()
const loading = ref(false)
const error = ref<string | null>(null)
const refreshIntervalId = ref<number | null>(null)
const REFRESH_INTERVAL_MS = 15000 // 15 seconds

const hasConfiguration = computed(() => {
  return !!settingsStore.apiKey && !!settingsStore.username
})

const fetchNowPlaying = async (isAutoRefresh = false) => {
  console.log('fetchNowPlaying called', { isAutoRefresh, loading: loading.value })
  if (!isAutoRefresh) {
    loading.value = true
    error.value = null
    console.log('manual refresh - loading set to true')
  }
  try {
    await store.fetchNowPlaying()
    console.log('fetch succeeded')
  } catch (err) {
    console.error('fetch error:', err)
    if (!isAutoRefresh) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch now playing'
    } else {
      // 自动刷新失败静默处理，仅记录到控制台
      console.error('Auto-refresh failed:', err)
    }
  } finally {
    if (!isAutoRefresh) {
      loading.value = false
      console.log('manual refresh - loading set to false')
    }
  }
}

const startPolling = () => {
  if (!hasConfiguration.value) {
    console.log('Skipping polling due to missing configuration')
    return
  }
  if (refreshIntervalId.value) {
    window.clearInterval(refreshIntervalId.value)
  }
  refreshIntervalId.value = window.setInterval(() => fetchNowPlaying(true), REFRESH_INTERVAL_MS)
}

const stopPolling = () => {
  if (refreshIntervalId.value) {
    window.clearInterval(refreshIntervalId.value)
    refreshIntervalId.value = null
  }
}

onMounted(() => {
  if (hasConfiguration.value) {
    fetchNowPlaying()
    startPolling()
  } else {
    error.value = 'API key or username not configured. Please go to Settings to configure.'
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="home">
    <md-elevated-card class="main-card">
      <div class="card-header">
        <div class="header-left">
          <h1 class="title">Now Playing</h1>
        </div>
        <md-text-button @click="fetchNowPlaying(false)" :disabled="loading">
          <span class="material-symbols-outlined" :class="{ 'rotate': loading }">
            refresh
          </span>
          {{ loading ? 'Refreshing' : 'Refresh' }}
        </md-text-button>
      </div>

      <div class="card-body">
        <div v-if="loading" class="loading">
          <md-circular-progress indeterminate></md-circular-progress>
          <p>Loading track information...</p>
        </div>

        <div v-else-if="error" class="error">
          <div class="error-content">
            <span class="material-symbols-outlined">error</span>
            <h2>Error</h2>
            <p>{{ error }}</p>
            <md-filled-tonal-button @click="fetchNowPlaying(false)">Retry</md-filled-tonal-button>
          </div>
        </div>

        <div v-else-if="store.nowPlaying" class="now-playing">
          <NowPlayingCard :track="store.nowPlaying" />
        </div>

        <div v-else class="empty">
          <div class="empty-content">
            <span class="material-symbols-outlined">music_note</span>
            <h2>No track playing</h2>
            <p>Start playing music on your Last.fm account to see it here.</p>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <md-filled-button @click="$router.push('/settings')">
          <span class="material-symbols-outlined">settings</span>
          Settings
        </md-filled-button>
      </div>
    </md-elevated-card>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
.main-card {
  padding: 32px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.refresh-info {
  font: var(--md-sys-typescale-body-small);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}
.title {
  font: var(--md-sys-typescale-headline-large);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}
.card-body {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
}
.error, .empty {
  display: flex;
  justify-content: center;
  padding: 32px;
}
.error-content, .empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.now-playing {
  margin: 0;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--md-sys-color-outline);
}
.material-symbols-outlined {
  vertical-align: middle;
}
.rotate {
  display: inline-block;
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>