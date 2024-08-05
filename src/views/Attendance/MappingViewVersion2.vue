<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import * as faceapi from "face-api.js";
import { useUserStore } from "@/stores/user.store";
import { useRoute, useRouter } from "vue-router";
import type { FaceDetection, WithFaceLandmarks, WithFaceDescriptor } from "face-api.js";
import type { User } from "@/stores/types/User";
import assignment from "@/services/assignment";
import { useAssignmentStore } from "@/stores/assignment.store";
import { useCourseStore } from "@/stores/course.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import type Attendance from "@/stores/types/Attendances";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
}

interface Identification {
  name: string;
  studentId: string;
  imageUrl: string;
  score: number;
  user: User;
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

const imageUrls = ref<string[]>([]);
const identifications = ref<Identification[]>([]);
const croppedImagesDataUrls = ref<string[]>([]);
const canvasRefs = reactive<CanvasRefs>({});
const userDescriptors = new Map<string, Float32Array[]>();
const userStore = useUserStore();
const route = useRoute();
const courseStore = useCourseStore();
const router = useRouter();
const assignmentStore = useAssignmentStore();
const attendanceStore = useAttendanceStore();
const isLoading = ref(true); // Add a loading state
const url = import.meta.env.VITE_API_URL as string;

onMounted(async () => {
  try {
    isLoading.value = true;
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    // get user by course id
    await userStore.getUserByCourseId(courseStore.currentCourse?.coursesId + '');
    await assignmentStore.getAssignmentById(route.params.assignmentId.toString());

    console.log("Models loaded successfully");
    console.log("Current Assignment:", userStore.users);

    // Process all face descriptions for each user
    userStore.users.forEach((user) => {
      const descriptors: Float32Array[] = [];

      // Iterate over each face description field
      const faceDescriptionFields = user.faceDescriptions || [];
      console.log("Face Descriptions Length:", user.faceDescriptions!.length);

      faceDescriptionFields.forEach((description, idx) => {
        if (description) {
          try {
            const float32Array = base64ToFloat32Array(description);
            descriptors.push(float32Array);
            console.log(`User: ${user.firstName}, Student ID: ${user.studentId}, Descriptor Index: ${idx}`);
          } catch (error) {
            console.error(`Error decoding face description ${idx + 1} for user: ${user.email}`, error);
          }
        } else {
          console.warn(`No face description found for user: ${user.email}, Descriptor Index: ${idx}`);
        }
      });

      // Store descriptors in the map with the student ID as the key
      if (descriptors.length > 0) {
        userDescriptors.set(user.studentId!, descriptors);
      }
    });

    const urls: string[] = route.query.imageUrls || [];
    console.log(urls);
    imageUrls.value = urls;

    // Process each image and wait for all to finish
    await Promise.all(
      imageUrls.value.map((url, index) => loadImageAndProcess(url, index))
    );
    console.log("Confirming attendance for", identifications.value, "students");

    // Call createAttendance after all images have been processed
    await createAttendance();

  } catch (error) {
    console.error("Error in onMounted:", error);
    alert("Failed to load data. Please check the console for more details.");
  } finally {
    isLoading.value = false; // Disable loading after processing
  }
});

async function processImage(image: HTMLImageElement, index: number) {
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
          score: 1 - bestMatch.score, // Higher score is better
          user: bestMatch.user,
        });
      } else {
        identifications.value.push({
          name: "Unknown",
          studentId: "N/A",
          imageUrl: croppedDataURL!,
          score: 0, // Unknown score
          user: null, //
        });
      }
    });
  } catch (error) {
    console.error("Failed to process face detection:", error);
  } finally {
    document.body.removeChild(canvas);
  }
}

function loadImageAndProcess(dataUrl: string, index: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        await processImage(img, index);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = (error) => {
      console.error("Error loading image:", dataUrl, error);
      reject(error);
    };
    img.src = dataUrl;
  });
}

function findBestUserMatch(
  descriptor: Float32Array
): { user: User | null; score: number } {
  const threshold = 0.6; // Set the threshold for best match
  let bestMatch = { user: null, score: threshold }; // Initialize best match with threshold score

  // Iterate over each user's descriptors
  userDescriptors.forEach((descriptors, studentId) => {
    // Iterate over each descriptor for the current user
    console.log("Student ID:", studentId, 'Descriptors:', descriptors.length);

    descriptors.forEach((userDescriptor) => {
      // Ensure descriptor lengths match to avoid calculation errors
      if (descriptor.length !== userDescriptor.length) {
        console.error(
          `Descriptor length mismatch for user ${studentId}:`,
          `descriptor length: ${descriptor.length}, userDescriptor length: ${userDescriptor.length}`
        );
        return; // Skip this descriptor if there's a length mismatch
      }

      // Calculate Euclidean distance between the input descriptor and the user's descriptor
      const distance = faceapi.euclideanDistance(descriptor, userDescriptor);

      // Debug logging to trace values
      console.log("Distance:", distance, "Threshold:", threshold, "Match Score:", bestMatch.score, "Student ID:", studentId);

      // Update best match if the current distance is lower than the current best score
      if (distance < bestMatch.score) {
        console.log("Best match updated:", studentId, distance);

        bestMatch = {
          user: userStore.users.find((u) => u.studentId === studentId)!, // Find the matching user by student ID
          score: distance, // Update the score with the new best distance
        };
      }
    });
  });

  return bestMatch; // Return the best match found
}

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

const createAttendance = async () => {
  attendanceStore.attendances = [];
  console.log("Confirming attendance for", identifications.value, "students");
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

      await attendanceStore.createAttendance(
        {
          attendanceId: 0,
          attendanceDate: new Date(),
          attendanceStatus: "present",
          attendanceConfirmStatus: identifiedUser ? "confirmed" : "notConfirmed",
          assignment: assignmentStore.assignment,
          user: identifiedUser,
          attendanceImage: "",
          attendanceScore: parseInt((identifications.value[i].score*100).toFixed(2)),
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

  // Filter users from identifications and create unknown users
  await userStore.getUserByCourseId(assignmentStore.assignment?.course.coursesId + '')
  const usersCreateUnknown = userStore.users.filter((user) => {
    return !identifications.value.some((identification) => identification.studentId === user.studentId);
  });
  console.log("Create unknown users", usersCreateUnknown);

  // Create unknown users
  for (let i = 0; i < usersCreateUnknown.length; i++) {
    try {
      await attendanceStore.createAttendance(
        {
          attendanceId: 0,
          attendanceDate: new Date(),
          attendanceStatus: "absent",
          attendanceConfirmStatus: "notConfirmed",
          assignment: assignmentStore.assignment,
          user: usersCreateUnknown[i],
          attendanceImage: "",
          attendanceScore: 0
        },
        new File([], "")
      );
    } catch (error) {
      console.error(
        "Error recording attendance for",
        usersCreateUnknown[i].firstName,
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
  await assignmentStore.updateAssignment(assignmentStore.assignment!.assignmentId + '', assignmentStore.assignment!);
  await attendanceStore.getAttendanceByAssignmentId(route.params.assignmentId.toString());

  console.log("Attendance confirmed successfully");
};

const confirmAttendance = async (attendance: Attendance) => {
  if (confirm("Do you want to confirm this attendance?")) {
    try {
      attendance.attendanceStatus = "present";
      attendance.attendanceConfirmStatus = "confirmed";
      await attendanceStore.confirmAttendanceByTeacher(attendance.attendanceId + "");
      alert("Attendance has been confirmed.");
  await attendanceStore.getAttendanceByAssignmentId(route.params.assignmentId.toString());

    } catch (error) {
      console.error("Error recording attendance:", error);
      alert("Failed to confirm attendance.");
    }
  }
};
//reject student
const reCheckAttendance = async (attendance: Attendance) => {
  try {
    attendance.attendanceStatus = "present";
    attendance.attendanceConfirmStatus = "recheck";
    await attendanceStore.rejectAttendanceByTeacher(attendance.attendanceId + "");
    alert("Attendance has been recheck.");
  await attendanceStore.getAttendanceByAssignmentId(route.params.assignmentId.toString());

  } catch (error) {
    console.error("Error recording attendance:", error);
    alert("Failed to recheck attendance.");
  }
};

</script>


<template>
  <v-container style="margin-top: 10%">
    <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px">
      <v-card-title>
        <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
      </v-card-title>
    </v-card>

    <!-- Display Controls and Image Upload -->
    <!-- <v-row class="mt-5">
      <v-col cols="12" md="6"></v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="#CFEBFB" @click="confirmAttendance()">
          <v-icon size="30">mdi-clipboard-check-outline</v-icon>ตรวจสอบการเช็คชื่อ
        </v-btn>
      </v-col>
    </v-row> -->

    <!-- Loading Spinner -->
    <v-row justify="center" v-if="isLoading">
      <v-col cols="12" md="6" class="text-center">
        <v-progress-circular :size="70" :width="7" indeterminate color="primary"></v-progress-circular>
        <div>Processing images...</div>
      </v-col>
    </v-row>
    <!-- Layout Row for Image Display and Identifications -->
    <v-row v-if="!isLoading">
      <!-- Column for Attendance Cards -->

      <v-row class="pt-5">
        <v-col v-for="(attendee, index) in attendanceStore.attendances?.filter(
          (attendee) => attendee.attendanceImage !== 'noimage.jpg'
        ) " :key="index" cols="12" sm="6" md="4" lg="3">
          <v-card class="mb-2" style="padding: 20px; background-color: rgb(237, 237, 237)">
            <v-row justify="center">
              <v-card-title class="bold-text mt-2">
                <v-icon small>mdi-circle-small</v-icon>
                {{ attendee.user?.studentId + " " + attendee.user?.firstName }}
              </v-card-title>
              <p>Confident value : {{ attendee.attendanceScore }}%</p>
            </v-row>
            <v-row>
              <v-col cols="6">
                <!-- {{attendee.attendanceImage}} -->
                <v-img :src="`${url}/attendances/image/${attendee.attendanceImage}`" height="200px"></v-img>
              </v-col>
              <v-col cols="6">
                <v-img :src="`${url}/users/${attendee.user?.userId}/image`" height="200px"></v-img>
              </v-col>
            </v-row>
            <v-card-text>
              <!-- <div>Score: {{ (attendee.*100).toFixed(2) }}%</div> -->
            </v-card-text>
            <v-card-actions>
              <v-btn variant="flat" color="warning" style="color: black"
                @click="reCheckAttendance(attendee)">Recheck</v-btn>
              <v-spacer></v-spacer>
              <v-btn variant="flat" color="success" @click="confirmAttendance(attendee)">Confirm</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<style scoped>
.bold-text {
  font-weight: bold;
}
</style>
