<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import CreateEnrolmentDialog2 from "./CreateEnrolmentDialog2.vue";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { onMounted, ref, watch } from "vue";
import { useUserStore } from "@/stores/user.store";
import { useMessageStore } from "@/stores/message";

const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const userStore = useUserStore();
const codeCourseError = ref("");
const messageStore = useMessageStore();

watch(
  () => enrollmentStore.codeCourse,
  (newVal) => {
    if (newVal.length == 4) {
      codeCourseError.value = "";
    }
  }
);

onMounted(async () => {
  courseStore.getCourses();
  await userStore.getUsersById(userStore.currentUser?.userId!);
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
});

const saveEnrollment = () => {
  codeCourseError.value = ""; // Reset error message

  // Validate course code length
  if (enrollmentStore.codeCourse.length != 4) {
    codeCourseError.value = "*กรุณากรอกตัวอักษรหรือตัวเลขจำนวน 4 ตัว*";
    return;
  }

  let courseFound = false;

  for (let i = 0; i < courseStore.courses.length; i++) {
    if (enrollmentStore.codeCourse === courseStore.courses[i].coursesId) {
      for (let j = 0; j < enrollmentStore.enrollments.length; j++) {
        if (
          enrollmentStore.codeCourse === enrollmentStore.enrollments[j].course?.coursesId
        ) {
          messageStore.showError("คุณได้เข้าร่วมวิชานี้แล้ว");
          courseStore.showCreateDialog = false;
          return;
        }
      }
      courseFound = true;

      const newEnrollment = {
        userId: userStore.currentUser?.userId ?? 0,
        courseId: courseStore.courses[i].coursesId,
        createdDate: undefined,
        updatedDate: undefined,
        deletedDate: undefined,
      };

      try {
        enrollmentStore.createEnrollment(newEnrollment);
        enrollmentStore.codeCourse = "";
        courseStore.showCreateDialog2 = true;
        return;
      } catch (error) {
        console.error("Error creating enrollment:", error);
        messageStore.showError("เกิดข้อผิดพลาดในการสร้าง enrollment");
      }
    }
  }

  if (!courseFound) {
    codeCourseError.value = "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
  }
};

const cancel = async () => {
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
  enrollmentStore.codeCourse = "";
  courseStore.showCreateDialog = false;
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title style="text-align: center">
            <h2>เข้าร่วมรายวิชา</h2>
          </v-card-title>
          <v-card-text>
            <v-card class="mb-4">
              <v-card-title>
                <h4>รหัสเข้ารายวิชา</h4>
              </v-card-title>
              <v-card-text>
                <v-text-field
                  clearable
                  label="รหัสวิชา"
                  variant="outlined"
                  v-model="enrollmentStore.codeCourse"
                  :error-messages="codeCourseError"
                  :rules="[
                    (v: string) => /^[A-Za-z0-9]{4}$/.test(v) || '*กรุณากรอกตัวอักษรหรือตัวเลขจำนวน 4 ตัว*',
                  ]"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn style="font-weight: bold" color="error" @click="cancel">ยกเลิก</v-btn>
            <v-spacer></v-spacer>
            <v-btn style="font-weight: bold" @click="saveEnrollment" color="primary"
              >ต่อไป</v-btn
            >
          </v-card-actions>
          <v-dialog v-model="courseStore.showCreateDialog2" persistent>
            <CreateEnrolmentDialog2 />
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

.title {
  word-wrap: break-word;
  white-space: normal;
  margin-bottom: 2%;
}

.colorText {
  color: red;
}
</style>
