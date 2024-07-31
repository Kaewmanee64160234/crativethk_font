<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as faceapi from "face-api.js";
import { useRoute } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import type { FaceDetection, WithFaceLandmarks, WithFaceDescriptor } from "face-api.js";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
}

interface Identification {
  name: string;
  studentId: string;
  imageUrl: string;
}

const assignmentStore = useAssignmentStore();
const route = useRoute();
const canvasRefs = reactive<CanvasRefs>({});
const imageUrls = ref<string[]>([]);
const croppedImage = ref<string | null>(null);
const showDialog = ref(false);

const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
};

const fetchImages = async () => {
  const assignmentId = route.params.assignmentId;
  await assignmentStore.getAssignmentById(assignmentId + '');
  const images = assignmentStore.currentAssignment?.assignmentImages || [];
  imageUrls.value = images.map(image => `${import.meta.env.VITE_API_URL}/assignments/image/filename/${image}`);
};

const processImage = async (image: HTMLImageElement, index: number) => {
  const canvas = canvasRefs[index] || document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const detections = await faceapi.detectAllFaces(image);
  const displaySize = { width: image.naturalWidth, height: image.naturalHeight };
  faceapi.matchDimensions(canvas, displaySize);
  const resizedDetections = faceapi.resizeResults(detections, displaySize);

  resizedDetections.forEach(detection => {
    const { x, y, width, height } = detection.box;

    const boxElement = document.createElement('div');
    boxElement.style.position = 'absolute';
    boxElement.style.border = '2px solid red';
    boxElement.style.top = `${y}px`;
    boxElement.style.left = `${x}px`;
    boxElement.style.width = `${width}px`;
    boxElement.style.height = `${height}px`;
    boxElement.style.cursor = 'pointer';
    boxElement.dataset.index = index.toString();
    boxElement.dataset.x = x.toString();
    boxElement.dataset.y = y.toString();
    boxElement.dataset.width = width.toString();
    boxElement.dataset.height = height.toString();

    boxElement.addEventListener('click', () => handleBoxClick(image, detection.box));

    canvas.parentElement?.appendChild(boxElement);
  });
};

const handleBoxClick = (img: HTMLImageElement, box: faceapi.Box) => {
  const canvas = document.createElement('canvas');
  canvas.width = box.width;
  canvas.height = box.height;
  const context = canvas.getContext('2d');
  if (context) {
    context.drawImage(
      img,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      box.width,
      box.height
    );
    croppedImage.value = canvas.toDataURL();
    showDialog.value = true;
  }
};

onMounted(async () => {
  await loadModels();
  await fetchImages();

  await nextTick();

  imageUrls.value.forEach((url, index) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => processImage(img, index);
    img.src = url;
  });
});
</script>

<template>
  <v-container>
    <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px">
      <v-card-title>
        <h1 class="text-h5">Assignment Images</h1>
      </v-card-title>
    </v-card>
    <v-row class="mt-5">
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="#CFEBFB">
          <v-icon size="30">mdi-clipboard-check-outline</v-icon>
          ตรวจสอบการเช็คชื่อ
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <div v-for="(imageUrl, index) in imageUrls" :key="index" class="position-relative mb-3">
          <img :src="imageUrl" class="w-100 rounded-lg" />
          <canvas :ref="el => canvasRefs[index] = el" class="position-absolute top-0 left-0 w-100 h-100"></canvas>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <v-card style="overflow-y: scroll">
          <v-row>
            <v-col cols="12" sm="6" v-for="(url, index) in croppedImagesDataUrls" :key="'cropped-' + index">
              <v-card outlined color="#EDEDED" class="rounded-lg">
                <v-card-title>
                  <v-icon small>mdi-circle-small</v-icon> Cropped Image
                </v-card-title>
                <v-img :src="url" aspect-ratio="1.5" class="rounded-lg"></v-img>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="showDialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Confirm Identity</span>
      </v-card-title>
      <v-card-text>
        <img :src="croppedImage" alt="Cropped Face" />
        <p>Is this you?</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="showDialog = false">Yes</v-btn>
        <v-btn color="secondary" @click="showDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
img {
  width: 100%;
  height: auto;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
