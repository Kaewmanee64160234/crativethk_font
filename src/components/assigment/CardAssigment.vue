<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import type Assignment from "@/stores/types/Assignment";
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import EditAssignment from "@/components/dialogs/EditAssignment.vue";

const router = useRouter();
const courseStore = useCourseStore();
const assignmentStore = useAssignmentStore();
const confirmDlg = ref();
const route = useRoute();
const id = ref(route.params.idCourse);
const userStore = useUserStore();
const attdentStore = useAttendanceStore();
const courseId = route.params.courseId;
const showDialog = ref(false);
const showDialogEditAssignment = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const capturedImages = ref<string[]>([]);
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const showCamera = ref(false);
const props = defineProps<{
  post: Assignment;
}>();

onMounted(async () => {
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
});

function formatThaiDate(date: Date) {
  const thaiDate = date
    .toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    })
    .replace(".", "");

  const shortYear = (date.getFullYear() + 543).toString().slice(-2);

  return `${thaiDate} ${shortYear}`;
}
function formatThaiTime(date: Date) {
  return date.toLocaleTimeString("th-TH", {
    hour: "numeric",
    minute: "numeric",
    hour12: false, // ใช้ระบบ 24 ชั่วโมง
  });
}
// Delete assignment and update UI
const deleteAssignment = async () => {
  try {
    await confirmDlg.value.openDialog(
      "Please Confirm",
      `Do you want to delete this Assignment?`,
      "Accept",
      "Cancel"
    );

    await assignmentStore.deleteAssignment(props.post!.assignmentId! + "");
    await assignmentStore.getAssignmentByCourseId(id.value.toString());

    window.location.reload();
    console.log("Assignment deleted successfully");
  } catch (error) {
    console.log("Error deleting assignment:", error);
  }
};
// function edit
const editAssignment = async () => {
  showDialogEditAssignment.value = true;
};
//create function goto mapping 2
const recheckMapping = () => {
  assignmentStore.currentAssignment = props.post;
  router.push(
    `/reCheckMappingTeacher/course/${courseStore.currentCourse?.coursesId}/assignment/${props.post.assignmentId}`
  );
};

const gotoMappinfForStudent = () => {
  assignmentStore.currentAssignment = props.post;
  router.push(
    "/mappingForStudent/course/" +
      courseStore.currentCourse?.coursesId +
      "/assignment/" +
      props.post.assignmentId
  );
};
// goToMapping2
const goToMapping2 = async () => {
  showDialog.value = true;
  await attdentStore.getAttendanceByAssignmentId(props.post!.assignmentId! + "");
};
// Mapping
const mapping = () => {
  assignmentStore.currentAssignment = props.post;
  router.push(
    `/mapping2/assignment/${props.post.assignmentId}/course/${courseStore.currentCourse?.coursesId}`
  );
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

const resizeAndConvertImageToBase64 = (
  imageUrl: string,
  maxWidth: number,
  maxHeight: number
) => {
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
const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
    videoRef.value.srcObject = null;
  }
  showCamera.value = false;
};

const startCamera = async () => {
  showCamera.value = true;
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  if (videoRef.value) {
    videoRef.value.srcObject = stream;
  }
};

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
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

// updatePost
const updatePost = async () => {
  if (imageUrls.value.length > 0) {
    imageUrls.value.push(...capturedImages.value);
    const allImages = [...capturedImages.value, ...imageUrls.value];
    localStorage.setItem("images", JSON.stringify(allImages));
    router.push({
      path: `/mapping2/assignment/${
        assignmentStore.currentAssignment?.assignmentId
      }/course/${id.value.toString()}`,
    });
    imageUrls.value = [];
    capturedImages.value = [];
  } else {
    console.error("No images available for posting.");
  }
};
async function save() {
  try {
    // Debug: Check if assignmentId is correctly set
    console.log("Assignment ID to update:", props.post.assignmentId);

    // Ensure that assignmentId is valid
    if (!props.post.assignmentId || parseInt(props.post.assignmentId + "") === 0) {
      throw new Error("Invalid assignment ID");
    }

    // Attempt to update the assignment with the new name
    await assignmentStore.updateAssignment(props.post.assignmentId + "", props.post);
    close();
    console.log("Assignment updated successfully"); // Log success
  } catch (error) {
    console.error("Error updating assignment:", error); // Log any errors
  }
}

function close() {
  showDialogEditAssignment.value = false;
}
</script>

<template>
  <div>
    <v-card @click="gotoMappinfForStudent()">
      <v-card-text>
        <h4>
          {{ props.post!.course!.user!.firstName + ' ' + props.post!.course!.user!.lastName }}
          สร้างการเช็คชื่อ : {{ props.post.nameAssignment }}
        </h4>
      </v-card-text>
      <v-card-actions>
        <v-card-text>
          {{ formatThaiDate(new Date(props.post!.createdDate!)) + " เวลา " +formatThaiTime(new Date(props.post!.createdDate!))+ " น." }}</v-card-text
        >
        <v-spacer></v-spacer>
        <!-- <v-btn >
                    <v-icon size="30">mdi-card-account-mail</v-icon>
                </v-btn> -->

        <!-- Dropdown Menu for Teacher Actions -->
        <v-menu v-if="userStore.currentUser?.role == 'อาจารย์'" bottom right>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
          </template>
          <v-list>
            <v-list-item @click="mapping">
              <v-list-item-title>ตรวจสอบการเช็คชื่อ</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>

            <v-list-item @click="recheckMapping">
              <v-list-item-title>ยืนยันนิสิตที่ให้ตรวจสอบอีกครั้ง</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="goToMapping2">
              <v-list-item-title>เพิ่มภาพถ่ายการเช็คชื่อ</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="editAssignment">
              <v-list-item-title>แก้ไขชื่อรายการเช็คชื่อ</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>

            <v-list-item @click="deleteAssignment">
              <v-list-item-title>ลบรายการเช็คชื่อ</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
  </div>

  <!-- ConfirmDialog Component -->
  <ConfirmDialog ref="confirmDlg" />
  <!-- Create Post Dialog -->
  <v-dialog v-model="showDialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Create Post</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <h1>Upload file เพื่อเพิ่มนิสิตที่เข้าเรียน</h1>
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
              <video ref="videoRef" autoplay style="width: 100%"></video>
              <canvas ref="canvasRef" style="display: none"></canvas>
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
        <v-btn color="primary" @click="updatePost()">โพสต์</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Assignment Dialog -->
  <v-dialog v-model="showDialogEditAssignment" max-width="600px" persistent>
    <v-card>
      <!-- Dialog title without the close button -->
      <v-card-title class="headline">
        Edit Assignment
        <v-spacer></v-spacer>
        <!-- Close button for dialog -->
        <v-btn icon @click="close" class="close-button">
          <v-icon color="red">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <!-- Dialog content with form -->
      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-text-field
            v-model="props.post.nameAssignment!"
            label="Assignment Name"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <!-- Dialog actions with Confirm and Cancel buttons -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="showDialogEditAssignment = false">ยกเลิก</v-btn>
        <v-btn color="primary" @click="save">ยืนยัน</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.headline {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  margin-right: -12px; /* Adjust this value if necessary to align with the edge */
}
</style>
