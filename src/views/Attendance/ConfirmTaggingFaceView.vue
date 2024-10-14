<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as faceapi from "face-api.js";
import { useRoute, useRouter } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useUserStore } from "@/stores/user.store";
import type Attendance from "@/stores/types/Attendances";
import Swal from "sweetalert2";
import { useCourseStore } from "@/stores/course.store";

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
const courseStore = useCourseStore();
const userStore = useUserStore();
const router = useRouter();
const showUploadDialog = ref(false);
const showCamera = ref(false);
const courseId = ref("");
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
};

const fetchImages = async () => {
  
  const assignmentId = route.params.assignmentId;
  await assignmentStore.getAssignmentById(assignmentId + "");
  const images = assignmentStore.currentAssignment?.assignmentImages || [];
  imageUrls.value = images.map(
    (image) =>{
  console.log("Fetching images",image);

  return  `${import.meta.env.VITE_API_URL}/assignments/image/filename/${image}`
 
    }

  );
};

const processImage = async (image: any, index: number) => {
  const canvas = canvasRefs[index];
  if (!canvas) return;

  const detections = await faceapi.detectAllFaces(image);
  const displaySize = {
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
  faceapi.matchDimensions(canvas, displaySize);
  const resizedDetections = faceapi.resizeResults(detections, displaySize);

  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
    context.strokeStyle = "red";
    context.lineWidth = 2;

    resizedDetections.forEach((detection) => {
      const { x, y, width, height } = detection.box;

      const boxElement = document.createElement("div");
      boxElement.style.position = "absolute";
      boxElement.style.border = "2px solid red";
      boxElement.style.cursor = "pointer";
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

      boxElement.addEventListener("click", () =>
        handleBoxClick(image, detection.box)
      );
      canvas.parentElement?.appendChild(boxElement);

      window.addEventListener("resize", updateBoxStyle);
    });
  }
};

const handleBoxClick = (img: HTMLImageElement, box: faceapi.Box) => {
  const canvas = document.createElement("canvas");
  canvas.width = box.width;
  canvas.height = box.height;
  const context = canvas.getContext("2d");
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
  const arr = dataurl.split(",");
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
  courseId.value = route.params.courseId.toString();
  await loadModels();
  await fetchImages();

  await nextTick();
  await courseStore.getCourseById(courseId.value);

  imageUrls.value.forEach((url, index) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvasRefs[index].width = img.naturalWidth;
      canvasRefs[index].height = img.naturalHeight;
      canvasRefs[index].style.width = img.width + "px";
      canvasRefs[index].style.height = img.height + "px";
      processImage(img, index);
    };
    img.src = url;
  });
});

const reCheckAttendance = async (attendance: Attendance) => {
  try {
    stopCamera();
    attendance.assignment = assignmentStore.currentAssignment;
    const date = new Date();
    const currentDate = date.getTime();
    const assignmentDate = new Date(
      assignmentStore.currentAssignment!.createdDate!
    );
    const assignmentTime = assignmentDate.getTime();
    const diff = currentDate - assignmentTime;
    console.log("Diff:", diff);

    attendance.attendanceStatus = diff > 900000 ? "late" : "present";
    attendance.attendanceConfirmStatus = "recheck";
    attendance.user = userStore.currentUser;
    attendance.attendanceScore = 100;
    attendance.attendanceId = attendanceStore.currentAttendance?.attendanceId;
    console.log("Attendance:", attendance);

    if (croppedImage.value) {
      const imageFile = dataURLToFile(
        croppedImage.value,
        "rechecked-image.jpg"
      );
      console.log("Image File:", imageFile);

      const status = await attendanceStore.confirmAttendance(
        attendance,
        imageFile
      );
      if (status == 200) {
        Swal.fire({
          title: "ทำการยืน",
          text: "Attendance recheck completed.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          router.push("/courseDetail/" + queryCourseId);
          stopCamera();
          showDialog.value = false;
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "ไม่สามารถทำการยืนยันการเข้าเรียนได้",
          icon: "error",
          confirmButtonText: "OK",
        });
        stopCamera();
      }
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      title: "Error!",
      text: "ไม่สามารถทำการยืนยันการเข้าเรียนได้",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

const confirmRecheck = async () => {
  await attendanceStore.getAttendanceByAssignmentAndStudent(
    route.params.assignmentId.toString(),
    userStore.currentUser!.studentId!
  );
  await reCheckAttendance(attendanceStore.editAttendance);
  stopCamera();
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
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        const detections = await faceapi.detectAllFaces(img);
        if (detections.length > 0) {
          const box = detections[0].box;
          croppedImage.value = cropFaceFromImage(ctx, box);
          showDialog.value = true;
        } else {
          Swal.fire({
            title: "Error!",
            text: "ไม่สามารถทำการยืนยันการเข้าเรียนได้",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      };
    };
    reader.readAsDataURL(file);
  }
  showUploadDialog.value = false;
};

const cropFaceFromImage = (
  ctx: CanvasRenderingContext2D | null,
  box: faceapi.Box
) => {
  if (ctx) {
    const imageData = ctx.getImageData(box.x, box.y, box.width, box.height);
    const canvas = document.createElement("canvas");
    canvas.width = box.width;
    canvas.height = box.height;
    canvas.getContext("2d")?.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/jpeg");
  }
  return null;
};

const startCamera = async () => {
  showCamera.value = true;
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  if (videoRef.value) {
    videoRef.value.srcObject = stream;
  }

};

const captureImage = () => {
  if (videoRef.value && canvasRef.value) {
    const ctx = canvasRef.value.getContext("2d");
    canvasRef.value.width = videoRef.value.videoWidth;
    canvasRef.value.height = videoRef.value.videoHeight;
    ctx?.drawImage(
      videoRef.value,
      0,
      0,
      canvasRef.value.width,
      canvasRef.value.height
    );
    const imgData = canvasRef.value.toDataURL("image/jpeg");

    const img = new Image();
    img.src = imgData;
    img.onload = async () => {
      const detections = await faceapi.detectAllFaces(img);
      if (detections.length > 0) {
        const box = detections[0].box;
        croppedImage.value = cropFaceFromImage(ctx, box);
        stopCamera();

        showUploadDialog.value = false;
        showDialog.value = true;
      } else {
        showUploadDialog.value = false;
        Swal.fire({
          title: "Error!",
          text: "ไม่สามารถทำการยืนยันการเข้าเรียนได้",
          icon: "error",
          confirmButtonText: "OK",
        });
        // close camera
        stopCamera();
      }
    };
  }
};

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.value.srcObject = null;
    showCamera.value = false;
  }
};

const goToCourseDetail = () => {
  router.push("/courseDetail/" + queryCourseId);
};

const onDialogClose = (val: boolean) => {
  if (!val) {
    stopCamera();
  }
};

const closeShowUploadDialog = () => {
  showUploadDialog.value = false;
  stopCamera();
};

const closeDialogShowDialog = () => {
  showDialog.value = false;
  stopCamera();
};
</script>


<template>
  <v-container class="mt-10">
    <v-card
      class="mx-auto card-style"
      color="primary"
      outlined
      style="padding: 20px; width: 100%"
    >
      <v-card-title>
        <h1 class="text-h5">
          <span
            style="cursor: pointer; color: aliceblue; text-decoration: none"
            @click="goToCourseDetail"
          >
            {{ courseStore.currentCourse?.nameCourses }}
          </span>
          > {{ assignmentStore.currentAssignment?.nameAssignment }}
        </h1>
      </v-card-title>
    </v-card>

    <v-row>
      <v-col class="mt-3" cols="12">
        <h1 class="text-center">ตรวจสอบการเข้าเรียน</h1>
        <p class="text-center description">
          “โปรดคลิกที่ใบหน้าของคุณหากเป็นคุณ หากภาพไม่ใช่คุณ กรุณาคลิกปุ่ม
          “ไม่มีภาพของฉัน”
        </p>
      </v-col>
    </v-row>

    <v-row style="width: 100%">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn
          style="background-color: #4a678c; color: white"
          @click="openUploadDialog"
          >ไม่มีภาพของฉัน</v-btn
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
        v-for="(imageUrl, index) in imageUrls"
        :key="index"
      >
      {{ imageUrl }}
        <div class="position-relative mb-3">
          <img
            :src="imageUrl"
            class="w-100 rounded-lg"
            @load="(event:any) => {
              const img = event.target;
              canvasRefs[index].width = img!.naturalWidth!;
              canvasRefs[index].height = img!.naturalHeight!;
              canvasRefs[index].style.width = img!.width! + 'px';
              canvasRefs[index].style.height = img!.height! + 'px';
              processImage(img!, index);
            }"
            style="object-fit: contain"
          />
          <canvas
            :ref="(el:any) => canvasRefs[index] = el"
            class="position-absolute top-0 left-0 w-100 h-100"
          ></canvas>
        </div>
      </v-col>
    </v-row>

    <!-- Dialog to upload or capture image -->
    <v-dialog
      v-model="showUploadDialog"
      max-width="600px"
      @update:model-value="onDialogClose"
    >
      <v-card class="elevation-4">
        <v-card-title class="headline text-h6">
          Upload หรือถ่ายภาพเพื่อยืนยันตัวตน
        </v-card-title>
        <v-card-text>
          <v-file-input
            label="Upload Image"
            @change="onFileChange"
            accept="image/*"
          />
          <v-btn color="primary" @click="startCamera" class="mt-2">
            ถ่ายภาพ
          </v-btn>
        </v-card-text>

        <!-- Camera View -->
        <v-row v-if="showCamera" class="pa-4">
          <v-col cols="12">
            <video ref="videoRef" autoplay class="video-preview"></video>
            <canvas ref="canvasRef" style="display: none"></canvas>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn @click="captureImage" block>ถ่ายรูปภาพ</v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn @click="stopCamera" block color="error">ปิดกล้อง</v-btn>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-btn color="secondary" @click="closeShowUploadDialog()">
            ยกเลิก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Identity Dialog -->
    <v-dialog
      v-model="showDialog"
      max-width="500px"
      @update:model-value="onDialogClose"
    >
      <v-card class="elevation-4">
        <v-card-text class="text-center">
          <img
            :src="croppedImage!"
            alt="Cropped Face"
            class="rounded-lg mb-3 confirm-image"
          />
          <p>ภาพนี้ใช่คุณใช่หรือไม่</p>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn variant="flat" color="error" @click="closeDialogShowDialog">
            ไม่
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="primary" @click="confirmRecheck">
            ใช่
          </v-btn>
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
  color: #ff6e6e;
  margin-top: 10px;
}

/* Ensure image is responsive and not too large or small */
.confirm-image {
  width: 70%;
  max-width: 150px;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Video preview for camera capture */
.video-preview {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Elevation for better dialog design */
.elevation-4 {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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