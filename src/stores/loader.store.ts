// src/stores/user.ts
import { defineStore } from "pinia";
import { ref } from "vue";


export const useLoaderStore = defineStore("loaderStore", () => {

    const loader = ref<boolean>(false);


  return {
    loader
  };
});