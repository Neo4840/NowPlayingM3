import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import '@material/web/all.js'

// Debug: check if Material components are loaded
console.log('Material components loaded:', {
  'md-filled-text-field': customElements.get('md-filled-text-field'),
  'md-elevated-card': customElements.get('md-elevated-card'),
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')