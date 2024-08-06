<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAttendanceStore } from "../../stores/attendance.store";
import { useRoute } from "vue-router";
import Attendance from "@/stores/types/Attendances";
import { useAssignmentStore } from "@/stores/assignment.store";
import Assignment from "@/stores/types/Assignment";
import { useCourseStore } from "@/stores/course.store";
import { useUserStore } from "@/stores/user.store";
const attendanceStore = useAttendanceStore();
const assignmentStore = useAssignmentStore();
const courseStore = useCourseStore();
const userStore = useUserStore();
const route = useRoute();
const url = "http://localhost:3000";

onMounted(async () => {
  const id = route.params.assignmentId;
  await attendanceStore.getAttendanceByStatusInAssignment(id + ""); // Assuming this function exists and fetches the attendances
  //get assignment by id
  await assignmentStore.getAssignmentById(id + "");
  await userStore.getUserByCourseId(
    assignmentStore.currentAssignment!.course!.coursesId.toString()
  );
  await courseStore.getCourseById(
    assignmentStore.currentAssignment!.course!.coursesId.toString()
  );
});

// confirm student
const confirmAttendance = async (attendance: Attendance) => {
  if (confirm("Do you want to confirm this attendance?")) {
    try {
      attendance.attendanceStatus = "present";
      attendance.attendanceConfirmStatus = "confirmed";
      await attendanceStore.confirmAttendanceByTeacher(attendance.attendanceId + "");
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
    attendance.attendanceStatus = "present";
    attendance.attendanceConfirmStatus = "recheck";
    await attendanceStore.rejectAttendanceByTeacher(attendance.attendanceId + "");
    alert("Attendance has been recheck.");
  } catch (error) {
    console.error("Error recording attendance:", error);
    alert("Failed to recheck attendance.");
  }
};
</script>

<template>
  <v-container fluid class="my-5">
    <div style="margin-top: 5%; margin-left: 5%">
      <v-card
        class="mx-auto"
        color="primary"
        max-width="1200"
        outlined
        style="padding: 20px"
      >
        <v-card-title>
          <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
        </v-card-title>
      </v-card>
     
      <v-row>
        <!-- Left column for student list (2/5 of the screen) -->
        <v-col cols="12" md="5">
          <v-card>
            <v-card-title>Student List</v-card-title>
            <v-card-text>
              <div>
                <v-row> </v-row>
                <v-row v-for="(member, index) in userStore.users" :key="index">
                  <v-divider></v-divider>
                  <v-col cols="2">
                    <v-avatar size="56">
                      <v-img :src="`${url}/users/${member.userId}/image`"></v-img>
                    </v-avatar>
                  </v-col>
                  <v-col cols="8" style="display: flex; align-items: center">
                    <div>
                      {{
                        member.studentId + " " + member.firstName + " " + member.lastName
                      }}
                    </div>
                  </v-col>
                  <v-divider vertical></v-divider>
                  <v-col
                    class="vertical-divider"
                    cols="2"
                    style="display: flex; align-items: center"
                  >
                    <div>
                      {{ member.status }}
                    </div>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right column for displaying student details and images (3/5 of the screen) -->
        <v-col cols="12" md="7">
          เช็คชื่อ
          <v-row>
            <v-col cols="2" style="text-align: center">มา</v-col>
            <v-divider vertical></v-divider>
            <v-col cols="2" class="vertical-divider" style="text-align: center"
              >รอดำเนินการ</v-col
            >
            <v-divider vertical></v-divider>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="6"
              v-for="attendee in attendanceStore.attendances"
              :key="attendee.attendanceId"
            >
              <!-- card backgound color EDEDED -->

              <v-card
                class="mb-2"
                style="padding: 20px; background-color: rgb(237, 237, 237)"
              >
                <v-row justify="center" align="center">
                  <v-card-title class="bold-text mt-2">
                    <v-icon small>mdi-circle-small</v-icon>
                    {{ attendee.user?.studentId + " " + attendee.user?.firstName }}
                  </v-card-title>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-img
                      :src="`${url}/attendances/image/${attendee.attendanceImage}`"
                      height="200px"
                    ></v-img>
                  </v-col>
                  <v-col cols="6">
                    <v-img
                      :src="`${url}/users/${attendee.user?.userId}/image`"
                      height="200px"
                    ></v-img>
                  </v-col>
                </v-row>
                <!-- <v-card-title
                  >{{ attendee.user?.firstName }}
                  {{ attendee.user?.lastName }}</v-card-title
                >
                <v-card-subtitle>{{ attendee.user?.studentId }}</v-card-subtitle> -->
                <v-card-text>
                  <div>Attendance Status: {{ attendee.attendanceStatus }}</div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    variant="flat"
                    color="warning"
                    style="color: black"
                    @click="reCheckAttendance(attendee)"
                    >Recheck</v-btn
                  >
                  <v-spacer></v-spacer>
                  <v-btn
                    variant="flat"
                    color="success"
                    @click="confirmAttendance(attendee)"
                    >Confirm</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.bold-text {
  font-weight: bold;
}
.vertical-divider {
  border-left: 1px solid #e0e0e0; /* สีของเส้นแบ่ง */
  height: auto; /* ให้สูงตามความสูงของ col */
}
</style>
