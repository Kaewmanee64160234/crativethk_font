<script lang="ts" setup>
import router from '@/router';
import user from '@/services/user';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref } from 'vue';
import * as faceapi from 'face-api.js';
import { useMessageStore } from '@/stores/message';

const userStore = useUserStore();
const messageStore = useMessageStore();
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const capturedImages = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const imageUrls = ref<string[]>([]);
const currentUserIdIndex = ref(0);

const nextUserId = async () => {
  try {
    const currentUser = userStore.register[currentUserIdIndex.value];
    if (!currentUser) {
      throw new Error("No user found at the current index");
    }
    const currentUserId = currentUser.userId;
    if (!currentUserId) {
      throw new Error("Invalid user ID");
    }
    console.log("user id", currentUserId);
    userStore.editUser = {
      ...currentUser,
      files: imageFiles.value,
    };

    const faceDescriptions = await processFiles(userStore.editUser.files);
    const dataFaceBase64 = faceDescriptions.map(faceDescription => float32ArrayToBase64(faceDescription));
    console.log(dataFaceBase64);
    userStore.editUser.faceDescriptions = dataFaceBase64;

    if (userStore.editUser.faceDescriptions.length > 0) {
      await userStore.saveUser();
      currentUserIdIndex.value++;
      navigateToNextUserOrHistory();
    } else {
      messageStore.showError("Please upload at least one image");
    }
  } catch (error) {
    console.error("Failed to update user images:", error);
  }
};

const navigateToNextUserOrHistory = () => {
  if (currentUserIdIndex.value < userStore.register.length) {
    router.push(`/uploadImage/${userStore.register[currentUserIdIndex.value].studentId}`);
    } else {
    router.push('/registerHistory');
    }
  resetState();
};

async function processFiles(files: File[]): Promise<Float32Array[]> {
  const faceDescriptions: Float32Array[] = [];

  for (const file of files) {
    const imgElement = await createImageElement(file);
    const faceDescription = await faceapi
      .detectSingleFace(imgElement, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (faceDescription) {
      faceDescriptions.push(faceDescription.descriptor);
    }

    // Clean up the created image element
    imgElement.remove();
  }

  return faceDescriptions;
}

function float32ArrayToBase64(float32Array: Float32Array): string {
  const uint8Array = new Uint8Array(float32Array.buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

async function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => resolve(img);
      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  if (userStore.register.length === 0) {
    messageStore.showError("No users found.");
  }
  await loadModels();
});

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

const resetState = () => {
  capturedImages.value = [];
  imageFiles.value = [];
  imageUrls.value = [];
  stopCamera(); // Ensure camera is stopped if open
};

const skipUser = () => {
  currentUserIdIndex.value++;
  navigateToNextUserOrHistory();
};
</script>
<template>
  <v-container style="padding-top: 120px;">
    <v-row>
      <v-col style="text-align: center;">
        <div v-if="currentUserIdIndex < userStore.register.length">
          {{ userStore.register[currentUserIdIndex].studentId + " " +
          userStore.register[currentUserIdIndex].firstName + " " + userStore.register[currentUserIdIndex].lastName }}
          <v-btn style="margin-left: 3%;" color="secondary" @click="skipUser">Skip</v-btn>
        </div>
        <div v-else>
          <span>No more users to process</span>
        </div>
      </v-col>
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
