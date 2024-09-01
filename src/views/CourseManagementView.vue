<script lang="ts" setup>
import CreateCourseDialog from "@/components/dialogs/CreateCourseDialog.vue";
import DeleteCourseDialog from "@/components/dialogs/DeleteCourseDialog.vue";
import EditCourseDialog from "@/components/dialogs/EditCourseDialog.vue";
import EditCourseDialog2 from "@/components/dialogs/EditCourseDialog2.vue";
import EditCourseDialog3 from "@/components/dialogs/EditCourseDialog3.vue";
import CreateCourseDialog2 from "@/components/dialogs/CreateCourseDialog2.vue";
import CreateCourseDialog3 from "@/components/dialogs/CreateCourseDialog3.vue";
import { useAuthStore } from "@/stores/auth";
import { useCourseStore } from "@/stores/course.store";
import type Course from "@/stores/types/Course";
import { useUserStore } from "@/stores/user.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type Enrollment from "@/stores/types/Enrollment";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import Swal from "sweetalert2";
import { useMessageStore } from "@/stores/message";
import course from "@/services/course";
const courseStore = useCourseStore();
const userStore = useUserStore();
const enrollmentStore = useEnrollmentStore();
const currentStep = ref(1);
const router = useRouter();
const messageStore = useMessageStore();
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

const advanceStep = () => {
  if (currentStep.value === 1) {
    if (!courseStore.currentCourse) {
      if (
        courseStore.nameCourse.length <= 0 || courseStore.nameCourse.length >= 100 ||
        courseStore.courseId.length < 8
      ) {
        messageStore.showError("กรุณากรอกข้อมูลให้ครบถ้วน");
        closeDialog();
        return;
      }
    } else {
      if (
        courseStore.currentCourse.nameCourses.length <= 0 || courseStore.currentCourse.nameCourses.length >= 100
      ) {
        messageStore.showError("กรุณากรอกข้อมูลให้ครบถ้วน");
        courseStore.showEditDialog = false;
        courseStore.getCourseByTeachId(userStore.currentUser!.teacherId!);
        return;
      }
    }
  }

  if (currentStep.value === 2) {
    if (!courseStore.currentCourse) {
      if (
        courseStore.session.length <= 0 || courseStore.session.length >= 10 ||
        courseStore.fullScore <= 0 || courseStore.fullScore > 100
      ) {
        messageStore.showError("กรุณากรอกข้อมูลให้ถูกต้อง");
        closeDialog();
        return;
      }
    } else {
      if (
        courseStore.currentCourse.session.length <= 0 || courseStore.currentCourse.session.length >= 10 ||
        courseStore.currentCourse.fullScore <= 0 || courseStore.currentCourse.fullScore > 100 || courseStore.currentCourse.coursesId.length < 8
      ) {
        messageStore.showError("กรุณากรอกข้อมูลให้ถูกต้อง");
        courseStore.showEditDialog = false;
        courseStore.getCourseByTeachId(userStore.currentUser!.teacherId!);
        return;
      }
    }
  }
  if (currentStep.value <= 3) {
    currentStep.value++;
  }
};


const retreatStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const closeDialog = () => {
  courseStore.showCreateDialog = false;
  courseStore.showEditDialog = false;
  currentStep.value = 1;
  courseStore.nameCourse = "";
  courseStore.courseId = "";
  courseStore.typeCourse = "เลคเชอร์";
  courseStore.credit = 0;
  courseStore.session = "1";
  courseStore.stdAmount = 0;
  courseStore.timeInLab = new Date();
  courseStore.timeOutLab = new Date();
  courseStore.timeInLec = new Date();
  courseStore.timeOutLec = new Date();
};

const finishCreation = async () => {
  console.log("file", courseStore.files.length)
  if (courseStore.files.length <= 0) {
    {
      messageStore.showError("กรุณาเลือกไฟล์เพื่อใส่รายชื่อนิสิต");
      closeDialog();
      return;
    }
  }
  const newCourse = {
    coursesId: courseStore.courseId,
    nameCourses: courseStore.nameCourse,
    codeCourses: "",
    typeCourses: courseStore.typeCourse,
    credit: courseStore.credit,
    session: courseStore.session,
    stdAmount: courseStore.stdAmount,
    timeInLab: courseStore.timeInLab,
    timeOutLab: courseStore.timeOutLab,
    timeInLec: courseStore.timeInLec,
    timeOutLec: courseStore.timeOutLec,
    fullScore: courseStore.fullScore,
    userId: userStore.currentUser?.userId ?? 0,
    createdDate: undefined,
    updatedDate: undefined,
    deletedDate: undefined, //mockup data ข้อมูลไม่ตรงกับหลังบ้าน
  };
  try {
    // ส่งคำขอสร้าง course
    await courseStore.createCourse(newCourse);
    console.log("course", newCourse);
    courseStore.nameCourse = "";
    courseStore.courseId = "";
    courseStore.typeCourse = "เลคเชอร์";
    courseStore.credit = 0;
    courseStore.session = "1";
    courseStore.stdAmount = 0;
    courseStore.timeInLab = new Date();
    courseStore.timeOutLab = new Date();
    courseStore.timeInLec = new Date();
    courseStore.timeOutLec = new Date();
    for (let i = 0; i < courseStore.files.length; i++) {
      for (let j = 0; j < userStore.users.length; j++) {
        if (courseStore.files[i].id == userStore.users[j].studentId) {
          console.log("enrollment", courseStore.files[i].id, userStore.users[j].userId);
          const newEnrollment: Enrollment = {
            userId: userStore.users[j].userId ?? 0,
            courseId: courseStore.currentCourse!.coursesId,
            createdDate: undefined,
            updatedDate: undefined,
            deletedDate: undefined,
          };
          enrollmentStore.createEnrollment(newEnrollment);
        }
      }
    }
  } catch (error) {
    console.error("Error creating course:", error);
  }
  courseStore.showCreateDialog = false;
  currentStep.value = 1; // Close the dialog after completion
  courseStore.getCourseByTeachId(userStore.currentUser!.teacherId!);
};

const updateCourse = () => {
  courseStore.updateCourse(courseStore.currentCourse!.coursesId, courseStore.currentCourse!);
  currentStep.value = 1;
  courseStore.showEditDialog = false;
  if (enrollmentStore.selectedEnrollment.length > 0) {
    for (const id of enrollmentStore.selectedEnrollment) {
      enrollmentStore.deleteEnrollment(id);
    }
    enrollmentStore.selectedEnrollment = [];
  }
  messageStore.showInfo("Successfully updated course.");
}
</script>
<template>
  <v-container>
    <v-row v-if="courseStore.courses.length > 0">
      <v-col cols="12" sm="6" md="4" v-for="(item, index) of courseStore.courses" :key="index">
        <v-card style="margin-left: 10%; margin-top: 15%" @click="goToCourseDetail(item.coursesId, item)">
          <v-img height="100"
            src="https://img.freepik.com/free-vector/realist-illustration-room-interior_52683-64752.jpg?w=1060&t=st=1714843452~exp=1714844052~hmac=e767aadc96b291547ce66a82185eb5e078cac3c31f6ca29c677e54174e142dbb"
            cover>
            <v-card-title style="margin-top: 5%">
              <h1 class="text-white">{{ item.nameCourses }}</h1>
            </v-card-title>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn icon v-bind="props" class="ma-2" style="position: absolute; right: 0; top: 0; z-index: 2">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showEditDialog(item)">
                  <v-list-item-title>แก้ไข</v-list-item-title>
                </v-list-item>
                <v-list-item @click="showDeleteDialog(item)">
                  <v-list-item-title>ลบ</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-dialog v-model="courseStore.showDeleteDialog" persistent>
              <DeleteCourseDialog />
            </v-dialog>
          </v-img>
          <v-avatar size="100" class="avatar">
            <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
          </v-avatar>
          <v-card-text>
            <div class="text-body">
              กลุ่มเรียนที่ {{ item.session }}
            </div>
            <div class="text-body">อาจารย์ {{ item.user?.firstName }}</div>
            <div class="text-body"> รหัสห้อง {{ item.codeCourses }}</div>
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
    <v-row v-else style="padding-top: 120px;">
      <v-col class="d-flex justify-center">
        <h1>ไม่มีรายวิชา</h1></v-col>
    </v-row>
  </v-container>
  <v-btn class="bottom-list-item" size="60" style="border-radius: 50%" variant="outlined"
    @click="courseStore.showCreateDialog = true">
    <v-icon icon="mdi-plus" size="40"></v-icon>
  </v-btn>
  <v-dialog v-model="courseStore.showCreateDialog" persistent>
    <v-stepper v-model="currentStep" hide-actions
      :items="['เพิ่มห้องเรียน', 'รายละเอียดห้องเรียน', 'เพิ่มรายชื่อนิสิต']" persistent>
      <template v-slot:item.1>
        <CreateCourseDialog />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ปิด</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="advanceStep">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.2>
        <CreateCourseDialog2 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ปิด</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
          <v-btn color="primary" @click="advanceStep">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.3>
        <CreateCourseDialog3 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ปิด</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
          <v-btn color="primary" @click="finishCreation">เสร็จสิ้น</v-btn>
        </v-card-actions>
      </template>
    </v-stepper>
  </v-dialog>

  <v-dialog v-model="courseStore.showEditDialog" persistent>
    <v-stepper v-model="currentStep" hide-actions
      :items="['แก้ไขห้องเรียน', 'แก้ไขรายละเอียดห้องเรียน', 'แก้ไขรายชื่อนิสิต']" persistent>
      <template v-slot:item.1>
        <EditCourseDialog />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ปิด</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="advanceStep">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.2>
        <EditCourseDialog2 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ปิด</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
          <v-btn color="primary" @click="advanceStep">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.3>
        <EditCourseDialog3 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ปิด</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
          <v-btn color="primary" @click="updateCourse">เสร็จสิ้น</v-btn>
        </v-card-actions>
      </template>
    </v-stepper>
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
