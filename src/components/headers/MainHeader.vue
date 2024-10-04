<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { useNotiforupdate } from '@/stores/notiforUpdate.store';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const notiforupdateStore = useNotiforupdate();
const showNotifications = ref(false);
const router = useRouter();

onMounted(async () => {
  await notiforupdateStore.fetchAllNotifications(); // Fetch notifications on mount
  await notiforupdateStore.getNotificationByUserReceive(userStore.currentUser!);
});

// Function to navigate to ConfirmRejectView with notification ID
function click(noticId: number) {
  router.push(`/confirmRejectNotic/${noticId}`);
}
</script>

<template>
  <v-app-bar scroll-behavior="elevate" color="#3051AC">
    <img src="../../assets/BUU_logo.png" alt="Your Image" style="margin-left: 1%; width: 40px; height: 40px;" />
    <v-app-bar-title>ระบบจัดการการเข้าเรียนของนิสิต</v-app-bar-title>

    <div style="display: flex; align-items: center; margin-right: 2%;">
      <v-menu v-model="showNotifications" offset-y bottom origin="top right" max-width="300"
        v-if="userStore.currentUser?.role == 'อาจารย์'">
        <template v-slot:activator="{ props }">
          <!-- Bell Icon Button with Notification Count -->
          <v-btn icon v-bind="props">
            <v-badge color="red" v-if="notiforupdateStore.notiforupdates.length > 0"
              :content="notiforupdateStore.notiforupdates.length" overlap>
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-outline</v-icon> <!-- Bell Icon without notification count -->
          </v-btn>
        </template>

        <!-- Notification List -->
        <v-card class="bg-surface-variant rounded-lg mx-auto" max-width="300px" min-width="300px">
          <v-card-title class="text-h9" style="background-color: lightgray; color: black;">การแจ้งเตือน</v-card-title>
          <v-divider></v-divider>

          <!-- If notifications are available -->
          <v-list v-if="notiforupdateStore.notiforupdates.length > 0">
            <v-list-item v-for="(notification, index) in notiforupdateStore.notiforupdates" :key="index"
              @click="notification.notiforupdateId !== undefined && click(notification.notiforupdateId)">
              <v-list-item-content>
                <!-- User's Name -->
                <v-list-item-title>
                  {{ notification.userSender?.studentId + ' ' + notification.userSender?.firstName + ' ' +
                    notification.userSender?.lastName }}
                </v-list-item-title>

                <!-- Notification Date -->
                <v-list-item-subtitle>
                  {{ notification.createdDate ? new Date(notification.createdDate).toLocaleDateString('th-TH') + ' ' +
                    new
                      Date(notification.createdDate).toLocaleTimeString('th-TH', {
                        hour: '2-digit', minute: '2-digit',
                  hour12: false
                  }) : 'Date not available' }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <!-- No Notifications Message -->
          <v-list v-else>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text-center">No notifications</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <v-app-bar-title style="margin: 0;">
        <span v-if="userStore.currentUser?.role === 'อาจารย์'">
<<<<<<< HEAD
          อาจารย์: {{ userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName }}
=======
          อาจารย์: {{
        userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName
      }}
>>>>>>> aff805ce4063ae3e6f9ee4e80e1aa26fb4022b32
        </span>
        <span v-if="userStore.currentUser?.studentId">
          นิสิต: {{ userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName }}
        </span>
        <span v-if="userStore.currentUser?.role === 'แอดมิน'">
          แอดมิน: {{ userStore.currentUser?.firstName + " " + userStore.currentUser?.lastName }}
        </span>
      </v-app-bar-title>
    </div>
  </v-app-bar>
</template>
