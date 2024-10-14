<script setup lang="ts">
import { defineProps, onMounted, ref,watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import type Assignment from "@/stores/types/Assignment";
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import EditAssignment from "@/components/dialogs/EditAssignment.vue";
import Swal from "sweetalert2";
import { useMessageStore } from "@/stores/message";

const router = useRouter();
const isValid = ref(false);
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
const messageStore = useMessageStore();
const props = defineProps<{
  post: Assignment;
}>();

onMounted(async () => {
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
  assignmentName.value = props.post.nameAssignment;
});
const assignmentName = ref<string>(props.post.nameAssignment || "");

// Watch for changes to props.post and update assignmentName
watch(
  () => props.post,
  (newVal) => {
    assignmentName.value = newVal.nameAssignment;
  }
);
const editAssignment = () => {
  assignmentName.value = props.post.nameAssignment || ""; // Reset to the original value
  showDialogEditAssignment.value = true; // Show edit dialog
};

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

const deleteAssignment = async (assignment: Assignment) => {
  try {
    // Use the `showConfirm_` function to show the confirmation dialog
    messageStore.showConfirm_(
      `คุณต้องการลบการเช็คชื่อ ${assignment.nameAssignment} ใช่หรือไม่`,
      async () => {
        // If confirmed, proceed with deleting the assignment
        await assignmentStore.deleteAssignment(
          assignment.assignmentId!.toString()
        );
        await assignmentStore.getAssignmentByCourseId(id.value.toString());

        // Show success dialog after deletion using SweetAlert2
        await Swal.fire({
          icon: "success",
          title: "ลบการเช็คชื่อสำเร็จ", // Success title in Thai
          text: "การเช็คชื่อถูกลบเรียบร้อยแล้ว", // Success message in Thai
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ตกลง", // 'OK' in Thai
        });

        // Optionally, reload the page to reflect the deletion
        window.location.reload();
        console.log("Assignment deleted successfully");
      },
      () => {
        console.log("Deletion cancelled by user.");
      }
    );
  } catch (error) {
    console.log("Error deleting assignment:", error);
  }
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
  await attdentStore.getAttendanceByAssignmentId(
    props.post!.assignmentId! + ""
  );
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
            const resizedImage = await resizeAndConvertImageToBase64(
              result,
              800,
              600
            );
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
    img.onerror = () =>
      reject(new Error(`Failed to load image at ${imageUrl}`));
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
  if (imageUrls.value.length > 0 || imageFiles.value.length > 0) {
    imageUrls.value.push(...capturedImages.value);
    const allImages = [...capturedImages.value, ...imageUrls.value];
    localStorage.setItem("images", JSON.stringify(allImages));
    router.push({
      path: `/mapping2/assignment/${
        props.post.assignmentId
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
    const updateAssignment: Assignment = {
      ...props.post,
      nameAssignment: assignmentName.value, // Use the edited name
    };

    if (!props.post.assignmentId) {
      throw new Error("Invalid assignment ID");
    }

    // Update the assignment in the store
    await assignmentStore.updateAssignment(props.post.assignmentId + "", updateAssignment);

    // Close the dialog after saving
    close();

    // Show success message
    Swal.fire({
      icon: "success",
      title: "อัปเดตการเช็คชื่อสำเร็จ",
      text: "ชื่อการเช็คชื่อถูกอัปเดตเรียบร้อยแล้ว",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "ตกลง",
    }).then(()=>{
      window.location.reload();
    })
  } catch (error) {
    console.error("Error updating assignment:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถอัปเดตการเช็คชื่อได้",
      confirmButtonColor: "#d33",
      confirmButtonText: "ตกลง",
    });
  }
}

const close = () => {
  assignmentName.value = props.post.nameAssignment || ""; // Reset to original value on cancel
  showDialogEditAssignment.value = false; // Hide dialog
  showDialog.value = false;
};
// closeDialog
const closeDialog = () => {
  showDialog.value = false;
  // Clear the image data when the dialog is closed
  capturedImages.value = [];
  imageUrls.value = [];
  imageFiles.value = [];
  showCamera.value = false;
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
    videoRef.value.srcObject = null;
  }

};
// removeImage
const removeImage = (index: number) => {
  if (index < capturedImages.value.length) {
    capturedImages.value.splice(index, 1);
  } else {
    imageUrls.value.splice(index - capturedImages.value.length, 1);
  }
};
const checkImageCountAndPost = async () => {
  if ([...capturedImages.value, ...imageUrls.value].length > 20) {
    // dialogclosw
    showDialog.value = false;
    Swal.fire({
      icon: "error",
      title: "ไม่สามารถอัปโหลดรูปภาพได้เกิน 20 รูป",
    }).then(() => {
      showDialog.value = true;
    });

    return;
  }
 
  if ([...capturedImages.value, ...imageUrls.value].length === 0) {
    showDialog.value = false;

    Swal.fire({
      icon: "error",
      title: "กรุณาเพิ่มรูปภาพ",
    }).then(() => {
      showDialog.value = true;
    });

    return;
  } else {
    await updatePost();
     closeDialog();
  }
};
</script>

<template>
  <div>
    <v-card @click="gotoMappinfForStudent()">
      <v-card-text>
        <h4>
          {{
            props.post!.course!.user!.firstName +
            " " +
            props.post!.course!.user!.lastName
          }}
          สร้างการเช็คชื่อ : {{ props.post.nameAssignment }}
        </h4>
      </v-card-text>
      <v-card-actions>
        <v-card-text>
          {{
            formatThaiDate(new Date(props.post!.createdDate!)) +
            " เวลา " +
            formatThaiTime(new Date(props.post!.createdDate!)) +
            " น."
          }}</v-card-text
        >
        <v-spacer></v-spacer>
        <!-- <v-btn >
                    <v-icon size="30">mdi-card-account-mail</v-icon>
                </v-btn> -->

        <!-- Dropdown Menu for Teacher Actions -->
        <v-menu v-if="userStore.currentUser?.role == 'อาจารย์'" bottom right>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              v-bind="props"
            ></v-btn>
          </template>
          <v-list>
            <v-list-item @click="mapping">
              <v-list-item-title>ตรวจสอบการเช็คชื่อ</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>

            <v-list-item @click="recheckMapping">
              <v-list-item-title
                >ยืนยันนิสิตที่ให้ตรวจสอบอีกครั้ง</v-list-item-title
              >
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

            <v-list-item @click="deleteAssignment(props.post)">
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
      <h3>เพิ่มรูปภาพในงานเช็คชื่อ {{ props.post.nameAssignment }}</h3>
    
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <v-container>
        <!-- File Upload Input -->
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

        <!-- Camera Button -->
        <v-row>
          <v-col cols="12" sm="12">
            <v-btn color="primary" @click="startCamera" block>
              <v-icon left>mdi-camera</v-icon> เปิดกล้องเพื่อถ่ายรูป
            </v-btn>
          </v-col>
        </v-row>

        <!-- Camera View -->
        <v-row v-if="showCamera">
          <v-col cols="12" sm="12">
            <video ref="videoRef" autoplay style="width: 100%; border-radius: 8px"></video>
            <canvas ref="canvasRef" style="display: none"></canvas>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn @click="captureImage" block color="primary">ถ่ายรูปภาพ</v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn @click="stopCamera" block color="error">ปิดกล้องถ่ายรูป</v-btn>
          </v-col>
        </v-row>

        <!-- Alert if image count exceeds 20 -->
        <v-row>
          <v-col cols="12" sm="12">
            <v-alert
              v-if="capturedImages.length + imageUrls.length > 20"
              type="error"
              outlined
              border="left"
              elevation="2"
              icon="mdi-alert"
            >
              ไม่สามารถอัปโหลดรูปภาพเกิน 20 รูป
            </v-alert>
          </v-col>
        </v-row>

        <!-- Uploaded and Captured Images Preview -->
        <v-row class="scrollable-image-section">
          <v-col
            cols="12"
            sm="6"
            md="4"
            v-for="(image, index) in [...capturedImages, ...imageUrls]"
            :key="index"
            class="image-container"
          >
            <v-card outlined class="ma-2">
              <v-img :src="image" aspect-ratio="1" class="ma-2"></v-img>
              <v-btn
                icon
                @click="removeImage(index)"
                class="delete-icon"
                variant="text"
              >
                <v-icon color="red">mdi-close</v-icon>
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <!-- Dialog Actions -->
    <v-card-actions>
      <v-btn color="error" @click="closeDialog" outlined>ยกเลิก</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="capturedImages.length + imageUrls.length > 20 || nameAssignment === ''"
        color="primary"
        @click="checkImageCountAndPost"
        outlined
      >
        โพสต์
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

  <!-- Edit Assignment Dialog -->
  <v-dialog v-model="showDialogEditAssignment" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline" style="text-align: center; font-weight: bold;">
        แก้ไขชื่อรายการเช็คชื่อ
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form ref="form" v-model="isValid" @submit.prevent="save">
          <v-text-field
            v-model="assignmentName"
            label="ชื่อรายการเช็คชื่อ"
            variant="outlined"
            outlined
            required
            maxlength="50"
            prepend-inner-icon="mdi-assignment"
            :rules="[ 
              (v) => !!v || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*', 
              (v) => (v && v.length >= 1 && v.length <= 50) || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*' 
            ]"
          />
        </v-form>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions style="justify-content: space-between;">
        <v-btn color="error" @click="close" style="color: red; font-weight: bold;">
          ยกเลิก
        </v-btn>
        <v-btn color="primary" :disabled="!isValid" @click="save" style="color: blue; font-weight: bold;">
          ยืนยัน
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <!-- Edit Assignment Dialog -->
  <v-dialog v-model="showDialogEditAssignment" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">
        แก้ไขชื่อการเช็คชื่อ
        <v-spacer></v-spacer>
      </v-card-title>

      <!-- Form to edit assignment name -->
      <v-card-text>
        <v-form ref="form" v-model="isValid" @submit.prevent="save">
          <v-text-field
            v-model="assignmentName"
            label="ชื่อรายการเช็คชื่อ"
            variant="outlined"
            outlined
            required
            maxlength="50"
            prepend-inner-icon="mdi-assignment"
            :rules="[ 
              (v) => !!v || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*', 
              (v) => (v && v.length >= 1 && v.length <= 50) || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*' 
            ]"
          />
        </v-form>
      </v-card-text>

      <!-- Dialog actions with save and cancel buttons -->
      <v-card-actions>
        <v-btn color="error" @click="close">ยกเลิก</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" :disabled="!isValid" @click="save">ยืนยัน</v-btn>
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
  position: absolute;
  top: 12px;
  right: 12px;
}

.scrollable-image-section {
  max-height: 400px;
  overflow-y: auto;
}

.image-container {
  position: relative;
}

.delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>