// import {WxPay} from 'yungouos-pay-uniapp-sdk'
// #ifdef VUE3
import App from './App.vue'
import {createSSRApp} from 'vue'
import Store from './vuex/store.js'
export function createApp() {
  const app = createSSRApp(App)
  app.use(Store)
  return {
    app
  }
}
// #endif