<script setup lang="ts">
import CreateUserDialog2 from '@/components/dialogs/CreateUserDialog2.vue';
import CreateUserDialog3 from '@/components/dialogs/CreateUserDialog3.vue';
import EditUserDialog from '@/components/dialogs/EditUserDialog.vue';
import EditUserDialog2 from '@/components/dialogs/EditUserDialog2.vue';
import EditUserDialog3 from '@/components/dialogs/EditUserDialog3.vue';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref, computed, watch } from 'vue';

const userStore = useUserStore();
const yearOptions = ref<string[]>(['']);
const statusTeacher = ref(['','ดำรงตำแหน่ง', 'สิ้นสุดการดำรงตำแหน่ง']);
const statusStudent = ref(['','กำลังศึกษา', 'พ้นสภาพนิสิต', 'สำเร็จการศึกษา']);
const majorOptions = ref([
  '',
  'วิทยาการคอมพิวเตอร์',
  'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจิทัล',
  'วิศวกรรมซอฟต์แวร์',
  'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ',
]);

// Define the filter params
const params = ref({
  page: 1,
  limit: 20,
  search: '',
  major: '',
  status: ''
});

onMounted(async () => {
  await userStore.getCurrentUser();
  await fetchFilteredUsers(); // Fetch users based on initial params
  updateYearOptions();
});

// Function to fetch filtered users
const fetchFilteredUsers = async () => {
  const role = getCurrentRole(); // Set role based on the selected tab
  await userStore.fetchPaginatedFilterUsers({
    ...params.value,
    role, // Include the role in the filter parameters
  });
};

// Function to compute and update year options dynamically
const updateYearOptions = () => {
  const uniqueYears = Array.from(new Set(userStore.users.map(user => user.year).filter((year): year is string => Boolean(year))));
  uniqueYears.sort();
  yearOptions.value = ['', ...uniqueYears];
};

// Watch tab selection and refetch user data accordingly
watch(() => userStore.tab, async () => {
  params.value.page = 1; // Reset pagination to page 1 when changing tabs
  await fetchFilteredUsers();
});

// Function to get the current role based on the selected tab
const getCurrentRole = () => {
  if (userStore.tab === 0) return 'นิสิต';
  if (userStore.tab === 1) return 'อาจารย์';
  return 'แอดมิน';
};

// Show edit dialog depending on user role
const showEditedDialog = (user: User) => {
  if (user.role === 'นิสิต') {
    userStore.showEditDialog = true;
  } else if (user.role === 'อาจารย์') {
    userStore.showEditDialog2 = true;
  } else if (user.role === 'แอดมิน') {
    userStore.showEditDialog3 = true;
  }
  userStore.editUser = { ...user, files: [] };
};

// Watch for changes in filter parameters and refetch data accordingly
watch(params, async () => {
  await fetchFilteredUsers();
}, { deep: true });
</script>
<template>
  <v-container style="padding-top: 120px;">
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="main-title">การจัดการผู้ใช้งาน</h2>
      </v-col>
    </v-row>

    <!-- Search Bar and Filters -->
    <v-row class="mb-6" align="center">
      <v-col cols="md 4">
        <v-text-field 
          style="width: 200px;" 
          v-model="params.search" 
          label="ค้าหาผู้ใช้งาน"
          append-inner-icon="mdi-magnify" 
          hide-details 
          dense 
          variant="solo" 
          class="search-bar"
        ></v-text-field>
      </v-col>
      
      <v-col cols="md 4">
        <v-select 
          v-model="params.major" 
          :items="majorOptions" 
          label="สาขา" 
          dense 
          variant="solo" 
          hide-details 
          class="wide-select"
        ></v-select>
      </v-col>
      
      <v-col cols="md 4">
        <v-select 
          v-if="userStore.tab === 0" 
          v-model="params.status" 
          :items="statusStudent" 
          label="สถานะภาพ" 
          dense 
          variant="solo" 
          hide-details 
          class="wide-select"
        ></v-select>
      </v-col>
      
      <v-col cols="md 4">
        <v-select 
          v-if="userStore.tab === 1 || userStore.tab === 2" 
          v-model="params.status" 
          :items="statusTeacher" 
          label="สถานะภาพ" 
          dense 
          variant="solo" 
          hide-details 
          class="wide-select"
        ></v-select>
      </v-col>
      
      <v-col cols="auto">
        <v-btn 
          color="primary" 
          variant="elevated" 
          @click="userStore.showDialog2 = true" 
          class="custom-btn"
        >
          <v-icon left size="20">mdi-account-plus-outline</v-icon>
          เพิ่มผู้ใช้อาจารย์
          <v-dialog v-model="userStore.showDialog2" persistent>
            <CreateUserDialog2 />
          </v-dialog>
        </v-btn>
      </v-col>
      
      <v-col cols="auto">
        <v-btn 
          color="primary" 
          variant="elevated" 
          @click="userStore.showDialog4 = true" 
          class="custom-btn"
        >
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
      <v-tabs v-model="userStore.tab" background-color="white" dark>
        <v-tab>นิสิต</v-tab>
        <v-tab>อาจารย์</v-tab>
        <v-tab>แอดมิน</v-tab>
      </v-tabs>

      <!-- Unified table for users -->
      <v-table dense v-if="userStore.users.length">
        <thead>
          <tr>
            <th class="text-left"></th>
            <th class="text-left">รหัส</th>
            <th class="text-left">ชื่อ-นามสกุล</th>
            <th class="text-left">ชั้นปี</th>
            <th class="text-left">สาขา</th>
            <th class="text-left">สถานะภาพ</th>
            <th class="text-center">ตัวเลือกเพิ่มเติม</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in userStore.users" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ user.studentId || user.teacherId }}</td>
            <td>{{ user.firstName + ' ' + user.lastName }}</td>
            <td>{{ user.year }}</td>
            <td>{{ user.major }}</td>
            <td style="color: seagreen;">{{ user.status }}</td>
            <td>
              <v-btn 
                small 
                class="ma-1" 
                style="background-color: #4C515A; color: azure;" 
                @click="showEditedDialog(user)"
              >
                <v-icon left>mdi-pencil</v-icon>
                แก้ไขข้อมูล
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-else class="no-users-message" style="text-align: center; color: red; margin-top: 20px;">
        ไม่พบผู้ใช้งาน
      </div>
      
      <!-- Pagination -->
      <v-pagination
        v-model="params.page"
        :length="Math.ceil(userStore.totalUsers / params.limit)"
        :total-visible="7"
        rounded="circle"
        size="large"
        color="primary"
        class="my-pagination"
      />
    </v-card>
  </v-container>

  <!-- Edit and Confirm Dialogs -->
  <v-dialog v-model="userStore.showEditDialog" persistent>
    <EditUserDialog />
  </v-dialog>
  <v-dialog v-model="userStore.showEditDialog2" persistent>
    <EditUserDialog2 />
  </v-dialog>
  <v-dialog v-model="userStore.showEditDialog3" persistent>
    <EditUserDialog3 />
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