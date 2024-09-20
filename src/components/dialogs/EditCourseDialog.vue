<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
const courseStore = useCourseStore();

</script>

<template>
  <v-col>
    <v-card-title>
      <h2>แก้ไขห้องเรียน</h2>
    </v-card-title>
    <v-card-text>
      <v-card class="mb-4">
        <v-card-title>
          <h3>แก้ไขชื่อรายวิชา</h3>
        </v-card-title>
        <v-card-text class="colorText">
          <v-text-field clearable label="แก้ไขชื่อรายวิชา" variant="outlined"
            v-model="courseStore.currentCourse!.nameCourses" :rules="[
              (v: any) => !!v || 'โปรดกรอกชื่อรายวิชา',
              (v: any) => v.length >= 1 || 'ชื่อรายวิชาต้องมีอย่างน้อย 1 ตัวอักษร',
              (v: any) => v.length <= 100 || 'ชื่อรายวิชาต้องมีไม่เกิน 100 ตัวอักษร'
            ]"></v-text-field>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          <h3>แก้ไขประเภทรายวิชา</h3>
        </v-card-title>
        <v-card-text>
          <v-select label="ประเภทรายวิชา" :items="['เลคเชอร์', 'เลคเชอร์และแลป']"
            v-model="courseStore.currentCourse!.typeCourses" variant="outlined"
            :rules="[(v: any) => !!v || 'โปรดเลือกประเภทรายวิชา']"></v-select>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-col>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}

.colorText {
  color: #2a6ec5;
}
</style>
