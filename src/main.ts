import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import vue3GoogleLogin from "vue3-google-login";

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as vuetifyComponents from 'vuetify/components';
import * as vuetifyDirectives from 'vuetify/directives';
// Import the Material Design Icons CSS
import '@mdi/font/css/materialdesignicons.css';
import { VTimePicker } from "vuetify/lib/labs/components.mjs";

const vuetify = createVuetify({
  components: {
    ...vuetifyComponents, // ใช้ spread operator เพื่อแทรก components ทั้งหมดที่นำเข้ามา
    VTimePicker, // เพิ่ม VTimePicker เข้าไปใน components
  },
  directives: vuetifyDirectives, // ใช้ vuetifyDirectives โดยตรง
});

createApp(App)
  .use(vue3GoogleLogin, {
    clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
    
  })
  .use(router)
  .use(vuetify)
  .use(createPinia())
  .mount('#app');
