<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useCourseStore } from "@/stores/course.store";
import { useAssignmentStore } from "@/stores/assignment.store";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useUserStore } from "@/stores/user.store";
import type Assignment from "@/stores/types/Assignment";
import type { User } from "@/stores/types/User";
import UpdateAttendantDialogView from "@/components/attendant/updateAttendantDialog.vue";
import type Attendance from "@/stores/types/Attendances";

const courseStore = useCourseStore();
const assignmentStore = useAssignmentStore();
const attendanceStore = useAttendanceStore();
const userStore = useUserStore();
const route = useRoute();
const id = ref(route.params.courseId);
const posts = ref<Assignment[]>([]);
const showDialog = ref(false);


onMounted(async () => {
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
  await attendanceStore.getAttendanceByCourseId(id.value.toString());
  const userId = userStore.currentUser?.studentId?.toString() || "";
  await attendanceStore.getAttendanceByCourseandStudentId(id.value.toString(), userId);
  await userStore.getUserByCourseId(id.value.toString());
  await courseStore.getCourseById(id.value.toString());
  // await courseStore.getAllRooms();
  posts.value = assignmentStore.assignments;

  if (isTeacher.value) {
    showDialog.value = true;
  }
});

const getAttendanceStatus = (
  attendances: Attendance[],
  userId: number,
  assignmentId: number
): string => {
  const attendanceIndex = attendances.findIndex(
    (att: Attendance) =>
      att.user?.userId === userId && att.assignment?.assignmentId === assignmentId
  );
  return attendances[attendanceIndex]
    ? attendances[attendanceIndex].attendanceStatus
    : "absent";
};



const openDialog = (assignment: Assignment, user: User) => {
  //filter attendance from assignments
  const attendance = attendanceStore.attendances?.findIndex(
    (att) =>
      att.user?.userId === user.userId &&
      att.assignment?.assignmentId === assignment.assignmentId
  );

  attendanceStore.editAttendance = attendanceStore.attendances![attendance!];
  attendanceStore.userAttendance = user;
  attendanceStore.showDialog = true;
};
const calculateTotalScoreAndAbsence = (
  userId: number,
  assignments: Assignment[]
): { totalScore: number; absentCount: number } => {
  // Initialize totalScore and absentCount
  let totalScore = 0;
  let absentCount = 0;

  // Loop through all assignments to calculate totalScore and count absences
  assignments.forEach((assignment) => {
    const status = getAttendanceStatus(
      attendanceStore.attendances || [],
      userId,
      assignment.assignmentId!
    );

    // Increment totalScore based on attendance status
    if (status === "present") {
      totalScore += 1; // Full point for present
    } else if (status === "late") {
      totalScore += 0.5; // Half point for late
    } else if (status === "absent") {
      absentCount += 1; // Count absences
    }
  });

  return { totalScore, absentCount };
};
const calculateTotalScore = (userId: number, assignments: Assignment[]): number => {
  return assignments.reduce((total, assignment) => {
    const status = getAttendanceStatus(
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
const filteredUsers = computed(() => {
  // Filter users based on whether the user is a teacher or a student.
  if (isTeacher.value) {
    return userStore.users;
  } else {
    return userStore.users.filter(
      (user) => user.userId === userStore.currentUser?.userId
    );
  }
});
const isTeacher = computed(() => userStore.currentUser?.role === "อาจารย์");
const isStudent = computed(() => userStore.currentUser?.role === "นิสิต");
</script>

<template>
  <v-container style="padding-top: 120px">
    <v-text style="font-size: 24px; font-weight: bold" v-if="isStudent">
      ประวัติการเช็คชื่อ วิชา {{ courseStore.currentCourse?.nameCourses }}
    </v-text>
    <v-card
      class="mx-auto"
      outlined
      style="padding: 20px; margin-top: 10px"
      v-if="isStudent"
    >
      <v-table>
        <thead>
          <tr>
            <th class="text-center vertical-divider">รหัสนิสิต</th>
            <th class="text-center vertical-divider">ชื่อ-สกุล</th>
            <th class="text-center vertical-divider">คะแนนเต็ม</th>
            <th class="text-center vertical-divider">คะแนนที่ได้</th>
            <th
              class="text-center vertical-divider"
              v-for="assignment in assignmentStore.assignments"
              :key="assignment.assignmentId"
            >
              {{ assignment.nameAssignment }}
            </th>
          </tr>
        </thead>
        <!-- {{attendanceStore.attendances!}} -->
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.userId"
            :class="{
        'highlight-red':calculateTotalScoreAndAbsence(user.userId!, assignmentStore.assignments)
        .absentCount > 3
      }"
          >
            <td class="text-center vertical-divider">
              {{ user.studentId }}
            </td>
            <td class="vertical-divider">
              <span
                :class="{ 'highlighted-text':         calculateTotalScoreAndAbsence(user.userId!, assignmentStore.assignments)
    .absentCount > 3 }"
              >
                {{ user.firstName + " " + user.lastName }}
              </span>
            </td>
            <td class="text-center vertical-divider">
              {{ courseStore.currentCourse?.fullScore }}
            </td>
            <td class="text-center vertical-divider">
              {{
              calculateTotalScore(
                user.userId!,
                assignmentStore.assignments
              )
              }}
            </td>
            <td
              v-for="assignment in assignmentStore.assignments"
              :key="assignment.assignmentId"
              class="text-center vertical-divider"
            >
              <!-- {{getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!)}} -->
              <template
                v-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'"
              >
                <v-btn
                  density="compact"
                  color="green"
                  icon="mdi-check-circle"
                  v-if="isTeacher"
                  @click="openDialog(assignment, user)"
                >
                  <v-icon>mdi-check-circle</v-icon>
                </v-btn>
                <v-icon color="green" v-else>mdi-check-circle</v-icon>
              </template>
              <template
                v-else-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'"
              >
                <v-btn
                  density="compact"
                  color="orange"
                  icon="mdi-clock-outline"
                  v-if="isTeacher"
                  @click="openDialog(assignment, user)"
                >
                  <v-icon>mdi-clock-outline</v-icon>
                </v-btn>
                <v-icon color="orange" v-else>mdi-clock-outline</v-icon>
              </template>
              <template v-else>
                <v-btn
                  density="compact"
                  color="red"
                  icon="mdi-close-circle"
                  v-if="isTeacher"
                  @click="openDialog(assignment, user)"
                >
                  <v-icon>mdi-close-circle</v-icon>
                </v-btn>
                <v-icon color="red" v-else>mdi-close-circle</v-icon>
              </template>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
    <v-text style="font-size: 24px; font-weight: bold" v-if="isTeacher">
      ดูรายชื่อวิชา {{ courseStore.currentCourse?.nameCourses }}
    </v-text>
    <v-card
      class="mx-auto"
      outlined
      style="padding: 20px; margin-top: 10px"
      v-if="isTeacher"
    >
      <v-table>
        <thead>
          <tr>
            <th class="text-center vertical-divider">รหัสนิสิต</th>
            <th class="text-center vertical-divider">ชื่อ-สกุล</th>
            <th class="text-center vertical-divider">คะแนนเต็ม</th>
            <th class="text-center vertical-divider">คะแนนที่ได้</th>
            <th
              class="text-center vertical-divider"
              v-for="assignment in assignmentStore.assignments"
              :key="assignment.assignmentId"
            >
              {{ assignment.nameAssignment }}
            </th>
          </tr>
        </thead>
        <!-- {{attendanceStore.attendances!}} -->
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.userId"
            :class="{
        'highlight-red':calculateTotalScoreAndAbsence(user.userId!, assignmentStore.assignments)
        .absentCount > 3
      }"
          >
            <td class="text-center vertical-divider">
              {{ user.studentId }}
            </td>
            <td class="vertical-divider">
              <span
                :class="{ 'highlighted-text':         calculateTotalScoreAndAbsence(user.userId!, assignmentStore.assignments)
    .absentCount > 3 }"
              >
                {{ user.firstName + " " + user.lastName }}
              </span>
            </td>
            <td class="text-center vertical-divider">
              {{ courseStore.currentCourse?.fullScore }}
            </td>
            <td class="text-center vertical-divider">
              {{
              calculateTotalScore(
                user.userId!,
                assignmentStore.assignments
              )
              }}
            </td>
            <td
              v-for="assignment in assignmentStore.assignments"
              :key="assignment.assignmentId"
              class="text-center vertical-divider"
            >
              <template
                v-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'"
              >
                <v-btn
                  density="compact"
                  color="green"
                  icon="mdi-check-circle"
                  v-if="isTeacher"
                  @click="openDialog(assignment, user)"
                >
                  <v-icon>mdi-check-circle</v-icon>
                </v-btn>
                <v-icon color="green" v-else>mdi-check-circle</v-icon>
              </template>
              <template
                v-else-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'"
              >
                <v-btn
                  density="compact"
                  color="orange"
                  icon="mdi-clock-outline"
                  v-if="isTeacher"
                  @click="openDialog(assignment, user)"
                >
                  <v-icon>mdi-clock-outline</v-icon>
                </v-btn>
                <v-icon color="orange" v-else>mdi-clock-outline</v-icon>
              </template>
              <template v-else>
                <v-btn
                  density="compact"
                  color="red"
                  icon="mdi-close-circle"
                  v-if="isTeacher"
                  @click="openDialog(assignment, user)"
                >
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
  <UpdateAttendantDialogView />
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
