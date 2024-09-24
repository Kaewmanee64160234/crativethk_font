<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
const courseStore = useCourseStore();

</script>

<template>
  <v-card-title>
    <h3>แก้ไขห้องเรียน</h3>
  </v-card-title>
  <v-card-text>
    <v-card class="mb-4">
      <v-row>
        <v-col>
          <v-card-title>
            <h4>ชื่อวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-text-field clearable label="ชื่อวิชา" variant="outlined" v-model="courseStore.currentCourse!.nameCourses"
              :rules="[
                (v: any) => !!v || 'โปรดกรอกชื่อรายวิชา',
                (v: any) => v.length >= 1 || 'ชื่อรายวิชาต้องมีอย่างน้อย 1 ตัวอักษร',
                (v: any) => v.length <= 100 || 'ชื่อรายวิชาต้องมีไม่เกิน 100 ตัวอักษร'
              ]"></v-text-field>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h4>ประเภทวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-select label="ประเภทวิชา" :items="['เลคเชอร์', 'เลคเชอร์และแลป']"
              v-model="courseStore.currentCourse!.typeCourses" variant="outlined"
              :rules="[(v: any) => !!v || 'โปรดเลือกประเภทรายวิชา']"></v-select>
          </v-card-text></v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card-title>
            <h4>รหัสวิชา</h4>
          </v-card-title>
          <v-card-text>
            <v-text-field variant="outlined" label="รหัสวิชา" v-model="courseStore.currentCourse!.coursesId" :rules="[
              (v: string) =>
                /^[A-Za-z0-9]{8,}$/.test(v) ||
                'โปรดกรอกรหัสวิชาอย่างน้อย 8 ตัวอักษร',
            ]"></v-text-field>
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
</style>
