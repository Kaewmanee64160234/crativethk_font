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
const queryCourseId = ref('');
onMounted(async () => {
  const id = route.params.assignmentId;
  queryCourseId.value = route.params.courseId + '';
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


const goBackToCourseDetail = () => {
  router.push("/courseDetail/" + queryCourseId.value);
};

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
      <v-row>
        <v-col cols="12">
          <v-btn @click="goBackToCourseDetail" color="primary" class="mr-4">
            <v-icon>mdi-arrow-left</v-icon>
            กลับ
          </v-btn>
        </v-col>
      </v-row>


      <v-row>
        <!-- Left column for student list (2/5 of the screen) -->
        <v-col cols="12" md="5" class="student-list-col">
          <v-card class="student-list-card">
            <v-card-title class="student-list-title">รายชื่อนิสิต</v-card-title>
            <v-card-text>
              <v-row v-for="(member, index) in userStore.users" :key="index" class="align-center student-row">
                <v-col cols="2">
                  <v-avatar size="56">
                    <v-img :src="`${url}/users/${member.userId}/image`"></v-img>
                  </v-avatar>
                </v-col>
                <v-col cols="8" class="student-info">
                  <div class="student-name">
                    {{ member.studentId + " " + member.firstName + " " + member.lastName }}
                  </div>
                </v-col>
                <v-col cols="2" class="status-col">
                  <div class="student-status">
                    {{ member.status }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="7" class="attendance-col">
          <v-card class="attendance-card">
            <v-card-title class="attendance-title">
              <span>เช็คชื่อ</span>
              <!-- <div class="attendance-status-header">
                <span>มา {{ countPresent.length }} </span>
                <v-divider vertical></v-divider>
                <span>รอดำเนินการ {{countRecheck.length  }}</span>
              </div> -->
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6" v-for="attendee in attendanceStore.attendances" :key="attendee.attendanceId">
                  <v-card class="attendee-card" outlined>
                    <v-card-title class="attendee-name">
                      <v-icon small>mdi-circle-small</v-icon>
                      {{ attendee.user?.studentId + " " + attendee.user?.firstName }}
                    </v-card-title>
                    <v-row class="attendee-images">
                      <v-col cols="6">
                        <v-img :src="`${url}/attendances/image/${attendee.attendanceImage}`" height="200px"
                          class="attendee-img"></v-img>
                      </v-col>
                      <v-col cols="6">
                        <v-img :src="`${url}/users/${attendee.user?.userId}/image`" height="200px"
                          class="attendee-img"></v-img>
                      </v-col>
                    </v-row>
                    <v-card-text class="attendee-status">
                      <div>Attendance Status: {{ attendee.attendanceStatus }}</div>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn variant="flat" color="warning" class="recheck-btn"
                        @click="reCheckAttendance(attendee)">Recheck</v-btn>
                      <v-spacer></v-spacer>
                      <v-btn variant="flat" color="success" class="confirm-btn"
                        @click="confirmAttendance(attendee)">Confirm</v-btn>
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
.primary-card {
  background-color: #f5f5f5;
  padding: 20px;
}

.primary-card-title {
  color: #fff;
  text-align: center;
}

.student-list-col {
  padding-right: 16px;
}

.student-list-card {
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-list-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 12px;
  text-align: center;
}

.student-row {
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.student-info {
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.student-status {
  text-align: center;
  font-weight: bold;
}

.attendance-col {
  padding-left: 16px;
}

.attendance-card {
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.attendance-title {
  display: flex;
  justify-content: space-between;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.attendance-status-header {
  display: flex;
  align-items: center;
}

.attendee-card {
  background-color: rgb(237, 237, 237);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s;
}

.attendee-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.attendee-name {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
}

.attendee-images {
  margin-top: 12px;
}

.attendee-img {
  border-radius: 8px;
  object-fit: cover;
}

.attendee-status {
  margin-top: 8px;
  font-size: 1rem;
  text-align: center;
}

.recheck-btn,
.confirm-btn {
  text-transform: none;
  font-weight: bold;
}
</style>


<style scoped>
.bold-text {
  font-weight: bold;
}

.vertical-divider {
  border-left: 1px solid #e0e0e0;
  /* สีของเส้นแบ่ง */
  height: auto;
  /* ให้สูงตามความสูงของ col */
}
</style>
