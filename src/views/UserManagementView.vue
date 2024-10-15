<script setup lang="ts">
import CreateUserDialog2 from '@/components/dialogs/CreateUserDialog2.vue';
import CreateUserDialog3 from '@/components/dialogs/CreateUserDialog3.vue';
import EditUserDialog from '@/components/dialogs/EditUserDialog.vue';
import EditUserDialog2 from '@/components/dialogs/EditUserDialog2.vue';
import EditUserDialog3 from '@/components/dialogs/EditUserDialog3.vue';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref, watch, computed } from 'vue';
const url = import.meta.env.VITE_API_URL;

const userStore = useUserStore();
const yearOptions = ref<string[]>(['']);
const tab = ref(0);
const statusTeacher = ref(['ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']);
const statusStudent = ref(['กำลังศึกษา', 'พ้นสภาพนิสิต', 'สำเร็จการศึกษา']);
const majorOptions = ref(['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ']);
const confirmDlg = ref();
const studentPage = computed(() => userStore.studentPage);
const adminPage = computed(() => userStore.adminPage);
const teacherPage = computed(() => userStore.teacherPage);


onMounted(async () => {
  await userStore.getUsersById(userStore.currentUser?.userId!);
  await userStore.getCurrentUser()
  await userStore.getUsers();
  await userStore.fetchPaginatedUsers();
  updateYearOptions();
  userStore.searchDropdown2 = 'วิทยาการคอมพิวเตอร์';
  userStore.searchDropdown3 = 'กำลังศึกษา';
})
// Function to compute and update year options dynamically
const updateYearOptions = () => {
  const uniqueYears = Array.from(new Set(userStore.users.map(user => user.year).filter((year): year is string => Boolean(year))));
  uniqueYears.sort();
  yearOptions.value = ['', ...uniqueYears];
};

watch(() => tab.value, () => {
  if (tab.value === 0) {
    userStore.itemsPerPage = 20;
    userStore.currentPage = userStore.studentPage;
    userStore.totalUsers = 0;
    userStore.searchDropdown2 = 'วิทยาการคอมพิวเตอร์';
    userStore.searchDropdown3 = 'กำลังศึกษา';
    userStore.getStudentPagination();
  } else if (tab.value === 1) {
    userStore.itemsPerPage = 20;
    userStore.currentPage = teacherPage.value;
    userStore.totalUsers = 0;
    userStore.searchDropdown4 = 'ดำรงตำแหน่ง';
    userStore.getTeacherPagination();
  } else if (tab.value === 2) {
    userStore.itemsPerPage = 20;
    userStore.currentPage = adminPage.value;
    userStore.totalUsers = 0;
    userStore.searchDropdown4 = 'ดำรงตำแหน่ง';
    userStore.getAdminPagination();
  }
});

// watch(() => tab.value, () => {
//   if (tab.value === 0) {
//     userStore.searchDropdown2 = 'วิทยาการคอมพิวเตอร์';
//     userStore.searchDropdown3 = 'กำลังศึกษา';
//   } else if (tab.value === 1) {
//     userStore.searchDropdown4 = 'ดำรงตำแหน่ง';
//   } else if (tab.value === 2) {
//     userStore.searchDropdown4 = 'ดำรงตำแหน่ง';
//   }
//   // Add any other logic you want to execute when the tab changes.
// });


// Watch for changes in the user array and recalculate year options whenever users are modified
watch(() => userStore.users, () => {
  updateYearOptions();
}, { deep: true });


watch(studentPage, () => {
  if (tab.value === 0) {
    userStore.currentPage = studentPage.value;
    userStore.getStudentPagination();
  }
});


watch(teacherPage, () => {
  if (tab.value === 1) {
    userStore.currentPage = teacherPage.value;
    userStore.getTeacherPagination();
  }
});


watch(adminPage, () => {
  if (tab.value === 2) {
    userStore.currentPage = adminPage.value;
    userStore.getAdminPagination();
  }
});



const paginatedStudents = computed(() => userStore.users.filter(user => user.role === 'นิสิต'));
const paginatedTeachers = computed(() => userStore.users.filter(user => user.role === 'อาจารย์'));
const paginatedAdmins = computed(() => userStore.users.filter(user => user.role === 'แอดมิน'));



const showEditedDialog = (user: User) => {
  if (user.role == 'นิสิต') {
    // Show the student edit dialog
    userStore.showEditDialog = true;
    userStore.editUser = { ...user, files: [] };
    console.log('Student ID user', userStore.editUser);
  } else if (user.role == 'อาจารย์') {
    // Show the teacher edit dialog
    userStore.showEditDialog2 = true;
    userStore.editUser = { ...user, files: [] };
    console.log('Teacher ID user', userStore.editUser);
  } else if (user.role == 'แอดมิน') {
    // Show the admin edit dialog
    userStore.showEditDialog3 = true;
    userStore.editUser = { ...user, files: [] };
    console.log('Admin ID user', userStore.editUser);
  } else {
    console.log('User does not have a valid ID');
  }
}
</script>
<template>
  <v-container style="padding-top: 120px;">
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="main-title">การจัดการผู้ใช้งาน</h2>
      </v-col>
    </v-row>

    <!-- Search Bar and Buttons -->
    <v-row class="mb-6" align="center">
      <v-col cols="auto">
        <v-text-field style="width: 200px;" v-model="userStore.searchQuery" label="ค้าหาผู้ใช้งาน"
          append-inner-icon="mdi-magnify" hide-details dense variant="solo" class="search-bar"></v-text-field>
      </v-col>
      <!-- Year Filter Dropdown -->
      <!-- <v-col cols="auto">
        <v-select v-if="tab === 0" v-model="userStore.searchDropdown" :items="yearOptions" label="ชั้นปี" dense
          variant="solo" hide-details class="year-dropdown"></v-select>
      </v-col> -->
      <v-col cols="md 4">
        <v-select v-if="tab === 0 || tab === 1" v-model="userStore.searchDropdown2" :items="majorOptions" label="สาขา" dense
          variant="solo" hide-details class="wide-select year-dropdown "></v-select>
      </v-col>
      <v-col cols="md 4">
        <v-select v-if="tab === 0" v-model="userStore.searchDropdown3" :items="statusStudent" label="สถานะภาพ" dense
          variant="solo" hide-details class="wide-select status-dropdown"></v-select>
      </v-col>
      <v-col cols="md 4">
        <v-select v-if="tab === 1 || tab == 2" v-model="userStore.searchDropdown4" :items="statusTeacher" label="สถานะภาพ" dense
          variant="solo" hide-details class="wide-select status-dropdown"></v-select>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="elevated" @click="userStore.showDialog2 = true" class="custom-btn">
          <v-icon left size="20">mdi-account-plus-outline</v-icon>
          เพิ่มผู้ใช้อาจารย์
          <v-dialog v-model="userStore.showDialog2" persistent>
            <CreateUserDialog2 />
          </v-dialog>
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="elevated" @click="userStore.showDialog4 = true" class="custom-btn">
          <v-icon left size="20">mdi-account-plus-outline</v-icon>
          เพิ่มผู้ใช้แอดมิน
          <v-dialog v-model="userStore.showDialog4" persistent>
            <CreateUserDialog3 />
          </v-dialog>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabs and Table -->
    <v-card class="my-3 emboss-effect" style="width: 100%;" elevation="2">
      <v-tabs v-model="tab" background-color="white" dark>
        <v-tab>นิสิต</v-tab>
        <v-tab>อาจารย์</v-tab>
        <v-tab>แอดมิน</v-tab>
      </v-tabs>

      <!-- Tab content for นิสิต -->
      <v-tab-item v-if="tab === 0">
        <v-table dense v-if="paginatedStudents.length">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"> </th>
                <th class="text-left">รหัสนิสิต</th>
                <th class="text-left">ชื่อ-นามสกุล</th>
                <th class="text-left">ชั้นปี</th>
                <th class="text-left">สาขา</th>
                <th class="text-left">สถานะภาพ</th>
                <th class="text-center">ตัวเลือกเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedStudents" :key="index">
                <td>{{ index + 1 }} </td>
                <td>{{ item.studentId }}</td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td>{{ item.year }}</td>
                <td>{{ item.major }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <td>
                  <div class="button-container">
                    <v-btn small class="ma-1" style="background-color: #4C515A;  color: azure;"
                      @click="showEditedDialog(item)">
                      <v-icon left>mdi-pencil</v-icon>
                      แก้ไขข้อมูล
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
        <div v-else class="no-users-message" style="text-align: center; color: red; margin-top: 20px;">
          ไม่พบผู้ใช้งาน
        </div>
        <!-- Pagination student -->
        <v-pagination
  v-if="tab === 0"
  v-model="userStore.studentPage"
  :length="Math.ceil(userStore.totalUsers / userStore.itemsPerPage)"
  :total-visible="7"
  rounded="circle"
  :disabled="userStore.users.length === 0 || userStore.totalUsers <= userStore.itemsPerPage || userStore.searchQuery  .length > 0"
  size="large"
  color="primary"
  class="my-pagination"
/>

      </v-tab-item>

      <!-- Tab content for อาจารย์ -->
      <v-tab-item v-if="tab === 1">
        <v-table dense v-if="paginatedTeachers.length">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">ชื่อ-นามสกุล</th>
                <th class="text-left">สาขา</th>
                <th class="text-left">สถานะภาพ</th>
                <th class="text-center">ตัวเลือกเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedTeachers" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td>{{ item.major }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <div class="button-container">
                  <v-btn small class="ma-1" style="background-color: #4C515A;  color: azure;"
                    @click="showEditedDialog(item)">
                    <v-icon left>mdi-pencil</v-icon>
                    แก้ไขข้อมูล
                  </v-btn>
                </div>
              </tr>
            </tbody>
          </template>
        </v-table>
        <div v-else class="no-users-message" style="text-align: center; color: red; margin-top: 20px;">
          ไม่พบผู้ใช้งาน
        </div>
        <!-- Pagination teacher -->
        <v-pagination
  v-if="tab === 1"
  v-model="teacherPage"
  :length="Math.ceil(userStore.totalUsers / userStore.itemsPerPage)"
  :total-visible="7"
  rounded="circle"
  size="large"
  color="primary"
  class="my-pagination"
></v-pagination>
      </v-tab-item>

      <!-- Tab content for แอดมิน -->
      <v-tab-item v-if="tab === 2">
        <v-table dense v-if="paginatedAdmins.length">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">ชื่อ-นามสกุล</th>
                <th class="text-left">สถานะภาพ</th>
                <th class="text-center">ตัวเลือกเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedAdmins" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <td>
                  <div class="button-container">
                    <v-btn small class="ma-1" style="background-color: #4C515A;  color: azure;"
                      @click="showEditedDialog(item)">
                      <v-icon left>mdi-pencil</v-icon>
                      แก้ไขข้อมูล
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
        <div v-else class="no-users-message" style="text-align: center; color: red; margin-top: 20px;">
          ไม่พบผู้ใช้งาน
        </div>
        <!-- Pagination -->
        <v-pagination
  v-if="tab === 2"
  v-model="adminPage"
  :length="Math.ceil(userStore.totalUsers / userStore.itemsPerPage)"
  :total-visible="7"
  rounded="circle"
  size="large"
  color="primary"
  class="my-pagination"
></v-pagination>
      </v-tab-item>
    </v-card>
  </v-container>

  <!-- Edit and Confirm Dialogs -->
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
.wide-select {
  width: 250px;
}

.my-pagination {
  margin-top: 20px;
  /* Adds space between pagination and table */
  display: flex;
  justify-content: center;
  /* Centers the pagination */
}

.v-pagination__item {
  font-size: 16px;
  /* Adjust font size */
  font-weight: bold;
  /* Make text bold */
  color: #1976d2;
  /* Color of pagination numbers */
}

.v-pagination__item--active {
  background-color: #1976d2 !important;
  /* Color of the active page */
  color: #fff !important;
  /* Active page text color */
}

.v-pagination__navigation {
  color: #1976d2 !important;
  /* Color of the navigation arrows */
}

.button-container {
  display: flex;
  justify-content: center;
  /* Center horizontally */
  align-items: center;
  /* Center vertically */
  height: 100%;
  /* Ensure the container takes up the full height of the cell */
}

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