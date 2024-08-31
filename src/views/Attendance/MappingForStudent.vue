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
  await userStore.getUserByCourseId(queryCourseId + '');
  attdent.value = [];
  attdent.value.push(...attendanceStore.attendances!.filter((attend: Attendance) => (attend.user?.studentId === userStore.currentUser?.studentId) && (attend.attendanceImage !== 'noimage.jpg')));
});


const reCheckAttendance = async (attendance: Attendance) => {
  try {
    console.log('Attendance:Ging', attendance);

    attendance.assignment = assignmentStore.currentAssignment;
    const date = new Date();
    const currentDate = date.getTime();
    const assignmentDate = new Date(assignmentStore.currentAssignment!.createdDate!);
    const assignmentTime = assignmentDate.getTime();
    const diff = currentDate - assignmentTime;
    attendance.attendanceStatus = diff > 900000 ? "late" : "present";
    attendance.attendanceConfirmStatus = "recheck";
    attendance.user = userStore.currentUser;
    attendance.attendanceScore = 0;



    await attendanceStore.confirmAttendance(attendance, null);


    router.push("/courseDetail/" + queryCourseId);
  } catch (error) {
    console.log(error);
  }
};

const goBackToCourseDetail = () => {
  router.push("/courseDetail/" + queryCourseId);
};

const confirmTagging = () => {
  router.push("/taggingFace/course/" + queryCourseId + "/assignment/" + route.params.assignmentId);
};
</script>
<template>
  <v-container class="fill-height" style="margin-top: 5%">
    <!-- Title Row with Back Button -->
    <v-row class="align-center">


      <!-- Title -->
      <v-col cols="12">
        <h1 class="title mt-5">ตรวจสอบการเข้าเรียน</h1>
      </v-col>
    </v-row>
    <v-row style="width: 100%;" >
      <!-- Back Button -->
        <v-btn variant="outlined" color="blue" @click="goBackToCourseDetail" class="back-btn">
          Go home
        </v-btn>
    
    </v-row>

    <!-- Conditional rendering for attendance data -->
    <v-row v-if="userStore.currentUser?.role === 'อาจารย์'" class="row-spacing" style="width: 100%;">
      <v-col v-for="student in attendanceStore.attendances" :key="student.attendanceId" cols="12" sm="6" md="4" lg="3"
        xl="3">
        <v-card class="pa-3 student-card" outlined>
          <!-- Student Information -->
          <v-row justify="center" align="center" class="row-spacing">
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
          <v-row justify="center" class="mt-2">
            <!-- Student Image -->
            <v-img :src="`${url}/attendances/image/${student.attendanceImage}`" height="200px" width="auto"
              class="rounded-lg student-image"
              :alt="`Student Image for ${student.user ? student.user.firstName : 'Unknown'}`"></v-img>
          </v-row>

          <!-- Re-check Button -->
          <v-row class="mt-2" v-if="userStore.currentUser?.role !== 'อาจารย์'">
            <v-col cols="12">
              <v-btn block color="#F6BB49" class="recheck-btn" @click="confirmTagging()">
                ตรวจสอบอีกครั้ง
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- No attendance detected -->
    <v-row v-else class="row-spacing" style="width: 100%;">
      <v-col v-if="attdent.length > 0" v-for="student in attdent" :key="student.attendanceId" cols="12" sm="6" md="4"
        lg="3" xl="3">
        <v-card class="pa-3 student-card" outlined>
          <!-- Student Information -->
          <v-row justify="center" class="align-center row-spacing">
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
          <v-row justify="center" class="mt-2">
            <!-- Student Image -->
            <v-img :src="`${url}/attendances/image/${student.attendanceImage}`" height="200px" width="auto"
              class="rounded-lg student-image"
              :alt="`Student Image for ${student.user ? student.user.firstName : 'Unknown'}`"></v-img>
          </v-row>

          <!-- Re-check Button -->
          <v-row class="mt-2">
            <v-col cols="12">
              <v-btn block color="#F6BB49" class="recheck-btn" @click="confirmTagging()">
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
              <v-btn class="mt-3 confirm-btn" color="primary" @click="confirmTagging()">
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
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #3f51b5;
  margin-bottom: 20px;
}

.back-btn {
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.bold-text {
  font-weight: bold;
  color: #333;
}

.pa-3 {
  padding: 20px !important;
}

.subtitle-1 {
  font-size: 1.25rem;
  text-align: center;
}

.student-card {
  background-color: #ffffff;
  border-radius: 8px;
  transition: box-shadow 0.3s;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.student-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.v-img {
  object-fit: cover;
  border-radius: 8px;
}

.v-btn {
  text-transform: none;
  font-weight: bold;
}

.recheck-btn {
  background-color: #f6bb49;
  color: #fff;
  transition: background-color 0.3s;
}

.recheck-btn:hover {
  background-color: #e0a838;
}

.confirm-btn {
  background-color: #3f51b5;
  color: #fff;
  transition: background-color 0.3s;
}

.confirm-btn:hover {
  background-color: #2e3b8a;
}

.red--text {
  color: #f44336;
}

.row-spacing {
  margin-bottom: 16px;
}
</style>
