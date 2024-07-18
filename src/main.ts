import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import vue3GoogleLogin from "vue3-google-login";

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as vuetifyComponents from 'vuetify/components';
import * as vuetifyDirectives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';  // Ensure this is correctly imported
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { VTimePicker } from "vuetify/labs/VTimePicker";

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  components: {
    ...vuetifyComponents,
    VTimePicker,
  },
  directives: vuetifyDirectives,
});

createApp(App)
  .use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID,
  })
  .use(router)
  .use(vuetify)
  .use(createPinia())
  .mount('#app');
