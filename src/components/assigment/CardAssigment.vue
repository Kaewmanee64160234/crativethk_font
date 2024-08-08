<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssignmentStore } from '@/stores/assignment.store';
import type Assignment from '@/stores/types/Assignment';
import { useCourseStore } from '@/stores/course.store';
import { useUserStore } from '@/stores/user.store';
import { useAttendanceStore } from '@/stores/attendance.store';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import EditAssignment from '@/components/dialogs/EditAssignment.vue';

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
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const capturedImages = ref<string[]>([]);
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const showCamera = ref(false);
const props = defineProps<{
  post: Assignment
}>();

onMounted(async () => {
    await assignmentStore.getAssignmentByCourseId(id.value.toString());
})


function formatThaiDate(date: Date) {
  return date.toLocaleDateString('th-TH', {
    day: 'numeric', // Numeric day of the month
    month: 'short'  // Abbreviated month name
  }).replace('.', ''); // Remove the dot after the month abbreviation
}
// Delete assignment and update UI
const deleteAssignment = async () => {
    await confirmDlg.value.openDialog(
    'Please Confirm',
    `Do you want to delete this Assignment?`,
    'Accept',
    'Cancel'
  )
  await assignmentStore.deleteAssignment(props.post.assignmentId);
  window.location.reload();
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
  // Optionally, remove the item from a local list if not using a global store
}
// function edit
const editAssignment = async () => {
  assignmentStore.EditAssignment = true;
}
//create function goto mapping 2
const recheckMapping = () => {
    assignmentStore.currentAssignment = props.post;
    router.push(`/reCheckMappingTeacher/course/${courseId}/assignment/${props.post.assignmentId}`);
}

const gotoMappinfForStudent = () => {
    assignmentStore.currentAssignment = props.post;
    router.push("/mappingForStudent/course/" + courseStore.currentCourse?.coursesId + "/assignment/" + props.post.assignmentId);
}
// goToMapping2
const goToMapping2 = async () => {
    showDialog.value = true;
    console.log("assigment",props.post);
    await attdentStore.getAttendanceByAssignmentId(props.post!.assignmentId!+'');

    // assignmentStore.currentAssignment = props.post;
    // router.push(`/mapping2/course/${courseId}/assignment/${props.post.assignmentId}`);
}

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
    router.push({ path: `/mapping2/assignment/${props.post.assignmentId}`, query: { imageUrls: imageUrls.value } });
    imageUrls.value = [];
    capturedImages.value = [];
  } else {
    console.error("No images available for posting.");
  }
};

</script>

<template>

  <!-- // <div>
  //   <v-card>
  //     <v-card-text>
  //       <h4>
  //         {{ props.post.course.user.firstName + ' ' + props.post.course.user.lastName }} โพสเนื้อหาใหม่ : {{ props.post.nameAssignment }}
  //       </h4>
  //     </v-card-text>
  //     <v-card-actions>
  //       <v-card-text>{{ formatThaiDate(new Date(props.post.createdDate)) }}</v-card-text>
  //       <v-spacer></v-spacer>
  //       <v-btn @click="gotoMappingForStudent()">
  //         <v-icon size="30">mdi-card-account-mail</v-icon>
  //       </v-btn>
  //       <v-btn @click="editAssignment()">
  //         <v-icon size="30">mdi mdi-book-edit</v-icon>
  //       </v-btn>
  //       <v-btn @click="deleteAssignment()">
  //         <v-icon size="30">mdi mdi-delete</v-icon>
  //       </v-btn>
  //     </v-card-actions>
  //   </v-card>
  // </div>
  // <ConfirmDialog ref="confirmDlg" />
  // <v-dialog v-model="assignmentStore.EditAssignment" persistent>
  //   <EditAssignment :post="props.post" :assignmentId="props.post.assignmentId ?? 0"></EditAssignment>
  // </v-dialog> -->

    <div>
        <v-card>
            <v-card-text>
                <h4>{{ props.post!.course!.user!.firstName + ' ' + props.post!.course!.user!.lastName }} โพสเนื้อหาใหม่ : {{
                    props.post.nameAssignment }}</h4>
            </v-card-text>
            <v-card-actions>
                <v-card-text> {{ formatThaiDate(new Date(props.post!.createdDate!)) }}</v-card-text>
                <v-spacer></v-spacer>
                <v-btn @click="gotoMappinfForStudent()"> <v-icon size="30">mdi-card-account-mail</v-icon>
                </v-btn>
                <v-btn v-if="userStore.currentUser?.role == 'อาจารย์'" @click="recheckMapping()"><v-icon
                        size="30">mdi-account-file-text-outline</v-icon></v-btn>
                <v-btn v-if="userStore.currentUser?.role == 'อาจารย์'" @click="goToMapping2()"><v-icon
                        size="30">mdi-account-edit-outline</v-icon></v-btn>
                        <v-btn @click="editAssignment()">
    <v-icon size="30">mdi mdi-book-edit</v-icon>
    </v-btn>
     <v-btn @click="deleteAssignment()">
     <v-icon size="30">mdi mdi-delete</v-icon>
    </v-btn>
            </v-card-actions>
        </v-card>
    </div>
    <ConfirmDialog ref="confirmDlg" />
  <v-dialog v-model="assignmentStore.EditAssignment" persistent>
  <EditAssignment :post="props.post" :assignmentId="props.post.assignmentId ?? 0"></EditAssignment>
  </v-dialog>

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
                            <v-file-input label="Upload Images" prepend-icon="mdi-camera" filled
                                @change="handleFileChange" accept="image/*" variant="outlined" multiple></v-file-input>
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
                        <v-col cols="12" sm="6" md="4" v-for="(image, index) in [...capturedImages, ...imageUrls]"
                            :key="index">
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
</template>

<style scoped>
</style>
