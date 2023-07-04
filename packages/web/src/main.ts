import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import './style.css'
import App from './App.vue'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'dark',
    },
})

createApp(App).use(vuetify).mount('#app')
