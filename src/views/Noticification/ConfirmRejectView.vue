<script lang="ts" setup>
import { useMessageStore } from '@/stores/message';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref, computed } from 'vue';
import * as faceapi from "face-api.js";
import { useRoute, useRouter } from 'vue-router';
import Loader from "@/components/loader/Loader.vue";
import { useNotiforupdate } from '@/stores/notiforUpdate.store';

const userStore = useUserStore();
const notiforupdateStore = useNotiforupdate();
const noticId = ref();
// const firstNotification = computed(() => notiforupdateStore.notiforupdates[0]);

//Notification find by UserId
const firstNotification = computed(() => {
  return notiforupdateStore.notiforupdates.find((notification) => notification.userReceive?.studentId === noticId.value);
});

const user = ref<User | undefined>(undefined);
const url = 'http://localhost:3000';
const imageUrls = ref<string[]>([]);
const imageUrls2 = ref<string[]>([]);
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const faceDescriptors = ref<Float32Array[]>([]);
const similarityScores = ref<number[]>([]);


const messageStore = useMessageStore();
onMounted(async () => {
  isLoading.value = true;
  try {
    //getNotificationById
    noticId.value = route.params.noticId as string;
    console.log("stdId", noticId.value);
    await notiforupdateStore.getNotiforupdateById(noticId.value);
    console.log("notiforupdateStore", notiforupdateStore.currentNotiforupdate);
    imageUrls.value = notiforupdateStore.currentNotiforupdate!.images!.map((image: string) => `${url}/notiforupdates/image/filename/${image}`);
    // imageUrls2 get by userId
    const userId = notiforupdateStore.currentNotiforupdate?.userSender?.userId;
    if (userId) {
      const response = await fetch(`${url}/users/${userId}/images`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch images for user ${userId}: ${errorData}`);
      }
      const data = await response.json();
      if (data.images) {
        const userImages = data.images.map((image: string) => `${url}/users/image/filename/${image}`);
        imageUrls2.value = [...imageUrls2.value, ...userImages];
        console.log("User's Previous Image URLs:", userImages);
      } else {
        console.warn(`No images found for user ${userId}`);
      }
    }


  } catch (error) {
    console.error('Error fetching notification images:', error);
  } finally {
    isLoading.value = false;
  }
});

// Calculate similarity between all face descriptors
const calculateSimilarity = () => {
  similarityScores.value = [];

  for (let i = 0; i < faceDescriptors.value.length - 1; i++) {
    for (let j = i + 1; j < faceDescriptors.value.length; j++) {
      const score = faceapi.euclideanDistance(faceDescriptors.value[i], faceDescriptors.value[j]);
      similarityScores.value.push(score);
    }
  }
};

//cancelNotice
const cancelNotice = async () => {
  try {
    if (notiforupdateStore.currentNotiforupdate) {
      const notiforupdateId = notiforupdateStore.currentNotiforupdate.notiforupdateId;
      if (notiforupdateId) {
        // Call the store method to update the notification status
        await notiforupdateStore.updateNotiforupdateReject(
          String(notiforupdateId),
          notiforupdateStore.currentNotiforupdate
        );
        // Update local state to reflect the status change
        notiforupdateStore.currentNotiforupdate.statusconfirmation = 'rejected';
      } else {
        throw new Error('Notification ID is undefined.');
      }
      messageStore.showInfo('Notification rejected successfully.');
      // Optionally, navigate to another route
      router.push('/courseManagement');
    } else {
      console.error('No notification to reject.');
    }
  } catch (error) {
    messageStore.showError('Failed to reject notification.');
    console.error('Error rejecting notice:', error);
  }
};

//confirmNotification
const confirmNotice = async () => {
  try {
    if (notiforupdateStore.currentNotiforupdate) {
      const notiforupdateId = notiforupdateStore.currentNotiforupdate.notiforupdateId;
      
      if (notiforupdateId) {
        // Call the store method to update the notification status
        await notiforupdateStore.updateNotiforupdateConfirm(
          String(notiforupdateId),
          notiforupdateStore.currentNotiforupdate
        );
        
        // Update local state to reflect the status change
        notiforupdateStore.currentNotiforupdate.statusconfirmation = 'confirmed';

        console.log(notiforupdateStore.currentNotiforupdate);
        
      } else {
        throw new Error('Notification ID is undefined.');
      }
      messageStore.showInfo('Notification confirmed successfully.');
      // Optionally, navigate to another route
      router.push('/courseManagement');
    } else {
      console.error('No notification to confirm.');
    }
  } catch (error) {
    messageStore.showError('Failed to confirm notification.');
    console.error('Error confirming notice:', error);
  }
};




</script>

<template>
  <v-container style="padding-top: 120px;">
    <v-card>
      <div v-if="isLoading" class="loader-overlay">
        <Loader></Loader>
      </div>
      <v-row>
        <v-col style="text-align: center;">
          <h1>ยืนยันการเปลี่ยนรูปนิสิต</h1>
        </v-col>
      </v-row>

      <!-- Check if notifications exist and show only the first one -->
      <v-row class="d-flex justify-center">
        <v-col cols="12" class="text-center">
          <h3>
            {{ notiforupdateStore.currentNotiforupdate?.userSender?.studentId }}
            {{ notiforupdateStore.currentNotiforupdate?.userSender?.firstName }}
            {{ notiforupdateStore.currentNotiforupdate?.userSender?.lastName }}
          </h3>
        </v-col>

        <!-- Display notification images -->
        <v-col cols="12" class="text-center">
          <h3>รูปนิสิตใหม่</h3>
        </v-col>
        <v-col v-for="(image, index) in imageUrls" :key="'notification-image-' + index" cols="2" md="2" lg="2"
          class="image-container">
          <v-img :src="image" aspect-ratio="1" class="rounded-lg ma-2 d-flex align-center justify-center">
          </v-img>
        </v-col>
      </v-row>

      <!-- Display User Images Below the Notification Images -->
      <v-row class="d-flex justify-center">
        <v-col cols="12" class="text-center">
          <h3>รูปนิสิตเดิม</h3>
        </v-col>
        <!-- {{  notiforupdateStore.currentNotiforupdate?.images }} -->

        <v-col v-for="(image, index) in imageUrls2" :key="'user-image-' + index" cols="2" md="2" lg="2"
          class="image-container">
          <v-img :src="image" aspect-ratio="1" class="rounded-lg ma-2 d-flex align-center justify-center">
          </v-img>
        </v-col>
      </v-row>
      <v-card-actions>
        <v-btn color="error" @click="cancelNotice">ปฎิเสธ</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="confirmNotice">ยืนยัน</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>


<style>
.image-container {
  position: relative;
  margin-bottom: 1rem;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
