<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useMessageStore } from "@/stores/message";
import { useUserStore } from "@/stores/user.store";

const enrollmentStore = useEnrollmentStore();
const courseStore = useCourseStore();
const messageStore = useMessageStore();
const userStore = useUserStore();

const deleteEnrollment = async (idEnrollment: number) => {
  courseStore.showDeleteDialog = false;
  await enrollmentStore.deleteEnrollment(idEnrollment);
  messageStore.showInfo("Successfully deleted enrollment.");
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-card class="cardText">
        <v-card-title>
          <h2>ต้องการยกเลิกการลงทะเบียน?</h2></v-card-title>
        <v-card-title
          >ต้องการยกเลิกการลงทะเบียนในรายวิชา
          {{ enrollmentStore.currentEnrollment?.course?.nameCourses }}
          ใช่หรือไม่</v-card-title
        >
        <v-card-actions class="actions">
          <v-btn @click="courseStore.showDeleteDialog = false"
            >ไม่ยกเลิก</v-btn
          >
          <v-btn
            class="colorText"
            @click="
              deleteEnrollment(enrollmentStore.currentEnrollment?.enrollmentId ?? 0)
            "
            >ยกเลิกการลงทะเบียน
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<style>
.actions {
  justify-content: flex-end;
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
