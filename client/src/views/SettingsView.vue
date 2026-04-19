<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useRouter } from 'vue-router'

const store = useSettingsStore()
const router = useRouter()
const apiKey = ref(store.apiKey)
const username = ref(store.username)
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

const onApiKeyInput = (e: Event) => {
  apiKey.value = (e.target as HTMLInputElement).value
}
const onUsernameInput = (e: Event) => {
  username.value = (e.target as HTMLInputElement).value
}

const saveSettings = async () => {
  saveStatus.value = 'saving'
  try {
    await store.updateSettings({
      apiKey: apiKey.value,
      username: username.value,
    })
    saveStatus.value = 'saved'
    // Redirect to home after a short delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    saveStatus.value = 'error'
    console.error('Failed to save settings:', error)
  }
}
</script>

<template>
  <div class="settings">
    <h1 class="title">Settings</h1>

    <md-elevated-card class="card">
      <div class="card-content">
        <h2 class="subtitle">Last.fm API Configuration</h2>
        <p class="description">
          You need a Last.fm API key and a username to fetch now playing data.
          <br>
          <a href="https://www.last.fm/api/account/create" target="_blank">Get your API key here</a>
        </p>

        <div class="form">
          <md-filled-text-field
            label="API Key"
            type="password"
            :value="apiKey"
            @input="onApiKeyInput"
            :disabled="saveStatus === 'saving'"
            class="field"
          ></md-filled-text-field>

          <md-filled-text-field
            label="Username"
            :value="username"
            @input="onUsernameInput"
            :disabled="saveStatus === 'saving'"
            class="field"
          ></md-filled-text-field>

          <div class="actions">
            <md-text-button @click="router.push('/')">
              Cancel
            </md-text-button>
            <md-filled-button @click="saveSettings" :disabled="saveStatus === 'saving'">
              <span v-if="saveStatus === 'saving'">Saving...</span>
              <span v-else>Save</span>
            </md-filled-button>
          </div>

          <div v-if="saveStatus === 'saved'" class="status success">
            <span class="material-symbols-outlined">check_circle</span>
            Settings saved successfully. Redirecting...
          </div>
          <div v-else-if="saveStatus === 'error'" class="status error">
            <span class="material-symbols-outlined">error</span>
            Failed to save settings. Please check your connection.
          </div>
        </div>
      </div>
    </md-elevated-card>
  </div>
</template>

<style scoped>
.settings {
  max-width: 600px;
  margin: 0 auto;
}
.title {
  font: var(--md-sys-typescale-headline-large);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 24px;
}
.card {
  margin-bottom: 24px;
}
.card-content {
  padding: 32px;
}
.subtitle {
  font: var(--md-sys-typescale-headline-medium);
  color: var(--md-sys-color-on-surface);
  margin-bottom: 8px;
}
.description {
  font: var(--md-sys-typescale-body-medium);
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 24px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field {
  width: 100%;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
.status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font: var(--md-sys-typescale-body-medium);
}
.success {
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-primary);
}
.error {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}
.material-symbols-outlined {
  font-size: 20px;
}
</style>