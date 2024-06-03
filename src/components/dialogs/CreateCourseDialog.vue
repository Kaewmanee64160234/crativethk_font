<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { ref } from "vue";
import CreateCourseDialog2 from "./CreateCourseDialog2.vue";
import course from "@/services/course";
import { useUserStore } from "@/stores/user.store";
const courseStore = useCourseStore();
const useStore = useUserStore();
const nameCourse = ref("");
const courseId = ref("");
const typeCourse = ref("");

const saveCourse = async () => {
  if (nameCourse.value === "" || typeCourse.value === "" || courseId.value.length < 8) {
    console.log("no data");
    return;
  }
  const newCourse = {
    coursesId: courseId.value,
    nameCourses: nameCourse.value,
    codeCourses: "",
    typeCourses: typeCourse.value,
    credit: 0,
    session: "1",
    stdAmount: 0,
    timeInLab: new Date(),
    timeOutLab: new Date(),
    timeInLec: new Date(),
    timeOutLec: new Date(),
    fullScore: 0,
    userId: 1,
    createdDate: undefined,
    updatedDate: undefined,
    deletedDate: undefined, //mockup data ข้อมูลไม่ตรงกับหลังบ้าน
  };
  try {
    // ส่งคำขอสร้าง course
    await courseStore.createCourse(newCourse);
    console.log("course", newCourse);
    courseStore.showCreateDialog2 = true;
    nameCourse.value = "";
    courseId.value = "";
    typeCourse.value = "";
  } catch (error) {
    console.error("Error creating course:", error);
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>
            <h2>เพิ่มห้องเรียน</h2>
          </v-card-title>
          <v-card-text>
            <v-card class="mb-4">
              <v-card-title>
                <h3>สร้างชื่อรายวิชา</h3>
              </v-card-title>
              <v-card-text>
                <v-text-field
                  clearable
                  label="สร้างชื่อรายวิชา"
                  variant="outlined"
                  v-model="nameCourse"
                  :rules="[(v) => !!v || 'โปรดกรอกชื่อรายวิชาให้ถูกต้อง']"
                ></v-text-field>
              </v-card-text>
            </v-card>
            <v-card class="mb-4">
              <v-card-title>
                <h3>สร้างรหัสห้องเรียน</h3>
                <p>อาจารย์ผู้สอนสร้างรหัสห้องเรียน โดยต้องมีตัวอักษร</p>
                <p>อย่างน้อย 8 ตัวอักษร</p>
              </v-card-title>
              <v-card-text>
                <v-text-field
                  clearable
                  label="รหัสห้องเรียน"
                  variant="outlined"
                  v-model="courseId"
                  :rules="[
                    (v) =>
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
                  v-model="typeCourse"
                  :rules="[(v) => !!v || 'โปรดเลือกประเภทรายวิชา']"
                ></v-select>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn @click="courseStore.closeDialog">ยกเลิก</v-btn>
            <v-btn @click="saveCourse" class="colorText">ต่อไป</v-btn>
          </v-card-actions>
          <v-dialog v-model="courseStore.showCreateDialog2" persistent>
            <CreateCourseDialog2 />
          </v-dialog>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.colorText {
  color: #2a6ec5;
}
</style>
