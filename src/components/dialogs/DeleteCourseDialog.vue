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
  await courseStore.getCourseByTeachId(userStore.currentUser?.userId!);
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-card class="cardText">
       <v-icon>mdi-delete-circle</v-icon>
        <v-card-title style="text-align: center">ยืนยันการลบรายวิชา
          {{ courseStore.currentCourse?.nameCourses }} ใช่หรือไม่</v-card-title>
        <v-card-actions>
          <v-btn @click="courseStore.showDeleteDialog = false">ยกเลิก</v-btn>
          <v-spacer></v-spacer>
          <v-btn class="colorText" @click="deleteCourse(courseStore.currentCourse!.coursesId)">ยืนยัน
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
