<script setup lang="ts">
import { computed } from 'vue'
import type { Track } from '../stores/nowPlaying'

const props = defineProps<{
  track: Track
}>()

const formattedTime = computed(() => {
  if (!props.track.timestamp) return ''
  const date = new Date(props.track.timestamp * 1000)
  return date.toLocaleTimeString()
})
</script>

<template>
  <md-elevated-card class="now-playing-card">
    <div class="card-content">
      <div class="album-art">
        <img v-if="track.image" :src="track.image" :alt="track.album" />
        <div v-else class="placeholder">
          <span class="material-symbols-outlined">music_note</span>
        </div>
      </div>
      <div class="track-info">
        <h2 class="track-name">{{ track.name }}</h2>
        <p class="artist">{{ track.artist }}</p>
        <p class="album">{{ track.album }}</p>
        <div class="metadata">
          <span class="material-symbols-outlined">play_circle</span>
          <span class="now-playing-label">Now Playing</span>
          <span class="timestamp" v-if="formattedTime">{{ formattedTime }}</span>
        </div>
      </div>
      <div class="actions">
        <md-filled-tonal-button :href="track.url" target="_blank">
          <span class="material-symbols-outlined">open_in_new</span>
          View on Last.fm
        </md-filled-tonal-button>
      </div>
    </div>
  </md-elevated-card>
</template>

<style scoped>
.now-playing-card {
  width: 100%;
}
.card-content {
  display: flex;
  padding: 24px;
  gap: 24px;
  align-items: center;
}
.album-art {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--md-sys-color-surface-container-high);
}
.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-primary);
}
.placeholder .material-symbols-outlined {
  font-size: 48px;
}
.track-info {
  flex: 1;
}
.track-name {
  font: var(--md-sys-typescale-headline-medium);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 8px;
}
.artist {
  font: var(--md-sys-typescale-title-large);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 4px;
}
.album {
  font: var(--md-sys-typescale-body-large);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0 0 12px;
}
.metadata {
  display: flex;
  align-items: center;
  gap: 8px;
  font: var(--md-sys-typescale-label-large);
  color: var(--md-sys-color-primary);
}
.now-playing-label {
  font-weight: 500;
}
.timestamp {
  color: var(--md-sys-color-on-surface-variant);
  margin-left: auto;
}
.actions {
  flex-shrink: 0;
}
.material-symbols-outlined {
  vertical-align: middle;
  margin-right: 4px;
}
</style>