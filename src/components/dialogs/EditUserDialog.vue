<script lang="ts" setup>
import { useUserStore } from "@/stores/user.store";
import * as faceapi from "face-api.js";
import { onMounted, ref } from "vue";
onMounted(async () => {
  await loadModels();
});

const userStore = useUserStore();
// Snackbar state
const snackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

function showSnackbar(message: string, color: string = "error") {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
}

async function save() {
  const faceDescriptions = await processFiles(userStore.editUser.files);
  const dataFaceBase64 = faceDescriptions.map((faceDescription) =>
    float32ArrayToBase64(faceDescription)
  );
  userStore.editUser.faceDescriptions = dataFaceBase64;
  console.log(userStore.editUser.faceDescriptions);
  //check if studentId is empty and not 8 numbers
  if (
    !userStore.editUser.studentId ||
    !/^[0-9]{8}$/.test(userStore.editUser.studentId)
  ) {
    return;
  } else if (
    !userStore.editUser.firstName ||
    !userStore.editUser.lastName ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.firstName) ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.lastName) ||
    userStore.editUser.firstName.length > 50 ||
    userStore.editUser.lastName.length > 50
  ) {
    showSnackbar(
      "โปรดกรอกชื่อและนามสกุลเป็นภาษาไทย และต้องไม่เกิน 50 ตัวอักษร"
    );
    return;
  }
  //check if year is empty and not 2 numbers
  else if (
    !userStore.editUser.year ||
    !/^[0-9]{2}$/.test(userStore.editUser.year)
  ) {
    showSnackbar("โปรดกรอกชั้นปีให้ถูกต้อง");
    return;
  }
  // check if email is empty and follows the email format
  else if (
    !userStore.editUser.email ||
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      userStore.editUser.email
    )
  ) {
    showSnackbar("โปรดกรอกอีเมลให้ถูกต้อง");
    return;
  }
  //check if major is empty and not วิทยาการคอมพิวเตอร์, เมคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล, วิศวกรรมซอฟต์แวร์, ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ
  else if (
    !userStore.editUser.major ||
    ![
      "วิทยาการคอมพิวเตอร์",
      "เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล",
      "วิศวกรรมซอฟต์แวร์",
      "ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ",
    ].includes(userStore.editUser.major)
  ) {
    showSnackbar("โปรดเลือกสาขาให้ถูกต้อง");
    return;
  }
  //check if role is not นิสิต
  // else if (userStore.editUser.role != "นิสิต") {
  //   showSnackbar("โปรดเลือกตำแหน่งที่ถูกต้อง");
  //   return;
  // }
  //check if status is not กำลังศึกษา, พ้นสภาพนิสิต, สำเร็จการศึกษา
  else if (
    !["กำลังศึกษา", "พ้นสภาพนิสิต", "สำเร็จการศึกษา"].includes(
      userStore.editUser.status ?? ""
    )
  ) {
    showSnackbar("โปรดเลือกสถานะภาพที่ถูกต้อง");
    return;
  }
  //checkStudentIdDuplicate
  // const studentIdDuplicate = await userStore.checkStudentIdDuplicate(userStore.editUser.studentId);
  // if (studentIdDuplicate) {
  //   showSnackbar('รหัสนิสิตนี้ถูกใช้งานแล้ว');
  //   return;
  // }
  await userStore.saveUser();
  userStore.resetUser();

  // window.location.reload();
  userStore.closeDialog();
  userStore.tab = 0;

  await userStore.fetchPaginatedFilterUsers({
    role: "นิสิต",
    major: "",
    status: "",
    search: "",
  });
}
async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
}
async function cancel() {
  userStore.resetUser();
  userStore.closeDialog();
}

// Set the default value for role
if (!userStore.editUser.role) {
  userStore.editUser.role = "นิสิต";
}
async function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => resolve(img);
      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function processFiles(files: File[]): Promise<Float32Array[]> {
  const faceDescriptions: Float32Array[] = [];

  for (const file of files) {
    const imgElement = await createImageElement(file);
    const faceDescription = await faceapi
      .detectSingleFace(imgElement, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (faceDescription) {
      faceDescriptions.push(faceDescription.descriptor);
    }

    // Clean up the created image element
    imgElement.remove();
  }

  return faceDescriptions;
}
function float32ArrayToBase64(float32Array: any) {
  const uint8Array = new Uint8Array(float32Array.buffer);
  let binary = "";
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
</script>
<template>
  <v-container>
    <v-row justify="center">
      <v-card
        class="mx-auto elevation-3"
        style="width: 50vw; padding: 30px; border-radius: 15px"
      >
        <v-card-title
          class="pb-0"
          style="font-size: 24px; font-weight: 600; text-align: center"
          >แก้ไขข้อมูลนิสิต</v-card-title
        >
        <v-divider class="my-4"></v-divider>

        <v-row>
          <!-- Form Column -->
          <v-col cols="12">
            <v-row>
              <!-- First Name -->
              <v-col cols="6">
                <v-text-field
                  label="ชื่อ"
                  variant="solo"
                  v-model="userStore.editUser.firstName"
                  :rules="[
                    (v) => !!v || 'โปรดกรอกชื่อ',
                    (v) =>
                      /^[ก-๙\s]+$/.test(v) ||
                      'ชื่อต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                    (v) => v.length <= 50 || 'ชื่อต้องไม่เกิน 50 ตัวอักษร',
                  ]"
                >
                </v-text-field>
              </v-col>
              <!-- Last Name -->
              <v-col cols="6">
                <v-text-field
                  label="นามสกุล"
                  variant="solo"
                  v-model="userStore.editUser.lastName"
                  :rules="[
                    (v) => !!v || 'โปรดกรอกนามสกุล',
                    (v) =>
                      /^[ก-๙\s]+$/.test(v) ||
                      'นามสกุลต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                    (v) => v.length <= 50 || 'นามสกุลต้องไม่เกิน 50 ตัวอักษร',
                  ]"
                >
                </v-text-field>
              </v-col>

              <!-- Email (disabled) -->
              <v-col cols="12">
                <v-text-field
                  label="อีเมล"
                  variant="solo"
                  v-model="userStore.editUser.email"
                  disabled
                  :rules="[
                    (v) => !!v || 'โปรดกรอกอีเมล',
                    (v) =>
                      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                        v
                      ) || 'กรอกอีเมลให้ถูกต้อง',
                  ]"
                >
                </v-text-field>
              </v-col>

              <!-- Year -->
              <v-col cols="6">
                <v-text-field
                  label="ชั้นปี"
                  variant="solo"
                  v-model="userStore.editUser.year"
                  :rules="[
                    (v) => !!v || 'โปรดใส่ชั้นปีเช่น 63, 64, 65',
                    (v) =>
                      /^[0-9]{2}$/.test(v) ||
                      'โปรดกรอกข้อมูลเฉพาะตัวเลข 2 หลัก',
                  ]"
                >
                </v-text-field>
              </v-col>

              <!-- Major -->
              <v-col cols="6">
                <v-select
                  label="สาขา"
                  :items="[
                    'วิทยาการคอมพิวเตอร์',
                    'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
                    'วิศวกรรมซอฟต์แวร์',
                    'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
                  ]"
                  variant="solo"
                  v-model="userStore.editUser.major"
                  :rules="[
                    (v) => !!v || 'โปรดเลือกสาขา',
                    (v) =>
                      [
                        'วิทยาการคอมพิวเตอร์',
                        'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
                        'วิศวกรรมซอฟต์แวร์',
                        'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
                      ].includes(v) || 'โปรดเลือกสาขาจากรายการที่ให้ไว้',
                  ]"
                >
                </v-select>
              </v-col>

              <!-- Status -->
              <v-col cols="12">
                <v-select
                  label="สถานะภาพ"
                  :items="['กำลังศึกษา', 'พ้นสภาพนิสิต', 'สำเร็จการศึกษา']"
                  variant="solo"
                  v-model="userStore.editUser.status"
                >
                </v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Card Actions (Buttons) -->
        <v-card-actions class="justify-space-between mt-4">
          <v-btn
            color="red"
            rounded
            outlined
            class="ml-4"
            style="padding: 12px 24px; font-size: 16px"
            @click="cancel"
          >
            ยกเลิก
          </v-btn>
          <v-btn
            color="blue"
            text="ยืนยัน"
            rounded
            class="mr-4"
            style="padding: 12px 24px; font-size: 16px"
            @click="save"
          >
            ยืนยัน
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-row>

    <!-- Snackbar for showing errors -->
    <v-snackbar
      v-model="snackbarVisible"
      :color="snackbarColor"
      top
      right
      :timeout="3000"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" @click="snackbarVisible = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.v-card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-text-field,
.v-combobox {
  border-radius: 8px;
}

.v-btn {
  font-weight: bold;
  font-size: 16px;
}

.v-card-actions {
  padding: 0 16px;
}

.v-snackbar {
  font-size: 14px;
  font-weight: bold;
}
/* Styling for fields and layout */
.v-card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-btn {
  font-weight: bold;
  font-size: 14px;
}

.v-card-actions {
  padding: 0 16px;
}

.v-snackbar {
  font-size: 14px;
  font-weight: bold;
}
</style>
