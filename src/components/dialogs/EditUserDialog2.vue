<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
import { ref } from 'vue';
const userStore = useUserStore();
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
  // Validate the name fields for Thai characters and length
  if (
    !userStore.editUser.firstName ||
    !userStore.editUser.lastName ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.firstName) ||
    !/^[ก-๙\s]+$/.test(userStore.editUser.lastName) ||
    userStore.editUser.firstName.length > 50 ||
    userStore.editUser.lastName.length > 50
  ) {
    showSnackbar('โปรดกรอกชื่อและนามสกุลเป็นภาษาไทย และต้องไม่เกิน 50 ตัวอักษร');
    return;
  }

  // Validate the role field to ensure it's set to "อาจารย์"
  if (userStore.editUser.role !== 'อาจารย์') {
    showSnackbar('โปรดเลือกตำแหน่งที่ถูกต้อง');
    return;
  }

  // Validate the status field for acceptable values
  if (!['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง'].includes(userStore.editUser.status ?? '')) {
    showSnackbar('โปรดเลือกสถานะภาพที่ถูกต้อง');
    return;
  }
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
// check if email empty and email format
else if (!userStore.editUser.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userStore.editUser.email)) {
        showSnackbar('โปรดกรอกอีเมลให้ถูกต้อง');
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

  // Save the user data and reset the form
  await userStore.saveUser();
  await userStore.resetUser();
  userStore.currentPage = 1;
  await userStore.getTeacherPagination();
  // Close the edit dialog
  userStore.closeDialog();
  userStore.tab = 1;

await userStore.fetchPaginatedFilterUsers({
  role: 'อาจารย์',
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
    userStore.editUser.role = 'อาจารย์';
}

</script>
<template>
  <v-container>
    <v-row justify="center">
      <!-- Adjusted card width to fit better -->
      <v-card class="mx-auto elevation-3" style="width: 60vw; padding: 30px; border-radius: 15px;">
        <v-card-title class="pb-0" style="font-size: 24px; font-weight: 600;text-align: center;">แก้ไขข้อมูลอาจารย์</v-card-title>
        <v-divider class="my-4"></v-divider>
        <v-row>
          <!-- Form Column -->
          <v-col cols="12">
            <v-row>
              <!-- First Name and Last Name in one row -->
              <v-col cols="6">
                <v-text-field label="ชื่อ" variant="solo" v-model="userStore.editUser.firstName"
                  :rules="[(v) => !!v || 'โปรดกรอกชื่อ',
                  (v) => /^[ก-๙\s]+$/.test(v) || 'ชื่อต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                  (v) => v.length <= 50 || 'ชื่อต้องไม่เกิน 50 ตัวอักษร']">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field label="นามสกุล" variant="solo" v-model="userStore.editUser.lastName"
                  :rules="[(v) => !!v || 'โปรดกรอกนามสกุล',
                  (v) => /^[ก-๙\s]+$/.test(v) || 'นามสกุลต้องไม่เป็นตัวเลขและต้องเป็นภาษาไทยเท่านั้น',
                  (v) => v.length <= 50 || 'นามสกุลต้องไม่เกิน 50 ตัวอักษร']">
                </v-text-field>
              </v-col>

              <!-- Email -->
              <v-col cols="12">
                <v-text-field label="อีเมล" variant="solo" v-model="userStore.editUser.email"
                  :rules="[(v) => !!v || 'โปรดกรอกอีเมล',
                  (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'กรอกอีเมลให้ถูกต้อง',
                  (v) => /^[a-zA-Z0-9._%+-]+@go\.buu\.ac\.th$/.test(v) || 'กรอกอีเมลให้ถูกต้อง (ต้องลงท้ายด้วย @go.buu.ac.th)']">
                </v-text-field>
              </v-col>

              <!-- Major Selection and Status in one row -->
              <v-col cols="6">
                <v-select label="สาขา"
                  :items="['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ']"
                  variant="solo" v-model="userStore.editUser.major" :rules="[
                    (v: any) => !!v || 'โปรดเลือกสาขา',
                    (v: any) => ['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ'].includes(v) || 'โปรดเลือกสาขาจากรายการที่ให้ไว้'
                  ]">
                </v-select>
              </v-col>

              <v-col cols="6">
                <v-select label="สถานะภาพ" :items="['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']" variant="solo"
                 v-model="userStore.editUser.status"
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