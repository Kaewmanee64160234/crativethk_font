<template>
  <v-app-bar scroll-behavior="elevate" color="#3051AC">
    <v-icon style="margin-left: 1%" size="40">mdi-view-grid</v-icon>
    <v-app-bar-title>ระบบจัดการการเข้าเรียนของนิสิต</v-app-bar-title>
    <v-app-bar-title
      style="text-align: right; margin-right: 2%"
      v-if="userStore.currentUser?.teacherId"
    >
      อาจารย์:
      {{
        userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName
      }}</v-app-bar-title
    >
    <v-app-bar-title
      style="text-align: right; margin-right: 2%"
      v-if="userStore.currentUser?.studentId"
    >
      นิสิต:
      {{
        userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName
      }}</v-app-bar-title
    >
  </v-app-bar>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
const userStore = useUserStore();
</script>
