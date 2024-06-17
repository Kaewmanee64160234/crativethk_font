<script setup lang="ts">
import { useUserStore } from "@/stores/user.store";
const userStore = useUserStore();
</script>
<template>
  <v-app-bar scroll-behavior="elevate" color="#3051AC">
    <v-icon style="margin-left: 1%" size="40">mdi-view-grid</v-icon>
<<<<<<< HEAD
    <v-app-bar-title>ระบบเช็คชื่อเข้าเรียน</v-app-bar-title>
    <v-app-bar-title style="text-align: right; margin-right: 2%"
      >{{userStore.currentUser?.firstName}}  {{ userStore.currentUser?.lastName }}</v-app-bar-title
=======
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
>>>>>>> 42877e21a02e95af80717b74c7645fa7e8c74664
    >
  </v-app-bar>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
const userStore = useUserStore();
</script>
