<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import EditCourseDialog2 from "./EditCourseDialog2.vue";
import course from "@/services/course";
const courseStore = useCourseStore();

const editCourse = () => {
  if (courseStore.currentCourse) {
    if (
      courseStore.currentCourse.nameCourses === "" ||
      courseStore.currentCourse.typeCourses === ""
    ) {
      console.log("no data");
      return;
    } else {
      // courseStore.updateCourse(
      //   courseStore.currentCourse.coursesId,
      //   courseStore.currentCourse
      // );
      courseStore.showEditDialog2 = true;
    }
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>
            <h2>แก้ไขห้องเรียน</h2>
          </v-card-title>
          <v-card-text>
            <v-card class="mb-4">
              <v-card-title>
                <h3>แก้ไขชื่อรายวิชา</h3>
              </v-card-title>
              <v-card-text class="colorText">
                <v-text-field
                  clearable
                  label="แก้ไขชื่อรายวิชา"
                  variant="outlined"
                  v-model="courseStore.currentCourse!.nameCourses"
                  :rules="[(v) => !!v || 'โปรดกรอกชื่อรายวิชา']"
                ></v-text-field>
              </v-card-text>
            </v-card>
            <v-card class="mb-4">
              <v-card-title>
                <h3>แก้ไขประเภทรายวิชา</h3>
              </v-card-title>
              <v-card-text>
                <v-select
                  label="ประเภทรายวิชา"
                  :items="['เลคเชอร์', 'เลคเชอร์และแลป']"
                  v-model="courseStore.currentCourse!.typeCourses"
                  variant="outlined"
                  :rules="[(v) => !!v || 'โปรดเลือกประเภทรายวิชา']"
                ></v-select>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn @click="courseStore.closeDialog2">ยกเลิก</v-btn>
            <v-btn @click="editCourse" class="colorText">ต่อไป</v-btn>
          </v-card-actions>
          <v-dialog v-model="courseStore.showEditDialog2" persistent>
            <EditCourseDialog2 />
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
