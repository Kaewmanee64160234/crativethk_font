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
const faceDescriptors = ref<Float32Array[]>([]); // To hold the face descriptors for similarity comparison
const similarityScores = ref<number[]>([]); // To store similarity scores between images

const imageStdUrl = import.meta.env.VITE_API_STD_URL;
const url = import.meta.env.VITE_API_URL;
const messageStore = useMessageStore();
stdId.value = route.params.stdId as string;

onMounted(async () => {
    isLoading.value = true;
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models"); // Load face recognition model

        if (stdId.value) {
            await userStore.getUsersByStdId(stdId.value);
            user.value = userStore.regisUser;
            images.value = await Promise.all(
                (user.value?.images?.map(async (image: string) => {
                    const fullImageUrl = `${url}/users/image/filename/${image}`;
                    const base64Image = await resizeAndConvertToBase64(fullImageUrl, 800, 600);
                    const faceDescriptor = await getFaceDescriptor(fullImageUrl); // Get face descriptor for each image
                    if (faceDescriptor) faceDescriptors.value.push(faceDescriptor); // Store descriptor
                    return base64Image;
                }) ?? [])
            );

            // Calculate similarity scores between images
            calculateSimilarity();
        }
    } catch (error) {
        console.error("Error loading images:", error);
    } finally {
        isLoading.value = false;
    }
});

// Calculate similarity between all face descriptors
const calculateSimilarity = () => {
    similarityScores.value = [];

    // Compare all combinations of face descriptors and calculate Euclidean distance
    for (let i = 0; i < faceDescriptors.value.length - 1; i++) {
        for (let j = i + 1; j < faceDescriptors.value.length; j++) {
            const score = faceapi.euclideanDistance(faceDescriptors.value[i], faceDescriptors.value[j]);
            similarityScores.value.push(score); // Push the similarity score (distance) between images
        }
    }
};

// Extract face descriptor for a given image URL
const getFaceDescriptor = async (imgUrl: string): Promise<Float32Array | null> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgUrl;
        img.onload = async () => {
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (detections && detections.descriptor) {
                resolve(detections.descriptor);
            } else {
                reject("No face detected");
            }
        };
        img.onerror = (error) => reject(error);
    });
};

// Function to resize and convert image to Base64
const resizeAndConvertToBase64 = (
    imgUrl: string,
    maxWidth: number,
    maxHeight: number
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject('Could not get canvas context');
                return;
            }

            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const width = img.width * ratio;
            const height = img.height * ratio;

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            resolve(dataUrl);
        };
        img.onerror = (error) => {
            reject(error);
        };
    });
};

const cancelNotice = async () => {
  messageStore.showInfo("Confirm rejection of notice");
  await userStore.updateRegisterStatus(userStore.regisUser!.userId!, userStore.regisUser!);
  router.push(`/userManagement`);
};

const confirmNotice = async () => {
  if (userStore.regisUser) {
    userStore.regisUser.registerStatus = 'confirmed';
    try {
      await userStore.updateRegisterStatus(userStore.regisUser.userId!, userStore.regisUser);
      messageStore.showInfo("Successfully confirmed notice");
      router.push('/userManagement');
    } catch (e) {
      console.error("Error in confirmNotice:", e);
      messageStore.showError("Failed to update notice status");
    }
  } else {
    messageStore.showError("Notice user not found");
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
        <v-row>
          <v-col style="text-align: center;">
            <h3>{{ userStore.regisUser?.studentId + " " + userStore.regisUser?.firstName + " " +
              userStore.regisUser?.lastName }}</h3>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-center">
          <v-col v-for="(image, index) in images" :key="'existing-' + index" cols="2" md="2" lg="2"
            class="image-container">
            <v-img :src="image" aspect-ratio="1" class="rounded-lg d-flex align-center justify-center"></v-img>
          </v-col>
        </v-row>

        <!-- Display Similarity Scores -->
        <v-row class="d-flex justify-center">
          <v-col cols="12" class="text-center">
            <h3>Face Similarity Scores</h3>
            <div v-if="similarityScores.length > 0">
              <div v-for="(score, index) in similarityScores" :key="index">
                <p>Comparison {{ index + 1 }}: Distance: {{ score.toFixed(2) }}</p>
              </div>
            </div>
            <div v-else>
              <p>No similarities detected.</p>
            </div>
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
