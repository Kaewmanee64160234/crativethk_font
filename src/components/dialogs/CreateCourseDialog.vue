<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { onMounted, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
const courseStore = useCourseStore();

watch(
  () => courseStore.nameCourse,
  (newVal) => {
    if (newVal.length >= 1 && newVal.length <= 50) {
      courseStore.courseNameError = "";
    }
  }
);

onMounted(() => {
  generateCourseCode();
});

const generateCourseCode = () => {
  courseStore.courseId = uuidv4().slice(0, 4);
  console.log("code", courseStore.courseId);
};

const copyCodeCourse = () => {
  navigator.clipboard.writeText(courseStore.courseId);
};
</script>

<template>
  <v-card-title>
    <h3>เพิ่มวิชา</h3>
  </v-card-title>
  <v-card-text>
    <v-card class="mb-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-card-title>
            <h4>ชื่อวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-text-field
              clearable
              variant="outlined"
              label="ชื่อวิชา"
              v-model="courseStore.nameCourse"
              :error-messages="courseStore.courseNameError"
              :rules="[
                (v: any) => !!v || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*',
                (v: any) => v.length >= 1 || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*',
                (v: any) => v.length <= 50 || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*'
              ]"
            ></v-text-field>
          </v-card-text>
        </v-col>
        <v-col cols="12" md="6">
          <v-card-title>
            <h4>ประเภทวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-select
              :items="['Lecture', 'Lecture & Lab']"
              variant="outlined"
              label="ประเภทวิชา"
              v-model="courseStore.typeCourse"
            ></v-select>
          </v-card-text>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card-title>
            <h4>รหัสเข้ารายวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-text-field
              :disabled="true"
              variant="outlined"
              v-model="courseStore.courseId"
            >
            </v-text-field>
          </v-card-text>
        </v-col>
        <v-col cols="12" md="6">
          <v-card-title>
            <h2>&nbsp;</h2>
          </v-card-title>
          <v-card-text>
            <v-icon size="30" @click="copyCodeCourse">mdi mdi-content-copy</v-icon>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </v-card-text>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}

.colorText {
  color: red;
}

.cut {
  word-wrap: break-word;
  white-space: normal;
}

@media (max-width: 600px) {
  .mb-4 {
    margin-bottom: 0.5rem;
  }
}
</style>
