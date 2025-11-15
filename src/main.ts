import { createApp } from 'vue'
import { createPinia } from 'pinia' // Import Pinia
import router from './router' // Import router
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia()) // Use Pinia
app.use(router) // Use router
app.mount('#app')
