<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useMessageStore } from "@/stores/message";
import { useUserStore } from "@/stores/user.store";
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const userStore = useUserStore();
const messageStore = useMessageStore();
const formatThaiDate = (isoDateTime: string | undefined): string => {
  if (!isoDateTime) {
    return "";
  }
  const date = new Date(isoDateTime);
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: "long" };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

  const dateString = date.toLocaleDateString("th-TH", dateOptions).replace(".", "");
  const timeString = date.toLocaleTimeString("th-TH", timeOptions);

  return `${dateString} ${timeString}`;
};

const saveEnrollment = async () => {
  courseStore.showCreateDialog = false;
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!); ///mockup data
  messageStore.showInfo("Successfully joined the course.");
};

const cancel = async () => {
  if (enrollmentStore.currentEnrollment) {
    await enrollmentStore.deleteEnrollment(
      enrollmentStore.currentEnrollment!.enrollmentId!
    );
    courseStore.showDeleteDialog = false;
    await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
    courseStore.showCreateDialog = false;
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title>
            <h2>ข้อมูลชั้นเรียน</h2>
          </v-card-title>
          <v-card-text>
            <v-card variant="outlined" class="mb-4">
              <v-card-title>
                <h3>{{ enrollmentStore.currentEnrollment?.course?.nameCourses }}</h3>
              </v-card-title>
              <v-card-text>
                <div>
                  กลุ่มเรียน: {{ enrollmentStore.currentEnrollment?.course?.session }}
                </div>
                <div>
                  รหัสวิชา: {{ enrollmentStore.currentEnrollment?.course?.coursesId }}
                </div>
                <div>
                  จำนวนหน่วยกิต: {{ enrollmentStore.currentEnrollment?.course?.credit }}
                </div>
                <div>
                  อาจารย์ผู้สอน:
                  {{ enrollmentStore.currentEnrollment?.course?.user?.firstName + " " + enrollmentStore.currentEnrollment?.course?.user?.lastName }}
                </div>
                <div>
                  เวลาเริ่มเรียนเลคเชอร์:
                  {{
                    formatThaiDate(enrollmentStore.currentEnrollment?.course?.timeInLec?.toString())
                  }}
                </div>
                <div>
                  เวลาเลิกเรียนเลคเชอร์:
                  {{
                    formatThaiDate(enrollmentStore.currentEnrollment?.course?.timeOutLec?.toString())
                  }}
                </div>
                <div
                  v-if="
                    enrollmentStore.currentEnrollment?.course?.typeCourses ===
                    'เลคเชอร์และแลป'
                  "
                >
                  เวลาเริ่มเรียนแลป:
                  {{
                    formatThaiDate(enrollmentStore.currentEnrollment?.course?.timeInLab?.toString())
                  }}
                </div>
                <div
                  v-if="
                    enrollmentStore.currentEnrollment?.course?.typeCourses ===
                    'เลคเชอร์และแลป'
                  "
                >
                  เวลาเลิกเรียนแลป:
                  {{
                    formatThaiDate(enrollmentStore.currentEnrollment?.course?.timeOutLab?.toString())
                  }}
                </div>
                <div>
                  คะแนนเต็ม: {{ enrollmentStore.currentEnrollment?.course?.fullScore }}
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn @click="cancel">ยกเลิก</v-btn>
            <v-btn @click="saveEnrollment" class="colorText">เข้าร่วม</v-btn>
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
.colorText {
  color: #2a6ec5;
}
</style>
