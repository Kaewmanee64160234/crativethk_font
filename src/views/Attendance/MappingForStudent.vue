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
const url = import.meta.env.VITE_API_URL;

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
  await userStore.getUserByCourseId(queryCourseId + "");
  await courseStore.getCourseById(queryCourseId + "");
  attdent.value = [];
  attdent.value.push(
    ...attendanceStore.attendances!.filter(
      (attend: Attendance) =>
        attend.user?.studentId === userStore.currentUser?.studentId &&
        attend.attendanceImage !== "noimage.jpg"
    )
  );
});

const reCheckAttendance = async (attendance: Attendance) => {
  try {
    console.log("Attendance:Ging", attendance);

    attendance.assignment = assignmentStore.currentAssignment;
    const date = new Date();
    const currentDate = date.getTime();
    const assignmentDate = new Date(assignmentStore.currentAssignment!.createdDate!);
    const assignmentTime = assignmentDate.getTime();
    const diff = currentDate - assignmentTime;
    attendance.attendanceStatus = diff > 900000 ? "มาสาย" : "มาเรียน";
    attendance.attendanceConfirmStatus = "recheck";
    attendance.user = userStore.currentUser;
    attendance.attendanceScore = 0;

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
  router.push(
    "/taggingFace/course/" + queryCourseId + "/assignment/" + route.params.assignmentId
  );
};
</script>

<template>
  <v-container class="fill-height" style="margin-top: 5%">
    <v-row></v-row>
    <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px; width: 100%;">
      <v-card-title>
        <h1 class="text-h5" style="text-align: start;">
          <router-link style="color: aliceblue;" :to="`/courseDetail/${courseStore.currentCourse?.coursesId}`">
            {{ courseStore.currentCourse?.nameCourses }}
          </router-link>
        </h1>
      </v-card-title>
    </v-card>

    <v-row class="align-start" style="width: 100%;">
      <v-col cols="12">
        <h2 class="title">รูปภาพนิสิตที่ระบบตรวจพบ</h2>
      </v-col>
    </v-row>

    <!-- Display student cards -->
    <v-row class="row-spacing" style="width: 100%">
      <v-col
        v-for="student in attendanceStore.attendances"
        :key="student.attendanceId"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="3"
      >
        <v-card class="student-card" outlined>
          <!-- Student Information -->
          <v-card-text class="text-center bold-text mt-2" style="font-size: large;">
            <div v-if="student.user">
              {{ student.user.studentId }} <br> {{ student.user.firstName }} {{ student.user.lastName }}
            </div>
            <div v-else class="red--text">
              ระบุไม่ได้
            </div>
          </v-card-text>

          <!-- Student Image -->
          <v-img
            :src="`${url}/attendances/image/${student.attendanceImage}`"
            class="student-image"
            :alt="`Student Image for ${
              student.user ? student.user.firstName : 'Unknown'
            }`"
          ></v-img>
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
  text-align: start; /* Aligns the title to the start */
  font-size: 1.5rem;
  font-weight: bold;
  color: #3f51b5;
  /* margin-bottom: 10px; */
  margin-top: 20px;
}

.bold-text {
  font-weight: bold;
  color: #333;
}

.student-card {
  background-color: #ffffff;
  border-radius: 8px;
  transition: box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  height: 320px;
  padding: 10px;
}

.student-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.v-img.student-image {
  object-fit: cover;
  border-radius: 8px;
  width: 90%;
  max-height: 180px;
  margin: 0 auto;
}

.v-card-text {
  text-align: center;
  padding: 8px 16px;
  background-color: #f9f9f9;
}

.red--text {
  color: #f44336;
}

.row-spacing {
  margin-bottom: 16px;
}
</style>
