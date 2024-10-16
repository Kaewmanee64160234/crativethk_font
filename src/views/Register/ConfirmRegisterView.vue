<script lang="ts" setup>
import { useMessageStore } from '@/stores/message';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref } from 'vue';
import * as faceapi from "face-api.js";
import { useRoute, useRouter } from 'vue-router';
import Loader from "@/components/loader/Loader.vue";

const userStore = useUserStore();
const stdId = ref();
const user = ref<User | undefined>(undefined);
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const images = ref<string[]>([]);

const imageStdUrl = import.meta.env.VITE_API_STD_URL;
const url = import.meta.env.VITE_API_URL;
const messageStore = useMessageStore();
stdId.value = route.params.stdId as string;

onMounted(async () => {
    isLoading.value = true;
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        if (stdId.value) {
            await userStore.getUsersByStdId(stdId.value);
            user.value = userStore.regisUser;
            images.value = await Promise.all(
                (user.value?.images?.map(async (image: string) => {
                    const fullImageUrl = `${url}/users/image/filename/${image}`;
                    return await resizeAndConvertToBase64(fullImageUrl, 800, 600);
                }) ?? [])
            );
        }
    } catch (error) {
        console.error("Error loading images:", error);
    } finally {
        isLoading.value = false;
    }
});

const cancelRegister = async () => {
  if (userStore.regisUser) {
    userStore.regisUser.registerStatus = 'reConfirmed';
    console.log("register", userStore.regisUser.registerStatus);
    try {
      await userStore.updateRegisterStatus(userStore.regisUser.userId!, userStore.regisUser);
      messageStore.showInfo("ปฎิเสธการลงทะเบียนเรียบร้อยแล้ว");

      if (userStore.currentUser?.role === 'อาจารย์') {
        router.push(`/courseManagement`);
      } else if (userStore.currentUser?.role === 'แอดมิน') {
        router.push('/userManagement');
      }
    } catch (e) {
      console.error("Error in confirmRegister:", e);
      messageStore.showError("Failed to update register status");
    }
  } else {
    messageStore.showError("Registration user not found");
  }
};

const resizeAndConvertToBase64 = (
    imgUrl: string,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';  // อนุญาตให้ทำ cross-origin requests
        img.src = imgUrl;
        img.onload = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject('Could not get canvas context');
                return;
            }

            // ตรวจจับใบหน้าในรูป
            const detections = await faceapi.detectSingleFace(img);

            if (!detections) {
                reject('Face not found');
                return;
            }

            const { x, y, width, height } = detections.box;

            // กำหนดขนาดของ canvas ให้ตรงกับขนาดใบหน้า
            canvas.width = width;
            canvas.height = height;

            // วาดเฉพาะส่วนใบหน้าลงบน canvas
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

            try {
                const dataUrl = canvas.toDataURL('image/jpeg');
                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = (error) => {
            reject(error);
        };
    });
};


const confirmRegister = async () => {
  if (userStore.regisUser) {
    userStore.regisUser.registerStatus = 'confirmed';
    console.log("register", userStore.regisUser.registerStatus);
    try {
      await userStore.updateRegisterStatus(userStore.regisUser.userId!, userStore.regisUser);
      messageStore.showInfo("ยืนยันการลงทะเบียนเรียบร้อยแล้ว");

      if (userStore.currentUser?.role === 'อาจารย์') {
        router.push(`/courseManagement`);
      } else if (userStore.currentUser?.role === 'แอดมิน') {
        router.push('/userManagement');
      }
    } catch (e) {
      console.error("Error in confirmRegister:", e);
      messageStore.showError("Failed to update register status");
    }
  } else {
    messageStore.showError("Registration user not found");
  }
};
const confirm_Regis = () => {
  messageStore.showConfirm_("คุณต้องการยืนยันการอัปโหลดใช่หรือไม่",() => confirmRegister() , () => null);
}
const cancel_Regis = () => {
  messageStore.showConfirm_("คุณต้องการปฏิเสธการอัปโหลดรูปภาพใช่หรือไม่",() => cancelRegister() , () => null);
}
</script>
<template>
  <v-container style="padding-top: 120px;">
    <v-card>
      <div v-if="isLoading" class="loader-overlay">
        <Loader></Loader>
      </div>
      <v-row>
        <v-col style="text-align: center;color: #04AA0C">
          <h1>ยืนยันการลงทะเบียนของนิสิต</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col style="text-align: center;">
          <h3>{{ userStore.regisUser?.studentId + " " + userStore.regisUser?.firstName + " " +
            userStore.regisUser?.lastName }}</h3>
        </v-col>
      </v-row>
      <v-row class="d-flex justify-center">
        <v-col cols="2" md="2" lg="2">
          <v-img :src="imageStdUrl + userStore.regisUser?.studentId" alt="User Image"
            class="rounded-lg d-flex align-center justify-center" />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-center">
          <h3 style="color: #004BBC;font-weight: bold;">รูปภาพที่อัปโหลด</h3>
        </v-col>
      </v-row>
      <v-row class="d-flex justify-center">
        <v-col v-for="(image, index) in images" :key="'existing-' + index" cols="2" md="2" lg="2"
          class="image-container">
          <v-img :src="image" aspect-ratio="1" class="rounded-lg d-flex align-center justify-center"></v-img>
        </v-col>
      </v-row>
    </v-card>
    <v-card-actions>
      <v-btn style="width: 100px;" color="error" rounded="xl" variant="elevated" @click="cancel_Regis">ปฎิเสธ</v-btn>
      <v-spacer></v-spacer>
      <v-btn style="width: 100px;" color="primary" rounded="xl" variant="elevated" @click="confirm_Regis">ยืนยัน</v-btn>
    </v-card-actions>
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
  border-radius: 8px;
}
</style>