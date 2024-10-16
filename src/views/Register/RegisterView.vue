<script lang="ts" setup>
import { useMessageStore } from "@/stores/message";
import { useUserStore } from "@/stores/user.store";
import Loader from "@/components/loader/Loader.vue";
import { computed, onMounted, ref } from "vue";

const userStore = useUserStore();
const page = ref(1);
const itemsPerPage = 5;
const isLoading = ref(false);
const messageStore = useMessageStore();

const selectedFile = ref(null);
const uploadFile = async () => {
  if (selectedFile.value) {
    try {
      isLoading.value = true;
      await userStore.getFileUser(selectedFile.value);
      for (let i = userStore.file_.length - 1; i >= 0; i--) {
        for (let y = 0; y < userStore.users.length; y++) {
          if (
            userStore.users[y].studentId == userStore.file_[i].id ||
            userStore.users[y].email == userStore.file_[i].id + "@go.buu.ac.th"
          ) {
            messageStore.showError("มีนิสิตที่มีรายชื่ออยู่ในระบบแล้ว");
            userStore.file_.splice(i, 1);
            break;
          }
        }
      }
      if (userStore.file_.length === 0) {
        selectedFile.value = null;
      }
      console.log("Updated file list:", userStore.file_);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      isLoading.value = false;
    }
  }
};

onMounted(async () => {
  await userStore.getUsers();
});

const paginatedFiles = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return userStore.file_.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(userStore.file_.length / itemsPerPage);
});

const cancel = () => {
  userStore.file_ = [];
  selectedFile.value = null;
};

const saveUser = async () => {
  if (userStore.file_.length === 0) {
    messageStore.showError("ไม่มีรายชื่อนิสิต กรุณาอัปโหลดไฟล์");
    return;
  }
  console.log(userStore.file_.length);
  for (let i = 0; i < userStore.file_.length; i++) {
    const nameParts = userStore.file_[i].name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    userStore.editUser = {
      ...userStore.editUser, // Spread existing editable user properties if any
      studentId: userStore.file_[i].id,
      firstName: firstName,
      lastName: lastName,
      major: userStore.file_[i].major,
      year: userStore.file_[i].year,
      email: userStore.file_[i].id + "@go.buu.ac.th",
      registerStatus: "notConfirmed",
      role: "นิสิต",
      status: "กำลังศึกษา",
    };
    try {
      await userStore.saveUser();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  }
  userStore.file_ = []; // Clear the file list after processing
  selectedFile.value = null;
  messageStore.showInfo("New user created successfully.");
};
</script>
<template>
  <v-container style="padding-top: 120px">
    <div v-if="isLoading" class="loader-overlay">
      <Loader></Loader>
    </div>
    <v-row>
      <v-col col="6" style="text-align: center">
        <v-icon size="100" color="#819DA9" style="color: #004bbc">mdi mdi-folder</v-icon>
        <div style="margin-bottom: 2%; color: #093271; font-weight: bold">
          อัปโหลดไฟล์
        </div>
        <v-file-input
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          label="เลือกไฟล์อัปโหลด"
          variant="outlined"
          prepend-icon="mdi-file-document-plus-outline"
          v-model="selectedFile"
          @change="uploadFile()"
        ></v-file-input>
        <!-- <div style="color: red;">*อัปโหลดไฟล์ได้เฉพาะไฟล์ Excel*</div> -->
      </v-col>
      <v-col col="6">
        <v-row>
          <v-col>
            <v-card>
              <v-card color="primary" style="margin-bottom: 5%">
                <v-card-title>รายชื่อนิสิตทั้งหมด</v-card-title>
              </v-card>
              <div v-if="userStore.file_.length > 0">
                <v-row v-for="(item, index) in paginatedFiles" :key="index">
                  <v-col style="padding-left: 5%; margin-bottom: 2%">
                    <h3>
                      {{ item.id }} &nbsp;&nbsp;&nbsp;&nbsp;
                      {{ item.name }} &nbsp;&nbsp;&nbsp;&nbsp; สาขา &nbsp;&nbsp;
                      {{ item.major }}
                    </h3>
                    <v-divider></v-divider>
                  </v-col>
                </v-row>
              </div>
              <div v-else>
                <v-col style="text-align: center; color: gray">ไม่มีข้อมูล</v-col>
              </div>
              <v-pagination
                v-model="page"
                :length="pageCount"
                :total-visible="7"
              ></v-pagination>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="justify-end">
      <v-card-actions>
        <v-btn
          style="width: 100px"
          color="error"
          rounded="xl"
          variant="elevated"
          @click="cancel"
          >ยกเลิก</v-btn
        >
        <v-btn
          style="width: 100px"
          color="primary"
          rounded="xl"
          variant="elevated"
          @click="saveUser()"
          >เสร็จสิ้น</v-btn
        >
      </v-card-actions>
    </v-row>
  </v-container>
</template>

<style scoped>
.file-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
