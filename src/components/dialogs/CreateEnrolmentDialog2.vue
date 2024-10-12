<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useMessageStore } from "@/stores/message";
import { useUserStore } from "@/stores/user.store";
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const userStore = useUserStore();
const messageStore = useMessageStore();

const saveEnrollment = async () => {
  courseStore.showCreateDialog = false;
  courseStore.showCreateDialog2 = false;
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
  messageStore.showInfo("เข้าร่วมชั้นเรียนเรียบร้อยแล้ว");
};

const cancel = async () => {
  if (enrollmentStore.currentEnrollment) {
    await enrollmentStore.deleteEnrollment(
      enrollmentStore.currentEnrollment!.enrollmentId!
    );
    await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
    courseStore.showCreateDialog = false;
    courseStore.showCreateDialog2 = false;
  }
};
const retreatStep = async () => {
  enrollmentStore.codeCourse = enrollmentStore.currentEnrollment?.course?.coursesId ?? "";
  if (enrollmentStore.currentEnrollment) {
    await enrollmentStore.deleteEnrollment(
      enrollmentStore.currentEnrollment!.enrollmentId!
    );
  }
  courseStore.showCreateDialog = true;
  courseStore.showCreateDialog2 = false;
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title style="text-align: center">
            <h2>รายละเอียดวิชา</h2>
          </v-card-title>
          <v-card-text>
            <v-card variant="outlined" class="mb-4" style="border: 2px solid #d9d9d9">
              <v-card-title>
                <h3>
                  <v-icon>mdi mdi-book-open-page-variant-outline</v-icon>
                  {{ enrollmentStore.currentEnrollment?.course?.nameCourses }}
                  <v-icon>mdi mdi-book-open-page-variant-outline</v-icon>
                </h3>
              </v-card-title>
              <v-card-text>
                <div>
                  <b>กลุ่มเรียน:</b>
                  {{ enrollmentStore.currentEnrollment?.course?.session }}
                </div>
                <div>
                  <b>อาจารย์ผู้สอน:</b>
                  {{
                    enrollmentStore.currentEnrollment?.course?.user?.firstName +
                    " " +
                    enrollmentStore.currentEnrollment?.course?.user?.lastName
                  }}
                </div>
                <div>
                  <b>เวลาเรียน Lecture:</b>
                  {{
                    enrollmentStore.currentEnrollment?.course?.dayInLec +
                    " " +
                    enrollmentStore.currentEnrollment?.course?.timeInLec +
                    " น." +
                    " - " +
                    enrollmentStore.currentEnrollment?.course?.timeOutLec +
                    " น."
                  }}
                </div>
                <div
                  v-if="
                    enrollmentStore.currentEnrollment?.course?.typeCourses ===
                    'Lecture & Lab'
                  "
                >
                  <b>เวลาเรียน Lab:</b>
                  {{
                    enrollmentStore.currentEnrollment?.course?.dayInLab +
                    " " +
                    enrollmentStore.currentEnrollment?.course?.timeInLab +
                    " น." +
                    " - " +
                    enrollmentStore.currentEnrollment?.course?.timeOutLab +
                    " น."
                  }}
                </div>
                <div>
                  <b>คะแนนเต็ม:</b>
                  {{
                    enrollmentStore.currentEnrollment?.course?.fullScore + " " + "คะแนน"
                  }}
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn @click="cancel" color="error">ยกเลิก</v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
            <v-btn @click="saveEnrollment" color="primary">เข้าร่วม</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>
