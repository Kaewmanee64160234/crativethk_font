<script setup lang="ts">
import { useAttendanceStore } from "../../stores/attendance.store";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user.store";
import router from "@/router";
import { useCourseStore } from "@/stores/course.store";
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
const isRecheckAllowed = ref(true);

onMounted(async () => {
  await userStore.getCurrentUser();
  await assignmentStore.getAssignmentById(route.params.assignmentId.toString());
  await attendanceStore.getAttendanceByAssignmentId(route.params.assignmentId.toString());
  await userStore.getUserByCourseId(queryCourseId + '');
  // get course by id
  await courseStore.getCourseById(queryCourseId + '');

  // Check if more than 1 day has passed since the assignment was created
  const currentDate = new Date().getTime();
  const assignmentDate = new Date(assignmentStore.currentAssignment!.createdDate!).getTime();
  const timeDifference = currentDate - assignmentDate;

  // If the time difference is greater than 24 hours (86400000 ms), disallow recheck
  isRecheckAllowed.value = timeDifference < 86400000;

  attdent.value = [];
  attdent.value.push(...attendanceStore.attendances!.filter((attend: Attendance) => 
    (attend.user?.studentId === userStore.currentUser?.studentId) && 
    (attend.attendanceImage !== 'noimage.jpg')
  ));
});

//confirm attendance
const confirmAttendance = async (attendance: Attendance) => {
  if (confirm("Do you want to confirm this attendance?")) {
    try {
      attendance.assignment = assignmentStore.currentAssignment;
      attendance.attendanceStatus = "present";
      attendance.attendanceConfirmStatus = "confirmed";
      if (attendance.user === null) {
        attendance.user = userStore.currentUser;
      }
      await attendanceStore.confirmAttendance(attendance);
      alert("Attendance has been confirmed.");
    } catch (error) {
      console.error("Error recording attendance:", error);
      alert("Failed to confirm attendance.");
    }
  }
};

const reCheckAttendance = async (attendance: Attendance) => {
  try {
    attendance.assignment = assignmentStore.currentAssignment;
    const date = new Date();
    const currentDate = date.getTime();
    const assignmentDate = new Date(assignmentStore.currentAssignment!.createdDate!);
    const assignmentTime = assignmentDate.getTime();
    const diff = currentDate - assignmentTime;

    // If the time difference is greater than 15 minutes (900000 ms), set status to "late"
    if (diff > 900000) {
      attendance.attendanceStatus = "late";
    } else {
      attendance.attendanceStatus = "present";
    }

    attendance.attendanceConfirmStatus = "recheck";
    attendance.user = userStore.currentUser;
    await attendanceStore.confirmAttendance(attendance);
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
// goToCourseDetail
const goToCourseDetail = () => {
  router.push("/courseDetail/" + queryCourseId);
};
</script>



<template>
 <v-container class="fill-height" style="margin-top: 5%;">
    <v-card class="mx-auto card-style" color="primary" outlined style="padding: 20px; width: 100%;">
      <v-card-title>
        <h1 class="text-h5">
          <span
            style="cursor: pointer; color: aliceblue; text-decoration: none;"
            @click="goToCourseDetail"
          >
            {{ courseStore.currentCourse?.nameCourses }}
          </span>
          > {{ assignmentStore.currentAssignment?.nameAssignment }}
        </h1>
      </v-card-title>
    </v-card>
        <h1 class="title">ตรวจสอบการเข้าเรียน</h1>


    <!-- Conditional rendering for attendance data -->
    <v-row v-if="userStore.currentUser?.role == 'อาจารย์'" style="width: 100%;">
      <v-col v-for="student in attendanceStore.attendances" :key="student.attendanceId" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-3 student-card" outlined>
          <!-- Student Information -->
          <v-row justify="center" align="center">
            <div class="d-flex flex-column align-items-center">
              <div v-if="student.user">
                <div class="subtitle-1 bold-text mt-2">
                 
                  {{ student.user.studentId + " " + student.user.firstName }}
                </div>
              </div>
              <div v-else class="text-center red--text bold-text mt-2">
                <v-icon small class="mr-1">mdi-alert-circle</v-icon>ระบุไม่ได้
              </div>
            </div>
          </v-row>
          <v-row v-if="student.user" justify="center">
            <!-- Student Image -->
            <v-img  :src="`${url}/attendances/image/${student.attendanceImage}`" height="200px" width="140px"
              class="rounded-lg" :alt="`Student Image for ${student.user ? student.user.firstName : 'Unknown'}`"></v-img>
          </v-row>
          <v-row v-else justify="center">
            <!-- Student Image -->
            <v-img  :src="`${url}/attendances/image/${student.attendanceImage}`" height="200px" width="140px"
              class="rounded-lg" ></v-img>
          </v-row>

          <!-- Re-check Button -->
          <v-row class="mt-3">
            <v-col cols="12">
              <v-btn block v-if="userStore.currentUser?.role !== 'อาจารย์' && isRecheckAllowed" color="#F6BB49" @click="confirmTagging()">
                ตรวจสอบอีกครั้ง
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- No attendance detected -->
    <v-row v-else style="width: 100%;">
      <v-col v-if="attdent.length > 0" v-for="student in attdent" :key="student.attendanceId" cols="12" sm="6" md="4" lg="3">
        <v-card v-if="isRecheckAllowed" class="pa-3 student-card" outlined>
          <!-- Student Information -->
          <v-row justify="center" align="center">
            <div class="d-flex flex-column align-items-center">
              <div v-if="student.user">
                <div class="subtitle-1 bold-text mt-2">
                 
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
              class="rounded-lg" :alt="`Student Image for ${student.user ? student.user.firstName : 'Unknown'}`"></v-img>
          </v-row>

          <!-- Re-check Button -->
          <v-row class="mt-3">
            <v-col cols="12">
              <v-btn v-if="userStore.currentUser?.role !== 'อาจารย์'  && student.attendanceConfirmStatus === 'notconfirm'  " block color="#F6BB49" @click="confirmTagging()">
                ตรวจสอบอีกครั้ง
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-card   v-else class="student-card " outlined>
          <v-row class="align-center justify-center">
            <div class="text-start
            ">
              <div class="subtitle-1 bold-text mt-2" style="color: red;" >
                หมดเวาลาการตรวจสอบการเข้าเรียน
              </div>
            </div>
          </v-row>
        </v-card>
      </v-col>
      <v-col v-else cols="12">
        <v-card v-if="isRecheckAllowed" class="student-card " outlined>
          <v-row class="align-center justify-center">
            <div class="text-start">
              <div class="subtitle-1 bold-text mt-2">
                ไม่สามารถตรวจจับการเข้าร่วมของคุณได้
              </div>
              <v-btn class="mt-3" color="primary" @click="confirmTagging()">
                ยืนยันว่าคุณอยู่ในห้องเรียน
              </v-btn>
            </div>
          </v-row>
        </v-card>
        <v-card v-else class="student-card " outlined>
          <v-row class="align-center justify-center">
            <div class="text-start
            ">
              <div class="subtitle-1 bold-text mt-2" style="color: red;" >

                หมดเวาลาการตรวจสอบการเข้าเรียน
              </div>
             
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
  width: 100%;
  text-align: start; /* Align the text to the start */
  font-size: 2rem;
  font-weight: bold;
}

.student-card {
  background-color: #ffffff;
  border-radius: 8px;
  transition: box-shadow 0.3s;
  width: 100%;
  padding:20px;
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
