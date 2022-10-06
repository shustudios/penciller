import { createApp } from 'vue'
import App from './App.vue'
import Ui from '@shustudios/penciller'

const app = createApp(App)

app.use(Ui)
app.mount('#app')
