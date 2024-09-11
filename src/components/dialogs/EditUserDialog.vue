<script lang="ts" setup>
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user.store';
import * as faceapi from 'face-api.js';
import ImageEditDialog from '@/components/dialogs/ImageEditDialog.vue';
import { onMounted, ref } from 'vue';
onMounted(async () => {
    await loadModels();
});

const userStore = useUserStore();
const url = import.meta.env.VITE_API_URL;
// Snackbar state
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('error');

function showSnackbar(message: string, color: string = 'error') {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbarVisible.value = true;
}

async function save() {
    const faceDescriptions = await processFiles(userStore.editUser.files);
    const dataFaceBase64 = faceDescriptions.map((faceDescription) => float32ArrayToBase64(faceDescription));
    userStore.editUser.faceDescriptions = dataFaceBase64;
    console.log(userStore.editUser.faceDescriptions);
//check if studentId is empty and not 8 numbers
    if (!userStore.editUser.studentId || !/^[0-9]{8}$/.test(userStore.editUser.studentId)) {
        return;
    }else if (!userStore.editUser.firstName || !userStore.editUser.lastName ||
        !/^[A-Za-zก-๙]+$/.test(userStore.editUser.firstName) ||
        !/^[A-Za-zก-๙]+$/.test(userStore.editUser.lastName)) {
        showSnackbar('โปรดกรอกชื่อและนามสกุลที่ไม่มีตัวเลข');
        return;
    }
    //check if year is empty and not 2 numbers
    else if (!userStore.editUser.year || !/^[0-9]{2}$/.test(userStore.editUser.year)) {
        showSnackbar('โปรดกรอกชั้นปีให้ถูกต้อง');
        return;
    }
    //check if major is empty and not วิทยาการคอมพิวเตอร์, เมคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล, วิศวกรรมซอฟต์แวร์, ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ
    else if (!userStore.editUser.major || !['วิทยาการคอมพิวเตอร์', 'เมคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ'].includes(userStore.editUser.major)) {
        showSnackbar('โปรดเลือกสาขาให้ถูกต้อง');
        return;
    }
    //check if role is not นิสิต
    else if (userStore.editUser.role != 'นิสิต') {
        showSnackbar('โปรดเลือกตำแหน่งที่ถูกต้อง');
        return;
    }
    //check if status is not กำลังศึกษา, พ้นสภาพนิสิต, สำเร็จการศึกษา
    else if (!['กำลังศึกษา', 'พ้นสภาพนิสิต', 'สำเร็จการศึกษา'].includes(userStore.editUser.status ?? '')) {
        showSnackbar('โปรดเลือกสถานะภาพที่ถูกต้อง');
        return;
    }
    await userStore.saveUser();
    userStore.resetUser();
    // window.location.reload();
    userStore.closeDialog();
}
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}
async function cancel() {
    userStore.resetUser();
    userStore.closeDialog();
}

// Set the default value for role
if (!userStore.editUser.role) {
    userStore.editUser.role = 'นิสิต';
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
function float32ArrayToBase64(float32Array) {
    const uint8Array = new Uint8Array(float32Array.buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}
</script>
<template>
    <v-container>
        <v-row justify="center">
            <v-card class="mx-auto" style="width: 70vw; padding: 30px;">
                <v-card-title class="pb-0">แก้ไขผู้ใช้</v-card-title>
                <v-row>
                    <!-- Image Column -->
                    <v-col cols="12" md="4" class="d-flex justify-center align-center">
                        <v-img
                            v-if="userStore.editUser && userStore.editUser.images && userStore.editUser.images.length > 0"
                            :src="`${url}/users/${userStore.editUser.userId}/image`"  alt="User Profile"
                            class="mb-2" max-width="100%" max-height="auto" />
                    </v-col>
                    <!-- Text Fields Column -->
                    <v-col cols="12" md="8">
                        <v-row align="center">
                            <v-col cols="12">
                                <v-text-field label="รหัสนิสิต" dense solo required
                                    v-model="userStore.editUser.studentId"
                                    :rules="[(v) => !!v || 'โปรดกรอกรหัสนิสิต', (v) => /^[0-9]{8}$/.test(v) || 'โปรดกรอกข้อมูลเฉพาะตัวเลข 8 หลัก']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="ชื่อ" dense solo required
                                    v-model="userStore.editUser.firstName"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="นามสกุล" dense solo required
                                    v-model="userStore.editUser.lastName"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="ชั้นปี" dense solo required
                                    v-model="userStore.editUser.year"
                                    :rules="[(v) => !!v || 'โปรดใส่ชั้นปีเช่น 63, 64, 65', (v) => /^[0-9]{2}$/.test(v) || 'โปรดกรอกข้อมูลเฉพาะตัวเลข 2 หลัก']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-combobox label="สาขา" :items="['วิทยาการคอมพิวเตอร์', 'เมคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ']"
                                    dense solo required v-model="userStore.editUser.major" :rules="[
                                v => !!v || 'โปรดเลือกสาขา',
                                v =>['วิทยาการคอมพิวเตอร์', 'เมคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ'].includes(v) || 'โปรดเลือกสาขาจากรายการที่ให้ไว้'
                            ]"></v-combobox>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="ตำแหน่ง" dense solo required
                                    v-model="userStore.editUser.role"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-combobox label="สถานะภาพ" :items="['กำลังศึกษา', 'พ้นสภาพนิสิต', 'สำเร็จการศึกษา']"
                                    dense solo required v-model="userStore.editUser.status"></v-combobox>
                            </v-col>
                            <!-- <v-col cols="12">
                                <v-btn color="blue" @click="userStore.showImageDialog = true">แสดงรูปภาพทั้งหมด</v-btn>
                            </v-col> -->
                            <!-- <v-col cols="12" md="6">  -->
                                <!-- File Input -->
                                <!-- <v-file-input label="อัพโหลดรูปภาพ" prepend-icon="mdi-camera" filled multiple
                                    v-model="userStore.editUser.files" accept="image/*" outlined></v-file-input>
                            </v-col> -->
                        </v-row>
                    </v-col>
                </v-row>
                <v-card-actions class="justify-end">
                    <v-btn color="blue" text="บันทึก" @click="save"></v-btn>
                    <v-btn text="ยกเลิก" @click="cancel"></v-btn>
                </v-card-actions>
            </v-card>
        </v-row>
        <!-- Snackbar for showing errors -->
        <v-snackbar v-model="snackbarVisible" :color="snackbarColor" top right :timeout="3000">
            {{ snackbarMessage }}
            <template v-slot:action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="snackbarVisible = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
    <v-dialog v-model="userStore.showImageDialog" persistent>
        <ImageEditDialog></ImageEditDialog>
    </v-dialog>
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