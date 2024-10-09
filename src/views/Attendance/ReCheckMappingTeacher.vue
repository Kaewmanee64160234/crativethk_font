<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAttendanceStore } from "../../stores/attendance.store";
import { useRoute } from "vue-router";
import type Attendance from "@/stores/types/Attendances";
import { useAssignmentStore } from "@/stores/assignment.store";
import type Assignment from "@/stores/types/Assignment";
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
import router from "@/router";
const attendanceStore = useAttendanceStore();
const assignmentStore = useAssignmentStore();
const courseStore = useCourseStore();
const userStore = useUserStore();
const route = useRoute();

const url = import.meta.env.VITE_API_URL;
const queryCourseId = ref("");
onMounted(async () => {
  const id = route.params.assignmentId;
  queryCourseId.value = route.params.courseId + "";
  await attendanceStore.getAttendanceByStatusInAssignment(id + ""); // Assuming this function exists and fetches the attendances
  //get assignment by id
  await assignmentStore.getAssignmentById(id + "");
  await userStore.getUserByCourseId(
    assignmentStore.currentAssignment!.course!.coursesId.toString()
  );
  await courseStore.getCourseById(
    assignmentStore.currentAssignment!.course!.coursesId.toString()
  );
  await attendanceStore.getAttendanceByAssignmentId(
    route.params.assignmentId.toString()
  );
});

const goBackToCourseDetail = () => {
  router.push("/courseDetail/" + queryCourseId.value);
};

// confirm student
const confirmAttendance = async (attendance: Attendance) => {
  if (confirm("Do you want to confirm this attendance?")) {
    try {
      attendance.attendanceStatus = "มาเรียน";
      attendance.attendanceConfirmStatus = "confirmed";
      await attendanceStore.confirmAttendanceByTeacher(
        attendance.attendanceId + ""
      );
      alert("Attendance has been confirmed.");
    } catch (error) {
      console.error("Error recording attendance:", error);
      alert("Failed to confirm attendance.");
    }
  }
};
//reject student
const reCheckAttendance = async (attendance: Attendance) => {
  try {
    attendance.attendanceStatus = "มาเรียน";
    attendance.attendanceConfirmStatus = "recheck";
    await attendanceStore.rejectAttendanceByTeacher(
      attendance.attendanceId + ""
    );
    alert("Attendance has been recheck.");
  } catch (error) {
    console.error("Error recording attendance:", error);
    alert("Failed to recheck attendance.");
  }
};
</script>

<template>
  <v-container fluid class="my-5">
    <v-card
      class="mx-auto mt-9"
      color="primary"
      max-width="1200"
      outlined
      style="padding: 20px"
    >
      <v-card-title>
        <h1 class="text-h5">
          <router-link
            :to="`/courseDetail/${courseStore.currentCourse?.coursesId}`"
            style="color: aliceblue"
          >
            {{ courseStore.currentCourse?.nameCourses }}
          </router-link>
          >
          <router-link
            :to="`/mapping2/assignment/${assignmentStore.currentAssignment?.assignmentId}/course/${route.params.courseId}`"
            style="color: aliceblue"
          >
            {{ assignmentStore.currentAssignment?.nameAssignment }}
          </router-link>
          > สรุปการเช็คชื่อ
        </h1>
      </v-card-title>
    </v-card>

    <div class="mt-5">
      <v-row class="ml-10">
        <!-- Left column for the student list -->
        <v-col cols="12" md="5">
          <v-card outlined>
            <v-card-title>รายชื่อนิสิต</v-card-title>
            <v-card-text>
              <v-row
                v-for="(member, index) in userStore.users"
                :key="index"
                class="align-center"
              >
                <v-col cols="2">
                  <v-avatar size="56">
                    <v-img :src="`${url}/users/${member.userId}/image`"></v-img>
                  </v-avatar>
                </v-col>
                <v-col cols="8">
                  <div>
                    {{ member.studentId }} {{ member.firstName }}
                    {{ member.lastName }}
                  </div>
                </v-col>
                <v-col cols="2" class="text-center" style="font-weight: bolder">
                  {{
                    attendanceStore.attendances?.find(
                      (attendance) => attendance.user?.userId === member.userId
                    )?.attendanceStatus === "present"
                      ? "มาเรียน"
                      : attendanceStore.attendances?.find(
                          (attendance) =>
                            attendance.user?.userId === member.userId
                        )?.attendanceStatus === "late"
                      ? "มาสาย"
                      : "ไม่มาเรียน"
                  }}
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right column for attendance details -->
        <v-col cols="12" md="7">
          <v-card outlined>
            <v-card-title>เช็คชื่อ</v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                  v-for="attendee in attendanceStore.attendances"
                  :key="attendee.attendanceId"
                >
                  <v-card class="mb-4 attendee-card" outlined>
                    <v-card-title class="text-center">
                      {{ attendee.user?.studentId }}
                      {{ attendee.user?.firstName }}
                      {{ attendee.user?.lastName }}
                    </v-card-title>
                    <v-row>
                      <v-col cols="6">
                        <v-img
                          :src="`${url}/attendances/image/${attendee.attendanceImage}`"
                          height="150px"
                          class="rounded-img"
                        ></v-img>
                      </v-col>
                      <v-col cols="6">
                        <v-img
                          :src="`${url}/users/${attendee.user?.userId}/image`"
                          height="150px"
                          class="rounded-img"
                        ></v-img>
                      </v-col>
                    </v-row>
                    <v-card-text class="text-center">
                      <div>
                        สถานะการเช็คชื่อ:
                        {{
                          attendee.attendanceStatus === "present"
                            ? "มาเรียน"
                            : attendee.attendanceStatus === "late"
                            ? "มาสาย"
                            : "ไม่มาเรียน"
                        }}
                      </div>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                      <v-btn
                        class="mx-2"
                        variant="flat"
                        color="error"
                        @click="rejectAttendance(attendee)"
                        >ปฏิเสธ</v-btn
                      >
                      <v-btn
                        class="mx-2"
                        variant="flat"
                        color="success"
                        @click="confirmAttendance(attendee)"
                        >ยืนยัน</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.v-card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.v-avatar {
  border-radius: 50%;
}

.v-card {
  background: #ffffff;
  border-radius: 8px;
}

.v-card-text {
  padding: 16px;
}

.v-card-actions {
  display: flex;
  justify-content: center;
}

.v-btn {
  text-transform: none;
  font-weight: bold;
  min-width: 100px;
}

.mb-4 {
  margin-bottom: 16px;
}

.align-center {
  align-items: center;
  padding: 8px 0;
}

.text-center {
  text-align: center;
}

.rounded-img {
  border-radius: 8px;
  object-fit: cover;
}

.attendee-card {
  background-color: #f5f5f5;
  padding: 16px;
  transition: box-shadow 0.3s;
}

.attendee-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
