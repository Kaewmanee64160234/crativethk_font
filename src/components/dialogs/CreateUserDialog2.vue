<script lang="ts" setup>
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user.store';
import * as faceapi from 'face-api.js';
import { onMounted, ref } from 'vue';

const userStore = useUserStore();
const messageStore = useMessageStore();

// Snackbar state
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('error');

onMounted(async () => {
  await loadModels();
});

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

async function save() {
  // check if teacherId is empty and not 8 digits
  // if (!userStore.editUser.teacherId || !/^[0-9]{8}$/.test(userStore.editUser.teacherId)) {
  //     showSnackbar('โปรดกรอกรหัสอาจารย์ 8 หลัก');
  //     return;
  if (!userStore.editUser.firstName || !userStore.editUser.lastName ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.firstName) ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.lastName) ||
    userStore.editUser.firstName.length > 100 ||
    userStore.editUser.lastName.length > 100) {
    showSnackbar('โปรดกรอกชื่อและนามสกุลเป็นภาษาไทย และต้องไม่เกิน 100 ตัวอักษร');
    return;
  }
  else if (
    !userStore.editUser.major ||
    ![
      "วิทยาการคอมพิวเตอร์",
      "เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล",
      "วิศวกรรมซอฟต์แวร์",
      "ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ",
    ].includes(userStore.editUser.major)
  ) {
    showSnackbar("โปรดเลือกสาขาให้ถูกต้อง");
    return;
  }
  // check if role is not "อาจารย์"
  else if (userStore.editUser.role !== 'อาจารย์') {
    showSnackbar('โปรดเลือกตำแหน่งที่ถูกต้อง');
    return;
  }
  else if (!['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(userStore.editUser.status ?? '')) {
    showSnackbar('โปรดเลือกสถานะภาพที่ถูกต้อง');
    return;
  }
  // check if email is empty and follows the email format
  else if (!userStore.editUser.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userStore.editUser.email)) {
    showSnackbar('โปรดกรอกอีเมลให้ถูกต้อง');
    return;
  }
  //checkEmailDuplicate
  const emailDuplicate = await userStore.checkEmailDuplicate(userStore.editUser.email);
  if (emailDuplicate) {
    showSnackbar('อีเมลนี้ถูกใช้งานแล้ว');
    return;
  }
  await userStore.saveUser();
  await userStore.resetUser();
  await userStore.closeDialog();
}

// check if role is not "อาจารย์"
// else if (userStore.editUser.role !== 'อาจารย์') {
//     showSnackbar('โปรดเลือกตำแหน่งที่ถูกต้อง');
//     return;
// }

// check if status is not valid


const onImageError = (event: any) => {
  event.target.src = 'path_to_default_image'; // Provide the path to a default image
};

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

function showSnackbar(message: string, color: string = 'error') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarVisible.value = true;
}

async function cancel() {
  userStore.resetUser();
  userStore.closeDialog();
}

// Set the default value for role
if (!userStore.editUser.role) {
  userStore.editUser.role = 'อาจารย์';
}

// set the default value for status
if (!userStore.editUser.status) {
  userStore.editUser.status = 'ดำรงตำแหน่ง';
}
// set the default value for major
if (!userStore.editUser.major) {
  userStore.editUser.major = 'วิทยาการคอมพิวเตอร์';
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <!-- Adjusted card width to fit better -->
      <v-card class="mx-auto elevation-3" style="width: 60vw; padding: 30px; border-radius: 15px;">
        <v-card-title class="pb-0" style="font-size: 24px; font-weight: 600;">เพิ่มผู้ใช้อาจารย์</v-card-title>
        <v-divider class="my-4"></v-divider>
        <v-row>
          <!-- Form Column -->
          <v-col cols="12">
            <v-row>
              <!-- First Name and Last Name in one row -->
              <v-col cols="6">
                <v-text-field label="ชื่อ" dense solo outlined rounded required v-model="userStore.editUser.firstName"
                  :rules="[(v) => !!v || 'โปรดกรอกชื่อ',
                  (v) => /^[ก-๙\s]+$/.test(v) || 'ชื่อต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                  (v) => v.length <= 100 || 'ชื่อต้องไม่เกิน 100 ตัวอักษร']">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field label="นามสกุล" dense solo outlined rounded required v-model="userStore.editUser.lastName"
                  :rules="[(v) => !!v || 'โปรดกรอกนามสกุล',
                  (v) => /^[ก-๙\s]+$/.test(v) || 'นามสกุลต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                  (v) => v.length <= 100 || 'นามสกุลต้องไม่เกิน 100 ตัวอักษร']">
                </v-text-field>
              </v-col>

              <!-- Email -->
              <v-col cols="12">
                <v-text-field label="อีเมล" dense solo outlined rounded required v-model="userStore.editUser.email"
                  :rules="[(v) => !!v || 'โปรดกรอกอีเมล',
                  (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'กรอกอีเมลให้ถูกต้อง']">
                </v-text-field>
              </v-col>

              <!-- Major Selection and Status in one row -->
              <v-col cols="6">
                <v-select label="สาขา"
                  :items="['วิทยาการคอมพิวเตอร์', 'เมคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ']"
                  dense solo outlined rounded required v-model="userStore.editUser.major" :rules="[
                    (v: any) => !!v || 'โปรดเลือกสาขา',
                    (v: any) => ['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ'].includes(v) || 'โปรดเลือกสาขาจากรายการที่ให้ไว้'
                  ]">
                </v-select>
              </v-col>

              <v-col cols="6">
                <v-select label="สถานะภาพ" :items="['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']" dense solo outlined rounded
                  required v-model="userStore.editUser.status"
                  :rules="[
                    (v) => !!v || 'โปรดเลือกสถานะภาพ',
                    (v) => ['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(v) || 'โปรดเลือกสถานะภาพจากรายการที่ให้ไว้']">
                </v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Card Actions (Buttons) -->
        <v-card-actions class="justify-space-between mt-4">
          <v-btn color="red" text="ยกเลิก" rounded outlined class="ml-2" @click="cancel"
            style="padding: 12px 24px; font-size: 16px; width: 120px;">
            ยกเลิก
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue" text="ยืนยัน" rounded class="mr-2" @click="save"
            style="padding: 12px 24px; font-size: 16px; width: 120px;">
            ยืนยัน
          </v-btn>
        </v-card-actions>


      </v-card>
    </v-row>

    <!-- Snackbar for showing errors -->
    <v-snackbar v-model="snackbarVisible" :color="snackbarColor" top right :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" @click="snackbarVisible = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
/* Styling for fields and layout */
.v-card {
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-text-field,
.v-combobox,
.v-select {
  background-color: #f4f6f8;
  border-radius: 8px;
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
