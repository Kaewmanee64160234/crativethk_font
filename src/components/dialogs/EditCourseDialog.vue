<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { watch } from "vue";
const courseStore = useCourseStore();
watch(() => courseStore.currentCourse!.nameCourses, (newVal) => {
  if (newVal.length >= 1 && newVal.length <= 100) {
    courseStore.courseNameError = "";
  }
});
const copyCodeCourse = () => {
  navigator.clipboard.writeText(courseStore.currentCourse!.codeCourses);
};
</script>

<template>
  <v-card-title>
    <h3>แก้ไขห้องเรียน</h3>
  </v-card-title>
  <v-card-text>
    <v-card class="mb-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-card-title>
            <h4>ชื่อวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-text-field clearable label="ชื่อวิชา" variant="outlined" v-model="courseStore.currentCourse!.nameCourses"
            :error-messages="courseStore.courseNameError"
              :rules="[
                (v: any) => !!v || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*',
                (v: any) => v.length >= 1 || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*',
                (v: any) => v.length <= 100 || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*'
              ]"></v-text-field>
          </v-card-text>
        </v-col>
        <v-col cols="12" md="6">
          <v-card-title>
            <h4>ประเภทวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-select label="ประเภทวิชา" :items="['Lecture', 'Lecture & Lab']"
              v-model="courseStore.currentCourse!.typeCourses" variant="outlined"
             ></v-select>
          </v-card-text></v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card-title>
            <h4>รหัสเข้ารายวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-text-field :disabled="true" variant="outlined" v-model="courseStore.currentCourse!.codeCourses">
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
@media (max-width: 600px) {
  .mb-4 {
    margin-bottom: 0.5rem;
  }
}
</style>
