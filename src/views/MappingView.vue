<template>

  <div style="margin-bottom: 20px">
    <input type="file"  @change="onFirstImageChange" accept="image/*" />
    <div style="position: relative; width: 250px; height: 250px">
      <img
        v-if="firstImageSrc"
        :src="firstImageSrc"
        alt="First Image"
        width="250"
        height="250"
      />
      <canvas
        ref="firstCanvas"
        width="250"
        height="250"
        style="position: absolute; top: 0; left: 0"
      ></canvas>
    </div>
  </div>
  <div style="margin-bottom: 20px">
    <input type="file" @change="onSecondImageChange" accept="image/*" />
    <div style="position: relative; width: 250px; height: 250px">
      <img
        v-if="secondImageSrc"
        :src="secondImageSrc"
        alt="Second Image"
        width="250"
        height="250"
      />
      <canvas
        ref="secondCanvas"
        width="250"
        height="250"
        style="position: absolute; top: 0; left: 0"
      ></canvas>
    </div>
  </div>
  <!-- show descption -->
    <div v-if="firstImageDescriptors.length > 0">
        <h3>First Image Descriptors:</h3>
        <pre>{{ firstImageDescriptors }}</pre>
    </div>
    <div v-if="secondImageDescriptors.length > 0">
        <h3>Second Image Descriptors:</h3>
        <pre>{{ secondImageDescriptors }}</pre>
    </div>
  <div v-if="comparisonResult !== null" style="margin-bottom: 20px">
    <h3>Comparison Result:</h3>
    <p v-if="comparisonResult">Match Found</p>
    <p v-else>No Match Found</p>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import * as faceapi from 'face-api.js';

// Define reactive properties
const firstImageSrc = ref<string>('');
const secondImageSrc = ref<string>('');
const comparisonResult = ref<boolean | null>(null);
const firstImageDescriptors = ref<Float32Array[]>([]);
const secondImageDescriptors = ref<Float32Array[]>([]);

// Load models
onMounted(async () => {
  await loadModels();
});

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

// Adjusted handleImageUpload to remove canvas processing for simplicity
async function handleImageUpload(event: Event, descriptorsRef: { value: Float32Array[] }) {
  const files = (event.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  const objectURL = URL.createObjectURL(files[0]);
  await nextTick(); // Wait for nextTick if necessary for image binding updates
  const imgElement = new Image();
  imgElement.onload = async () => { // Ensure image is loaded before processing
    await processImage(imgElement, descriptorsRef);
    URL.revokeObjectURL(objectURL); // Cleanup
  };
  imgElement.src = objectURL; // Trigger image loading
}

async function processImage(imgElement: HTMLImageElement, descriptorsRef: { value: Float32Array[] }) {
  const detections = await faceapi
    .detectAllFaces(imgElement, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptors();
  descriptorsRef.value = detections.map(d => d.descriptor);
  // Consider logging here to ensure descriptors are set
}

const onFirstImageChange = async (event: Event) => {
  comparisonResult.value = null; // Reset comparison result
  await handleImageUpload(event, firstImageDescriptors);
  firstImageSrc.value = URL.createObjectURL(event.target!.files[0]); // Update image src
};

const onSecondImageChange = async (event: Event) => {
  await handleImageUpload(event, secondImageDescriptors);
  secondImageSrc.value = URL.createObjectURL(event.target!.files[0]); // Update image src
};

watch([firstImageDescriptors, secondImageDescriptors], ([first, second], [oldFirst, oldSecond]) => {
  // Only run comparison if both images have been processed
  if (first.length > 0 && second.length > 0 && (first !== oldFirst || second !== oldSecond)) {
    performComparison();
  }
});

function performComparison() {
  const faceMatcher = new faceapi.FaceMatcher(firstImageDescriptors.value);
  const match = secondImageDescriptors.value.some(descriptor => faceMatcher.findBestMatch(descriptor).label !== 'unknown');
  comparisonResult.value = match;
  // Log the comparison result to ensure it's being set
  console.log('Comparison result:', match);
}
</script>
