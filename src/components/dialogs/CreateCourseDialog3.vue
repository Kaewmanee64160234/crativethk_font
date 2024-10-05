<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
import { onMounted, ref, watch } from "vue";
import Loader from "@/components/loader/Loader.vue";
const courseStore = useCourseStore();
const userStore = useUserStore();
const selectedFile = ref(null);
const checkStd = ref([] as any);
const isLoading = ref(false);

onMounted(async () => {
  await userStore.getUsers;
});

const uploadFile = async () => {
  if (selectedFile.value) {
    courseStore.fileError = "";
    isLoading.value = true;
    await courseStore.getFileUser(selectedFile.value);
    
    const notFoundUsers = [];
    const foundUsers = [];

    for (let i = 0; i < courseStore.files.length; i++) {
      const fileId = String(courseStore.files[i].id).trim();
      const userExists = userStore.users.some(user => String(user.studentId).trim() === fileId);
      
      if (userExists) {
        foundUsers.push(courseStore.files[i]);
      } else {
        notFoundUsers.push(courseStore.files[i]);
      }
    }
    courseStore.files = [...notFoundUsers, ...foundUsers];
    checkStd.value = new Array(courseStore.files.length).fill(false);
    for (let i = 0; i < courseStore.files.length; i++) {
      checkStd.value[i] = userStore.users.some(user => String(user.studentId).trim() === String(courseStore.files[i].id).trim());
    }
    isLoading.value = false;
    console.log("Std.value ", checkStd.value);
  }
};





watch(() => selectedFile, (newVal) => {
  if (newVal.value) {
    courseStore.fileError = "";
  }
});

onMounted(async () => {
  await userStore.getUsers();

});

const delFile = () => {
  if (courseStore.files.length <= 0) {
    {
      courseStore.fileError = "*กรุณาอัปโหลดไฟล์ .xlsx*";
      return;
    }
  }
  courseStore.files = [];
  selectedFile.value = null;
  courseStore.fileError = "";
};

</script>

<template>
  <v-card-title>
    <h3>เพิ่มรายชื่อนิสิต</h3>
  </v-card-title>
  <v-card-text>
    <v-card class="mb-4">
      <div v-if="isLoading" class="loader-overlay">
        <Loader></Loader>
      </div>
      <v-row>
        <v-col col="12" sm="6">
          <v-card-title>
            <h5>อัปโหลดไฟล์</h5>
          </v-card-title>
          <v-card-text>
            <v-file-input
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              label="เลือกไฟล์อัปโหลด" variant="outlined" prepend-icon="mdi-file-document-plus-outline"
              v-model="selectedFile" @change="uploadFile()" :error-messages="courseStore.fileError"></v-file-input>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text class="d-flex justify-end">
            <v-btn style="width: 120px;" color="error" @click="delFile">ลบไฟล์ทั้งหมด</v-btn>
          </v-card-text>
        </v-col>
      </v-row>
      <v-card style="max-height: 300px; width: 95%; margin: 0 auto; overflow-y: auto;">
        <v-row>
          <v-col>
            <div v-if="courseStore.files.length > 0">
              <v-row align="center" v-for="(item, index) in courseStore.files" :key="index">
                <v-col cols="auto">
                  <v-avatar size="50">
                    <v-img></v-img>
                  </v-avatar>
                </v-col>
                <v-col :class="{ 'error-text': !userStore.users.some(user => String(user.studentId).trim() === String(item.id).trim()) }">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.id + "@go.buu.ac.th" }}</p>
                </v-col>
                <v-col cols="auto">
                  <v-checkbox :disabled="!userStore.users.some(user => String(user.studentId).trim() === String(item.id).trim())" color="primary" v-model="checkStd[index]"></v-checkbox>
                </v-col>
              </v-row>
            </div>
            <div v-else>
              <v-col style="text-align: center;color: #888888;">รายชื่อนิสิตทั้งหมด</v-col>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-card>
  </v-card-text>
</template>

<style scoped>
.title {
  margin-left: 3%;
  margin-top: 1%;
}

.mb-4 {
  margin-bottom: 1rem;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.error-text {
  color: red;
}
</style>
