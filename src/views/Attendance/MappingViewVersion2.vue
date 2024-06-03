<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as faceapi from "face-api.js";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type {
  FaceDetection,
  WithFaceLandmarks,
  WithFaceDescriptor,
} from "face-api.js"; // Import types
import { useAssignmentStore } from "@/stores/assignment.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useUserStore } from "@/stores/user.store";
import router from "@/router";
import type { User } from "@/stores/types/User";
import { useCourseStore } from "@/stores/course.store";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
}

const imageUrls = ref<string[]>([]);
const identifications = ref<{ name: string; studentId: string }[]>([]);
const croppedImagesDataUrls = ref<string[]>([]);
const canvasRefs = reactive<CanvasRefs>({});
const assigmentStore = useAssignmentStore();
const attendaceStore = useAttendanceStore();
const userStore = useUserStore();
const courseStore = useCourseStore();

const processImage = async (image: HTMLImageElement, index: number) => {
  await nextTick();
  const canvas = canvasRefs[index];
  if (!canvas || image.naturalWidth === 0 || image.naturalHeight === 0) {
    console.error("Canvas not available for processing or image size is zero.");
    return;
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Unable to get canvas context.");
    return;
  }

  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

  try {
    const displaySize = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = (await faceapi
      .detectAllFaces(image, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors()) as WithFaceLandmarks<
        { detection: FaceDetection },
        WithFaceDescriptor
      >[];
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    updateIdentifications(resizedDetections, image, ctx);
  } catch (error) {
    console.error("Failed to detect faces:", error);
  }
};
function resizeAndConvertToBase64(imgUrl, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate the new dimensions of the image
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

      // Convert to base64
      const dataUrl = canvas.toDataURL("image/jpeg"); // You can change 'image/jpeg' to another format if needed
      resolve(dataUrl);
    };
    img.onerror = reject;
  });
}

const loadImageAndProcess = (dataUrl: string, index: number) => {
  const img = new Image();
  img.onload = () => {
    processImage(img, index);
  };
  img.onerror = (errorEvent) => {
    console.error("Error loading image:", dataUrl, errorEvent);
  };
  img.src = dataUrl;
};

onMounted(async () => {
  const route = useRoute();
  await userStore.getUserByCourseId(courseStore.currentCourse!.coursesId!);
  await userStore.getCurrentUser();

  console.log("Route object:", route); // Debugging line to check the entire route object

  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

  const urls: string[] = route.query.imageUrls || [];
  console.log(urls.length);

  if (Array.isArray(urls) && urls.length > 0) {
    imageUrls.value = urls;
    imageUrls.value.forEach((url, index) => {
      nextTick(() => loadImageAndProcess(url, index));
    });
  }
});

const setCanvasRef = (index: number) => (el: HTMLCanvasElement) => {
  if (el) {
    canvasRefs[index] = el;
  }
};
const updateIdentifications = (detections, image, index) => {
  console.log("userStore.users:", userStore.users); // Debug what userStore.users currently holds

  // Check if userStore.users is an array before proceeding
  if (!Array.isArray(userStore.users)) {
    console.error("userStore.users is not an array", userStore.users);
    return;
  }

  // Filter users to include only those with valid face descriptions
  const validUsers = userStore.users.filter(user =>
    user.faceDescriptions &&
    Array.isArray(user.faceDescriptions) &&
    user.faceDescriptions.every(desc => desc && desc.length === 128)
  );

  if (validUsers.length === 0) {
    console.error("No valid face descriptors found. Please check the user data.");
    return;
  }

  // Prepare face descriptors for the FaceMatcher
  const labeledDescriptors = validUsers.map(user =>
    new faceapi.LabeledFaceDescriptors(
      user.firstName,
      user.faceDescriptions.map(desc => new Float32Array(desc))
    )
  );

  // Initialize the FaceMatcher with a lower threshold for more strict matching
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

  detections.forEach(detection => {
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    const person = validUsers.find(user => user.firstName === bestMatch.label);

    // Push identification data, handle unknown differently
    identifications.value.push({
      name: person ? person.firstName : "Unknown",
      studentId: person ? person.studentId ?? "N/A" : "N/A"
    });


    const box = detection.detection.box;
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = box.width;
    cropCanvas.height = box.height;
    const cropCtx = cropCanvas.getContext("2d");
    cropCtx.drawImage(image, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
    croppedImagesDataUrls.value.push(cropCanvas.toDataURL());

  });
};

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteArrays = [];

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
  for (let i = 0; i < identifications.value.length; i++) {
    try {
      // Verify image URL before processing
      if (!croppedImagesDataUrls.value[i]) {
        console.error("Image URL is missing for index:", i);
        continue; // Skip this iteration if the URL is missing
      }

      // Resize image and convert to Base64
      const resizedImageBase64 = await resizeAndConvertToBase64(
        croppedImagesDataUrls.value[i], 800, 600
      );
      const blob = base64ToBlob(resizedImageBase64, "image/jpeg");
      const imageFile = new File([blob], `attendance_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Determine user object based on identification
      let identifiedUser = identifications.value[i].name !== "Unknown"
        ? userStore.users.find(user => user.firstName === identifications.value[i].name)
        : {
          studentId: i + '',
          firstName: "Unknown",
          lastName: "Unknown",
          faceDescriptions: []
        } as User;



      // Log the attempt to create attendance
      // console.log("Submitting:", attendanceData);
      await attendaceStore.createAttendance({
        attendanceId: 0,
        attendanceDate: new Date(),
        attendanceStatus: "present",
        attendanceConfirmStatus: identifiedUser ? "confirmed" : "notConfirmed",
        assignment: assigmentStore.assignment,
        user: identifiedUser,
        attendanceImage: ""
      }, imageFile);
      // console.log("Attendance recorded successfully for", identifications.value[i].name);

    } catch (error) {
      console.error("Error recording attendance for", identifications.value[i].name, ":", error);
      console.error("Detailed Error:", error instanceof Event ? "DOM Event error, check network or permissions." : error);
    }
  }
  if (userStore.currentUser?.role === 'teacher') {
    router.push('/resheckMappingTeacher/' + assigmentStore.assignment?.assignmentId);
  } else {
    router.push('/mappingForStudent/' + assigmentStore.assignment?.assignmentId);

  }


};


</script>
<template>
  <v-container style="margin-top: 5%">
    <!-- Display Controls and Image Upload -->
    <v-row>
      <v-col cols="12" md="6"></v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="confirmAttendance()">Check Attendance</v-btn>
      </v-col>
    </v-row>

    <!-- Layout Row for Image Display and Identifications -->
    <v-row>
      

      <!-- Column for Original Images with Canvas Overlay -->
      <v-col cols="12" md="6">
        <div v-for="(imageUrl, index) in imageUrls" :key="'orig-image-' + index"
          class="position-relative mb-3">
          <img :src="imageUrl" alt="Uploaded Image" class="w-100" />
          <canvas :ref="setCanvasRef(index)" class="overlay-canvas"></canvas>
        </div>
      </v-col>

      <!-- Column for Identification and Cropped Images Display -->
      <v-col cols="12" md="6">
        <v-row>
          <v-col cols="12" sm="6" v-for="(name, index) in identifications" :key="'id-' + index">
            <v-card outlined>
              <v-card-title>{{ name.studentId }} | {{ name.name }}</v-card-title>
              <v-img :src="croppedImagesDataUrls[index]" aspect-ratio="1.5" class="rounded-lg"></v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.mb-3 {
  margin-bottom: 1rem;
}

.w-100 {
  width: 100%;
}

.position-relative {
  position: relative;
}

.text-right {
  text-align: right;
}
</style>
