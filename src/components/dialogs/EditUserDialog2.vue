<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { ref } from 'vue';
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
    // check if teacherId is empty and not 8 digits
    // if (!userStore.editUser.teacherId || !/^[0-9]{8}$/.test(userStore.editUser.teacherId)) {
    //     showSnackbar('โปรดกรอกรหัสอาจารย์ 8 หลัก');
    //     return;
    // }
    if (!userStore.editUser.firstName || !userStore.editUser.lastName ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.firstName) ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.lastName) ||
    userStore.editUser.firstName.length > 100 ||
    userStore.editUser.lastName.length > 100) {

    showSnackbar('โปรดกรอกชื่อและนามสกุลเป็นภาษาไทย และต้องไม่เกิน 100 ตัวอักษร');
    return;
  }

    // check if role is not "อาจารย์"
    else if (userStore.editUser.role !== 'อาจารย์') {
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
    // window.location.reload();
    await userStore.closeDialog();
}

async function cancel() {
    userStore.resetUser();
    userStore.closeDialog();
}

// Set the default value for role
if (!userStore.editUser.role) {
    userStore.editUser.role = 'อาจารย์';
}

</script>
<template>
    <v-container>
      <v-row justify="center">
        <!-- Adjusted card width to fit better -->
        <v-card class="mx-auto elevation-3" style="width: 40vw; padding: 30px; border-radius: 15px;">
          <v-card-title class="pb-0" style="font-size: 24px; font-weight: 600;">แก้ไขผู้ใช้อาจารย์</v-card-title>
          <v-divider class="my-4"></v-divider>
  
          <v-row>
            <!-- Form Column -->
            <v-col cols="12">
              <v-row>
                <!-- First Name -->
                <v-col cols="12">
                  <v-text-field label="ชื่อ" dense solo outlined rounded required v-model="userStore.editUser.firstName"
                    :rules="[ 
                      (v) => !!v || 'โปรดกรอกชื่อ',
                      (v) => /^[ก-๙\s]+$/.test(v) || 'ชื่อต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                      (v) => v.length <= 100 || 'ชื่อต้องไม่เกิน 100 ตัวอักษร'
                    ]">
                  </v-text-field>
                </v-col>
                <!-- Last Name -->
                <v-col cols="12">
                  <v-text-field label="นามสกุล" dense solo outlined rounded required v-model="userStore.editUser.lastName"
                    :rules="[
                      (v) => !!v || 'โปรดกรอกนามสกุล',
                      (v) => /^[ก-๙\s]+$/.test(v) || 'นามสกุลต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                      (v) => v.length <= 100 || 'นามสกุลต้องไม่เกิน 100 ตัวอักษร'
                    ]">
                  </v-text-field>
                </v-col>
               <!-- Status Combobox -->
              <v-col cols="12">
                <v-combobox label="สถานะภาพ" :items="['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']" dense solo outlined
                  rounded required v-model="userStore.editUser.status"  :rules="[
                    (v: any) => !!v || 'โปรดเลือกสถานะภาพ',
                    (v: any) => ['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(v) || 'โปรดเลือกสถานะภาพจากรายการที่ให้ไว้'
                  ]">
                </v-combobox>
              </v-col>
              </v-row>
            </v-col>
          </v-row>
  
          <!-- Card Actions (Buttons) -->
          <v-card-actions class="justify-end mt-4">
            <v-btn color="primary" text="บันทึก" rounded depressed class="mr-4" @click="save">
              บันทึก
            </v-btn>
            <v-btn text="ยกเลิก" rounded outlined color="grey" @click="cancel">
              ยกเลิก
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
  .v-combobox {
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