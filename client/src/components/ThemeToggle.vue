<template>
  <div class="theme-toggle">
    <md-switch
      :selected="isDark"
      @change="toggleTheme"
      aria-label="深色模式"
    >
      深色模式
    </md-switch>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
const isDark = settings.isDark
const toggleTheme = settings.toggleTheme
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
}
</style>