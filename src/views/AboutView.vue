<template>
  <h1>This is an about page</h1>
  
  <!-- Button to trigger the camera -->
  <v-btn @click="startCamera">Take Photo</v-btn>
  <v-btn v-if="cameraActive" @click="flipCamera">Flip Camera</v-btn>
  <video ref="videoElement" style="display: none;" autoplay></video>
  <v-btn v-if="cameraActive" @click="capturePhoto">Capture Photo</v-btn>

  <!-- File input for selecting an image -->
  <input type="file" @change="onFileChange" accept="image/*">
  
  <!-- Display the selected image -->
  <h1>Section</h1>
  <img ref="imageElement" :src="selectedImage" alt="Selected Image" style="height: 50vh; display: block;">
  
  <!-- Canvas for drawing detections, placed directly over the image -->
  <canvas ref="canvas" style="position: absolute; left: 0; top: 0;"></canvas>
  
  <!-- Button to trigger face detection -->
  <v-btn @click="detectFaces">Detect Faces</v-btn>
  
  <!-- Display detection result -->
  <p v-if="faceDescription">Detected: {{ faceDescription }}</p>
  <p v-else-if="detectionStatus === 'no-face'">Cannot detect</p>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import * as faceapi from 'face-api.js';

const selectedImage = ref('');
const imageElement = ref<HTMLImageElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const faceDescription = ref<string | null>(null); // To store face description
const detectionStatus = ref<string | null>(null); // To track detection status
const cameraActive = ref(false);
const facingMode = ref<'user' | 'environment'>('user'); // Track front or rear camera

// Load the models
const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  console.log('Models loaded');
};
loadModels();

// Start the camera stream
const startCamera = async () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode.value } });
    videoElement.value!.srcObject = stream;
    videoElement.value!.style.display = 'block';
    cameraActive.value = true;
  }
};

// Flip between front and rear cameras
const flipCamera = async () => {
  // Switch facing mode
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
  
  // Restart the camera with the new facing mode
  if (cameraActive.value) {
    stopCamera();
    await startCamera();
  }
};

// Stop the camera stream
const stopCamera = () => {
  const stream = videoElement.value?.srcObject as MediaStream;
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
};

// Capture photo from the camera
const capturePhoto = async () => {
  const video = videoElement.value;
  const canvasElement = document.createElement('canvas');
  const context = canvasElement.getContext('2d');

  if (video && context) {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    selectedImage.value = canvasElement.toDataURL('image/png');
    
    // Stop camera after capturing
    stopCamera();
    cameraActive.value = false;
    videoElement.value!.style.display = 'none';
  }
};

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

    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

    if (detections.length > 0) {
      detectionStatus.value = null;
      
      const displaySize = { width: img.width, height: img.height };
      faceapi.matchDimensions(canvas.value, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.value.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

        // Draw detections and landmarks
        faceapi.draw.drawDetections(canvas.value, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas.value, resizedDetections);

        // Set face description with details
        faceDescription.value = resizedDetections.map((detection, index) => {
          const box = detection.detection.box;
          const descriptor = detection.descriptor.slice(0, 5).map(val => val.toFixed(2)).join(', ');
          return `Face ${index + 1}: Box [${box.x.toFixed(1)}, ${box.y.toFixed(1)}, ${box.width.toFixed(1)}, ${box.height.toFixed(1)}], Descriptor [${descriptor}]`;
        }).join('; ');
      }
    } else {
      // No faces detected
      faceDescription.value = null;
      detectionStatus.value = 'no-face';
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
