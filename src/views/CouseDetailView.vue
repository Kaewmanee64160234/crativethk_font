<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import CardAssigment from "@/components/assigment/CardAssigment.vue";
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import type Assignment from "@/stores/types/Assignment";
import type Attendance from "@/stores/types/Attendances";
import UpdateAttendantDialogView from "@/components/attendant/updateAttendantDialog.vue";
import type { User } from "@/stores/types/User";
import * as XLSX from 'xlsx';
import { useLoaderStore } from "@/stores/loader.store";
import { useMessageStore } from "@/stores/message";
import assignment from "@/services/assignment";

const route = useRoute();
const messageStore = useMessageStore();
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
const userStore = useUserStore();
const url = import.meta.env.VITE_API_URL;
const attendanceStore = useAttendanceStore();
const roomSelect = ref<string>();
const loaderStore = useLoaderStore();

const isTeacher = computed(() => userStore.currentUser?.role === 'อาจารย์');
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const capturedImages = ref<string[]>([]);
const assignmentManual = ref(false);
const filteredUsers = computed(() => {
  if (isTeacher.value) {
    return userStore.users;
  } else {
    return userStore.users.filter(user => user.userId === userStore.currentUser?.userId);
  }
});
onMounted(async () => {
  // loader.value = true;
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
  await attendanceStore.getAttendanceByCourseId(id.value.toString());
  await userStore.getUserByCourseId(id.value.toString());
  await courseStore.getCourseById(id.value.toString());
  await courseStore.getAllRooms();
  posts.value = assignmentStore.assignments;
  // loader.value = false;

});
const removeImage = (index: number) => {
  if (index < capturedImages.value.length) {
    capturedImages.value.splice(index, 1);
  } else {
    imageUrls.value.splice(index - capturedImages.value.length, 1);
  }
};
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

// Function to resize an image and convert it to a base64 string
const resizeAndConvertImageToBase64 = (
  imageUrl: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.7  // default quality is set to 0.7
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      // Calculate the aspect ratio and resize
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw the resized image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert the canvas to a base64 string with the specified quality
      const resizedImage = canvas.toDataURL("image/jpeg", quality);
      resolve(resizedImage);
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
    img.src = imageUrl;
  });
};
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
// Function to handle post creation, including image processing and backend communication
const createPost = async () => {
  console.time('Total createPost execution time');

  console.time('Validation check');
  if (nameAssignment.value === "") {
    console.timeEnd('Validation check');
    return;
  } else {
    // alert('The assignment has been created successfully.');
  }
  console.timeEnd('Validation check');

  console.time('Room selection');
  const room = courseStore.rooms.find((r) => r.roomNumber === roomSelect.value);
  console.timeEnd('Room selection');

  console.time('Assignment creation');
  const newAssignment = {
    assignmentTime: new Date(),
    nameAssignment: nameAssignment.value,
    course: { ...courseStore.currentCourse! },
    assignmentId: 0,
    attdances: [],
    status: "no data",
    room: room,
    createdDate: new Date(),
    updatedDate: undefined,
    deletedDate: undefined,
    assignmentManual: assignmentManual.value,
  };
  await assignmentStore.createAssignment({
    ...newAssignment,
    statusAssignment: 'nodata',
  }, imageFiles.value);

  if (imageUrls.value.length > 0) {
    imageUrls.value.push(...capturedImages.value);
    router.push({ path: `/mapping2/assignment/${assignmentStore.assignment?.assignmentId}`, query: { imageUrls: imageUrls.value } });
  }
  // If assignment.name is empty, set it to the current date and time
  if (newAssignment.nameAssignment === "") {
    newAssignment.nameAssignment = new Date().toLocaleString();
  }
  console.timeEnd('Assignment creation');

  console.time('Image processing');
  // Resize and compress images before uploading
  const processedImages = await Promise.all(
    imageFiles.value.map(file => resizeAndConvertImageToBase64(URL.createObjectURL(file), 800, 600, 0.7))
  );
  console.timeEnd('Image processing');

  // Convert base64 images to File objects
  const filesToUpload = processedImages.map((base64, index) =>
    base64ToFile(base64, `image-${index + 1}.jpg`)
  );

  console.time('Backend assignment creation');
  // Create the assignment in the backend with the converted files
  await assignmentStore.createAssignment({
    ...newAssignment,
    statusAssignment: 'nodata',
  }, filesToUpload);
  console.timeEnd('Backend assignment creation');

  // Close the create post dialog
  showDialog.value = false;

  console.time('Image storage and navigation');
  // Combine captured images and image URLs, and store them in localStorage
  const allImages = [...capturedImages.value, ...imageUrls.value];
  localStorage.setItem('images', JSON.stringify(allImages));

  if (allImages.length > 0) {
    // Navigate to the next page (this part is commented out as per your request)
    router.push({
      path: `/mapping2/assignment/${assignmentStore.currentAssignment?.assignmentId}/course/${id.value.toString()}`,
    });

    // Clear the form and images after navigating
    nameAssignment.value = "";
    imageUrls.value = [];
    capturedImages.value = [];
    imageFiles.value = [];
  } else {
    console.error("No images available for posting.");
  }
  console.timeEnd('Image storage and navigation');

  console.timeEnd('Total createPost execution time');
};




const getAttendanceStatus = (
  attendances: Attendance[],
  userId: number,
  assignmentId: number
): string => {
  const attendanceIndex = attendances?.findIndex(
    (att: Attendance) => att.user?.userId === userId && att.assignment?.assignmentId === assignmentId
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
  console.log("show", attendance)
  console.log("show", assignment)
  attendanceStore.editAttendance = attendanceStore.attendances![attendance!];
  attendanceStore.userAttendance = user;
  attendanceStore.showDialog = true;
};

const exportFile = () => {
  messageStore.showConfirm_("ต้องการดาวน์โหลดไฟล์ Excel ใช่หรือไม่",confirmExportFile,cancelExportFile);
};

const confirmExportFile = () => {
  const data = filteredUsers.value.map(user => {
    const userData: {
      รหัสนิสิต: string | undefined;
      ชื่อ: string;
      คะแนนรวม: number;
      [key: string]: string | number | undefined;
    } = {
      รหัสนิสิต: user.studentId,
      ชื่อ: user.firstName + " " + user.lastName,
      คะแนนรวม: calculateTotalScore(user.userId!, assignmentStore.assignments)
    };

    assignmentStore.assignments.forEach(assignment => {
      const status = getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!);
      let translatedStatus = '';

      if (status === 'present') {
        translatedStatus = 'มา';
      } else if (status === 'late') {
        translatedStatus = 'สาย';
      } else {
        translatedStatus = 'ขาด';
      }

      userData[assignment.nameAssignment] = translatedStatus;
    });

    return userData;
  });

  console.log(data);

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, "Report.xlsx");

  console.log('Export successful');
};



const cancelExportFile = () => {
  console.log('export failed')
}
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
        <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px">
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
            <v-card-title class="text-h5 text-center primary--text">
              <v-icon left class="mr-2">mdi-pencil</v-icon>
              Create Post
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-text-field name="nameAssignment" label="Assignment Name" id="nameAssignment"
                      v-model="nameAssignment" variant="outlined" outlined
                      prepend-inner-icon="mdi-assignment"></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" sm="12">
                    <v-file-input label="Upload Images" prepend-icon="mdi-camera" filled @change="handleFileChange"
                      accept="image/*" variant="outlined" multiple></v-file-input>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-btn color="primary" @click="startCamera" block>
                      <v-icon left>mdi-camera</v-icon>
                      Open Camera
                    </v-btn>
                  </v-col>
                </v-row>
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
                <v-row>
                  <v-col cols="12" sm="6" md="4" v-for="(image, index) in [...capturedImages, ...imageUrls]"
                    :key="index">
                    <v-card outlined class="ma-2">
                      <v-img :src="image" aspect-ratio="1" class="ma-2"
                        style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"></v-img>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="removeImage(index)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="showDialog = false" outlined>
                <v-icon left>mdi-cancel</v-icon>
                ยกเลิก
              </v-btn>
              <v-btn color="primary" @click="createPost()" outlined>
                <v-icon left>mdi-send</v-icon>
                โพสต์
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-row class="pt-5" v-if="posts.length > 0">
          <v-col cols="12" sm="12" md="12" v-for="post in posts" :key="post.assignmentId">
            <CardAssigment :post="post"></CardAssigment>
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
      <!-- tab member -->
      <v-tab-item v-else-if="tab === 'Members'" value="Members">
        <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px">
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
                  <v-img :src="`${url}/users/${courseStore.currentCourse?.user?.userId}/image`"></v-img>
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
          <v-row> 
            <v-col col="12" sm="11">
              <v-card-title>Assignment Attendance Details</v-card-title>
            </v-col>
            <v-col col="12" sm="1" v-if="userStore.currentUser?.role === 'อาจารย์'">
              <v-btn color="success" @click="exportFile">Export</v-btn>
            </v-col>
          </v-row>
          <v-table>
            <thead>
              <tr>
                <th class="text-left vertical-divider">Student ID</th>
                <th class="text-left vertical-divider">Student Name</th>
                <th class="text-left vertical-divider">Full Score</th>
                <th class="text-left vertical-divider">Score</th>
                <th class="vertical-divider" v-for="assignment in assignmentStore.assignments"
                  :key="assignment.assignmentId">
                  {{ assignment.nameAssignment }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.userId">
                <td class="vertical-divider">{{ user.studentId }}</td>
                <td class="vertical-divider">{{ user.firstName + " " + user.lastName }}</td>
                <td class="vertical-divider">{{ assignmentStore.assignments.length }}</td>
                <td class="vertical-divider">{{ calculateTotalScore(user.userId!, assignmentStore.assignments) }}</td>
                <td v-for="assignment in assignmentStore.assignments" :key="assignment.assignmentId"
                  class="vertical-divider">
                  <template
                    v-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'">
                    <v-btn density="compact" color="green" icon="mdi-check-circles" v-if="isTeacher"
                      @click="openDialog(assignment, user)">
                      <v-icon>mdi-check-circle</v-icon>
                    </v-btn>
                    <v-icon color="green" v-else>mdi-check-circle</v-icon>
                  </template>
                  <template
                    v-else-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'">
                    <v-btn density="compact" color="orange" icon="mdi-check-circles" v-if="isTeacher"
                      @click="openDialog(assignment, user)">
                      <v-icon>mdi-clock-outline</v-icon>
                    </v-btn>
                    <v-icon color="orange" v-else>mdi-clock-outline</v-icon>
                  </template>
                  <template v-else>
                    <v-btn density="compact" color="red" icon="mdi-check-circles" v-if="isTeacher"
                      @click="openDialog(assignment, user)">
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
  <UpdateAttendantDialogView />
</template>

<style scoped>
.v-col {
  padding: 10px 0;
  /* Provides consistent vertical spacing between rows */
}

.vertical-divider {
  border-left: 1px solid #e0e0e0;
  /* สีของเส้นแบ่ง */
  height: auto;
  /* ให้สูงตามความสูงของ col */
}
</style>
