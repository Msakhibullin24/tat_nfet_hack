import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { quasar, plugins, config } from './plugins/quasar'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './assets/global.sass'

createApp(App)
  .use(router)
  .use(quasar, {plugins, config})
  .use(VueQueryPlugin)
  .mount('#app')
