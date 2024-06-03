<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";

const enrollmentStore = useEnrollmentStore();
const courseStore = useCourseStore();

const deleteEnrollment = async (idEnrollment: number) => {
  await enrollmentStore.deleteEnrollment(idEnrollment);
  courseStore.showDeleteDialog = false;
  await enrollmentStore.getCourseByStudentId("64160144");
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-card class="cardText">
        <v-card-title class="text-h4 mt-6" style="text-align: center"
          >ต้องการยกเลิกการลงทะเบียนในรายวิชา
          {{ enrollmentStore.currentEnrollment?.course?.nameCourses }}
          หรือไม่</v-card-title
        >
        <v-card-actions class="actions">
          <v-btn class="text-h5" @click="courseStore.showDeleteDialog = false"
            >ยกเลิก</v-btn
          >
          <v-btn
            class="colorText text-h5"
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
  color: #2a6ec5;
}
.cardText {
  width: auto;
  height: auto;
}
</style>
