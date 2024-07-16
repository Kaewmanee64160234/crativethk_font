<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import CardAssigment from "@/components/assigment/CardAssigment.vue";
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import type Assignment from "@/stores/types/Assignment";
import type Attendance from "@/stores/types/Attendances";

const route = useRoute();
const id = ref(route.params.idCourse);
const tabs = [
  { id: 1, title: "Posts" },
  { id: 2, title: "Members" },
  { id: 3, title: "Record" },
];

const router = useRouter();
const tab = ref("posts");
const posts = ref<Assignment[]>([]);
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const assigmentStore = useAssignmentStore();
const courseStore = useCourseStore();
const showTextArea = ref(false);
const nameAssignment = ref("");
const userStore = useUserStore();
const url = "http://localhost:3000";
const attendanceStore = useAttendanceStore();
const roomSelect = ref<string>();

// Camera related
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const showCamera = ref(false);

onMounted(async () => {
  try {
    await assigmentStore.getAssignmentByCourseId(id.value.toString());
    await attendanceStore.getAttendanceByCourseId(id.value.toString());
    await userStore.getUserByCourseId(id.value.toString());
    await courseStore.getCourseById(id.value.toString());
    await courseStore.getAllRooms();
    posts.value = assigmentStore.assignments;
  } catch (error) {
    console.error("Error in onMounted:", error);
    alert("Failed to load data. Please check the console for more details.");
  }
});

const processFile = (url: string) => {
  imageUrls.value.push(url);
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    imageUrls.value = [];
    imageFiles.value = [];
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          try {
            const resizedImage = await resizeAndConvertImageToBase64(result, 800, 600);
            imageUrls.value.push(resizedImage);
            imageFiles.value.push(file);
          } catch (error) {
            console.error("Error resizing image:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const openPost = () => {
  showTextArea.value = !showTextArea.value;
};

const resizeAndConvertImageToBase64 = (imageUrl: string, maxWidth: number, maxHeight: number) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
    img.src = imageUrl;
  });
};

const createPost = async () => {
  if (nameAssignment.value === "") {
    return;
  }

  const room = courseStore.rooms.find((r) => r.roomNumber === roomSelect.value);

  const newAssignment = {
    assignmentTime: new Date(),
    nameAssignment: nameAssignment.value,
    course: { ...courseStore.currentCourse! },
    assignmentId: 0,
    attdances: [],
    room: room,
    createdDate: new Date(),
    updatedDate: undefined,
    deletedDate: undefined,
  };

  try {
    await assigmentStore.createAssignment(newAssignment);
    if (imageUrls.value.length > 0) {
      router.push({ path: "/mapping2", query: { imageUrls: imageUrls.value } });
      nameAssignment.value = "";
      imageUrls.value = [];
    } else {
      console.error("No images available for posting.");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Failed to create post. Please check the console for more details.");
  }
};

const getAttendanceStatus = (
  attendances: Attendance[],
  userId: number,
  assignmentId: number
): string => {
  const attendance = attendances?.find(
    (att) => att.user?.userId === userId && att.assignment?.assignmentId === assignmentId
  );
  return attendance ? attendance.attendanceStatus : "No Record Found";
};

const calculateTotalScore = (userId: number, assignments: Assignment[]): number => {
  return assignments.reduce((total, assignment) => {
    const status = getAttendanceStatus(
      attendanceStore.attendances || [],
      userId,
      assignment.assignmentId!
    );
    if (status === "present") {
      return total + 1;
    } else if (status === "late") {
      return total + 0.5;
    }
    return total;
  }, 0);
};

// Camera related methods
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
    if (!ctx) return;
    canvasRef.value.width = videoRef.value.videoWidth;
    canvasRef.value.height = videoRef.value.videoHeight;
    ctx.drawImage(videoRef.value, 0, 0);
    const imageUrl = canvasRef.value.toDataURL("image/jpeg");
    resizeAndConvertImageToBase64(imageUrl, 800, 600)
      .then((resizedImage) => {
        imageUrls.value.push(resizedImage);
        const file = dataURLtoFile(resizedImage, `image-${Date.now()}.jpg`);
        imageFiles.value.push(file);
      })
      .catch((error) => console.error("Error resizing image:", error));
  }
};

const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
    videoRef.value.srcObject = null;
  }
  showCamera.value = false;
};

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
</script>

<template>
  <div style="margin-top: 5%; margin-left: 5%">
    <v-tabs v-model="tab">
      <v-tab v-for="item in tabs" :key="item.id" :value="item.title">
        {{ item.title }}
      </v-tab>
    </v-tabs>

    <v-container>
      <!-- Tab content for posts -->
      <v-tab-item v-if="tab === 'Posts'" value="Posts">
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

        <v-btn color="#6CA7FA" @click="openPost" style="margin: 10px 0; color: black">
          <v-icon>mdi-plus</v-icon>สร้างการเช็คชื่อ
        </v-btn>
        <!-- Conditional text area -->
        <v-card v-if="showTextArea" style="margin: 10px">
          <v-container>
            <v-autocomplete
              v-model="roomSelect"
              :items="courseStore.rooms.map((r) => r.roomNumber)"
              item-text="roomNumber"
              item-value="roomNumber"
              label="Select a room"
              variant="outlined"
              outlined
              return-object
            ></v-autocomplete>
            <v-textarea
              v-model="nameAssignment"
              label="Enter your post"
              variant="outlined"
              outlined
            ></v-textarea>
            <v-file-input
              label="Upload Images"
              prepend-icon="mdi-camera"
              filled
              @change="handleFileChange"
              accept="image/*"
              variant="outlined"
              multiple
            ></v-file-input>
            <v-btn color="primary" @click="startCamera">Open Camera</v-btn>
            <div v-if="showCamera">
              <video ref="videoRef" autoplay></video>
              <canvas ref="canvasRef" style="display: none;"></canvas>
              <v-btn @click="captureImage">Capture Image</v-btn>
              <v-btn @click="stopCamera">Close Camera</v-btn>
            </div>
            <div>
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                  v-for="(image, index) in imageUrls"
                  :key="index"
                >
                  <v-img :src="image" aspect-ratio="1" class="ma-2"></v-img>
                </v-col>
              </v-row>
            </div>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="showTextArea = false">ยกเลิก</v-btn>
            <v-btn color="primary" @click="createPost()">โพสต์</v-btn>
          </v-card-actions>
        </v-card>

        <v-row>
          <v-col cols="12" sm="12" md="12" v-for="post in posts" :key="post.assignmentId">
            <CardAssigment :post="post"></CardAssigment>
          </v-col>
        </v-row>
      </v-tab-item>

      <!-- Tab content for Members -->
      <v-tab-item v-else-if="tab === 'Members'" value="Members">
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
        <div style="width: 100%; padding: 20px">
          <!-- Teacher Section -->
          <div style="margin-bottom: 30px">
            <v-row>
              <v-col>
                <h3>Teacher</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-divider></v-divider>

              <v-col cols="2">
                <v-avatar size="56">
                  <v-img
                    :src="`${url}/users/${courseStore.currentCourse?.user?.userId}/image`"
                  ></v-img>
                </v-avatar>
              </v-col>
              <v-col cols="10" style="display: flex; align-items: center">
                <div>
                  {{
                    courseStore.currentCourse?.user?.firstName +
                    " " +
                    courseStore.currentCourse?.user?.lastName
                  }}
                </div>
              </v-col>
              <v-divider></v-divider>
            </v-row>
          </div>

          <!-- Students Section -->
          <div>
            <v-row>
              <v-col cols="6">
                <h3>Students</h3>
              </v-col>

              <v-col cols="6" style="text-align: end">
                <p>{{ userStore.users.length }} Members</p>
              </v-col>
            </v-row>
            <v-row v-for="(member, index) in userStore.users" :key="index">
              <v-divider></v-divider>
              <v-col cols="2">
                <v-avatar size="56">
                  <v-img :src="`${url}/users/${member.userId}/image`"></v-img>
                </v-avatar>
              </v-col>
              <v-col cols="10" style="display: flex; align-items: center">
                <div>
                  {{ member.studentId + " " + member.firstName + " " + member.lastName }}
                </div>
              </v-col>
              <v-divider></v-divider>
            </v-row>
          </div>
        </div>
      </v-tab-item>

      <!-- Tab content for Assignments -->
      <!-- Tab Item for Users -->
      <v-tab-item v-else>
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
        <!-- Tab Item for Assignment Attendance -->
        <v-card class="mx-auto" outlined style="padding: 20px; margin-top: 10px">
          <v-card-title>Assignment Attendance Details</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th class="text-left vertical-divider">Student ID</th>
                <th class="text-left vertical-divider">Student Name</th>
                <th class="text-left vertical-divider">Full Score</th>
                <th class="text-left vertical-divider">Score</th>
                <th
                  class="vertical-divider"
                  v-for="assignment in assigmentStore.assignments"
                  :key="assignment.assignmentId"
                >
                  {{ assignment.nameAssignment }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userStore.users" :key="user.userId">
                <td class="vertical-divider">{{ user.studentId }}</td>
                <td class="vertical-divider">
                  {{ user.firstName + " " + user.lastName }}
                </td>
                <td class="vertical-divider">{{ assigmentStore.assignments.length }}</td>
                <td class="vertical-divider">
                  {{ calculateTotalScore(user.userId!, assigmentStore.assignments) }}
                </td>
                <td
                  v-for="assignment in assigmentStore.assignments"
                  :key="assignment.assignmentId"
                  class="vertical-divider"
                >
                  <template
                    v-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'"
                  >
                    <v-icon color="green">mdi-check-circle</v-icon> Present
                  </template>
                  <template
                    v-else-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'"
                  >
                    <v-icon color="orange">mdi-clock-outline</v-icon> Late
                  </template>
                  <template v-else>
                    <v-icon color="red">mdi-close-circle</v-icon> Absent
                  </template>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-tab-item>
    </v-container>
  </div>
</template>

<style scoped>
.v-col {
  padding: 10px 0;
}
.vertical-divider {
  border-left: 1px solid #e0e0e0;
  height: auto;
}
</style>
