<script lang="ts" setup>
import router from '@/router';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref } from 'vue';

const userStore = useUserStore();
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const capturedImages = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const imageUrls = ref<string[]>([]);
const currentUserIdIndex = ref(0);

const goToRegister = () => {
  router.push(`/register`);
};

const nextUserId = () => {
  currentUserIdIndex.value++;
  if (currentUserIdIndex.value < userStore.register.length) {
    router.push(`/uploadImage/${userStore.register[currentUserIdIndex.value].studentId}`);
  } else {
    router.push(`/registerHistoryView`);
  }
};

const resizeAndConvertImageToBase64 = (imageUrl: string, maxWidth: number, maxHeight: number) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
    img.src = imageUrl;
  });
};

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const startCamera = async () => {
  showCamera.value = true;
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  if (videoRef.value) {
    videoRef.value.srcObject = stream;
  }
};
const captureImage = () => {
  if (videoRef.value && canvasRef.value) {
    const ctx = canvasRef.value.getContext("2d");
    if (!ctx) return;
    canvasRef.value.width = videoRef.value.videoWidth;
    canvasRef.value.height = videoRef.value.videoHeight;
    ctx.drawImage(videoRef.value, 0, 0);
    const imageUrl = canvasRef.value.toDataURL("image/jpeg");
    resizeAndConvertImageToBase64(imageUrl, 800, 600)
      .then((resizedImage) => {
        capturedImages.value.push(resizedImage);
        const file = dataURLtoFile(resizedImage, `image-${Date.now()}.jpg`);
        imageFiles.value.push(file);
      })
      .catch((error) => console.error("Error resizing image:", error));
  }
};

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
    videoRef.value.srcObject = null;
  }
  showCamera.value = false;
};

const removeImage = (index: number) => {
  capturedImages.value.splice(index, 1);
};

onMounted(async () => {
  await userStore.getUsers();

});
</script>
<template>
  <v-container style="padding-top: 120px;">
    <v-row>
      <v-col style="text-align: center;">{{ userStore.register[currentUserIdIndex].studentId + " " +
        userStore.register[currentUserIdIndex].firstName + " " + userStore.register[currentUserIdIndex].lastName
        }}</v-col>
    </v-row>
    <v-row>
      <v-col style="text-align: center;">
        <v-btn color="primary" @click="startCamera">Open Camera</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="showCamera">
      <v-col cols="12" sm="12">
        <video ref="videoRef" autoplay style="width: 100%;"></video>
        <canvas ref="canvasRef" style="display: none;"></canvas>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn @click="captureImage" block>Capture Image</v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn @click="stopCamera" block>Close Camera</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" md="4" v-for="(image, index) in [...capturedImages, ...imageUrls]" :key="index"
        class="position-relative">
        <v-img :src="image" aspect-ratio="1" class="ma-2">
          <v-icon class="remove-btn" color="red" @click="removeImage(index)" size="40">mdi
            mdi-close-circle-outline</v-icon>
        </v-img>
      </v-col>
    </v-row>
    <v-card-actions class="actions">
      <!-- <v-btn color="error" @click="goToRegister">ย้อนกลับ<v-icon>mdi mdi-arrow-left-thin</v-icon></v-btn> -->
      <v-spacer></v-spacer>
      <v-btn color="success" @click="nextUserId">ถัดไป<v-icon>mdi mdi-arrow-right-thin</v-icon></v-btn>
    </v-card-actions>
  </v-container>
</template>

<style>
.image-container {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 80px;
  right: 0px;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>