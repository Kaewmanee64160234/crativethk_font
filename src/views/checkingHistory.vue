<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCourseStore } from "@/stores/course.store";
import { useAssignmentStore } from "@/stores/assignment.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useUserStore } from "@/stores/user.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import type Attendance from "@/stores/types/Attendance";
import type Assignment from "@/stores/types/Assignment";
import type { User } from "@/stores/types/User";

const router = useRouter();
const courseName = ref("OOAD 2023");
const courseStore = useCourseStore();
const assignmentStore = useAssignmentStore();
const attendanceStore = useAttendanceStore();
const enrollmentStore = useEnrollmentStore();
const userStore = useUserStore();
const route = useRoute();
const id = ref(route.params.courseId);
const posts = ref<Assignment[]>([]);
const showDialog = ref(false);

const currentUser = computed(() => userStore.currentUser);

onMounted(async () => {
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
  await attendanceStore.getAttendanceByCourseId(id.value.toString());
  const userId = userStore.currentUser?.studentId?.toString() || '';
  await attendanceStore.getAttendanceByCourseandStudentId(id.value.toString(), userId);
  await userStore.getUserByCourseId(id.value.toString());
  await courseStore.getCourseById(id.value.toString());
  await courseStore.getAllRooms();
  posts.value = assignmentStore.assignments;

  if (isTeacher.value) {
    showDialog.value = true;
  }
});

const getAttendanceStatus = (attendances: Attendance[] | undefined, assignmentId: number): string => {
  if (!attendances) return "absent";
  const attendance = attendances.find(
    (att) => att.user?.userId === currentUser.value?.userId && att.assignment?.assignmentId === assignmentId
  );
  return attendance ? attendance.attendanceStatus : "absent";
};

const getAttendanceStatusTeacher = (
  attendances: Attendance[],
  userId: number,
  assignmentId: number
): string => {
  const attendanceIndex = attendances?.findIndex(
    (att:Attendance) => att.user?.userId === userId && att.assignment?.assignmentId === assignmentId
  );
  return attendances[attendanceIndex!] ? attendances[attendanceIndex!].attendanceStatus : "absent";
};


const calculateTotalScore = (assignments: Assignment[]): number => {
  return assignments.reduce((total, assignment) => {
    const status = getAttendanceStatus(attendanceStore.attendances, assignment.assignmentId!);
    if (status === "present") {
      return total + 1;
    } else if (status === "late") {
      return total + 0.5;
    }
    return total;
  }, 0);
};

const calculateTotalScoreForTeacher = (userId: number, assignments: Assignment[]): number => {
  return assignments.reduce((total, assignment) => {
    const status = getAttendanceStatusTeacher(
      attendanceStore.attendances || [],
      userId,
      assignment.assignmentId!
    );
    if (status === "present") {
      return total + 1;
    } else if (status === "late") {
      return total + 0.5;
    }
    return total;
  }, 0);
};
const openDialog = (assignment: Assignment, user: User) => {
  //filter attendance from assignments
  const attendance = attendanceStore.attendances?.findIndex(
    (att) => att.user?.userId === user.userId && att.assignment?.assignmentId === assignment.assignmentId);

  attendanceStore.editAttendance = attendanceStore.attendances![attendance!];
  attendanceStore.userAttendance = user;
  attendanceStore.showDialog = true;
};
const isTeacher = computed(() => userStore.currentUser?.role === 'อาจารย์');
const isStudent = computed(() => userStore.currentUser?.role === 'นิสิต');
</script>

<template>
  <v-container style="padding-top: 120px;">
    <v-text style="font-size: 24px; font-weight: bold;" v-if="isStudent"> ประวัติการเช็คชื่อ วิชา {{ courseStore.currentCourse?.nameCourses }} </v-text>
    <v-card class="mx-auto" outlined style="padding: 20px; margin-top: 10px" v-if="isStudent">
      <v-table>
        <thead>
          <tr>
            <th class="text-left vertical-divider">Student ID</th>
            <th class="text-left vertical-divider">Student Name</th>
            <th class="text-left vertical-divider">Full Score</th>
            <th class="text-left vertical-divider">Score</th>
            <th class="vertical-divider" v-for="assignment in assignmentStore.assignments" :key="assignment.assignmentId">
              {{ assignment.nameAssignment }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="currentUser">
            <td class="vertical-divider">{{ currentUser.studentId }}</td>
            <td class="vertical-divider">{{ currentUser.firstName + " " + currentUser.lastName }}</td>
            <td class="vertical-divider">{{ assignmentStore.assignments.length }}</td>
            <td class="vertical-divider">{{ calculateTotalScore(assignmentStore.assignments) }}</td>
            <td v-for="assignment in assignmentStore.assignments" :key="assignment.assignmentId" class="vertical-divider">
              <template v-if="getAttendanceStatus(attendanceStore.attendances, assignment.assignmentId!) === 'present'">
                <v-icon color="green">mdi-check-circle</v-icon>
              </template>
              <template v-else-if="getAttendanceStatus(attendanceStore.attendances, assignment.assignmentId!) === 'late'">
                <v-icon color="orange">mdi-clock-outline</v-icon>
              </template>
              <template v-else>
                <v-icon color="red">mdi-close-circle</v-icon>
              </template>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
    <v-text style="font-size: 24px; font-weight: bold;" v-if="isTeacher"> ดูรายชื่อวิชา {{ courseStore.currentCourse?.nameCourses }} </v-text>
    <v-card class="mx-auto" outlined style="padding: 20px; margin-top: 10px" v-if="isTeacher">
    <v-table>
            <thead>
              <tr>
                <th class="text-left vertical-divider">Student ID</th>
                <th class="text-left vertical-divider">Student Name</th>
                <th class="text-left vertical-divider">Full Score</th>
                <th class="text-left vertical-divider">Score</th>
                <th class="vertical-divider" v-for="assignment in assignmentStore.assignments" :key="assignment.assignmentId">
                  {{ assignment.nameAssignment }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userStore.users" :key="user.userId">
                <td class="vertical-divider">{{ user.studentId }}</td>
                <td class="vertical-divider">{{ user.firstName + " " + user.lastName }}</td>
                <td class="vertical-divider">{{ assignmentStore.assignments.length }}</td>
                <td class="vertical-divider">{{ calculateTotalScoreForTeacher(user.userId!, assignmentStore.assignments) }}</td>
                <td v-for="assignment in assignmentStore.assignments" :key="assignment.assignmentId" class="vertical-divider">
                  <template v-if="getAttendanceStatusTeacher(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'">
                    <v-btn density="compact" color="green" icon="mdi-check-circles" v-if="isTeacher" @click="openDialog(assignment, user)">
                      <v-icon>mdi-check-circle</v-icon>
                    </v-btn>
                    <v-icon color="green" v-else>mdi-check-circle</v-icon>
                  </template>
                  <template v-else-if="getAttendanceStatusTeacher(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'">
                    <v-btn density="compact" color="orange" icon="mdi-check-circles" v-if="isTeacher" @click="openDialog(assignment, user)">
                      <v-icon>mdi-clock-outline</v-icon>
                    </v-btn>
                    <v-icon color="orange" v-else>mdi-clock-outline</v-icon>
                  </template>
                  <template v-else>
                    <v-btn density="compact" color="red" icon="mdi-check-circles" v-if="isTeacher" @click="openDialog(assignment, user)">
                      <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                    <v-icon color="red" v-else>mdi-close-circle</v-icon>
                  </template>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
  </v-container>
</template>

<style scoped>
.text-center {
  text-align: center;
}
.vertical-divider {
  border-left: 1px solid #e0e0e0;
  height: auto;
}
</style>
