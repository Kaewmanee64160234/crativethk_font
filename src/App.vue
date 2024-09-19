<template>
  <Loader v-if="loaderStore.loader" />

  <component
    :is="$route.meta.layout === 'mainLayout' ? MainLayout : FullLayout"
  ></component>
  <MainLayout></MainLayout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import FullLayout from "./components/layout/FullLayout.vue";
import MainLayout from "./components/layout/MainLayout.vue";
import { useUserStore } from "./stores/user.store";
import { useLoaderStore } from "./stores/loader.store";
const userStore = useUserStore();
const loaderStore = useLoaderStore();
// get user data fro local storage when on mounted
onMounted(() => {
  userStore.getCurrentUser();
});
</script>

<style >
/* use font kanit */
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300&display=swap');
body {
  font-family: 'Kanit', sans-serif;
}
</style>
