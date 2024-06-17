<template>
  <v-app-bar scroll-behavior="elevate" color="#E4F1FF">
    <v-icon style="margin-left: 1%" size="40">mdi-view-grid</v-icon>
    <v-app-bar-title>ระบบเช็คชื่อเข้าเรียน</v-app-bar-title>
    <v-app-bar-title style="text-align: right; margin-right: 2%"
      >{{userStore.currentUser?.firstName}}  {{ userStore.currentUser?.lastName }}</v-app-bar-title
    >
  </v-app-bar>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
const userStore = useUserStore();
</script>
