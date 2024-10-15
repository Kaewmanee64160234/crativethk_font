<script lang="ts" setup>
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user.store';
import { useNotiforupdate } from '@/stores/notiforUpdate.store';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import Loader from "@/components/loader/Loader.vue";

const userStore = useUserStore();
const notiforupdateStore = useNotiforupdate();
const noticId = ref<string | null>(null);
const route = useRoute();
const router = useRouter();
const imageUrls = ref<string[]>([]);
const imageUrls2 = ref<string[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    // Get notification by ID
    noticId.value = route.params.noticId as string;
    await notiforupdateStore.getNotiforupdateById(noticId.value);
    const url = 'http://localhost:3000';
    imageUrls.value = notiforupdateStore.currentNotiforupdate!.images!.map((image: string) => `${url}/notiforupdates/image/filename/${image}`);

    // Fetch user images
    const userId = notiforupdateStore.currentNotiforupdate?.userSender?.userId;
    if (userId) {
      const response = await fetch(`${url}/users/${userId}/images`);
      const data = await response.json();
      imageUrls2.value = data.images.map((image: string) => `${url}/users/image/filename/${image}`);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  } finally {
    isLoading.value = false;
  }
});

// SweetAlert for rejecting the notification
const cancelNotice = async () => {
  Swal.fire({
    icon: 'warning',
    title: 'คุณต้องการปฏิเสธการอัปเดตรูปภาพหรือไม่',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  }).then(async (result) => {
    if (result.isConfirmed && notiforupdateStore.currentNotiforupdate) {
      await notiforupdateStore.updateNotiforupdateReject(
        String(notiforupdateStore.currentNotiforupdate.notiforupdateId),
        notiforupdateStore.currentNotiforupdate
      );
      Swal.fire('สำเร็จ!', 'การแจ้งเตือนถูกปฏิเสธ', 'success');
      router.push('/courseManagement').then(() => window.location.reload());
    }
  });
};

// SweetAlert for confirming the notification
const confirmNotice = async () => {
  Swal.fire({
    icon: 'success',
    title: 'คุณต้องการยืนยันการอัปโหลดใช่หรือไม่',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  }).then(async (result) => {
    if (result.isConfirmed && notiforupdateStore.currentNotiforupdate) {
      await notiforupdateStore.updateNotiforupdateConfirm(
        String(notiforupdateStore.currentNotiforupdate.notiforupdateId),
        notiforupdateStore.currentNotiforupdate
      );
      Swal.fire('สำเร็จ!', 'การแจ้งเตือนถูกยืนยัน', 'success');
      router.push('/courseManagement');
    }
  });
};
</script>


<template>
  <v-container style="padding-top: 120px;">
    <v-card>
      <div v-if="isLoading" class="loader-overlay">
        <Loader></Loader>
      </div>

      <!-- Title -->
      <v-row>
        <v-col style="text-align: center;">
          <h1 style="color: green;">ยืนยันการอัปเดตรูปภาพ</h1>
        </v-col>
      </v-row>

      <!-- Student Information -->
      <v-row class="d-flex justify-center">
        <v-col cols="12" class="text-center">
          <h3>
            {{ notiforupdateStore.currentNotiforupdate?.userSender?.studentId }}
            {{ notiforupdateStore.currentNotiforupdate?.userSender?.firstName }}
            {{ notiforupdateStore.currentNotiforupdate?.userSender?.lastName }}
          </h3>
        </v-col>
      </v-row>
      <v-row class="d-flex justify-center">
        <v-col cols="12" class="text-center">
          <h3 style="color: blue;">รูปภาพเก่า</h3>
        </v-col>
        <v-col v-for="(image, index) in imageUrls2" :key="'user-image-' + index" cols="2" md="2" lg="2"
          class="image-container">
          <v-img :src="image" aspect-ratio="1" class="rounded-lg ma-2 d-flex align-center justify-center">
          </v-img>
        </v-col>
      </v-row>
      <!-- New Student Images Section -->
      <v-row class="d-flex justify-center">
        <v-col cols="12" class="text-center">
          <h3 style="color: blue;">รูปภาพใหม่</h3>
        </v-col>
        <v-col v-for="(image, index) in imageUrls" :key="'notification-image-' + index" cols="2" md="2" lg="2"
          class="image-container">
          <v-img :src="image" aspect-ratio="1" class="rounded-lg ma-2 d-flex align-center justify-center">
          </v-img>
        </v-col>
      </v-row>

      <!-- Old Student Images Section -->
     

      <!-- Actions -->
      <v-card-actions class="justify-space-between">
        <v-btn color="error" @click="cancelNotice" style="padding: 12px 24px;">ปฎิเสธ</v-btn>
        <v-btn color="success" @click="confirmNotice" style="padding: 12px 24px;">ยืนยัน</v-btn>
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

