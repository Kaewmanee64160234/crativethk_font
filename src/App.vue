<template>
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
const userStore = useUserStore();
// get user data fro local storage when on mounted
onMounted(() => {
  userStore.getUserFromLocalStorage();
});
</script>

<style >
/* use font kanit */
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300&display=swap');
body {
  font-family: 'Kanit', sans-serif;
}
</style>
