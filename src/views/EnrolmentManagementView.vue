<script lang="ts" setup>
import CreateEnrolmentDialog from "@/components/dialogs/CreateEnrolmentDialog.vue";
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useMessageStore } from "@/stores/message";
import type Course from "@/stores/types/Course";
import { useUserStore } from "@/stores/user.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const courseStore = useCourseStore();
const messageStore = useMessageStore();
const userStore = useUserStore();
const router = useRouter();
const enrollmentStore = useEnrollmentStore();
const images = ["https://img.freepik.com/free-vector/realist-illustration-room-interior_52683-64752.jpg?w=1060&t=st=1714843452~exp=1714844052~hmac=e767aadc96b291547ce66a82185eb5e078cac3c31f6ca29c677e54174e142dbb",
  "https://i.pinimg.com/564x/ec/65/73/ec657382deed5cc8db3f7efb2329f7a3.jpg",
  "https://i.pinimg.com/564x/88/d0/2b/88d02b3ac90940257c7cfe02bd576ab2.jpg",
  "https://i.pinimg.com/564x/e5/76/f8/e576f8116717a0146760f8deac680893.jpg",
  "https://i.pinimg.com/736x/0c/9c/25/0c9c25cbe3f54193de0e2964eb629a65.jpg",
  "https://i.pinimg.com/564x/33/7a/d4/337ad486dba5d4532b106c77961e5559.jpg",
  "https://i.pinimg.com/564x/b4/b9/84/b4b98465bbd7d74a9b7adf1b00a8c6ec.jpg",
  "https://i.pinimg.com/564x/49/b6/53/49b6539f872e3b819706311d158d01db.jpg"
]
const randomImage = () => {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}

onMounted(async () => {
  await userStore.getUsersById(userStore.currentUser?.userId!);
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
})
const goToCourseDetail = (idCourse: string, course: Course) => {
  router.push(`/courseDetail/${idCourse}`);
  courseStore.currentCourse = course;
};
const delEnrolment = (idEnrollment: number,nameCourse: string) => {
  messageStore.showConfirm_(`ต้องการออกจากวิชา ${nameCourse} ใช่หรือไม่`, () => confirmDelEnrolment(idEnrollment), () => { courseStore.showCreateDialog = false; });
}
const confirmDelEnrolment = async (id: number) => {
  await enrollmentStore.deleteEnrollment(id);
  messageStore.showInfo("ลบรายวิชาเรียบร้อยแล้ว");
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
}
</script>
<template>
  <v-container>
    <v-row v-if="enrollmentStore.enrollments.length > 0">
      <v-col cols="12" sm="6" md="4" v-for="(item, index) of enrollmentStore.enrollments" :key="index">
        <v-card style="margin-left: 10%; margin-top: 15%"
          @click="goToCourseDetail(item.course!.coursesId!, item.course!)">
          <v-img height="100" :src="randomImage()" cover>
            <v-card-title>
              <div class="text-white">
                กลุ่มเรียนที่ {{ item.course?.session }}
              </div>
              <h1 class="text-white">{{ item.course?.nameCourses }}</h1>
            </v-card-title>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn icon v-bind="props" class="ma-2 text-white" variant="text"
                  style="position: absolute; right: 0; top: 0; z-index: 2">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="delEnrolment(item.enrollmentId!,item.course?.nameCourses!)">
                  <v-list-item-title style="color: #CF0000;"><v-icon>mdi-delete</v-icon>ลบห้องเรียน</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-img>
          <v-avatar size="100" class="avatar">
            <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
          </v-avatar>
          <v-card-text>
            <div class="text-body" style="font-weight: bold;">อาจารย์ {{ item.course?.user?.firstName }}</div>
            <div class="text-body">
              เวลาเริ่มเรียน Lecture {{ item.course?.dayInLec +" "+ item.course?.timeInLec + " น." + " - " +
                item.course?.timeOutLec + " น." }}
            </div>
            <div class="text-body" v-if="item.course?.typeCourses === 'Lecture & Lab'">
              เวลาเริ่มเรียน Lab {{ item.course?.dayInLec +" "+ item.course.timeInLab + " น." + " - " +
                item.course.timeOutLab + " น." }}
            </div>
            <div v-else>
              <div class="text-body">เวลาเริ่มเรียน Lab -</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else style="padding-top: 120px;">
      <v-col class="d-flex justify-center">
        <h1>ไม่มีรายวิชาที่ลงทะเบียน</h1>
      </v-col>
    </v-row>
  </v-container>
  <v-btn class="bottom-list-item" size="60" style="border-radius: 50%" variant="outlined"
    @click="courseStore.showCreateDialog = true">
    <v-icon icon="mdi-plus" size="40"></v-icon>
  </v-btn>
  <v-dialog v-model="courseStore.showCreateDialog">
    <CreateEnrolmentDialog />
  </v-dialog>
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
@media (max-width: 600px) {
  .avatar {
    top: 25%;
  }
}
</style>
