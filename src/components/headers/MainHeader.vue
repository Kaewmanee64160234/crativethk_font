<template>
  <v-app-bar scroll-behavior="elevate" color="#3051AC">
    <img src="../../assets/BUU_logo.png" alt="Your Image" style="margin-left: 1%; width: 40px; height: 40px;" />
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
