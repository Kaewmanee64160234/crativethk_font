<script lang="ts" setup>
import { onMounted, ref, computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user.store';
import * as faceapi from 'face-api.js';
import Swal from 'sweetalert2';
import { useMessageStore } from '@/stores/message';
import type { User } from '@/stores/types/User';
import Loader from "@/components/loader/Loader.vue";
import axios from 'axios';
import { useNotiforupdate } from '@/stores/notiforUpdate.store';

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
}

interface Identification {
  name: string;
  studentId: string;
  imageUrl: string;
  score: number;
  user: User;
}

const messageStore = useMessageStore();
const isLoading = ref(false);
const userStore = useUserStore();
const showDialog = ref(true);
const alertDialog = ref(false);
const alertMessage = ref('');
const identifications = ref<Identification[]>([]);
const canvasRefs = reactive<CanvasRefs>({});
const croppedImagesDataUrls = ref<string[]>([]);
const userDescriptors = new Map<string, Float32Array[]>();
const url = import.meta.env.VITE_API_URL;
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const fileInputKey = ref(Date.now()); // Key to reset the file input field
const faceDescriptionFields = ref<string[]>([]);
const notiStore = useNotiforupdate();

// Fetching existing images from the user store
const images = ref<string[]>(userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? []);
async function close() {
  userStore.closeImageDialog();
}

onMounted(async () => {
  await loadModels()
  await userStore.getUsersById(userStore.currentUser?.userId!);
  images.value = userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? [];
});

async function loadModels() {

  try {
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    ]);
    userStore.users.forEach((user) => {
      const descriptors: Float32Array[] = [];
      const faceDescriptionFields = user.faceDescriptions || [];

      faceDescriptionFields.forEach((description, idx) => {
        if (description) {
          try {
            const float32Array = base64ToFloat32Array(description);
            descriptors.push(float32Array);
          } catch (error) {
            console.error(`Error decoding face description ${idx + 1} for user: ${user.email}`, error);
          }
        }
      });

      if (descriptors.length > 0) {
        userDescriptors.set(user.studentId!, descriptors);
      }
    });
    console.timeEnd("Face Description Processing Time");
    const urls: string[] = JSON.parse(localStorage.getItem('images') || '[]');

    imageUrls.value = urls;
    localStorage.removeItem('images');


    console.time("Image Processing Time");
    await Promise.all(imageUrls.value.map((url, index) => loadImageAndProcess(url, index)));
    console.timeEnd("Image Processing Time");
  } catch (error) {
    console.error("Error loading face-api models:", error);

  }
}

function base64ToFloat32Array(base64: string): Float32Array {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
  } catch (error) {
    console.error("Failed to decode base64 string:", base64, error);
    throw error;
  }
}

function loadImageAndProcess(dataUrl: string, index: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        await processImage(img, index);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = (error) => {
      console.error("Error loading image:", dataUrl, error);
      reject(error);
    };
    img.src = dataUrl;
  });
}

async function processImage(image: HTMLImageElement, index: number) {
  console.time(`Image Detection and Descriptor Time - Image ${index}`);
  const canvas = canvasRefs[index] || document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");

  try {
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

    detections.forEach((detection) => {
      // const bestMatch = findBestUserMatch(detection.descriptor);
      const cropCanvas = document.createElement("canvas");
      const cropCtx = cropCanvas.getContext("2d");
      const { x, y, width, height } = detection.detection.box;
      cropCanvas.width = width;
      cropCanvas.height = height;
      cropCtx!.drawImage(image, x, y, width, height, 0, 0, width, height);

      const croppedDataURL = cropCanvas.toDataURL();
      croppedImagesDataUrls.value.push(croppedDataURL);
      // chnage floadt 32 array to base 64 and save in faceDescriptionFields
      const base64Descriptor = float32ArrayToBase64(detection.descriptor);
      faceDescriptionFields.value.push(base64Descriptor);



    });
  } catch (error) {
    console.error("Failed to process face detection:", error);
  } finally {
    document.body.removeChild(canvas);
    console.timeEnd(`Image Detection and Descriptor Time - Image ${index}`);
  }
}


function float32ArrayToBase64(float32Array: Float32Array): string {
  const uint8Array = new Uint8Array(float32Array.buffer);
  const binaryString = String.fromCharCode.apply(null, uint8Array as unknown as number[]);
  return btoa(binaryString);
}

// resizeAndConvertToBase64
async function resizeAndConvertToBase64(imageUrl: string, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      // Calculate the aspect ratio and resize
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw the resized image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert the canvas to a base64 string with the specified quality
      const resizedImage = canvas.toDataURL("image/jpeg", 0.5);
      resolve(resizedImage);
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
    img.src = imageUrl;
  });
}

// base64ToBlob
function base64ToBlob(base64: string, type: string): Blob {
  const binaryString = atob(base64.split(",")[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

async function save() {
  if (imageUrls.value && imageUrls.value.length > 0) {
    await Promise.all(imageUrls.value.map((url, index) => loadImageAndProcess(url, index)));
    
    const formData = new FormData();

    console.log("croppedImagesDataUrls", croppedImagesDataUrls.value);

    // Process and append cropped images to formData as files
    for (let i = 0; i < croppedImagesDataUrls.value.length; i++) {
      const croppedImageDataUrl = croppedImagesDataUrls.value[i];

      // Resize the image and convert to base64
      const resizedImageBase64 = await resizeAndConvertToBase64(croppedImageDataUrl, 800, 600);

      // Convert the resized base64 image to a Blob and then to a File
      const blob = base64ToBlob(resizedImageBase64, "image/jpeg");
      const imageFile = new File([blob], `croppedImage_${i + 1}_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Append the image file to the formData
      formData.append("files", imageFile, imageFile.name);
      console.log("Appended file:", imageFile.name);
    }

    // Add face descriptors to formData
    faceDescriptionFields.value.forEach((faceDescription, index) => {
      formData.append(`faceDescriptor${index + 1}`, faceDescription);
    });

    // Add userId to formData
    formData.append("userId", userStore.currentUser!.userId!);

    // Log the form data entries for debugging
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    await notiStore.createNotiforupdate(formData);

  } else {
    messageStore.showError("No images available to send.");
  }
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

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const resizeAndConvertImageToBase64 = (
  imageUrl: string,
  maxWidth: number = 400,   // Reduced default maxWidth to 400px
  maxHeight: number = 400,  // Reduced default maxHeight to 400px
  quality: number = 0.5     // Lowered quality to 0.5 for better compression
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      // Calculate the aspect ratio and resize
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw the resized image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert the canvas to a base64 string with the specified quality
      const resizedImage = canvas.toDataURL("image/jpeg", quality);
      resolve(resizedImage);
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
    img.src = imageUrl;
  });
};


function checkDuplicateImage(newImageBase64: string): boolean {
  // Check if the new image base64 string is already in the list
  return imageUrls.value.some((uploadedImage) => {
    const uploadedImageBase64 = uploadedImage.split(',')[1];
    return uploadedImageBase64 === newImageBase64.split(',')[1];
  });
}
const hasUploadedImages = computed(() => imageUrls.value.length > 0);

const canUpload = computed(() => imageFiles.value.length === 5);

</script>

<template>
  <v-container class="pt-12">
    <v-dialog v-model="showDialog" height="800" persistent>
      <v-card class="rounded-lg" outlined>
        <!-- Loader Overlay -->
        <div v-if="isLoading" class="loader-overlay">
          <Loader></Loader>
        </div>
        <v-card-title class="headline">
          รูปภาพทั้งหมด
          <v-btn icon @click="close">
            <v-icon color="red">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row v-if="!canUpload" class="mt-2">
            <v-col cols="12" class="text-center">
              <v-alert type="info" class="mt-3" border="left">
                <v-icon left>mdi-information-outline</v-icon>
                กรุณาอัปโหลดรูปภาพให้ครบ 5 รูป
              </v-alert>
            </v-col>
          </v-row>

          <!-- Existing Images -->
          <v-row>
            <v-col v-for="(image, index) in images" :key="'existing-' + index" cols="2" md="2" lg="2"
              class="image-container">
              <v-img :src="image" aspect-ratio="1" class="rounded-lg d-flex align-center justify-center"></v-img>
            </v-col>
          </v-row>

          <!-- Uploaded Images -->
          <v-row v-if="hasUploadedImages" class="mt-4">
            <v-col cols="12">
              <v-text class="font-weight-bold">รูปภาพที่อัปโหลด</v-text>
            </v-col>
            <v-col v-for="(image, index) in imageUrls" :key="'uploaded-' + index" cols="2" md="2" lg="2"
              class="image-container">
              <v-img :src="image" aspect-ratio="1" class="rounded-lg ma-2 d-flex align-center justify-center"></v-img>
            </v-col>
          </v-row>

          <!-- File Input -->
          <v-row>
            <v-col cols="12" class="mt-4">
              <v-file-input :key="fileInputKey" label="อัปโหลดรูปภาพ" multiple prepend-icon="mdi-camera" filled
                @change="handleFileChange" accept="image/*" variant="outlined"
                :rules="[() => canUpload || imageUrls.length < 5 ? true : 'ต้องอัปโหลดรูปภาพให้ครบ 5 รูป']"></v-file-input>
            </v-col>
          </v-row>

          <!-- Upload Button -->
          <v-row justify="end" class="mt-4">
            <v-col cols="auto">
              <v-btn :disabled="!canUpload" color="primary" @click="save"
                v-tooltip="'กรุณาอัปโหลดรูปภาพ 5 รูปก่อนอัปเดต'">
                อัปโหลด
              </v-btn>
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
  margin-bottom: 1rem;
}

.v-alert {
  background-color: #e3f2fd;
  border-color: #1976d2;
}

.v-card {
  height: 800px;
  /* Ensure the dialog is square */
  overflow: hidden;
  /* Prevent content overflow */
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
