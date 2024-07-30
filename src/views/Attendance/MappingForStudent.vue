<script setup lang="ts">
import { useAttendanceStore } from "../../stores/attendance.store";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user.store";
import router from "@/router";
import { useCourseStore } from "@/stores/course.store";
import assignment from "@/services/assignment";
import { useAssignmentStore } from "@/stores/assignment.store";
import type Attendance from "@/stores/types/Attendances";
import { useMessageStore } from "@/stores/message";
const url = "http://localhost:3000";

const route = useRoute();
const attendanceStore = useAttendanceStore();
const userStore = useUserStore();
const courseStore = useCourseStore();
const assignmentStore = useAssignmentStore();
const messageStore = useMessageStore();
const attdent = ref<Attendance[]>([]);
const queryCourseId = route.params.courseId;

onMounted(async () => {
  await userStore.getCurrentUser();
  console.log(JSON.stringify(userStore.currentUser));
  await assignmentStore.getAssignmentById(route.params.assignmentId.toString());
  console.log(JSON.stringify(assignmentStore.currentAssignment));
  await attendanceStore.getAttendanceByAssignmentId(route.params.assignmentId.toString());
  await userStore.getUserByCourseId(queryCourseId+'');
  attdent.value = [];
  attdent.value.push(...attendanceStore.attendances!.filter((attend: Attendance) => (attend.user?.studentId === userStore.currentUser?.studentId) && (attend.attendanceImage !== '')));
});

//confirm attendance
const confirmAttendance = async (attendance: Attendance) => {
  // Show a confirmation dialog
  if (confirm("Do you want to confirm this attendance?")) {
    try {
      // Set attendance status
      attendance.assignment = assignmentStore.currentAssignment;
      attendance.attendanceStatus = "present";
      attendance.attendanceConfirmStatus = "confirmed";
      if (attendance.user === null) {
        attendance.user = userStore.currentUser;
      }

      // Call store method to confirm attendance
      await attendanceStore.confirmAttendance(attendance);

      // Notify user of success
      alert("Attendance has been confirmed.");

      // Redirect after successful confirmation
      // router.push('/resheckMappingTeacher/' + assignmentStore.currentAssignment?.assignmentId); // Replace '/next-page-route' with your specific route
    } catch (error) {
      console.error("Error recording attendance:", error);
      alert("Failed to confirm attendance."); // Show error alert
    }
  }
};

const reCheckAttendance = async (attendance: Attendance) => {
  try {
    attendance.assignment = assignmentStore.currentAssignment;
    // if click this function after 15 minutes create assignment set attdent status to late
    const date = new Date();
    const currentDate = date.getTime();
    const assignmentDate = new Date(assignmentStore.currentAssignment!.createdDate!);
    const assignmentTime = assignmentDate.getTime();
    const diff = currentDate - assignmentTime;
    if (diff > 900000) {
      attendance.attendanceStatus = "late";
    } else {
      attendance.attendanceStatus = "present";
    }
    attendance.attendanceConfirmStatus = "recheck";
    attendance.user = userStore.currentUser;
    console.log(JSON.stringify(attendance));

    await attendanceStore.confirmAttendance(attendance);
    router.push("/courseDetail/" + queryCourseId);
    // router.push('/resheckMappingTeacher/' + assignmentStore.currentAssignment?.assignmentId); // Replace '/next-page-route' with your specific route
  } catch (error) {
    console.log(error);
  }
};

const goBackToCourseDetail = () => {
  router.push("/courseDetail/" + queryCourseId);
};

const confirmTagging = () => {
  router.push("/taggingFace/course/" + queryCourseId+"/assignment/"+route.params.assignmentId);
};
</script>
<template>
  
  <v-container class="fill-height" style="margin-top: 5%">
    <v-card class="mx-auto card-style" outlined color="primary">
      <v-card-title class="card-title">
        <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
      </v-card-title>
    </v-card>
    <h1 class="title mt-5">ตรวจสอบการเข้าเรียน</h1>

    <v-btn fab dark icon absolute top right color="blue" @click="goBackToCourseDetail" class="back-btn"
      :to="`/courseDetail/${courseStore.currentCourse?.coursesId!}`">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <!-- Conditional rendering for attendance data -->
    <v-row v-if="userStore.currentUser?.role == 'อาจารย์'" style="width: 100%;">
      <v-col v-for="student in attendanceStore.attendances" :key="student.attendanceId" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-3 student-card" outlined>
          <!-- Student Information -->
          <v-row justify="center" align="center">
            <div class="d-flex flex-column align-items-center">
              <div v-if="student.user">
                <div class="subtitle-1 bold-text mt-2">
                  <v-icon small class="mr-1">mdi-account-circle</v-icon>
                  {{ student.user.studentId + " " + student.user.firstName }}
                </div>
              </div>
              <div v-else class="text-center red--text bold-text mt-2">
                <v-icon small class="mr-1">mdi-alert-circle</v-icon>ระบุไม่ได้
              </div>
            </div>
          </v-row>
          <v-row justify="center">
            <!-- Student Image -->
            <v-img :src="`${url}/attendances/image/${student.attendanceImage}`" height="200px" width="140px"
              class="rounded-lg" :alt="`Student Image for ${student.user ? student.user.firstName : 'Unknown'
                }`"></v-img>
          </v-row>

          <!-- Re-check Button -->
          <v-row class="mt-3">
            <v-col cols="12">
              <v-btn block color="#F6BB49" @click="reCheckAttendance(student)">
                ตรวจสอบอีกครั้ง
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- No attendance detected -->
    <v-row v-else style="width: 100%;">
      <v-col v-if="attdent.length > 0" v-for="student in attdent" :key="student.attendanceId" cols="12" sm="6" md="4"
        lg="3">
        <v-card class="pa-3 student-card" outlined>
          <!-- Student Information -->
          <v-row justify="center" align="center">
            <div class="d-flex flex-column align-items-center">
              <div v-if="student.user">
                <div class="subtitle-1 bold-text mt-2">
                  <v-icon small class="mr-1">mdi-account-circle</v-icon>
                  {{ student.user.studentId + " " + student.user.firstName }}
                </div>
              </div>
              <div v-else class="text-center red--text bold-text mt-2">
                <v-icon small class="mr-1">mdi-alert-circle</v-icon>ระบุไม่ได้
              </div>
            </div>
          </v-row>
          <v-row justify="center">
            <!-- Student Image -->
            <v-img :src="`${url}/attendances/image/${student.attendanceImage}`" height="200px" width="140px"
              class="rounded-lg" :alt="`Student Image for ${student.user ? student.user.firstName : 'Unknown'
                }`"></v-img>
          </v-row>

          <!-- Re-check Button -->
          <v-row class="mt-3">
            <v-col cols="12">
              <v-btn block color="#F6BB49" @click="reCheckAttendance(student)">
                ตรวจสอบอีกครั้ง
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col v-else cols="12">
        <v-card class="pa-3 student-card" outlined>
          <v-row class="align-center justify-center">
            <div class="text-center">
              <div class="subtitle-1 bold-text mt-2">
                ไม่สามารถตรวจจับการเข้าร่วมของคุณได้
              </div>
              <v-btn class="mt-3" color="primary" @click="confirmTagging()">
                ยืนยันว่าคุณอยู่ในห้องเรียน
              </v-btn>
            </div>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.card-style {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
}

.card-title {
  text-align: start;
  color: white;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
}

.back-btn {
  top: 0;
  right: 0;
  z-index: 10;
}

.v-btn--active {
  background-color: #4caf50 !important;
  /* Active state color for 'เข้าเรียน' button when active */
}

.bold-text {
  font-weight: bold;
}

.pa-3 {
  padding: 24px !important;
}

.subtitle-1 {
  font-size: 1.25rem;
}

.student-card {
  background-color: #ffffff;
  border-radius: 8px;
  transition: box-shadow 0.3s;
  width: 100%;
}

.student-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.v-img {
  object-fit: cover;
}

.v-btn {
  text-transform: none;
}
</style>
