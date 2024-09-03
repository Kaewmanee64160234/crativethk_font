<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { ref } from 'vue';

const userStore = useUserStore();
const showNotifications = ref(false);
const notifications = ref([
  { title: "New Assignment", subtitle: "You have a new assignment due tomorrow." },
  { title: "Class Cancelled", subtitle: "Today's math class has been cancelled." },
  // Add more notifications here
]);

const handleNotificationClick = () => {
  showNotifications.value = !showNotifications.value;
  console.log('Notification clicked');
};
</script>

<template>
  <v-app-bar scroll-behavior="elevate" color="#3051AC">
    <img src="../../assets/BUU_logo.png" alt="Your Image" style="margin-left: 1%; width: 40px; height: 40px;" />
    <v-app-bar-title>ระบบจัดการการเข้าเรียนของนิสิต</v-app-bar-title>
    
    <div style="display: flex; align-items: center; margin-right: 2%;">
      <v-menu
        v-model="showNotifications"
        offset-y
        bottom
        origin="top right"
        max-width="300"
      >
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </template>
        
        <v-list>
          <v-list-item
            v-for="(notification, index) in notifications"
            :key="index"
          >
            <v-list-item-content>
              <v-list-item-title>{{ notification.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ notification.subtitle }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="notifications.length === 0">
            <v-list-item-content>
              <v-list-item-title>No notifications</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
      
      <v-app-bar-title style="margin: 0;">
        <span v-if="userStore.currentUser?.teacherId">
          อาจารย์: {{
            userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName
          }}
        </span>
        <span v-if="userStore.currentUser?.studentId">
          นิสิต: {{
            userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName
          }}
        </span>
        <span v-if="userStore.currentUser?.role === 'แอดมิน'">
          แอดมิน: {{
            userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName
          }}
        </span>
      </v-app-bar-title>
    </div>
  </v-app-bar>
</template>
