<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import CardAssigment from "@/components/assigment/CardAssigment.vue";
import { useCourseStore } from "@/stores/course.store";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import type Assignment from "@/stores/types/Assignment";
import type Attendance from "@/stores/types/Attendances";
import { useMessageStore } from "@/stores/message";
import UpdateAttendantDialogView from "@/components/attendant/updateAttendantDialog.vue";
import type { User } from "@/stores/types/User";

const route = useRoute();
const id = ref(route.params.idCourse);
const tabs = [
  { id: 1, title: "Posts" },
  { id: 2, title: "Members" },
  { id: 3, title: "Record" },
];

const router = useRouter();
const tab = ref("Posts");
const posts = ref<Assignment[]>([]);
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const assignmentStore = useAssignmentStore();
const courseStore = useCourseStore();
const showDialog = ref(false);
const nameAssignment = ref("");
const authStore = useAuthStore();
const userStore = useUserStore();
const url = "http://localhost:3000";
const attendanceStore = useAttendanceStore();
const roomSelect = ref<string>();
const messageStore = useMessageStore();

const isTeacher = computed(() => userStore.currentUser?.role === 'อาจารย์');
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const capturedImages = ref<string[]>([]);

onMounted(async () => {
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
  await attendanceStore.getAttendanceByCourseId(id.value.toString());
  await userStore.getUserByCourseId(id.value.toString());
  await courseStore.getCourseById(id.value.toString());
  await courseStore.getAllRooms();
  posts.value = assignmentStore.assignments;

  if (isTeacher.value) {
    showDialog.value = true;
  }
});

const processFile = (url: string) => {
  imageUrls.value.push(url);
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
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
  } else {
    alert('The assignment has been created successfully.');
  }

  const room = courseStore.rooms.find((r) => r.roomNumber === roomSelect.value);

  const newAssignment = {
    assignmentTime: new Date(),
    nameAssignment: nameAssignment.value,
    course: { ...courseStore.currentCourse! },
    assignmentId: 0,
    attdances: [],
    
    status:"no data",
    room: room,
    createdDate: new Date(),
    updatedDate: undefined,
    deletedDate: undefined,
  };

  // if assignment.name is empty, set to currnet date time
  if (newAssignment.nameAssignment === "") {
    newAssignment.nameAssignment = new Date().toLocaleString();
  }

  await assignmentStore.createAssignment(newAssignment,imageFiles.value);
  if (imageUrls.value.length > 0) {
    // image url and captured images are available
    imageUrls.value.push(...capturedImages.value);
    router.push({ path: "/mapping2", query: { imageUrls: imageUrls.value } });
    nameAssignment.value = "";
    imageUrls.value = [];
    capturedImages.value = [];
  } else {
    console.error("No images available for posting.");
  }
};

const getAttendanceStatus = (
  attendances: Attendance[],
  userId: number,
  assignmentId: number
): string => {
  const attendanceIndex = attendances?.findIndex(
    (att:Attendance) => att.user?.userId === userId && att.assignment?.assignmentId === assignmentId
  );
  return attendances[attendanceIndex!] ? attendances[attendanceIndex!].attendanceStatus : "absent";
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
        capturedImages.value.push(resizedImage);
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

// open show dialog and set value editAttendance
const openDialog = (assignment: Assignment, user: User) => {
  //filter attendance from assignments
  const attendance = attendanceStore.attendances?.findIndex(
    (att) => att.user?.userId === user.userId && att.assignment?.assignmentId === assignment.assignmentId);
  console.log("show",attendance)
  console.log("show",assignment)
  attendanceStore.editAttendance = attendanceStore.attendances![attendance!];
  attendanceStore.userAttendance = user;
  attendanceStore.showDialog = true;
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
          class="mx-auto "
          color="primary"
          max-width="1200"
          outlined
          style="padding: 20px"
        >
          <v-card-title>
            <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
          </v-card-title>
        </v-card>


        <v-btn v-if="isTeacher" color="#6CA7FA" @click="showDialog = true" style="margin: 10px 0; color: black">
          <v-icon>mdi-plus</v-icon>สร้างการเช็คชื่อ
        </v-btn>

        <!-- Dialog for creating post -->
        <v-dialog v-model="showDialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Create Post</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-text-field
                      name="nameAssignment"
                      label="label"
                      id="id"
                      v-model="nameAssignment"
                      variant="outlined"
                      outlined
                    ></v-text-field>
                  
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-file-input
                      label="Upload Images"
                      prepend-icon="mdi-camera"
                      filled
                      @change="handleFileChange"
                      accept="image/*"
                      variant="outlined"
                      multiple
                    ></v-file-input>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-btn color="primary" @click="startCamera">Open Camera</v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="showCamera">
                  <v-col cols="12" sm="12">
                    <video ref="videoRef" autoplay style="width: 100%;"></video>
                    <canvas ref="canvasRef" style="display: none;"></canvas>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn @click="captureImage" block>Capture Image</v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn @click="stopCamera" block>Close Camera</v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    v-for="(image, index) in [...capturedImages, ...imageUrls]"
                    :key="index"
                  >
                    <v-img :src="image" aspect-ratio="1" class="ma-2"></v-img>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="showDialog = false">ยกเลิก</v-btn>
              <v-btn color="primary" @click="createPost()">โพสต์</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-row class="pt-5" v-if="posts.length>0">
          <v-col  cols="12" sm="12" md="12" v-for="post in posts" :key="post.assignmentId">
            <CardAssigment  :post="post"></CardAssigment>
          </v-col>
         
        </v-row>
        <v-row class="pt-5" v-else>
          <v-col cols="12" sm="12" md="12">
            <v-card outlined>
              <v-card-text>
                <h2>No posts available</h2>
              </v-card-text>
            </v-card>
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
   <!-- Tab content for Assignment Attendance -->
   <v-tab-item v-else>
        <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px">
          <v-card-title>
            <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
          </v-card-title>
        </v-card>
        <v-card class="mx-auto" outlined style="padding: 20px; margin-top: 10px">
          <v-card-title>Assignment Attendance Details</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th class="text-left vertical-divider">Student ID</th>
                <th class="text-left vertical-divider">Student Name</th>
                <th class="text-left vertical-divider">Full Score</th>
                <th class="text-left vertical-divider">Score</th>
                <th class="vertical-divider" v-for="assignment in assignmentStore.assignments" :key="assignment.assignmentId">
                  {{ assignment.nameAssignment }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userStore.users" :key="user.userId">
                <td class="vertical-divider">{{ user.studentId }}</td>
                <td class="vertical-divider">{{ user.firstName + " " + user.lastName }}</td>
                <td class="vertical-divider">{{ assignmentStore.assignments.length }}</td>
                <td class="vertical-divider">{{ calculateTotalScore(user.userId!, assignmentStore.assignments) }}</td>
                <td v-for="assignment in assignmentStore.assignments" :key="assignment.assignmentId" class="vertical-divider">
                  <template v-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'">
                    <v-btn density="compact" color="green" icon="mdi-check-circles" v-if="isTeacher" @click="openDialog(assignment, user)">
                      <v-icon>mdi-check-circle</v-icon>
                    </v-btn>
                    <v-icon color="green" v-else>mdi-check-circle</v-icon>
                  </template>
                  <template v-else-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'">
                    <v-btn density="compact" color="orange" icon="mdi-check-circles" v-if="isTeacher" @click="openDialog(assignment, user)">
                      <v-icon>mdi-clock-outline</v-icon>
                    </v-btn>
                    <v-icon color="orange" v-else>mdi-clock-outline</v-icon>
                  </template>
                  <template v-else>
                    <v-btn density="compact" color="red" icon="mdi-check-circles" v-if="isTeacher" @click="openDialog(assignment, user)">
                      <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                    <v-icon color="red" v-else>mdi-close-circle</v-icon>
                  </template>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-tab-item>
    </v-container>
  </div>
  <UpdateAttendantDialogView/>
</template>

<style scoped>
.v-col {
  padding: 10px 0;
  /* Provides consistent vertical spacing between rows */
}
.vertical-divider {
  border-left: 1px solid #e0e0e0; /* สีของเส้นแบ่ง */
  height: auto; /* ให้สูงตามความสูงของ col */
}
</style>
