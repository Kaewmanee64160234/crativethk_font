<template>
  <h1>This is an about page</h1>
  <!-- File input for selecting an image -->
  <!-- Button to trigger face detection -->
  <!-- Display the selected image -->
  <h1> Section</h1>
  <img ref="imageElement" :src="selectedImage" alt="Selected Image" style="height: 50vh; display: block;">
  <!-- Canvas for drawing detections, placed directly over the image -->
  <canvas ref="canvas" style="position: absolute; left: 0; top: 0;"></canvas>
  <input type="file" @change="onFileChange" accept="image/*">
  <button @click="detectFaces">Detect Faces</button>


</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import * as faceapi from 'face-api.js';

const selectedImage = ref('');
const imageElement = ref<HTMLImageElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

// Load the models
const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  console.log('Models loaded');
};
loadModels();

const adjustCanvasToImage = () => {
  if (imageElement.value && canvas.value) {
    const img = imageElement.value;
    const cnv = canvas.value;

    const { width, height, top, left } = img.getBoundingClientRect();
    cnv.width = width;
    cnv.height = height;
    cnv.style.top = `${top}px`;
    cnv.style.left = `${left}px`;
  }
};

const detectFaces = async () => {
  if (imageElement.value && canvas.value) {
    const img = imageElement.value;

    await nextTick();
    adjustCanvasToImage();

    const detections = await faceapi.detectAllFaces(img);
    // const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    if (detections.length > 0) {
      const displaySize = { width: img.width, height: img.height };
      faceapi.matchDimensions(canvas.value, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.value.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
        faceapi.draw.drawDetections(canvas.value, resizedDetections);
        // faceapi.draw.drawFaceLandmarks(canvas.value, resizedDetections);
      }
    }
  }
};

const onFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    const file = files[0];
    selectedImage.value = URL.createObjectURL(file);
    
    // Wait for the image to load and then adjust the canvas
    await nextTick();
    if (imageElement.value) {
      imageElement.value.onload = () => adjustCanvasToImage();
    }
  }
};
</script>
