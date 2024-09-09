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

//function click to the ConfirmRejectView.vue
function click() {
  router.push('/confirmRejectNotic');
}
</script>

<template>
  <v-app-bar scroll-behavior="elevate" color="#3051AC">
    <img src="../../assets/BUU_logo.png" alt="Your Image" style="margin-left: 1%; width: 40px; height: 40px;" />
    <v-app-bar-title>ระบบจัดการการเข้าเรียนของนิสิต</v-app-bar-title>

    <div style="display: flex; align-items: center; margin-right: 2%;">
      <v-menu v-model="showNotifications" offset-y bottom origin="top right" max-width="300">
  <template v-slot:activator="{ props }" v-if="userStore.currentUser?.role == 'อาจารย์'">
    <!-- Bell Icon Button -->
    <v-btn icon v-bind="props">
      <v-icon>mdi-bell-outline</v-icon>
    </v-btn>
  </template>

  <!-- Notification List -->
  <v-card max-width="300px" min-width="300px">
    <v-card-title class="text-h6">
      Notifications
    </v-card-title>
    <v-divider></v-divider>
    
    <!-- If notifications are available -->
    <v-list v-if="notiforupdateStore.notiforupdates.length > 0">
      <v-list-item
        v-for="(notification, index) in notiforupdateStore.notiforupdates"
        :key="index"
        @click="click()"
      >
        <v-list-item-avatar>
          <!-- Optional Avatar/Icon for each notification -->
          <v-icon color="primary">mdi-account</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <!-- User's Name -->
          <v-list-item-title>
            {{ notification.userSender?.firstName + ' ' + notification.userSender?.lastName }}
          </v-list-item-title>

          <!-- Notification Date -->
          <v-list-item-subtitle>
            {{ notification.createdDate ? new Date(notification.createdDate).toLocaleString() : 'Date not available' }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <!-- Optional Icon for Each Notification -->
        <v-list-item-icon>
          <v-icon color="secondary">mdi-message-text-outline</v-icon>
        </v-list-item-icon>
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
