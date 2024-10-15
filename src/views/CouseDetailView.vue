<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAssignmentStore } from "@/stores/assignment.store";
import CardAssigment from "@/components/assigment/CardAssigment.vue";
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import type Assignment from "@/stores/types/Assignment";
import type Attendance from "@/stores/types/Attendances";
import UpdateAttendantDialogView from "@/components/attendant/updateAttendantDialog.vue";
import type { User } from "@/stores/types/User";
import * as XLSX from "xlsx";
import { useLoaderStore } from "@/stores/loader.store";
import { useMessageStore } from "@/stores/message";
import Swal from "sweetalert2";

// Access the router and route objects
const router = useRouter();
const route = useRoute();
const messageStore = useMessageStore();

// Extract the course ID from the route parameters
const id = ref(route.params.idCourse);

// Define tabs for navigation
const tabs = [
  { id: 1, title: "โพสต์" },
  { id: 2, title: "รายชื่อผู้เรียน/ผู้สอน" },
  { id: 3, title: "คะแนน" },
];

// Other variables and logic...
const assignmentStore = useAssignmentStore();
const courseStore = useCourseStore();
const userStore = useUserStore();
const attendanceStore = useAttendanceStore();
const loaderStore = useLoaderStore();
const showDialog = ref(false);
const posts = ref<Assignment[]>([]);
const totalPage = ref(assignmentStore.lastPage);

const tab = ref("โพสต์");
const url = import.meta.env.VITE_API_URL;
const nameAssignment = ref("");
const imageUrls = ref<string[]>([]);
const capturedImages = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const showCamera = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const assignmentManual = ref(false);
const coursesId = ref("");

const isTeacher = computed(() => userStore.currentUser?.role === "อาจารย์");
const filteredAssignments = computed(() => {
  // Only include assignments that have corresponding attendance data.
  return assignmentStore.assignments.filter((assignment) =>
    attendanceStore.attendances!.some(
      (att) => att.assignment?.assignmentId === assignment.assignmentId
    )
  );
});

const filteredUsers = computed(() => {
  // Filter users based on whether the user is a teacher or a student.
  if (isTeacher.value) {
    return userStore.users;
  } else {
    return userStore.users.filter(
      (user) => user.userId === userStore.currentUser?.userId
    );
  }
});
const handlePaste = (event: ClipboardEvent) => {
  const pastedText = event.clipboardData?.getData("text") || "";
  const combinedText = nameAssignment.value + pastedText;

  if (combinedText.length > 50) {
    event.preventDefault();
    nextTick(() => {
      notifyError("ไม่สามารถกรอกเกิน 50 ตัวอักษร");
    });
  }
};

const notifyError = (message: string) => {
  console.error(message);
};

// Fetch assignments when the component mounts
onMounted(async () => {
  console.log("id", id.value);

  await assignmentStore.getAssignmentByCourseIdPaginate(id.value.toString(), 1),
    await attendanceStore.getAttendanceByCourseId(id.value.toString()),
    await userStore.getUserByCourseId(id.value.toString()),
    await courseStore.getCourseById(id.value.toString()),
    (posts.value = assignmentStore.assignments);
  totalPage.value = assignmentStore.total;
});

// Watch for changes to `currentPage` and fetch new assignments when it changes
watch(
  () => assignmentStore.currentPage,
  async (newPage, oldPage) => {
    if (newPage !== oldPage) {
      await assignmentStore.getAssignmentByCourseIdPaginate(id.value.toString(), newPage);
      posts.value = assignmentStore.assignments;
      totalPage.value = assignmentStore.total;
    }
  }
);

// Calculate total score based on attendance status.
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

// Get attendance status for a specific user and assignment.
const getAttendanceStatus = (
  attendances: Attendance[],
  userId: number,
  assignmentId: number
): string => {
  const attendanceIndex = attendances.findIndex(
    (att: Attendance) =>
      att.user?.userId === userId && att.assignment?.assignmentId === assignmentId
  );
  return attendances[attendanceIndex]
    ? attendances[attendanceIndex].attendanceStatus
    : "absent";
};

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
  if (nameAssignment.value === "") {
    showDialog.value = false;

    Swal.fire({
      icon: "error",
      title: "กรุณากรอกชื่อเรื่องการเช็คชื่อ",
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
    await createPost();
    await closeDialog();
  }
};
// Function to resize an image and convert it to a base64 string
const resizeAndConvertImageToBase64 = (
  imageUrl: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.7 // default quality is set to 0.7
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
  const arr = base64.split(",");
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
  stopCamera();
  console.time("Total createPost execution time");

  // Validation checks
  console.time("Validation check");
  if (nameAssignment.value === "") {
    console.timeEnd("Validation check");
    Swal.fire({
      icon: "error",
      title: "กรุณากรอกชื่อเรื่องการเช็คชื่อ",
    });
    return;
  }

  if ([...capturedImages.value, ...imageUrls.value].length > 20) {
    console.timeEnd("Validation check");
    Swal.fire({
      icon: "error",
      title: "ไม่สามารถอัปโหลดรูปภาพได้เกิน 20 รูป",
    });
    return;
  }
  console.timeEnd("Validation check");

  console.time("Assignment creation");

  // Create new assignment object
  const newAssignment = {
    assignmentTime: new Date(),
    nameAssignment: nameAssignment.value || new Date().toLocaleString(), // Fallback to date if name is empty
    course: { ...courseStore.currentCourse! },
    assignmentId: 0,
    attdances: [],
    status: "no data",
    createdDate: new Date(),
    updatedDate: undefined,
    deletedDate: undefined,
    assignmentManual: assignmentManual.value,
  };

  try {
    // Step 1: Create assignment
    await assignmentStore.createAssignment(
      {
        ...newAssignment,
        statusAssignment: "nodata",
      },
      [] // Send empty file array initially
    );

    const createdAssignment = assignmentStore.currentAssignment;
    console.log("newAssignment", createdAssignment);

    if (!createdAssignment || !createdAssignment.assignmentId) {
      console.error("Assignment creation failed or assignmentId is undefined.");
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการสร้างการเช็คชื่อ",
      });
      return;
    }

    console.timeEnd("Assignment creation");

    // Proceed to image processing and uploads only if there are images
    if (capturedImages.value.length > 0 || imageUrls.value.length > 0) {
      console.time("Image processing");

      // Resize and compress images before uploading
      const processedImages = await Promise.all(
        imageFiles.value.map((file) =>
          resizeAndConvertImageToBase64(URL.createObjectURL(file), 800, 600, 0.7)
        )
      );

      console.timeEnd("Image processing");

      // Convert base64 images to File objects
      const filesToUpload = processedImages.map((base64, index) =>
        base64ToFile(base64, `image-${index + 1}.jpg`)
      );

      console.time("Backend image upload");

      // Step 2: Upload images
      await assignmentStore.updateImageAssignment(
        createdAssignment.assignmentId + "",
        filesToUpload
      );

      console.timeEnd("Backend image upload");
    }

    // Image storage and navigation
    console.time("Image storage and navigation");

    // Combine captured images and image URLs, remove duplicates
    const allImages = [...new Set([...capturedImages.value, ...imageUrls.value])]; // Avoid duplicates
    localStorage.setItem("images", JSON.stringify(allImages));

    if (allImages.length > 0) {
      // Navigate to the next page
      router.push({
        path: `/mapping2/assignment/${createdAssignment.assignmentId}/course/${id.value}`,
      });

      // Clear the form and reset images after navigating
      closeDialog();
      nameAssignment.value = "";
      imageUrls.value = [];
      capturedImages.value = [];
      imageFiles.value = [];
    } else {
      console.error("No images available for posting.");
    }

    console.timeEnd("Image storage and navigation");
  } catch (error) {
    console.error("Error creating assignment or uploading images:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาดในการสร้างการเช็คชื่อหรือการอัปโหลดรูปภาพ",
      text: error.message,
    });
  }

  console.timeEnd("Total createPost execution time");
};

// open show dialog and set value editAttendance
const openDialog = (assignment: Assignment, user: User) => {
  //filter attendance from assignments
  const attendance = attendanceStore.attendances?.findIndex(
    (att) =>
      att.user?.userId === user.userId &&
      att.assignment?.assignmentId === assignment.assignmentId
  );
  console.log("show", attendance);
  console.log("show", assignment);
  attendanceStore.editAttendance = attendanceStore.attendances![attendance!];
  attendanceStore.userAttendance = user;
  attendanceStore.showDialog = true;
};

const exportFile = () => {
  messageStore.showConfirm_(
    "ต้องการดาวน์โหลดไฟล์ Excel ใช่หรือไม่",
    confirmExportFile,
    cancelExportFile
  );
};

const confirmExportFile = () => {
  const data = filteredUsers.value.map((user) => {
    const userData: {
      รหัสนิสิต: string | undefined;
      ชื่อ: string;
      คะแนนรวม: number;
      [key: string]: string | number | undefined;
    } = {
      รหัสนิสิต: user.studentId,
      ชื่อ: user.firstName + " " + user.lastName,
      คะแนนรวม: calculateTotalScore(user.userId!, assignmentStore.assignments),
    };

    assignmentStore.assignments.forEach((assignment) => {
      const status = getAttendanceStatus(
        attendanceStore.attendances!,
        user.userId!,
        assignment.assignmentId!
      );
      let translatedStatus = "";

      if (status === "present") {
        translatedStatus = "มาเรียน";
      } else if (status === "late") {
        translatedStatus = "มาสาย";
      } else {
        translatedStatus = "ไม่มาเรียน";
      }

      userData[assignment.nameAssignment] = translatedStatus;
    });

    return userData;
  });

  // Create the worksheet and workbook
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Define a style for borders
  const borderStyle = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  // Iterate through each cell in the worksheet and apply border styles
  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      if (!ws[cellAddress].s) ws[cellAddress].s = {};
      ws[cellAddress].s.border = borderStyle;
    }
  }

  // Write the file with the applied styles
  XLSX.writeFile(wb, "Report.xlsx");

  console.log("Export successful");
};

const cancelExportFile = () => {
  console.log("export failed");
};

// closeDialog and reset image and close camera
const closeDialog = () => {
  stopCamera();
  // reset textfield and
  nameAssignment.value = "";
  showDialog.value = false;
  imageUrls.value = [];
  capturedImages.value = [];
  imageFiles.value = [];
};
const calculateTotalScoreAndAbsence = (
  userId: number,
  assignments: Assignment[]
): { totalScore: number; absentCount: number } => {
  // Initialize totalScore and absentCount
  let totalScore = 0;
  let absentCount = 0;

  // Loop through all assignments to calculate totalScore and count absences
  assignments.forEach((assignment) => {
    const status = getAttendanceStatus(
      attendanceStore.attendances || [],
      userId,
      assignment.assignmentId!
    );

    // Increment totalScore based on attendance status
    if (status === "present") {
      totalScore += 1; // Full point for present
    } else if (status === "late") {
      totalScore += 0.5; // Half point for late
    } else if (status === "absent") {
      absentCount += 1; // Count absences
    }
  });

  return { totalScore, absentCount };
};
</script>

<template>
  <div style="margin-top: 5%; margin-left: 5%">
    <v-tabs v-model="tab">
      <v-tab v-for="item in tabs" :key="item.id" :value="item.title">
        {{ item.title }}
      </v-tab>
    </v-tabs>
    <v-divider></v-divider>

    <v-container>
      <!-- Tab content for posts -->
      <v-tab-item v-if="tab === 'โพสต์'" value="โพสต์">
        <v-card
          class="mx-auto"
          color="primary"
          max-width="1200"
          outlined
          style="padding: 20px"
        >
          <v-card-title>
            <h1 class="text-h5">
              {{ courseStore.currentCourse?.nameCourses }}
            </h1>
          </v-card-title>
        </v-card>

        <v-btn
          v-if="isTeacher"
          color="#6CA7FA"
          @click="showDialog = true"
          style="margin: 10px 0; color: black"
        >
          <v-icon>mdi-plus</v-icon>สร้างการเช็คชื่อ
        </v-btn>
        <v-dialog v-model="showDialog" persistent max-width="600px">
          <v-card>
            <v-card-title style="text-align: center">
              <h4>สร้างการเช็คชื่อ</h4>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-card-title>
                      <h6>ชื่อเรื่องการเช็คชื่อ</h6>
                    </v-card-title>
                    <v-card-text>
                      <v-text-field
                        name="nameAssignment"
                        label="ชื่อเรื่องการเช็คชื่อ"
                        v-model="nameAssignment"
                        variant="outlined"
                        outlined
                        required
                        maxlength="50"
                        @paste="handlePaste"
                        :rules="[
                          (v: any) => !!v || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*',
                          (v: any) => (v && v.length >= 1 && v.length <= 50) || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*'
                        ]"
                      />
                    </v-card-text>
                  </v-col>
                </v-row>

                <!-- File Upload and Camera Controls -->
                <v-row>
                  <v-col cols="12" sm="7">
                    <v-card-title style="white-space: nowrap">
                      <h6>
                        อัปโหลดรูปภาพ
                        <span style="color: red">(ห้ามอัปโหลดรูปภาพเกิน 20 รูป)</span>
                      </h6>
                    </v-card-title>
                    <v-card-text>
                      <v-file-input
                        label="(อัปโหลดสูงสุด 20 รูป)"
                        prepend-icon="mdi-image-multiple"
                        filled
                        @change="handleFileChange"
                        accept="image/*"
                        variant="outlined"
                        multiple
                      ></v-file-input>
                    </v-card-text>
                  </v-col>
                  <v-col cols="12" sm="5">
                    <v-card-title>
                      <h5>&nbsp;</h5>
                    </v-card-title>
                    <v-card-text>
                      <v-btn color="primary" @click="startCamera" block>
                        <v-icon left>mdi-camera</v-icon>
                        เปิดกล้องเพื่อถ่ายรูป
                      </v-btn>
                    </v-card-text>
                  </v-col>
                </v-row>
                <!-- Camera View -->
                <v-row v-if="showCamera">
                  <v-col cols="12" sm="12">
                    <video
                      ref="videoRef"
                      autoplay
                      style="width: 100%; border-radius: 8px"
                    ></video>
                    <canvas ref="canvasRef" style="display: none"></canvas>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-btn @click="captureImage" block color="primary">
                      <!-- <v-icon left>mdi-camera</v-icon> -->
                      ถ่ายรูปภาพ
                    </v-btn>
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col cols="12" sm="4">
                    <v-btn @click="stopCamera" block color="error">
                      <!-- <v-icon left>mdi-close</v-icon> -->
                      ปิดกล้องถ่ายรูป
                    </v-btn>
                  </v-col>
                </v-row>
                <!-- notification image morethan 20
                -->
                <v-row>
                  <v-col cols="12" sm="12">
                    <v-alert
                      v-if="capturedImages.length + imageUrls.length > 20"
                      type="error"
                      outlined
                      border="start"
                      elevation="2"
                      icon="mdi-alert"
                    >
                      ไม่สามารถอัปโหลดรูปภาพเกิน 20 รูป
                    </v-alert>
                  </v-col>
                </v-row>

                <!-- Uploaded and Captured Images Preview -->
                <v-row
                  class="scrollable-image-section"
                  v-if="imageUrls.length > 0 || capturedImages.length > 0"
                >
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
                <v-row v-else>
                  <v-col style="text-align: center; color: #a9a9a9">ไม่มีรูปภาพ</v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <!-- Dialog Actions (Fixed at the Bottom) -->
            <v-card-actions class="fixed-action-buttons">
              <v-btn color="error" @click="closeDialog()" outlined> ยกเลิก </v-btn>
              <v-spacer></v-spacer>

              <!-- Disable the post button if more than 20 images or if the name is empty -->
              <v-btn
                :disabled="
                  [...capturedImages, ...imageUrls].length > 20 || nameAssignment === ''
                "
                color="primary"
                @click="checkImageCountAndPost"
                outlined
              >
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
          <v-col
            cols="12"
            sm="12"
            md="12"
            class="d-flex justify-center align-center"
            style="min-height: 200px"
          >
            <div
              outlined
              class="d-flex justify-center align-center"
              style="min-height: 200px"
            >
              <p
                class="text-center"
                style="color: #999; font-size: 18px; font-weight: 500"
              >
                ไม่มีข้อมูลโพสต์
              </p>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-row>
            <v-col style="width: 100%">
              <v-pagination
                v-model="assignmentStore.currentPage"
                :length="Math.ceil(totalPage / 5)"
                rounded="circle"
              ></v-pagination>
            </v-col>
          </v-row>
        </v-row>
      </v-tab-item>
      <!-- tab member -->
      <v-tab-item
        v-else-if="tab === 'รายชื่อผู้เรียน/ผู้สอน'"
        value="รายชื่อผู้เรียน/ผู้สอน"
      >
        <v-card
          class="mx-auto"
          color="primary"
          max-width="1200"
          outlined
          style="padding: 20px"
        >
          <v-card-title>
            <h1 class="text-h5">
              {{ courseStore.currentCourse?.nameCourses }}
            </h1>
          </v-card-title>
        </v-card>
        <div style="width: 100%; padding: 20px">
          <!-- Teacher Section -->
          <div style="margin-bottom: 30px">
            <v-row>
              <v-col>
                <h3>ผู้สอน</h3>
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
                <h3>ผู้เรียน</h3>
              </v-col>

              <v-col cols="6" style="text-align: end">
                <p>{{ userStore.users.length }} คน</p>
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

      <v-tab-item v-else>
        <v-card
          class="mx-auto"
          color="primary"
          max-width="1200"
          outlined
          style="padding: 20px"
        >
          <v-card-title>
            <h1 class="text-h5">
              {{ courseStore.currentCourse?.nameCourses }}
            </h1>
          </v-card-title>
        </v-card>
        <v-card class="mx-auto" outlined style="padding: 20px; margin-top: 10px">
          <v-row>
            <v-col col="12" sm="10" class="text-primary">
              <v-card-title>คะแนนการเช็คชื่อ</v-card-title>
            </v-col>
            <v-col col="12" sm="2" v-if="userStore.currentUser?.role === 'อาจารย์'">
              <v-btn
                color="#093271"
                @click="exportFile"
                style="width: 200px; color: white"
              >
                <v-icon left>mdi-file-export</v-icon>Export คะแนน
              </v-btn>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <v-table>
            <thead>
              <tr>
                <th class="text-center vertical-divider">รหัสนิสิต</th>
                <th class="text-center vertical-divider">ชื่อ-สกุล</th>
                <th class="text-center vertical-divider">คะแนนเต็ม</th>
                <th class="text-center vertical-divider">คะแนนที่ได้</th>
                <th
                  class="text-center vertical-divider"
                  v-for="assignment in assignmentStore.assignments"
                  :key="assignment.assignmentId"
                >
                  {{ assignment.nameAssignment }}
                </th>
              </tr>
            </thead>
            <!-- {{attendanceStore.attendances!}} -->
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.userId"
                :class="{
                'highlight-red': calculateTotalScoreAndAbsence(user.userId!, assignmentStore.assignments)
                  .absentCount > 3
              }"
              >
                <td class="text-center vertical-divider">
                  {{ user.studentId }}
                </td>
                <td class="vertical-divider">
                  <span
                    :class="{
                    'highlighted-text': calculateTotalScoreAndAbsence(user.userId!, assignmentStore.assignments)
                      .absentCount > 3
                  }"
                  >
                    {{ user.firstName + " " + user.lastName }}
                  </span>
                </td>
                <td class="text-center vertical-divider">
                  {{ courseStore.currentCourse?.fullScore }}
                </td>
                <td class="text-center vertical-divider">
                  {{
                    calculateTotalScore(
                      user.userId!,
                      assignmentStore.assignments
                    )
                  }}
                </td>
                <td
                  v-for="assignment in assignmentStore.assignments"
                  :key="assignment.assignmentId"
                  class="text-center vertical-divider"
                >
                  <!-- {{getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!)}} -->
                  <template
                    v-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'"
                  >
                    <v-btn
                      density="compact"
                      color="green"
                      icon="mdi-check-circle"
                      v-if="isTeacher"
                      @click="openDialog(assignment, user)"
                    >
                      <v-icon>mdi-check-circle</v-icon>
                    </v-btn>
                    <v-icon color="green" v-else>mdi-check-circle</v-icon>
                  </template>
                  <template
                    v-else-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'"
                  >
                    <v-btn
                      density="compact"
                      color="orange"
                      icon="mdi-clock-outline"
                      v-if="isTeacher"
                      @click="openDialog(assignment, user)"
                    >
                      <v-icon>mdi-clock-outline</v-icon>
                    </v-btn>
                    <v-icon color="orange" v-else>mdi-clock-outline</v-icon>
                  </template>
                  <template v-else>
                    <v-btn
                      density="compact"
                      color="red"
                      icon="mdi-close-circle"
                      v-if="isTeacher"
                      @click="openDialog(assignment, user)"
                    >
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
.highlight-red {
  background-color: rgba(255, 0, 0, 0.1);
}

.highlight-yellow {
  background-color: rgba(255, 235, 59, 0.1);
}

.highlighted-text {
  color: red;
  font-weight: bold;
}

.text-primary {
  color: #3051ac;
}

.v-card-title {
  font-weight: bold;
}

.vertical-divider {
  border-left: 1px solid #e0e0e0;
}

.v-btn {
  margin-bottom: 12px;
}

.v-btn:hover {
  background-color: #3051ac;
  /* color: white !important; */
}

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

.v-card-title {
  font-weight: bold;
}

.v-card-text {
  font-size: 16px;
}

.ma-2 {
  margin: 8px;
}

.v-file-input {
  margin-bottom: 16px;
}

.v-btn {
  margin-bottom: 12px;
}

.v-btn:hover {
  background-color: #e0e0e0;
}

.v-img {
  border-radius: 8px;
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
}

.v-card-actions {
  display: flex;
  justify-content: flex-end;
}

.text-center {
  text-align: center;
}

.primary--text {
  color: #6ca7fa !important;
}

.image-container {
  position: relative;
}

.delete-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: transparent !important;
  /* No background */
  box-shadow: none;
  /* Remove shadow */
  padding: 0;
  /* Remove padding */
}

.delete-icon:hover {
  background-color: transparent;
  /* No hover background */
}

/* Scrollable image section */
.scrollable-image-section {
  max-height: 200px;
  /* Adjust this value as needed */
  overflow-y: auto;
}

/* Fixed position for action buttons */
.fixed-action-buttons {
  position: sticky;
  bottom: 0;
  background-color: white;
  /* Same background as the card */
  z-index: 1;
  /* Ensure it stays above content */
  padding: 16px;
  /* Add some padding for better spacing */
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  /* Optional: shadow for better separation */
}

.image-container {
  position: relative;
}

.delete-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: transparent !important;
  padding: 0;
}
</style>
