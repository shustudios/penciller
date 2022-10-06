import { createApp } from 'vue'
import App from './App.vue'
import Ui from '../index.js'

import './assets/styles/variables.css'
import './assets/styles/reset.css'
import './assets/styles/layout.css'

const app = createApp(App)

app.use(Ui)
app.mount('#app')
