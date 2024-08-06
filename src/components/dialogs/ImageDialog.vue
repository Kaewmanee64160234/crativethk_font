<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useUserStore } from '@/stores/user.store';
import * as faceapi from 'face-api.js';
import Swal from 'sweetalert2';

const userStore = useUserStore();
const showDialog = ref(true);
const alertDialog = ref(false);
const alertMessage = ref('');
const url = "http://localhost:3000";
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const fileInputKey = ref(Date.now()); // Key to reset the file input field

// Fetching existing images from the user store
const images = ref<string[]>(userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? []);
console.log("image",images.value)
async function close() {
  userStore.closeImageDialog();
}

onMounted(async () => {
  await userStore.getUsersById(userStore.currentUser?.userId!);
  images.value = userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? [];

  await loadModels();
  console.log("Face API models loaded",images.value);
});

async function loadModels() {
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  } catch (error) {
    console.error("Error loading face-api models:", error);
 }
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
  const failedFiles: string[] = [];

  for (const file of files) {
    try {
      const imgElement = await createImageElement(file);
      const faceDescription = await faceapi
        .detectSingleFace(imgElement, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (faceDescription) {
        faceDescriptions.push(faceDescription.descriptor);
      } else {
        // close dialog
        showDialog.value = false;
        userStore.showImageDialog = false;
        // console.warn(`No face detected in file: ${file.name}`);
        Swal.fire("No face detected", `No face detected in file: ${file.name}`, "error");
        failedFiles.push(file.name);

      }

      // Clean up the created image element
      imgElement.remove();
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      failedFiles.push(file.name);
    }
  }

  if (failedFiles.length > 0) {
    alertMessage.value = `No face detected in the following files: ${failedFiles.join(', ')}`;
    alertDialog.value = true;
    return [];
  }

  return faceDescriptions;
}

async function save() {
  if (canUpload.value) {
    userStore.editUser = {
      ...userStore.currentUser,
      firstName: userStore.currentUser!.firstName || '',
      lastName: userStore.currentUser!.lastName || '',
      files: imageFiles.value,
    };

    const faceDescriptions = await processFiles(userStore.editUser.files);
    if (faceDescriptions.length !== 5) {
      // Do not proceed if any face detection fails
      return;
    }
    const dataFaceBase64 = faceDescriptions.map(faceDescription => float32ArrayToBase64(faceDescription));
    console.log("Number of face descriptors:", faceDescriptions.length);
    userStore.editUser.faceDescriptions = dataFaceBase64;

    console.log(userStore.editUser);

    // Uncomment these lines once the issue is resolved
    await userStore.saveUser();
    showDialog.value = false;
    await userStore.closeImageDialog();
    window.location.reload();

    await userStore.getUsersById(userStore.currentUser?.userId!);
    showDialog.value = true;
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
  return imageUrls.value.some((uploadedImage) => {
    const uploadedImageBase64 = uploadedImage.split(',')[1];
    return uploadedImageBase64 === newImageBase64.split(',')[1];
  });
}

function removeImage(index: number) {
  images.value.splice(index, 1);
  userStore.currentUser.images = images.value.map(image => image.replace(`${url}/users/image/filename/`, ''));
}

function removeUploadedImage(index: number) {
  imageUrls.value.splice(index, 1);
  imageFiles.value.splice(index, 1);
  fileInputKey.value = Date.now(); // Reset the file input field
}

// Computed properties
const hasUploadedImages = computed(() => imageUrls.value.length > 0);

const canUpload = computed(() => imageUrls.value.length === 5);

</script>

<template>
  <v-container class="pt-12">
    <v-dialog v-model="showDialog" height="800" persistent>
      <v-card class="rounded-lg" outlined>
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
            <v-col
              v-for="(image, index) in images"
              :key="'existing-' + index"
              cols="2"
              md="2"
              lg="2"
              class="image-container"
            >
              <v-img
                :src="image"
                aspect-ratio="1"
                class="rounded-lg d-flex align-center justify-center"
              ></v-img>
            </v-col>
          </v-row>

          <!-- Uploaded Images -->
          <v-row v-if="hasUploadedImages" class="mt-4">
            <v-col cols="12">
              <v-text class="font-weight-bold">รูปภาพที่อัปโหลด</v-text>
            </v-col>
            <v-col
              v-for="(image, index) in imageUrls"
              :key="'uploaded-' + index"
              cols="2"
              md="2"
              lg="2"
              class="image-container"
            >
              <v-img
                :src="image"
                aspect-ratio="1"
                class="rounded-lg ma-2 d-flex align-center justify-center"
              ></v-img>
            </v-col>
          </v-row>

          <!-- File Input -->
          <v-row>
            <v-col cols="12" class="mt-4">
              <v-file-input
                :key="fileInputKey"
                label="อัปโหลดรูปภาพ"
                multiple
                prepend-icon="mdi-camera"
                filled
                @change="handleFileChange"
                accept="image/*"
                variant="outlined"
                :rules="[() => canUpload || imageUrls.length < 5 ? true : 'ต้องอัปโหลดรูปภาพให้ครบ 5 รูป']"
              ></v-file-input>
            </v-col>
          </v-row>

          <!-- Upload Button -->
          <v-row justify="end" class="mt-4">
            <v-col cols="auto">
              <v-btn
                :disabled="!canUpload"
                color="primary"
                @click="save"
                v-tooltip="'กรุณาอัปโหลดรูปภาพ 5 รูปก่อนอัปเดต'"
              >
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
  height: 800px; /* Ensure the dialog is square */
  overflow: hidden; /* Prevent content overflow */
}
</style>
