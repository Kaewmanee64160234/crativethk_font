<script lang="ts" setup>
import course from "@/services/course";
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import type Enrollment from "@/stores/types/Enrollment";
import { useUserStore } from "@/stores/user.store";
import { on } from "events";
import { onMounted, ref } from "vue";
const courseStore = useCourseStore();
const userStore = useUserStore();
const enrollmentStore = useEnrollmentStore();
const selectedFile = ref(null);
const file = ref([] as { id: string, name: string }[]);

const uploadFile = async () => {
  if (selectedFile.value) {
    await courseStore.getFileUser(selectedFile.value);
  }
};

const closeDialog = async () => {
  courseStore.closeDialog();
  courseStore.files = [];
};

onMounted(async () => {
  await userStore.getUsers();

});

</script>

<template>                   
      <v-card>
        <v-card-title class="title">
          <v-row>
            <!-- <v-col cols="6">
              <h2>เพิ่มรายชื่อนิสิต</h2>
            </v-col> -->
            <v-col>
              <v-file-input
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                label="Upload File" variant="outlined" prepend-icon="mdi-file-document-plus-outline"
                v-model="selectedFile" @change="uploadFile()"></v-file-input>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card variant="outlined" class="textarea" style="width: 90%; overflow-y: scroll">
          <v-card-title>
            <div>รายชื่อนิสิตทั้งหมด</div>
          </v-card-title>
          <div v-if="courseStore.files.length > 0">
            <v-row align="center" v-for="(item, index) in courseStore.files" :key="index">
              <v-col cols="auto">
                <v-avatar size="50">
                  <v-img></v-img>
                </v-avatar>
              </v-col>
              <v-col>
                <h3>{{ item.id }}</h3>
                <p>{{ item.name }}</p>
              </v-col>
            </v-row>
          </div>
          <div v-else>
            <v-col style="text-align: center;color: red;">ว่าง</v-col>
          </div>
        </v-card>
        <!-- <v-card-actions class="actions">
          <v-btn @click="closeDialog()">ยกเลิก</v-btn>
          <v-btn @click="saveFileInCourse" class="colorText">เสร็จสิ้น</v-btn>
        </v-card-actions> -->
      </v-card>
</template>

<style scoped>
.title {
  margin-left: 3%;
  margin-top: 1%;
}

.textarea {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  border-color: #e0e0e0;
}

.actions {
  justify-content: flex-end;
}

.colorText {
  color: #2a6ec5;
}
</style>
