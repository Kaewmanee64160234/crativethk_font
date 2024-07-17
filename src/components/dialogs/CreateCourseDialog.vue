<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
const courseStore = useCourseStore();
</script>

<template>
      <v-col>
        <v-card>
          <!-- <v-card-title>
            <h2>เพิ่มห้องเรียน</h2>
          </v-card-title> -->
          <v-card-text>
            <v-card class="mb-4">
              <v-card-title>
                <h3>สร้างชื่อรายวิชา</h3>
              </v-card-title>
              <v-card-text class="colorText">
                <v-text-field
                  clearable
                  label="สร้างชื่อรายวิชา"
                  variant="outlined"
                  v-model="courseStore.nameCourse"
                  :rules="[(v: any) => !!v || 'โปรดกรอกชื่อรายวิชาให้ถูกต้อง']"
                ></v-text-field>
              </v-card-text>
            </v-card>
            <v-card class="mb-4">
              <v-card-title>
                <h3>สร้างรหัสห้องเรียน</h3>
                <p class="cut">อาจารย์ผู้สอนสร้างรหัสห้องเรียน โดยต้องมีตัวอักษรอย่างน้อย 8 ตัวอักษร</p>
              </v-card-title>
              <v-card-text class="colorText">
                <v-text-field
                  clearable
                  label="รหัสห้องเรียน"
                  variant="outlined"
                  v-model="courseStore.courseId"
                  :rules="[
                    (v: string) =>
                      /^[A-Za-z0-9]{8,}$/.test(v) ||
                      'โปรดกรอกรหัสห้องเรียนอย่างน้อย 8 ตัวอักษร',
                  ]"
                ></v-text-field>
              </v-card-text>
            </v-card>
            <v-card class="mb-4">
              <v-card-title>
                <h3>เพิ่มประเภทรายวิชา</h3>
              </v-card-title>
              <v-card-text>
                <v-select
                  label="ประเภทรายวิชา"
                  :items="['เลคเชอร์', 'เลคเชอร์และแลป']"
                  variant="outlined"
                  v-model="courseStore.typeCourse"
                  :rules="[(v: any) => !!v || 'โปรดเลือกประเภทรายวิชา']"
                ></v-select>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
</template>


<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.colorText {
  color: #2a6ec5;
}
.cut {
  word-wrap: break-word;
  white-space: normal;
}
</style>
