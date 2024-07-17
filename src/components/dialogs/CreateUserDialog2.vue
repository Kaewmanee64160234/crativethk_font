<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import * as faceapi from 'face-api.js';
import { onMounted } from 'vue';

const userStore = useUserStore();
onMounted(async () => {
  await loadModels();
});

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}
async function save() {
    // loop create faceDescription
    // const faceDescriptions = await processFiles(userStore.editUser.files);
    // userStore.editUser.faceDescriptions = faceDescriptions;
    await userStore.saveUser();
   userStore.resetUser();
}

async function cancel() {
    userStore.resetUser();
    userStore.closeDialog();
}
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

// Set the default value for role
if (!userStore.editUser.role) {
  userStore.editUser.role = 'อาจารย์';
}

</script>
<template>
    <v-container>
        <v-row justify="center">
            <v-card class="mx-auto" style="width: 70vw; padding: 30px;">
                <v-card-title class="pb-0">เพิ่มผู้ใช้</v-card-title>
                <v-row>
                    <!-- Image Column -->
                    <v-col cols="12" md="4" class="d-flex justify-center align-center">
                        <v-avatar size="192">
                            <img :src="userStore.currentUser?.imageProfile" @error="onImageError" alt="User Profile">
                        </v-avatar>
                    </v-col>
                    <!-- Text Fields Column -->
                    <v-col cols="12" md="8">
                        <v-row align="center">
                            <v-col cols="12">
                                <v-text-field label="รหัสอาจารย์" dense solo required
                                    v-model="userStore.editUser.teacherId"
                                    :rules="[(v) => !!v || 'โปรดกรอกรหัสอาจารย์', (v) => /^[0-9]{8}$/.test(v) || 'โปรดกรอกข้อมูลเฉพาะตัวเลข 8 หลัก']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="ชื่อ" dense solo required v-model="userStore.editUser.firstName"
                                    :rules="[(v) => !!v || 'โปรดกรอกขื่อ']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="นามสกุล" dense solo required v-model="userStore.editUser.lastName"
                                    :rules="[(v) => !!v || 'โปรดกรอกนามสกุล']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="อีเมล" dense solo required v-model="userStore.editUser.email"
                                    :rules="[(v) => !!v || 'โปรดกรอกอีเมล']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="ตำแหน่ง" dense solo required v-model="userStore.editUser.role" 
                                    :rules="[(v) => !!v || 'โปรดกรอกตำแหน่ง']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-combobox label="สถานะภาพ" :items="['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']" dense solo required
                                    v-model="userStore.editUser.status" :rules="[
                                        v => !!v || 'โปรดเลือกสถานะภาพ',
                                        v => ['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(v) || 'โปรดเลือกสถานะภาพจากรายการที่ให้ไว้'
                                    ]"></v-combobox>
                            </v-col>
                            <!-- {{ userStore.editUser.files }} -->
                            <v-col cols="12" md="6">
                                <!-- File Input -->
                                <v-file-input label="อัพโหลดรูปภาพ" prepend-icon="mdi-camera" filled multiple
                                    v-model="userStore.editUser.files" accept="image/*" outlined></v-file-input>
                            </v-col>

                        </v-row>
                    </v-col>
                </v-row>
                <v-card-actions class="justify-end">
                    <v-btn color="blue" text="บันทึก" @click="save"></v-btn>
                    <v-btn text="ยกเลิก" @click="cancel"></v-btn>
                </v-card-actions>
            </v-card>
        </v-row>
    </v-container>

</template>
<style>
.actions {
    justify-content: flex-end;
}

.cards {
    width: 27vw;
    margin: 2%;
}

.textarea {
    margin-left: 5%;
    border-color: #E0E0E0;
}

.colorText {
    color: #2A6EC5;
}

.font-bold {
    font-weight: bold;
}

.fields {
    margin-left: 2%;
}
</style>