<script lang="ts" setup>
import CreateCourseDialog from "@/components/dialogs/CreateCourseDialog.vue";
import DeleteCourseDialog from "@/components/dialogs/DeleteCourseDialog.vue";
import EditCourseDialog from "@/components/dialogs/EditCourseDialog.vue";
import { useAuthStore } from "@/stores/auth";
import { useCourseStore } from "@/stores/course.store";
import type Course from "@/stores/types/Course";
import { useUserStore } from "@/stores/user.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const courseStore = useCourseStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
console.log("user", courseStore.currentCourse?.user?.firstName);
onMounted(async () => {
  await userStore.getCurrentUser();
  await courseStore.getCourseByTeachId(userStore.currentUser!.teacherId!);
});

//create function click and push to /courseDetail/:idCourse
const goToCourseDetail = (idCourse: string, course: Course) => {
  router.push(`/courseDetail/${idCourse}`);
  courseStore.currentCourse = course;
};

const showEditDialog = (course: Course) => {
  courseStore.showEditDialog = true;
  courseStore.currentCourse = course;
  console.log("id course", courseStore.currentCourse?.coursesId);
};

const showDeleteDialog = (course: Course) => {
  courseStore.showDeleteDialog = true;
  courseStore.currentCourse = course;
};

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
</script>
<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-for="(item, index) of courseStore.courses"
        :key="index"
      >
        <v-card
          style="margin-left: 10%; margin-top: 15%"
          @click="goToCourseDetail(item.coursesId, item)"
        >
          <v-img
            height="100"
            src="https://img.freepik.com/free-vector/realist-illustration-room-interior_52683-64752.jpg?w=1060&t=st=1714843452~exp=1714844052~hmac=e767aadc96b291547ce66a82185eb5e078cac3c31f6ca29c677e54174e142dbb"
            cover
          >
            <v-card-title style="margin-top: 5%">
              <h1 class="text-white">{{ item.nameCourses }}</h1>
            </v-card-title>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                  class="ma-2"
                  style="position: absolute; right: 0; top: 0; z-index: 2"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showEditDialog(item)">
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="showDeleteDialog(item)">
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-dialog v-model="courseStore.showEditDialog" persistent>
              <EditCourseDialog />
            </v-dialog>
            <v-dialog v-model="courseStore.showDeleteDialog" persistent>
              <DeleteCourseDialog />
            </v-dialog>
          </v-img>
          <v-avatar size="100" class="avatar">
            <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
          </v-avatar>
          <v-card-text>
            <div class="text-body">กลุ่มเรียนที่ {{ item.session }}</div>
            <div class="text-body">อาจารย์ {{ item.user?.firstName }}</div>
            <div class="text-body">
              เริมเรียนเลคเชอร์ {{ formatThaiDate(item.timeInLec?.toString()) }}
            </div>
            <div class="text-body">
              เลิกเรียนเลคเชอร์ {{ formatThaiDate(item.timeOutLec?.toString()) }}
            </div>
            <div class="text-body" v-if="item.typeCourses === 'เลคเชอร์และแลป'">
              เริมเรียนแลป {{ formatThaiDate(item.timeInLab?.toString()) }}
            </div>
            <div class="text-body" v-if="item.typeCourses === 'เลคเชอร์และแลป'">
              เลิกเรียนแลป {{ formatThaiDate(item.timeOutLab?.toString()) }}
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
  <v-btn
    class="bottom-list-item"
    size="60"
    style="border-radius: 50%"
    variant="outlined"
    @click="courseStore.showCreateDialog = true"
  >
    <v-icon icon="mdi-plus" size="40"></v-icon>
  </v-btn>
  <v-dialog v-model="courseStore.showCreateDialog" persistent>
    <CreateCourseDialog />
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
