<script setup lang="ts">
import CreateUserDialog2 from '@/components/dialogs/CreateUserDialog2.vue';
import CreateUserDialog3 from '@/components/dialogs/CreateUserDialog3.vue';
import EditUserDialog from '@/components/dialogs/EditUserDialog.vue';
import EditUserDialog2 from '@/components/dialogs/EditUserDialog2.vue';
import EditUserDialog3 from '@/components/dialogs/EditUserDialog3.vue';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
<<<<<<< HEAD
import { onMounted, ref, watch, computed } from 'vue';
=======
import { onMounted, ref, computed } from 'vue';
>>>>>>> aff805ce4063ae3e6f9ee4e80e1aa26fb4022b32
const url = import.meta.env.VITE_API_URL;

const userStore = useUserStore();
const yearOptions = ref<string[]>(['']); 
const page = ref(1);
const tab = ref(0);
const itemsPerPage = 20;
const majorOptions = ref(['', 'วิทยาการคอมพิวเตอร์', 'เทคโนโลยีสารสนเทศเพื่ออุตสาหกรรมดิจดทัล', 'วิศวกรรมซอฟต์แวร์', 'ปัญญาประดิษฐ์ประยุกต์และเทคโนโลยีอัจฉริยะ']);
const confirmDlg = ref();
onMounted(async () => {
  await userStore.getUsersById(userStore.currentUser?.userId!);
  await userStore.getCurrentUser()
  await userStore.getUsers();
  updateYearOptions(); 
})
// Function to compute and update year options dynamically
const updateYearOptions = () => {
  const uniqueYears = Array.from(new Set(userStore.users.map(user => user.year).filter((year): year is string => Boolean(year))));
  uniqueYears.sort();
  yearOptions.value = ['', ...uniqueYears];
};

// Watch for changes in the user array and recalculate year options whenever users are modified
watch(() => userStore.users, () => {
  updateYearOptions();
}, { deep: true });

const paginatedStudents = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return sortedStudents.value.slice(start, start + itemsPerPage);
});

const paginatedTeachers = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return sortedTeachers.value.slice(start, start + itemsPerPage);
});

const paginatedAdmins = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return sortedAdmins.value.slice(start, start + itemsPerPage);
});

const totalPagesStudents = computed(() => Math.ceil(sortedStudents.value.length / itemsPerPage));
const totalPagesTeachers = computed(() => Math.ceil(sortedTeachers.value.length / itemsPerPage));
const totalPagesAdmins = computed(() => Math.ceil(sortedAdmins.value.length / itemsPerPage));

// Reset page to 1 when changing tabs
watch(tab, () => {
  page.value = 1; // Reset page to 1 when switching between tabs
});


const sortedStudents = computed(() => {
  return userStore.users
    .filter(user => user.role == 'นิสิต')
    // Filter by selected year and major
    .filter(user => {
      if (userStore.searchDropdown && userStore.searchDropdown2) {
        return user.year === userStore.searchDropdown && user.major === userStore.searchDropdown2;
      }
      return true;
    })
    // Filter by selected year
    .filter(user => {
      if (userStore.searchDropdown) {
        return user.year === userStore.searchDropdown;
      }
      return true;
    })
    // Filter by selected major
    .filter(user => {
      if (userStore.searchDropdown2) {
        return user.major === userStore.searchDropdown2;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.role && b.role) {
        return a.role.localeCompare(b.role);
      }
      return 0;
    });
});
const sortedTeachers = computed(() => {
  return userStore.users
    .filter(user => user.role === 'อาจารย์')
    .sort((a, b) => {
      if (a.role && b.role) {
        return a.role.localeCompare(b.role);
      }
      return 0;
    });
});
const sortedAdmins = computed(() => {
  return userStore.users
    .filter(user => user.role === 'แอดมิน')
    .sort((a, b) => {
      if (a.role && b.role) {
        return a.role.localeCompare(b.role);
      }
      return 0;
    });
});
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
        <v-text-field v-model="userStore.searchQuery" label="ค้าหาผู้ใช้งาน" append-inner-icon="mdi-magnify"
          hide-details dense variant="solo" class="search-bar"></v-text-field>
      </v-col>
      <!-- Year Filter Dropdown -->
      <v-col cols="auto">
        <v-select v-if="tab === 0" v-model="userStore.searchDropdown" :items="yearOptions" label="ชั้นปี" dense
          variant="solo" hide-details class="year-dropdown"></v-select>
      </v-col>
      <v-col cols="md 4">
        <v-select v-if="tab === 0" v-model="userStore.searchDropdown2" :items="majorOptions" label="สาขา" dense
          variant="solo" hide-details class="year-dropdown"></v-select>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="elevated" @click="userStore.showDialog2 = true" class="custom-btn">
          <v-icon left>mdi-plus</v-icon>
          เพิ่มผู้ใช้อาจารย์
          <v-dialog v-model="userStore.showDialog2" persistent>
            <CreateUserDialog2 />
          </v-dialog>
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="elevated" @click="userStore.showDialog4 = true" class="custom-btn">
          <v-icon left>mdi-plus</v-icon>
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
        <v-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left"></th>
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
                <td></td>
                <td>{{ item.studentId }}</td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td>{{ item.year }}</td>
                <td>{{ item.major }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <td>
                  <div class="button-container">
                    <v-btn small class="ma-1" color="yellow darken-2" @click="showEditedDialog(item)">
                      <v-icon left>mdi-pencil</v-icon>
                      แก้ไขข้อมูล
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
        <!-- Pagination student -->
        <v-pagination v-model="page" :length="totalPagesStudents" @input="page = $event" />
      </v-tab-item>

      <!-- Tab content for อาจารย์ -->
      <v-tab-item v-if="tab === 1">
        <v-table dense>
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
              <tr v-for="(item, index) in paginatedTeachers" :key="index">
                <td></td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <div class="button-container">
                  <v-btn small class="ma-1" color="yellow darken-2" @click="showEditedDialog(item)">
                    <v-icon left>mdi-pencil</v-icon>
                    แก้ไขข้อมูล
                  </v-btn>
                </div>
              </tr>
            </tbody>
          </template>
        </v-table>
        <!-- Pagination teacher -->
        <v-pagination v-model="page" :length="totalPagesTeachers" @input="page = $event" />
      </v-tab-item>

      <!-- Tab content for แอดมิน -->
      <v-tab-item v-if="tab === 2">
        <v-table dense>
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
                <td></td>
                <td>{{ item.firstName + " " + item.lastName }}</td>
                <td style="color: seagreen;">{{ item.status }}</td>
                <td>
                  <div class="button-container">
                    <v-btn small class="ma-1" color="yellow darken-2" @click="showEditedDialog(item)">
                      <v-icon left>mdi-pencil</v-icon>
                      แก้ไขข้อมูล
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
        <!-- Pagination -->
        <v-pagination v-model="page" :length="totalPagesAdmins" @input="page = $event" />
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