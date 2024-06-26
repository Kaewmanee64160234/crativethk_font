<script lang="ts" setup>
import CreateCourseDialog from "@/components/dialogs/CreateCourseDialog.vue";
import CreateEnrolmentDialog from "@/components/dialogs/CreateEnrolmentDialog.vue";
import DeleteEnrolmentDialog from "@/components/dialogs/DeleteEnrolmentDialog.vue";
import EditCourseDialog from "@/components/dialogs/EditCourseDialog.vue";
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import type Course from "@/stores/types/Course";
import type Enrollment from "@/stores/types/Enrollment";
import { useUserStore } from "@/stores/user.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const courseStore = useCourseStore();
const userStore = useUserStore();
const router = useRouter();
const enrollmentStore = useEnrollmentStore();

onMounted(async () => {
  await userStore.getCurrentUser();
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
});
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
const goToCourseDetail = (idCourse: string, course: Course) => {
  router.push(`/courseDetail/${idCourse}`);
  courseStore.currentCourse = course;
};
const showDeleteDialog = (enrollment: Enrollment) => {
  courseStore.showDeleteDialog = true;
  enrollmentStore.currentEnrollment = enrollment;
};
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" md="4" v-for="(item, index) of enrollmentStore.enrollments" :key="index">
        <v-card style="margin-left: 10%; margin-top: 15%"
          @click="goToCourseDetail(item.course!.coursesId!, item.course!)">
          <v-img height="15vh"
            src="https://img.freepik.com/free-vector/realist-illustration-room-interior_52683-64752.jpg?w=1060&t=st=1714843452~exp=1714844052~hmac=e767aadc96b291547ce66a82185eb5e078cac3c31f6ca29c677e54174e142dbb"
            cover>
            <v-card-title style="margin-top: 5%">
              <h1 class="text-white">{{ item.course?.nameCourses }}</h1>
            </v-card-title>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn icon v-bind="props" class="ma-2" style="position: absolute; right: 0; top: 0; z-index: 2">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showDeleteDialog(item)">
                  <v-list-item-title>Unenroll</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-dialog v-model="courseStore.showDeleteDialog" persistent>
              <DeleteEnrolmentDialog />
            </v-dialog>
          </v-img>
          <v-avatar size="100" class="avatar">
            <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
          </v-avatar>
          <v-card-text>
            <div class="text-body">กลุ่มเรียนที่ {{ item.course?.session }}</div>
            <div class="text-body">อาจารย์ {{ item.course?.user?.firstName }}</div>
            <div class="text-body">
              เริมเรียนเลคเชอร์ {{ formatThaiDate(item.course?.timeInLec?.toString()) }}
            </div>
            <div class="text-body">
              เลิกเรียนเลคเชอร์ {{ formatThaiDate(item.course?.timeOutLec?.toString()) }}
            </div>
            <div class="text-body" v-if="item.course?.typeCourses === 'เลคเชอร์และแลป'">
              เริมเรียนแลป {{ formatThaiDate(item.course.timeInLab?.toString()) }}
            </div>
            <div class="text-body" v-if="item.course?.typeCourses === 'เลคเชอร์และแลป'">
              เลิกเรียนแลป {{ formatThaiDate(item.course.timeOutLab?.toString()) }}
            </div>
            <div v-else>
              <div class="text-body">เริมเรียนแลป ไม่มี</div>
              <div class="text-body">เลิกเรียนแลป ไม่มี</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <!-- <v-container class="container" fluid>
        <v-row align="center" justify="end">
            <v-col> -->
  <v-btn class="bottom-list-item" size="60" style="border-radius: 50%" variant="outlined"
    @click="courseStore.showCreateDialog = true">
    <v-icon icon="mdi-plus" size="40"></v-icon>
  </v-btn>
  <v-dialog v-model="courseStore.showCreateDialog" persistent>
    <CreateEnrolmentDialog />
  </v-dialog>
  <!-- </v-col>
        </v-row>
    </v-container> -->
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100vh;
}

.text-white {
  color: white;
}

.text-body {
  font-size: 1.25rem;
  margin-bottom: 2%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.avatar {
  position: absolute;
  top: 30%;
  right: 0%;
  transform: translate(-50%, -50%);
}

.bottom-list-item {
  position: fixed;
  bottom: 0;
  right: 0;
  margin-right: 20px;
  /* ปรับค่าตามที่คุณต้องการ */
  margin-bottom: 20px;
}
</style>

