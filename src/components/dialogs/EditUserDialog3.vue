<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { ref } from 'vue';
const userStore = useUserStore();
const url = import.meta.env.BASE_URL;

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
    !/^[ก-๙\s]+$/.test(userStore.editUser.firstName) ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.lastName) ||
    userStore.editUser.firstName.length > 50 ||
    userStore.editUser.lastName.length > 50) {

    showSnackbar('โปรดกรอกชื่อและนามสกุลเป็นภาษาไทย และต้องไม่เกิน 50 ตัวอักษร');
    return;
  }
  // check if role is not "แอดมิน"
  else if (userStore.editUser.role !== 'แอดมิน') {
    showSnackbar('โปรดเลือกตำแหน่งที่ถูกต้อง');
    return;
  }

  // check if status is not valid
  else if (!['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(userStore.editUser.status ?? '')) {
    showSnackbar('โปรดเลือกสถานภาพที่ถูกต้อง');
    return;
  }
  // check if email is empty, follows the correct email format, and ends with @go.buu.ac.th
  else if (!userStore.editUser.email ||
    !/^[a-zA-Z0-9._%+-]+@go\.buu\.ac\.th$/.test(userStore.editUser.email)) {
    showSnackbar('โปรดกรอกอีเมลที่ลงท้ายด้วย @go.buu.ac.th');
    return;
  }
  // Check for email duplicates, ignoring the current user's own email
  const emailDuplicate = await userStore.checkEmailDuplicate(userStore.editUser.email ?? '', userStore.editUser.userId);
  if (emailDuplicate) {
    showSnackbar('อีเมลนี้ถูกใช้งานแล้ว');
    return;
  }
  await userStore.saveUser();
  await userStore.resetUser();
  // window.location.reload(); 
  userStore.currentPage = 1;
  await userStore.getAdminPagination();
  await userStore.closeDialog();
  userStore.tab = 2;

 await userStore.fetchPaginatedFilterUsers({
  role: 'แอดมิน',
    major: '',
    status: '',
    search: '',
   
});
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
      <v-card class="mx-auto elevation-3" style="width: 60vw; padding: 30px; border-radius: 15px;">
        <v-card-title class="pb-0" style="font-size: 24px; font-weight: 600;text-align: center;">แก้ไขข้อมูลแอดมิน</v-card-title>
        <v-divider class="my-4"></v-divider>
        <v-row>
          <v-col cols="12">
            <v-row>
              <!-- First Name -->
              <v-col cols="6">
                <v-text-field label="ชื่อ" variant="solo" v-model="userStore.editUser.firstName"
                  :rules="[
                    (v) => !!v || 'โปรดกรอกชื่อ',
                    (v) => /^[ก-๙\s]+$/.test(v) || 'ชื่อต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                    (v) => v.length <= 50 || 'ชื่อต้องไม่เกิน 50 ตัวอักษร'
                  ]">
                </v-text-field>
              </v-col>
              <!-- Last Name -->
              <v-col cols="6">
                <v-text-field label="นามสกุล" variant="solo" v-model="userStore.editUser.lastName"
                  :rules="[
                    (v) => !!v || 'โปรดกรอกนามสกุล',
                    (v) => /^[ก-๙\s]+$/.test(v) || 'นามสกุลต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                    (v) => v.length <= 50 || 'นามสกุลต้องไม่เกิน 50 ตัวอักษร'
                  ]">
                </v-text-field>
              </v-col>
              <!-- Email -->
              <v-col cols="6">
                <v-text-field label="อีเมล" variant="solo" v-model="userStore.editUser.email"
                  :rules="[(v) => !!v || 'โปรดกรอกอีเมล', (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'กรอกอีเมลให้ถูกต้อง',
                    (v) => /^[a-zA-Z0-9._%+-]+@go\.buu\.ac\.th$/.test(v) || 'กรอกอีเมลให้ถูกต้อง (ต้องลงท้ายด้วย @go.buu.ac.th)'
                  ]">
                </v-text-field>
              </v-col>
              <!-- Status -->
              <v-col cols="6">
                <v-select label="สถานภาพ" :items="['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']" variant="solo" v-model="userStore.editUser.status" :rules="[
                    (v) => !!v || 'โปรดเลือกสถานภาพ',
                    (v) => ['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(v) || 'โปรดเลือกสถานภาพจากรายการที่ให้ไว้'
                  ]">
                </v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Card Actions (Buttons) -->
        <v-card-actions class="justify-space-between mt-4">
          <v-btn text="ยกเลิก" rounded outlined color="red" style="padding: 12px 24px; font-size: 16px;"
            @click="cancel">
            ยกเลิก
          </v-btn>
          <v-btn color="blue" text="ยืนยัน" rounded style="padding: 12px 24px; font-size: 16px;" @click="save">
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
</style>
