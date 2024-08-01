<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as faceapi from "face-api.js";
import { useUserStore } from "@/stores/user.store";
import { useRoute, useRouter } from "vue-router";
import type { FaceDetection, WithFaceLandmarks, WithFaceDescriptor } from "face-api.js";
import type { User } from "@/stores/types/User";
import assignment from "@/services/assignment";
import { useAssignmentStore } from "@/stores/assignment.store";
import { useCourseStore } from "@/stores/course.store";
import { useAttendanceStore } from "@/stores/attendance.store";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
}

interface Identification {
  name: string;
  studentId: string;
  imageUrl: string;
}
function float32ArrayToBase64(float32Array: Float32Array): string {
  const uint8Array = new Uint8Array(float32Array.buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
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

const setCanvasRef = (index) => (el) => {
  canvasRefs[index] = el;
};

const imageUrls = ref<string[]>([]);
const identifications = ref<Identification[]>([]);
const croppedImagesDataUrls = ref<string[]>([]);
const canvasRefs = reactive<CanvasRefs>({});
const userDescriptors = new Map<string, Float32Array>();
const userStore = useUserStore();
const route = useRoute();
const courseStore = useCourseStore();
const router = useRouter();
const assignmentStore = useAssignmentStore();
const attendaceStore = useAttendanceStore();

async function processImage(image, index) {
  const canvas = canvasRefs[index] || document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");

  try {
    const detections = (await faceapi
      .detectAllFaces(image, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors()) as WithFaceLandmarks<
      { detection: FaceDetection },
      WithFaceDescriptor
    >[];

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
        });
      } else {
        identifications.value.push({
          name: "Unknown",
          studentId: "N/A",
          imageUrl: croppedDataURL!,
        });
      }
    });
  } catch (error) {
    console.error("Failed to process face detection:", error);
  }
}

function loadImageAndProcess(dataUrl: string, index: number): void {
  const img = new Image();
  img.onload = () => processImage(img, index);
  img.onerror = (error) => console.error("Error loading image:", dataUrl, error);
  img.src = dataUrl;
}

function findBestUserMatch(
  descriptor: Float32Array
): { user: User | null; score: number } {
  let bestMatch = { user: null, score: 0.7 };
  userDescriptors.forEach((userDescriptor, studentId) => {
    const distance = faceapi.euclideanDistance(descriptor, userDescriptor);
    if (distance < bestMatch.score) {
      bestMatch = {
        user: userStore.users.find((u) => u.studentId === studentId)!,
        score: distance,
      };
    }
  });
  return bestMatch;
}

onMounted(async () => {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);

    console.log("Models loaded successfully");
    console.log("Current Assignment:",  userStore.users);
    

    const faceDescriptions = userStore.users.map((user) => user.faceDescriptions![0]);
    faceDescriptions.forEach((description, index) => {
      if (description) {
        try {
          const float32Array = base64ToFloat32Array(description);
          const user = userStore.users[index];
          userDescriptors.set(user.studentId!, float32Array);

          // Added logging for debugging
          console.log(`User: ${user.email}, Student ID: ${user.studentId}`);
          console.log(`Face Description: ${description}`);
          console.log(`Float32Array: ${float32Array}`);
        } catch (error) {
          console.error("Error decoding face description for user:", userStore.users[index].email, error);
        }
      } else {
        console.warn("No face description found for user:", userStore.users[index].email);
      }
    });

    const urls: string[] = route.query.imageUrls || [];
    console.log(urls);
    imageUrls.value = urls;
    imageUrls.value.forEach((url, index) => {
      nextTick(() => loadImageAndProcess(url, index));
    });
  } catch (error) {
    console.error("Error in onMounted:", error);
    alert("Failed to load data. Please check the console for more details.");
  }
});

// Existing functions
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) =>
      reject(new Error(`Failed to load image from ${url}: ${error}`));
    img.src = url;
  });
}

function resizeAndConvertToBase64(
  imgUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg");
      resolve(dataUrl);
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

const confirmAttendance = async () => {
  console.log("Confirming attendance for", identifications.value.length, "students");
  for (let i = 0; i < identifications.value.length; i++) {
    try {
      if (!croppedImagesDataUrls.value[i]) {
        console.error("Image URL is missing for index:", i);
        continue;
      }

      const resizedImageBase64 = await resizeAndConvertToBase64(
        croppedImagesDataUrls.value[i],
        800,
        600
      );
      const blob = base64ToBlob(resizedImageBase64, "image/jpeg");
      const imageFile = new File([blob], `attendance_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      let identifiedUser =
        identifications.value[i].name !== "Unknown"
          ? userStore.users.find(
              (user) => user.firstName === identifications.value[i].name
            )
          : ({
              studentId: i + "",
              firstName: "Unknown",
              lastName: "Unknown",
              faceDescriptions: [],
            } as User);

      await attendaceStore.createAttendance(
        {
          attendanceId: 0,
          attendanceDate: new Date(),
          attendanceStatus: "present",
          attendanceConfirmStatus: identifiedUser ? "confirmed" : "notConfirmed",
          assignment: assignmentStore.assignment,
          user: identifiedUser,
          attendanceImage: "",
        },
        imageFile
      );
    } catch (error) {
      console.error(
        "Error recording attendance for",
        identifications.value[i].name,
        ":",
        error
      );
      console.error(
        "Detailed Error:",
        error instanceof Event ? "DOM Event error, check network or permissions." : error
      );
    }
  }
  // filter user from identifications and create user unknow 
  await userStore.getUserByCourseId(assignmentStore.assignment?.course.coursesId+'')
  const usersCreateUnkow = userStore.users.filter((user) => {
    return !identifications.value.some((identification) => identification.studentId === user.studentId);
  });
  console.log("Create user unknow", usersCreateUnkow);
  
  // create user unknow
  for (let i = 0; i < usersCreateUnkow.length; i++) {
    try {
      await attendaceStore.createAttendance(
        {
          attendanceId: 0,
          attendanceDate: new Date(),
          attendanceStatus: "absent",
          attendanceConfirmStatus: "notConfirmed",
          assignment: assignmentStore.assignment,
          user: usersCreateUnkow[i],
          attendanceImage: "",
        },
        new File([], "")
      );
    } catch (error) {
      console.error(
        "Error recording attendance for",
        usersCreateUnkow[i].firstName,
        ":",
        error
      );
      console.error(
        "Detailed Error:",
        error instanceof Event ? "DOM Event error, check network or permissions." : error
      );
    }
  }
  assignmentStore.assignment!.statusAssignment = 'completed';
  await assignmentStore.updateAssignment(assignmentStore.assignment!.assignmentId+'',assignmentStore.assignment!);
  if (userStore.currentUser?.role === "อาจารย์") {
    router.push("/reCheckMappingTeacher/course/"+ courseStore.currentCourse?.coursesId+"/assignment/" + assignmentStore.assignment?.assignmentId);
  } else {
    router.push("/mappingForStudent/course/"+ courseStore.currentCourse?.coursesId+"/assignment/" + assignmentStore.assignment?.assignmentId);
  }
};
</script>



<template>
  <v-container style="margin-top: 10%">
    <v-card
      class="mx-auto"
      color="primary"
      max-width="1200"
      outlined
      style="padding: 20px"
    >
      <v-card-title>
        <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
      </v-card-title>
    </v-card>
    <!-- Display Controls and Image Upload -->
    <v-row class="mt-5">
      <v-col cols="12" md="6"></v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="#CFEBFB" @click="confirmAttendance()"
          ><v-icon size="30">mdi-clipboard-check-outline</v-icon>ตรวจสอบการเช็คชื่อ</v-btn
        >
      </v-col>
    </v-row>

    <!-- Layout Row for Image Display and Identifications -->
    <v-row>
      <!-- Column for Original Images with Canvas Overlay -->
      <v-col cols="12" md="6">
        <div
          v-for="(imageUrl, index) in imageUrls"
          :key="'orig-image-' + index"
          class="position-relative mb-3"
        >
          <img :src="imageUrl" alt="Uploaded Image" class="w-90 rounded-lg" />
        </div>
      </v-col>

      <!-- Column for Identification and Cropped Images Display -->
      <v-col cols="12" md="6">
        <v-card style="overflow-y: scroll">
          <v-row>
            <v-col
              cols="12"
              sm="6"
              v-for="(name, index) in identifications"
              :key="'id-' + index"
            >
              <v-card outlined color="#EDEDED" class="rounded-lg">
                <v-card-title>
                  <v-icon small>mdi-circle-small</v-icon>{{ name.studentId }} |
                  {{ name.name }}</v-card-title
                >
                <v-img
                  :src="croppedImagesDataUrls[index]"
                  aspect-ratio="1.5"
                  class="rounded-lg"
                ></v-img>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
