<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as faceapi from "face-api.js";
import { useRoute, useRouter } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useUserStore } from "@/stores/user.store";
import type Attendance from "@/stores/types/Attendances";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
}

const assignmentStore = useAssignmentStore();
const route = useRoute();
const canvasRefs = reactive<CanvasRefs>({});
const imageUrls = ref<string[]>([]);
const croppedImage = ref<string | null>(null);
const queryCourseId = route.params.courseId;
const showDialog = ref(false);
const attendanceStore = useAttendanceStore();
const userStore = useUserStore();
const router = useRouter();
const showUploadDialog = ref(false);
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

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

const dataURLToFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
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

const reCheckAttendance = async (attendance: Attendance) => {
  try {
    attendance.assignment = assignmentStore.currentAssignment;
    const date = new Date();
    const currentDate = date.getTime();
    const assignmentDate = new Date(assignmentStore.currentAssignment!.createdDate!);
    const assignmentTime = assignmentDate.getTime();
    const diff = currentDate - assignmentTime;
    attendance.attendanceStatus = diff > 900000 ? "late" : "present";
    attendance.attendanceConfirmStatus = "recheck";
    attendance.user = userStore.currentUser;
    attendance.attendanceScore = 100;
    attendance.attendanceId = attendanceStore.currentAttendance?.attendanceId;
    console.log('Attendance:', attendance);
    

    if (croppedImage.value) {
      const imageFile = dataURLToFile(croppedImage.value, 'rechecked-image.jpg');
      console.log('Image File:', imageFile);
    
      await attendanceStore.confirmAttendance(attendance, imageFile);
    }

    router.push("/courseDetail/" + queryCourseId);
    showDialog.value = false;
  } catch (error) {
    console.log(error);
  }
};

const confirmRecheck = async () => {
  await attendanceStore.getAttendanceByAssignmentAndStudent(route.params.assignmentId.toString(), userStore.currentUser!.studentId!);
  await reCheckAttendance(attendanceStore.editAttendance);
  showDialog.value = false;
};

const openUploadDialog = () => {
  showUploadDialog.value = true;
};

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.src = e.target!.result as string;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        const detections = await faceapi.detectAllFaces(img);
        if (detections.length > 0) {
          const box = detections[0].box;
          croppedImage.value = cropFaceFromImage(ctx, box);
          showDialog.value = true;
        } else {
          alert('No face detected. Please try again.');
        }
      };
    };
    reader.readAsDataURL(file);
  }
  showUploadDialog.value = false;
};

const cropFaceFromImage = (ctx: CanvasRenderingContext2D | null, box: faceapi.Box) => {
  if (ctx) {
    const imageData = ctx.getImageData(box.x, box.y, box.width, box.height);
    const canvas = document.createElement('canvas');
    canvas.width = box.width;
    canvas.height = box.height;
    canvas.getContext('2d')?.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg');
  }
  return null;
};

const startCamera = () => {
  showCamera.value = true;
  if (videoRef.value) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.value!.srcObject = stream;
        videoRef.value!.play();
        showCamera.value = true;
      })
      .catch(err => {
        console.error("Error accessing the camera: ", err);
      });
  }
};

const captureImage = () => {
  if (videoRef.value && canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    canvasRef.value.width = videoRef.value.videoWidth;
    canvasRef.value.height = videoRef.value.videoHeight;
    ctx?.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height);
    const imgData = canvasRef.value.toDataURL('image/jpeg');

    // Process the captured image for face detection
    const img = new Image();
    img.src = imgData;
    img.onload = async () => {
      const detections = await faceapi.detectAllFaces(img);
      if (detections.length > 0) {
        const box = detections[0].box;
        croppedImage.value = cropFaceFromImage(ctx, box);
        showDialog.value = true;
      } else {
        alert('No face detected. Please try again.');
      }
    };
  }
};

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoRef.value.srcObject = null;
    showCamera.value = false;
  }
};
</script>


<template>
  <v-container class="mt-10">
    <v-row>
      <v-col class="mt-3" cols="12">
        <h1 class="text-center">Confirm Tagging Face</h1>
        <p class="text-center description">Please click on your face if it is you. If the image is not you, click the "Not My Image" button.</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="align-start justify-start">
        <v-btn color="secondary" @click="openUploadDialog">ไม่มีภาพของฉัน</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" v-for="(imageUrl, index) in imageUrls" :key="index">
        <div class="position-relative mb-3">
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

    <v-dialog v-model="showUploadDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Upload or Take a Photo</span>
        </v-card-title>
        <v-card-text>
          <v-file-input label="Upload Image" @change="onFileChange" accept="image/*" />
          <v-btn color="primary" @click="startCamera">Take Photo</v-btn>
        </v-card-text>
        <v-row v-if="showCamera">
          <v-col cols="12" sm="12">
            <video ref="videoRef" autoplay style="width: 100%; border-radius: 8px;"></video>
            <canvas ref="canvasRef" style="display: none;"></canvas>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn @click="captureImage" block>
              <v-icon left>mdi-camera</v-icon>
              Capture Image
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn @click="stopCamera" block color="error">
              <v-icon left>mdi-close</v-icon>
              Close Camera
            </v-btn>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-btn color="secondary" @click="showUploadDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Confirm Identity</span>
        </v-card-title>
        <v-card-text class="text-center">
          <img :src="croppedImage" alt="Cropped Face" class="rounded-lg mb-2" />
          <p>Is this you?</p>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="confirmRecheck">Yes</v-btn>
          <v-btn color="secondary" @click="showDialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<style scoped>
/* Main container to center content */
.v-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Description text styling */
.description {
  font-size: 1.1rem;
  color: #555;
  margin-top: 10px;
}

/* Image container to maintain position relative for canvas overlay */
.image-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Image styling to keep it centered and contained */
.image-display {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Canvas for overlay effects */
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Dialog text alignment for better UX */
.v-card-text {
  text-align: center;
}

/* Button styling for consistency */
.v-btn {
  text-transform: none;
  font-weight: bold;
}
</style>
