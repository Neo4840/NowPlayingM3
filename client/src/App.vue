<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header>
      <md-elevated-button>Material3 Last.fm</md-elevated-button>
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
}
main {
  flex: 1;
  padding: 24px;
}
</style>