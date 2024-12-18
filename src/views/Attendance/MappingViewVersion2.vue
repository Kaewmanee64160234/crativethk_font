<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import * as faceapi from "face-api.js";
import { useUserStore } from "@/stores/user.store";
import { useRoute, useRouter } from "vue-router";
import Loader from "@/components/loader/Loader.vue";
import type { User } from "@/stores/types/User";
import { useAssignmentStore } from "@/stores/assignment.store";
import { useCourseStore } from "@/stores/course.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import type Attendance from "@/stores/types/Attendances";
import Swal from "sweetalert2";
import type { Identification } from "@/stores/types/identification.type";

interface CanvasRefs {
  [key: number]: HTMLCanvasElement;
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
const filterOptions = ["แสดงรายชื่อทั้งหมด", "ความถูกต้องน้อยกว่า 50%"];
const filterOption = ref("ความถูกต้องน้อยกว่า 50%");
const sortedAttendances = computed(() => {
  return attendanceStore.attendances
    ?.slice()
    .filter((attendance) => attendance.attendanceImage !== "noimage.jpg")
    .sort((a, b) => a.attendanceScore! - b.attendanceScore!);
});

// Filtering attendances based on the selected dropdown option
const filteredAttendances = computed(() => {
  if (filterOption.value === "ความถูกต้องน้อยกว่า 50%") {
    return sortedAttendances.value!.filter(
      (attendee) =>
        attendee.attendanceScore! < 50 && attendee.attendanceStatus == "present"
    );
  } else {
    return sortedAttendances.value?.filter(
      (attendee) => attendee.attendanceStatus == "present"
    );
  }
});

onMounted(async () => {
  try {
    isLoading.value = true;
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    ]);
    // get current course
    await courseStore.getCourseById(route.params.courseId.toString());
    // get user by course id
    await userStore.getUserByCourseId(
      courseStore.currentCourse?.coursesId + ""
    );
    await assignmentStore.getAssignmentById(
      route.params.assignmentId.toString()
    );

    console.time("Face Description Processing Time");
    userStore.users.forEach((user) => {
      const descriptors: Float32Array[] = [];
      const faceDescriptionFields = user.faceDescriptions || [];

      faceDescriptionFields.forEach((description, idx) => {
        if (description) {
          try {
            const float32Array = base64ToFloat32Array(description);
            descriptors.push(float32Array);
          } catch (error) {
            console.error(
              `Error decoding face description ${idx + 1} for user: ${
                user.email
              }`,
              error
            );
          }
        }
      });

      if (descriptors.length > 0) {
        userDescriptors.set(user.studentId!, descriptors);
      }
    });
    console.timeEnd("Face Description Processing Time");
    const urls: string[] = JSON.parse(localStorage.getItem("images") || "[]");
    console.log(urls);

    imageUrls.value = urls;
    localStorage.removeItem("images");

    console.time("Image Processing Time");
    await Promise.all(
      imageUrls.value.map((url, index) => loadImageAndProcess(url, index))
    );
    console.timeEnd("Image Processing Time");
    await assignmentStore.getAssignmentById(
      route.params.assignmentId.toString()
    );

    // Call createAttendance after all images have been processed
    if (assignmentStore.currentAssignment!.statusAssignment == "completed") {
      console.log(
        "Assignment is already completed. Skipping attendance confirmation."
      );
      console.time("Update Attendance Time");
      await updateAttdent();
      console.timeEnd("Update Attendance Time");
    } else {
      console.time("Create Attendance Time");
      await createAttendance();
      console.timeEnd("Create Attendance Time");
    }
  } catch (error) {
    console.error("Error in onMounted:", error);
    alert("Failed to load data. Please check the console for more details.");
  } finally {
    isLoading.value = false;
    console.timeEnd("Total Runtime");
  }
});

async function processImage(image: HTMLImageElement, index: number) {
  console.time(`Image Detection and Descriptor Time - Image ${index}`);
  const canvas = canvasRefs[index] || document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  try {
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

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
          score: 1 - bestMatch.score,
          user: bestMatch.user,
        });
      } else {
        identifications.value.push({
          name: "Unknown",
          studentId: "N/A",
          imageUrl: croppedDataURL!,
          score: 0,
          user: {
            studentId: "N/A",
            firstName: "Unknown",
            lastName: "Unknown",
            faceDescriptions: [],
          },
        });
      }
    });
  } catch (error) {
    console.error("Failed to process face detection:", error);
  } finally {
    document.body.removeChild(canvas);
    console.timeEnd(`Image Detection and Descriptor Time - Image ${index}`);
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

function findBestUserMatch(descriptor: Float32Array) {
  const threshold = 0.6; // Set the threshold for best match
  let bestMatch: { user?: User; score: number } = { score: threshold };
  // Initialize best match with threshold score

  // Iterate over each user's descriptors
  userDescriptors.forEach((descriptors, studentId) => {
    // Iterate over each descriptor for the current user
    console.log("Student ID:", studentId, "Descriptors:", descriptors.length);

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
      console.log(
        "Distance:",
        distance,
        "Threshold:",
        threshold,
        "Match Score:",
        bestMatch.score,
        "Student ID:",
        studentId
      );

      // Update best match if the current distance is lower than the current best score
      if (distance < bestMatch.score) {
        console.log("Best match updated:", studentId, distance);

        bestMatch = {
          user: userStore.users.find((u) => u.studentId === studentId), // Find the matching user by student ID
          score: distance, // Update the score with the new best distance
        };
      }
    });
  });

  return bestMatch; // Return the best match found
}

function resizeAndConvertToBase64(
  imgUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Ensure cross-origin images are handled correctly
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

      const dataUrl = canvas.toDataURL("image/jpeg");  // Ensure it returns a proper base64 string
      resolve(dataUrl);
    };

    img.onerror = (error) => {
      reject("Error loading image: " + error);
    };
  });
}


function base64ToBlob(base64: string, mimeType: string): Blob {
  // Regex to check if the base64 string contains the proper prefix
  const base64Pattern = /^data:(.*);base64,/;
  let byteCharacters;

  try {
    // Check if base64 string contains the proper data prefix (e.g., data:image/jpeg;base64,)
    if (base64Pattern.test(base64)) {
      // Strip the data URI prefix if present
      byteCharacters = atob(base64.split(",")[1]);
    } else {
      // Handle case where there is no prefix and attempt to decode the entire string
      byteCharacters = atob(base64);
    }
  } catch (error) {
    console.error("Error decoding base64 string:", error, base64);
    throw new Error("Invalid base64 string provided.");
  }

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

  // Submit known attendances
  await attendanceStore.submitAttendances(
    identifications.value,
    croppedImagesDataUrls.value,
    assignmentStore.currentAssignment!,
    "present",
    "notconfirm"

  );
  // Filter users from identifications and find unknown users
  await userStore.getUserByCourseId(assignmentStore.currentAssignment?.course.coursesId + "");
  const usersCreateUnknown = userStore.users.filter((user) => {
    return !identifications.value.some((identification) => identification.studentId === user.studentId);
  });
  console.log("Create unknown users", usersCreateUnknown);

  // Add unknown users to identifications and submit their attendance as "absent"
  const unknownUsers = usersCreateUnknown.map((user) => ({
    name: "Unknown",
    studentId: user.studentId!,
    imageUrl: "", // No image for unknown users
    score: 0, // Score is zero for unknown users
    user: user,
  }));

  await attendanceStore.submitAttendances(
    unknownUsers,
    Array(unknownUsers.length).fill(''), // No image data for unknown users
    assignmentStore.currentAssignment!,
     "absent",
    "notconfirm"

  );

  // Mark the assignment as completed
  assignmentStore.currentAssignment!.statusAssignment = "completed";
  await attendanceStore.revalidateAttendance(route.params.assignmentId.toString());

  await assignmentStore.updateAssignment(
    assignmentStore.currentAssignment!.assignmentId + "",
    assignmentStore.currentAssignment!
  );

  // Retrieve updated attendance data
  await attendanceStore.getAttendanceByAssignmentId(route.params.assignmentId.toString());

  console.log("Attendance confirmed successfully");
};

// update Attdent
const updateAttdent = async () => {
  await assignmentStore.getAssignmentById(route.params.assignmentId.toString());
  try {
    for (let i = 0; i < identifications.value.length; i++) {
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

     
      // find user from attdent from name identifiv=cation
      await attendanceStore.getAttendanceByAssignmentId(
        route.params.assignmentId.toString()
      );
      const userAttdent = attendanceStore.attendances!.find(
        (user) => user.user?.firstName === identifications.value[i].name
      );
      // console.log("User Attdent:", userAttdent);
      if (userAttdent) {
        userAttdent.attendanceStatus = "present";
        userAttdent.attendanceConfirmStatus = "notconfirm";
        userAttdent.attendanceScore = parseInt(
          (identifications.value[i].score * 100).toFixed(2)
        );
        userAttdent.assignment = assignmentStore.currentAssignment!;
        console.log("User Attdent:", userAttdent);

        await attendanceStore.confirmAttendance(userAttdent, imageFile);
      }
    }
  } catch (e) {
    console.error(
      "Error recording attendance for",

      ":",
      e
    );
    console.error(
      "Detailed Error:",
      e instanceof Event ? "DOM Event error, check network or permissions." : e
    );
  } finally {
    await attendanceStore.getAttendanceByAssignmentId(
      route.params.assignmentId.toString()
    );
  }
};



//reject student
const reCheckAttendance = async (attendance: Attendance) => {
  try {
    attendance.attendanceStatus = "absent";
    attendance.attendanceConfirmStatus = "notconfirm";
    await attendanceStore.rejectAttendanceByTeacher(
      attendance.attendanceId + ""
    );
    if (attendance.user == null) {
      await attendanceStore.removeAttendance(attendance.attendanceId + "");
    }
    Swal.fire({
      icon: "success",
      title: "เรียบร้อย",
      text: "คุณได้ทำการปฏิเสธการเช็คชื่อนี้เรียบร้อยแล้ว",
    }).then(async () => {
      await attendanceStore.getAttendanceByAssignmentId(
        route.params.assignmentId.toString()
      );
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    alert("Failed to recheck attendance.");
  }
};



const nextPage = () => {
  router.push(
    `/reCheckMappingTeacher/course/${courseStore.currentCourse?.coursesId}/assignment/${route.params.assignmentId}`
  );
};
const goToCourseDetail = () => {
  router.push(`/courseDetail/${courseStore.currentCourse?.coursesId}`);
};
</script>

<template>
  <v-container class="mt-10">
    <!-- Page Content for Attendance Checking -->
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

    <v-row v-if="isLoading">
      <Loader></Loader>
    </v-row>

    <v-row v-else style="padding: 20px">
      <v-col cols="12" class="d-flex justify-space-between align-center mb-4">
        <h1 class="display-1">ตรวจสอบการเช็คชื่อ</h1>
        <div class="d-flex align-end">
          <!-- Navigation Buttons -->
          <v-btn
            color="primary"
            style="color: rgba(9, 50, 113, 1); width: 150px"
            @click="nextPage"
            >ถัดไป</v-btn
          >
        </div>
      </v-col>

      <!-- Filter Dropdown and Status in the Same Row -->
      <v-row class="d-flex justify-space-between align-center">
        <!-- Dropdown on the left side -->
        <v-col cols="auto">
          <v-select
            v-model="filterOption"
            :items="filterOptions"
            label="แสดงรายชื่อทั้งหมด"
            variant="solo"
            dense
          ></v-select>
        </v-col>

        <!-- Status on the right side -->
        <v-col cols="auto">
          <div class="status-student d-flex align-end">
            <v-row class="align-center text-center" justify="center">
              <v-col cols="auto" class="status-section">
                <div class="status-number">{{ identifications.length }}</div>
                <div class="status-label correct-text">ตรวจจับได้</div>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col cols="auto" class="status-section">
                <div class="status-number">{{ userStore.users.length }}</div>
                <div class="status-label" style="color: rgba(0, 75, 188, 1)">
                  จำนวนนิสิตทั้งหมด
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <!-- Attendance Cards -->
      <v-col cols="12" class="pt-5">
        <v-container>
          <v-row>
            <v-col
              v-for="(attendee, index) in filteredAttendances"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="mb-3 hover-card"
                :style="{
                  padding: '20px',
                  backgroundColor: attendee.attendanceScore! >= 50 ? '#F1F1F1' : '#FEF2F2',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px'
                }"
              >
                <v-row justify="center">
                  <v-card-title class="bold-text mt-2 text-center ellipsis">
                    {{
                      attendee.user
                        ? attendee.user?.studentId 
                          
                        : "ไม่พบในฐานข้อมูล"
                    }}
                    <br>
                    {{
                      attendee.user
                        ?
                     attendee.user?.firstName + ' ' + attendee.user?.lastName 
                        : ""
                 
                    }}
                  </v-card-title>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-img
                      :src="`${url}/attendances/image/${attendee.attendanceImage}`"
                      height="200px"
                      class="rounded-lg"
                      style="border-radius: 10px"
                    ></v-img>
                  </v-col>
                  <v-col cols="6">
                    <v-img
                      v-if="attendee.user?.userId"
                      :src="`${url}/users/${attendee.user?.userId}/image`"
                      height="200px"
                      class="rounded-lg"
                      style="border-radius: 10px"
                    ></v-img>
                    <v-img
                      v-else
                      src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                      height="200px"
                      class="rounded-lg"
                      style="border-radius: 10px"
                    ></v-img>
                  </v-col>
                </v-row>
                <v-row justify="center">
                  <v-card-subtitle
                    :class="attendee.attendanceScore! >= 50 ? 'correct-text mb-3' : 'incorrect-text mb-3'"
                    style="font-weight: bolder"
                  >
                    ความถูกต้อง

                    {{ attendee.attendanceScore }}%
                  </v-card-subtitle>
                </v-row>
                <v-card-actions class="d-flex justify-center">
                  <v-btn
                    color="error"
                    variant="flat"
                    @click="reCheckAttendance(attendee)"
                    class="font-weight-bold"
                    block
                    style="border-radius: 8px"
                  >
                    ปฏิเสธ
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.bold-text {
  font-weight: bold;
  font-size: 15pt;
}

.correct-text {
  color: #10b981; /* Tailwind's Green */
}

.incorrect-text {
  color: #dc2626; /* Tailwind's Red */
}

.display-1 {
  font-size: 24px;
  font-weight: bold;
}

.status-section {
  margin: 0 20px;
}

.status-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.status-label {
  font-size: 14px;
  font-weight: bold;
  /* color: #777; */
}

.v-card {
  transition: transform 0.3s;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.v-btn {
  transition: background-color 0.3s;
}

.v-btn:hover {
  background-color: #f5f5f5;
}

/* Ellipsis for overflowing text */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
