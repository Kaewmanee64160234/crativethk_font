<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useMessageStore } from "@/stores/message";
import { useUserStore } from "@/stores/user.store";
const courseStore = useCourseStore();
const userStore = useUserStore();
const messageStore = useMessageStore();

const deleteCourse = async (idCourse: string) => {
  await courseStore.deleteCourse(idCourse);
  courseStore.showDeleteDialog = false;
  messageStore.showInfo("Course has been deleted successfully.");
  await courseStore.getCourseByTeachId(userStore.currentUser?.teacherId ?? "");
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-card class="cardText">
        <v-card-title>
          <h2>ต้องการลบรายวิชา?</h2></v-card-title>
        <v-card-title style="text-align: center"
          >ต้องการลบรายวิชา
          {{ courseStore.currentCourse?.nameCourses }} ใช่หรือไม่</v-card-title
        >
        <v-card-actions class="actions">
          <v-btn @click="courseStore.showDeleteDialog = false"
            >ไม่ยกเลิก</v-btn
          >
          <v-btn
            class="colorText"
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
  color: #c52a2a;
}
.cardText {
  width: auto;
  height: auto;
}
.cut {
  word-wrap: break-word;
  white-space: normal;
}
</style>
