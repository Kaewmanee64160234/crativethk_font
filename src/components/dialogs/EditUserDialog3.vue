<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { ref } from 'vue';
const userStore = useUserStore();
const url = 'http://localhost:3000';
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
if (!userStore.editUser.firstName || !userStore.editUser.lastName ||
        !/^[A-Za-zก-๙]+$/.test(userStore.editUser.firstName) ||
        !/^[A-Za-zก-๙]+$/.test(userStore.editUser.lastName)) {
            showSnackbar('โปรดกรอกชื่อและนามสกุลที่ไม่มีตัวเลข');
        return;
    }
    // check if role is not "แอดมิน"
    else if (userStore.editUser.role !== 'แอดมิน') {
        showSnackbar('โปรดเลือกตำแหน่งที่ถูกต้อง');
        return;
    }

    // check if status is not valid
    else if (!['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(userStore.editUser.status ?? '')) {
        showSnackbar('โปรดเลือกสถานะภาพที่ถูกต้อง');
        return;
    }
        await userStore.saveUser();
        await userStore.resetUser();
        window.location.reload(); 
}

async function cancel() {
    userStore.resetUser();
    userStore.closeDialog();
}

// Set the default value for role
if (!userStore.editUser.role) {
  userStore.editUser.role = 'แอดมิน';
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
                        <v-img :src="`${url}/users/image/filename/${userStore.editUser.images}`" alt="User Profile"
                            class="mb-2" max-width="100%" max-height="auto" />
                    </v-col>
                    <!-- Text Fields Column -->
                    <v-col cols="12" md="8">
                        <v-row align="center">
                            <v-col cols="12">
                                <v-text-field label="ชื่อ" dense solo required
                                    v-model="userStore.editUser.firstName"
                                    :rules="[(v) => !!v || 'โปรดกรอกขื่อ']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="นามสกุล" dense solo required
                                    v-model="userStore.editUser.lastName"
                                    :rules="[(v) => !!v || 'โปรดกรอกนามสกุล']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="ตำแหน่ง" dense solo required 
                                    v-model="userStore.editUser.role"
                                    :rules="[(v) => !!v || 'โปรดกรอกตำแหน่ง']"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-combobox label="สถานะภาพ" :items="['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']" dense solo required
                                    v-model="userStore.editUser.status" :rules="[
                                        v => !!v || 'โปรดเลือกสถานะภาพ',
                                        v => ['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(v) || 'โปรดเลือกสถานะภาพจากรายการที่ให้ไว้'
                                    ]"></v-combobox>
                            </v-col>
                            <v-col cols="12" md="6">
                                <!-- File Input -->
                                <v-file-input label="อัพโหลดรูปภาพ" prepend-icon="mdi-camera" filled multiple
                                    v-model="userStore.editUser.files" accept="image/*" outlined></v-file-input>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-card-actions class="justify-end">
                    <v-btn color="blue" text="บันทึก" @click="save" ></v-btn>
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