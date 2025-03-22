import { createApp } from 'vue'
import router from '@/router.js'
import '@/style.css'
import App from '@/App.vue'
import toastPlugin from '@/plugins/toast.js'
import promptPlugin from '@/plugins/prompt.js'
import {createPinia} from "pinia"

const pinia = createPinia()

createApp(App)
    .use(router)
    .use(pinia)
    .use(toastPlugin)
    .use(promptPlugin)
    .mount('#app')