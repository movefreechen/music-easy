import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'

import '@mdi/font/css/materialdesignicons.css'
import './style.css'
import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'dark',
    },
})

const pinia = createPinia()

createApp(App).use(pinia).use(vuetify).use(router).mount('#app')
