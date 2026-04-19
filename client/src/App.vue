<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div id="app">
    <header>
      <md-elevated-button @click="goHome">NowPlayingM3</md-elevated-button>
      <ThemeToggle />
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
header {
  padding: 16px;
  border-bottom: 1px solid var(--md-sys-color-outline);
  background-color: var(--md-sys-color-surface);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

md-elevated-button {
  cursor: pointer;
}

main {
  flex: 1;
  padding: 24px;
}
</style>