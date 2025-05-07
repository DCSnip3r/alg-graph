import { createApp } from 'vue'
import { createPinia } from 'pinia' // Import Pinia
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia()) // Use Pinia
app.mount('#app')
