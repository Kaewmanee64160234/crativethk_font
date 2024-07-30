<script setup lang="ts">
import { useAssignmentStore } from '@/stores/assignment.store';
import { useAttendanceStore } from '@/stores/attendance.store';
import { useCourseStore } from '@/stores/course.store';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import * as faceapi from 'face-api.js';

const courseStore = useCourseStore();
const userStore = useUserStore();
const attendanceStore = useAttendanceStore();
const assignmentStore = useAssignmentStore();
const url = import.meta.env.VITE_API_URL;
const route = useRoute();

const canvasRefs = ref<Record<string, HTMLCanvasElement>>({});
const modelsLoaded = ref(false);

onMounted(async () => {
  await assignmentStore.getAssignmentById(route.params.assignmentId+'');
  console.log(assignmentStore.currentAssignment);
  await loadModels();
  modelsLoaded.value = true;
  await nextTick(); // Wait until DOM is updated
  processImages();
});

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

async function processImages() {
  const images = document.querySelectorAll('img[data-detect]');
  images.forEach(async (img, index) => {
    const canvas = canvasRefs.value[index];
    if (canvas && modelsLoaded.value) {
      const detections = await faceapi.detectAllFaces(img);
      faceapi.matchDimensions(canvas, img);
      const resizedDetections = faceapi.resizeResults(detections, img);
      faceapi.draw.drawDetections(canvas, resizedDetections);
    }
  });
}
</script>

<template>
  <v-card>
    <v-card-title>
      <span class="headline">Assignment Images</span>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col v-for="(image, index) in assignmentStore.currentAssignment?.assignmentImages" :key="index" cols="4">
          <div style="position: relative;">
            <img :src="`${url}/assignments/image/filename/${image}`" aspect-ratio="1" :data-detect="true" crossOrigin="anonymous" @load="processImages" />
            <canvas :ref="el => canvasRefs[index] = el" style="position: absolute; top: 0; left: 0;"></canvas>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" text @click="assignmentStore.dialogAssignmentTag = false">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
img {
  width: 100%;
  height: auto;
}
canvas {
  width: 100%;
  height: auto;
}
</style>
