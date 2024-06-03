<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
const courseStore = useCourseStore();
const userStore = useUserStore();

const deleteCourse = async (idCourse: string) => {
  await courseStore.deleteCourse(idCourse);
  courseStore.showDeleteDialog = false;
  await courseStore.getCourseByTeachId(userStore.currentUser?.teacherId ?? "");
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-card class="cardText">
        <v-card-title class="text-h4 mt-6" style="text-align: center"
          >ต้องการลบรายวิชา
          {{ courseStore.currentCourse?.nameCourses }} หรือไม่</v-card-title
        >
        <v-card-actions class="actions">
          <v-btn class="text-h5" @click="courseStore.showDeleteDialog = false"
            >ยกเลิก</v-btn
          >
          <v-btn
            class="colorText text-h5"
            @click="deleteCourse(courseStore.currentCourse!.coursesId)"
            >ยืนยันการลบรายวิชา
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<style>
.actions {
  justify-content: flex-end;
  margin-top: 3%;
}
.colorText {
  color: #2a6ec5;
}
.cardText {
  width: auto;
  height: auto;
}
</style>
