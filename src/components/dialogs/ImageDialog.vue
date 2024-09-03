<script lang="ts" setup>
import { onMounted, ref, computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user.store';
import * as faceapi from 'face-api.js';
import Swal from 'sweetalert2';
import { useMessageStore } from '@/stores/message';
import type { User } from '@/stores/types/User';
import Loader from "@/components/loader/Loader.vue";
import axios from 'axios';

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

// Fetching existing images from the user store
const images = ref<string[]>(userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? []);
console.log("image", images.value)
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
    console.log(urls);

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
      const bestMatch = findBestUserMatch(detection.descriptor);
      const cropCanvas = document.createElement("canvas");
      const cropCtx = cropCanvas.getContext("2d");
      const { x, y, width, height } = detection.detection.box;
      cropCanvas.width = width;
      cropCanvas.height = height;
      cropCtx!.drawImage(image, x, y, width, height, 0, 0, width, height);

      const croppedDataURL = cropCanvas.toDataURL();
      croppedImagesDataUrls.value.push(croppedDataURL);

      if (bestMatch.user) {
        identifications.value.push({
          name: bestMatch.user.firstName,
          studentId: bestMatch.user.studentId!,
          imageUrl: croppedDataURL!,
          score: 1 - bestMatch.score,
          user: bestMatch.user,
        });
      } else {
        identifications.value.push({
          name: "Unknown",
          studentId: "N/A",
          imageUrl: croppedDataURL!,
          score: 0,
          user: null,
        });
      }
    });
  } catch (error) {
    console.error("Failed to process face detection:", error);
  } finally {
    document.body.removeChild(canvas);
    console.timeEnd(`Image Detection and Descriptor Time - Image ${index}`);
  }
}

function findBestUserMatch(
  descriptor: Float32Array
): { user: User | null; score: number } {
  const threshold = 0.6; // Set the threshold for best match
  let bestMatch = { user: null, score: threshold }; // Initialize best match with threshold score

  // Iterate over each user's descriptors
  userDescriptors.forEach((descriptors, studentId) => {
    // Iterate over each descriptor for the current user
    console.log("Student ID:", studentId, 'Descriptors:', descriptors.length);

    descriptors.forEach((userDescriptor) => {
      // Ensure descriptor lengths match to avoid calculation errors
      if (descriptor.length !== userDescriptor.length) {
        console.error(
          `Descriptor length mismatch for user ${studentId}:`,
          `descriptor length: ${descriptor.length}, userDescriptor length: ${userDescriptor.length}`
        );
        return; // Skip this descriptor if there's a length mismatch
      }

      // Calculate Euclidean distance between the input descriptor and the user's descriptor
      const distance = faceapi.euclideanDistance(descriptor, userDescriptor);

      // Debug logging to trace values
      console.log("Distance:", distance, "Threshold:", threshold, "Match Score:", bestMatch.score, "Student ID:", studentId);

      // Update best match if the current distance is lower than the current best score
      if (distance < bestMatch.score) {
        console.log("Best match updated:", studentId, distance);

        bestMatch = {
          user: userStore.users.find((u) => u.studentId === studentId)!, // Find the matching user by student ID
          score: distance, // Update the score with the new best distance
        };
      }
    });
  });

  return bestMatch; // Return the best match found
}
function float32ArrayToBase64(float32Array: Float32Array): string {
  const uint8Array = new Uint8Array(float32Array.buffer);
  const binaryString = String.fromCharCode.apply(null, uint8Array as unknown as number[]);
  return btoa(binaryString);
}

async function save() {
  if (canUpload.value) {
    isLoading.value = true;

    // Resize and convert images to Base64
    const processedImages = await Promise.all(
      imageFiles.value.map(file => resizeAndConvertImageToBase64(URL.createObjectURL(file), 800, 600, 0.7))
    );
    const faceDescriptionsArray: string[] = [];

    for (const image of imageFiles.value) {
      const img = new Image();
      img.src = URL.createObjectURL(image);
      await new Promise<void>((resolve, reject) => {
        img.onload = async () => {
          try {
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (detection) {
              const descriptor = detection.descriptor;
              const base64Descriptor = float32ArrayToBase64(descriptor);
              faceDescriptionsArray.push(base64Descriptor);
            }
            resolve();
          } catch (error) {
            console.error("Face detection failed:", error);
            reject(error);
          }
        };
        img.onerror = (error) => {
          console.error("Error loading image:", error);
          reject(error);
        };
      });
    }

    // Prepare data to be sent to the backend
    const notificationData = {
      userId: userStore.currentUser?.userId,
      images: processedImages, // Base64 encoded images
      faceDescriptions: faceDescriptionsArray, // Base64 encoded face descriptors
    };

    try {
      // Send the notification request to the backend
      await axios.post(`${url}/notiforupdate`, notificationData);
      messageStore.showInfo('Image update request sent to teacher for approval.');
      showDialog.value = false;

      // Optionally reload or reset the form
      window.location.reload();
    } catch (error) {
      messageStore.showError('Failed to send image update request.');
      console.error("Notification error:", error);
    } finally {
      isLoading.value = false;
    }
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
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.7  // default quality is set to 0.7
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
