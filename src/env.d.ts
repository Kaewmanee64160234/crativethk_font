/// <reference types="vite/client" />

declare namespace NodeJS {
    interface ProcessEnv {
      VUE_APP_GOOGLE_CLIENT_ID: string;
    }
  }
  
  interface ImportMetaEnv {
    readonly VUE_APP_GOOGLE_CLIENT_ID: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }