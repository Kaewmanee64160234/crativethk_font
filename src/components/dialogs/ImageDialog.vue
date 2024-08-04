<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useUserStore } from '@/stores/user.store';
import * as faceapi from 'face-api.js';

const userStore = useUserStore();
const showDialog = ref(true);
const url = "http://localhost:3000";
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const fileInputKey = ref(Date.now()); // Key to reset the file input field

// Fetching existing images from the user store
const images = ref<string[]>(userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? []);

async function close() {
  userStore.closeImageDialog();
}

onMounted(async () => {
  await userStore.getUsersById(userStore.currentUser?.userId!);
  images.value = userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? [];

  await loadModels();
});

async function loadModels() {
  await userStore.getUsersById(userStore.currentUser?.userId!);
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

function float32ArrayToBase64(float32Array: Float32Array) {
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

async function save() {
  userStore.editUser = {
    ...userStore.currentUser,
    firstName: userStore.currentUser!.firstName || '',
    lastName: userStore.currentUser!.lastName || '',
    files: imageFiles.value,
  };

  const faceDescriptions = await processFiles(userStore.editUser.files);
  const dataFaceBase64 = faceDescriptions.map(faceDescription => float32ArrayToBase64(faceDescription));
  console.log(dataFaceBase64);
  userStore.editUser.faceDescriptions = dataFaceBase64;

  await userStore.saveUser();
  showDialog.value = false;
  await userStore.closeImageDialog();
  window.location.reload();

  await userStore.getUsersById(userStore.currentUser?.userId!);
  showDialog.value = true;
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          try {
            const resizedImage = await resizeAndConvertImageToBase64(result, 800, 600);
            
            // Check for duplicate images
            const isDuplicate = checkDuplicateImage(resizedImage);
            if (!isDuplicate) {
              imageUrls.value.push(resizedImage);
              imageFiles.value.push(file);
            }
          } catch (error) {
            console.error("Error resizing image:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    });
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

function checkDuplicateImage(newImageBase64: string): boolean {
  // Check if the new image base64 string is already in the list
  return images.value.some((existingImage) => {
    // Extract the base64 part from the data URL
    const existingImageBase64 = existingImage.split(',')[1];
    return existingImageBase64 === newImageBase64.split(',')[1];
  });
}

function removeImage(index: number) {
  images.value.splice(index, 1);
  // Optionally, update the user store with the new images list
  userStore.currentUser.images = images.value.map(image => image.replace(`${url}/users/image/filename/`, ''));
}

function removeUploadedImage(index: number) {
  imageUrls.value.splice(index, 1);
  imageFiles.value.splice(index, 1);
  fileInputKey.value = Date.now(); // Reset the file input field
}

// Computed property to check if there are uploaded images
const hasUploadedImages = computed(() => imageUrls.value.length > 0);

</script>

<template>
  <v-container style="padding-top: 120px;">
    <v-dialog v-model="showDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="headline" style="display: flex; justify-content: space-between;">
          รูปภาพทั้งหมด
          <v-btn icon @click="close">
            <v-icon color="red">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-for="(image, index) in images" :key="index" cols="6" md="4" lg="3" class="image-container">
              <v-img :src="image" aspect-ratio="1"></v-img>
              <v-btn icon small @click="removeImage(index)" class="close-button">
                <v-icon color="red">mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-if="hasUploadedImages">
            <v-col cols="12">
              <v-text>รูปภาพที่อัปโหลด</v-text>
            </v-col>
            <v-col cols="6" md="4" lg="3" class="image-container" v-for="(image, index) in [...imageUrls]" :key="index">
              <v-img :src="image" aspect-ratio="1" class="ma-2"></v-img>
              <v-btn icon small @click="removeUploadedImage(index)" class="close-button">
                <v-icon color="red">mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="12">
              <!-- File Input -->
              <v-file-input :key="fileInputKey" label="อัปโหลดรูปภาพ" multiple prepend-icon="mdi-camera" filled @change="handleFileChange"
                accept="image/*" variant="outlined"></v-file-input>
            </v-col>
          </v-row>
          <v-row justify="end">
            <v-col cols="auto">
              <v-btn color="primary" @click="save">อัปโหลด</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.headline {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-container {
  position: relative;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
