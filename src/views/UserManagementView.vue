<script setup lang="ts">
import CreateUserDialog from '@/components/dialogs/CreateUserDialog.vue';
import CreateUserDialog2 from '@/components/dialogs/CreateUserDialog2.vue';
import CreateUserDialog3 from '@/components/dialogs/CreateUserDialog3.vue';
import EditUserDialog from '@/components/dialogs/EditUserDialog.vue';
import EditUserDialog2 from '@/components/dialogs/EditUserDialog2.vue';
import EditUserDialog3 from '@/components/dialogs/EditUserDialog3.vue';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref, defineComponent, computed } from 'vue';
const url = import.meta.env.VITE_API_URL;

const userStore = useUserStore();
const sortedStudents = computed(() => {
  return userStore.users
    .filter(user => user.studentId)
    .sort((a, b) => {
      if (a.studentId && b.studentId) {
        return a.studentId.localeCompare(b.studentId);
      }
      return 0;
    });
});
const sortedTeachers = computed(() => {
  return userStore.users
    .filter(user => user.teacherId)
    .sort((a, b) => {
      if (a.teacherId && b.teacherId) {
        return a.teacherId.localeCompare(b.teacherId);
      }
      return 0;
    });
});
const sortedAdmins = computed(() => {
  return userStore.users
    .filter(user => user.adminId)
    .sort((a, b) => {
      if (a.adminId && b.adminId) {
        return a.adminId.localeCompare(b.adminId);
      }
      return 0;
    });
});
// const teachers = computed(() => userStore.users.filter(user => user.teacherId));
const confirmDlg = ref();
onMounted(async () => {
  await userStore.getUsersById(userStore.currentUser?.userId!);
  await userStore.getCurrentUser()
  await userStore.getUsers();
  await userStore.getUserFromLocalStorage();
})

const showEditedDialog = (user: User) => {
  if (user.studentId) {
    // Show the student edit dialog
    userStore.showEditDialog = true;
    userStore.editUser = { ...user, files: [] };
    console.log('Student ID user', userStore.editUser);
  } else if (user.teacherId) {
    // Show the teacher edit dialog
    userStore.showEditDialog2 = true;
    userStore.editUser = { ...user, files: [] };
    console.log('Teacher ID user', userStore.editUser);
  } else if (user.adminId) {
    // Show the admin edit dialog
    userStore.showEditDialog3 = true;
    userStore.editUser = { ...user, files: [] };
    console.log('Admin ID user', userStore.editUser);
  } else {
    console.log('User does not have a valid ID');
  }
}


// function delete user
const deleteUser = async (id: number) => {
  console.log(id);
  await confirmDlg.value.openDialog(
    'Please Confirm',
    `Do you want to delete this customer?`,
    'Accept',
    'Cancel'
  )
  await userStore.deleteUser(id);
}
const showDeleteDialog = (user: User) => {
  userStore.showDeleteDialog = true;
  userStore.currentUser = user;
}

const defaultImagePath = 'path_to_default_image'; // Path to your default/fallback image

function onImageError(event: Event) {
  console.error('Error loading image');
  const target = event.target as HTMLImageElement;
  target.src = 'path_to_default_fallback_image'; // Make sure this default path is correct and accessible
}

function formattedImageProfile(profileImage: string): string {
  console.log("Profile Image Data: ", profileImage);
  if (profileImage && !profileImage.startsWith('data:')) {
    return `data:image/png;base64,${profileImage}`;
  }
  return profileImage;
}

const tab = ref(0);
</script>
<template>
  <v-container style="padding-top: 120px;">
    <v-toolbar style="background-color: white;" flat>
      <v-toolbar-title class="mr-10"
        style="font-weight: bold; white-space: nowrap;">การจัดการผู้ใช้งาน</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-row align="center" justify="end">
        <v-col cols="auto">
          <v-text-field v-model="userStore.searchQuery" label="ค้าหารหัสนิสิต" append-inner-icon="mdi-magnify"
            hide-details dense variant="solo" class="search-bar"></v-text-field>
        </v-col>
        <!-- <v-col cols="auto">
          <v-btn color="primary" variant="elevated" @click="userStore.showDialog = true" class="custom-btn">
            <v-icon left>mdi-plus</v-icon>
            เพิ่มผู้ใช้นิสิต
            <v-dialog v-model="userStore.showDialog" persistent>
              <CreateUserDialog></CreateUserDialog>
            </v-dialog>
          </v-btn>
        </v-col> -->
        <v-col cols="auto">
          <v-btn color="primary" variant="elevated" @click="userStore.showDialog2 = true" class="custom-btn">
            <v-icon left>mdi-plus</v-icon>
            เพิ่มผู้ใช้อาจารย์
            <v-dialog v-model="userStore.showDialog2" persistent>
              <CreateUserDialog2></CreateUserDialog2>
            </v-dialog>
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" variant="elevated" @click="userStore.showDialog4 = true" class="custom-btn">
            <v-icon left>mdi-plus</v-icon>
            เพิ่มผู้ใช้แอดมิน
            <v-dialog v-model="userStore.showDialog4" persistent>
              <CreateUserDialog3></CreateUserDialog3>
            </v-dialog>
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar><br>
    <v-card class="my-3 emboss-effect" style="width: 100%;" elevation="2">
      <v-tabs v-model="tab" background-color="white" dark>
        <v-tab>นิสิต</v-tab>
        <v-tab>อาจารย์</v-tab>
        <v-tab>แอดมิน</v-tab>
        <!-- <v-tab>บุคลากร</v-tab> -->
      </v-tabs>
      <!-- Tab content for นืสิต -->
      <v-tab-item v-if="tab === 0">
        <v-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
                <!-- <th class="text-left">ภาพ</th> -->
                <th class="text-left">รหัสนิสิต</th>
                <th class="text-left">ชื่อ-นามสกุล</th>
                <th class="text-left">ชั้นปี</th>
                <th class="text-left">สาขา</th>
                <th class="text-left">ตำแหน่ง</th>
                <th class="text-left">สถานะภาพ</th>
                <th class="text-center">ตัวเลือกเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) of sortedStudents" :key="index">
                <td>{{ index + 1 }}</td>
                <!-- <img :src="`${url}/users/${item.userId}/image`" style="width: 100px; height: 100px;"> -->
                <td>{{ item.studentId }}</td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td>{{ item.year }}</td>
                <td>{{ item.major}}</td>
                <td>{{ item.role }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <td>
                  <div class="button-group">
                    <v-btn small class="ma-1" color="yellow darken-2" @click="showEditedDialog(item)">
                      <v-icon left>mdi-pencil</v-icon>
                      แก้ไขข้อมูล
                    </v-btn>
                    <!-- <v-btn small class="ma-1" color="red" @click="deleteUser(item.userId!)">
                      <v-icon left>mdi-delete</v-icon>
                      ลบข้อมูล
                    </v-btn> -->
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </v-tab-item>
      <!-- Tab content for อาจารย์ -->
      <v-tab-item v-if="tab === 1">
        <v-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">ภาพ</th>
                <th class="text-left">รหัสอาจารย์</th>
                <th class="text-left">ชื่อ-นามสกุล</th>
                <th class="text-left">ตำแหน่ง</th>
                <th class="text-left">สถานะภาพ</th>
                <th class="text-center">ตัวเลือกเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) of sortedTeachers" :key="index">
                <td>{{ index + 1 }}</td>
                <img :src="`${url}/users/${item.userId}/image`" style="width: 100px; height: 100px;">
                <td>{{ item.teacherId }}</td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td>{{ item.role }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <td style="justify-content: center;">
                  <div class="button-group">
                  <v-btn small class="ma-1" color="yellow darken-2" text="Button Text" @click="showEditedDialog(item)">
                    <v-icon left>mdi-pencil</v-icon>
                    แก้ไขข้อมูล
                  </v-btn>
                </div>
                  <!-- <v-btn small class="ma-1" color="red" text="Button Text" @click="deleteUser(item.userId!)">
                    <v-icon left>mdi-delete</v-icon>
                    ลบข้อมูล
                  </v-btn> -->
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </v-tab-item>
      <v-tab-item v-if="tab === 2">
        <v-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">ภาพ</th>
                <th class="text-left">รหัสแอดมิน</th>
                <th class="text-left">ชื่อ-นามสกุล</th>
                <th class="text-left">ตำแหน่ง</th>
                <th class="text-left">สถานะภาพ</th>
                <th class="text-center">ตัวเลือกเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) of sortedAdmins" :key="index">
                <td>{{ index + 1 }}</td>
                <img :src="`${url}/users/${item.userId}/image`" style="width: 100px; height: 100px;">
                <td>{{ item.adminId }}</td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td>{{ item.role }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <td style="justify-content: center;">
                  <div class="button-group">
                  <v-btn small class="ma-1" color="yellow darken-2" text="Button Text" @click="showEditedDialog(item)">
                    <v-icon left>mdi-pencil</v-icon>
                    แก้ไขข้อมูล
                  </v-btn>
                </div>
                  <!-- <v-btn small class="ma-1" color="red" text="Button Text" @click="deleteUser(item.userId!)">
                    <v-icon left>mdi-delete</v-icon>
                    ลบข้อมูล
                  </v-btn> -->
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </v-tab-item>
    </v-card>
  </v-container>
  <v-dialog v-model="userStore.showEditDialog" persistent>
    <EditUserDialog></EditUserDialog>
  </v-dialog>
  <v-dialog v-model="userStore.showEditDialog2" persistent>
    <EditUserDialog2></EditUserDialog2>
  </v-dialog>
  <v-dialog v-model="userStore.showEditDialog3" persistent>
    <EditUserDialog3></EditUserDialog3>
  </v-dialog>
  <ConfirmDialog ref="confirmDlg" />

</template>
<style scoped>
.v-data-table .v-icon {
  cursor: pointer;
}

.emboss-effect {
  background: #fff;
  /* Ensure the card background is light to enhance the shadow effect */
  box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.2);
  /* Inset shadow for embossed effect */
}

.search-bar {
  max-width: 400px;
  /* Adjust the width as needed */
  width: 400px;
}

.custom-btn {
  background-color: #1976d2 !important;
  color: white !important;
  margin-left: 10px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
}

.custom-btn:hover {
  background-color: #155a8a !important;
}

.custom-btn v-icon {
  margin-right: 5px;
}

.d-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>