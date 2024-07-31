<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import * as faceapi from "face-api.js";
import { useRoute } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import type { FaceDetection, WithFaceLandmarks, WithFaceDescriptor } from "face-api.js";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
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
  const canvas = canvasRefs[index];
  if (!canvas) return;

  const detections = await faceapi.detectAllFaces(image);
  const displaySize = { width: image.naturalWidth, height: image.naturalHeight };
  faceapi.matchDimensions(canvas, displaySize);
  const resizedDetections = faceapi.resizeResults(detections, displaySize);

  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
    context.strokeStyle = 'red';
    context.lineWidth = 2;

    resizedDetections.forEach(detection => {
      const { x, y, width, height } = detection.box;

      const boxElement = document.createElement('div');
      boxElement.style.position = 'absolute';
      boxElement.style.border = '2px solid red';
      boxElement.style.cursor = 'pointer';
      boxElement.dataset.index = index.toString();
      boxElement.dataset.x = x.toString();
      boxElement.dataset.y = y.toString();
      boxElement.dataset.width = width.toString();
      boxElement.dataset.height = height.toString();

      const updateBoxStyle = () => {
        const scaleX = canvas.clientWidth / displaySize.width;
        const scaleY = canvas.clientHeight / displaySize.height;
        boxElement.style.top = `${y * scaleY}px`;
        boxElement.style.left = `${x * scaleX}px`;
        boxElement.style.width = `${width * scaleX}px`;
        boxElement.style.height = `${height * scaleY}px`;
      };

      updateBoxStyle();

      boxElement.addEventListener('click', () => handleBoxClick(image, detection.box));
      canvas.parentElement?.appendChild(boxElement);

      // Update the box position and size on window resize
      window.addEventListener('resize', updateBoxStyle);
    });
  }
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
    img.onload = () => {
      canvasRefs[index].width = img.naturalWidth;
      canvasRefs[index].height = img.naturalHeight;
      canvasRefs[index].style.width = img.width + 'px';
      canvasRefs[index].style.height = img.height + 'px';
      processImage(img, index);
    };
    img.src = url;
  });
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <div v-for="(imageUrl, index) in imageUrls" :key="index" class="position-relative mb-3">
          <img :src="imageUrl" class="w-100 rounded-lg"
            @load="(event) => { 
              const img = event.target; 
              canvasRefs[index].width = img!.naturalWidth; 
              canvasRefs[index].height = img!.naturalHeight; 
              canvasRefs[index].style.width = img!.width + 'px'; 
              canvasRefs[index].style.height = img!.height + 'px'; 
              processImage(img, index); 
            }" 
            style="object-fit: contain;" />
          <canvas :ref="el => canvasRefs[index] = el" class="position-absolute top-0 left-0 w-100 h-100"></canvas>
        </div>
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
  object-fit: contain;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
