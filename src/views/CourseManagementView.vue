<script lang="ts" setup>
import CreateCourseDialog from "@/components/dialogs/CreateCourseDialog.vue";
import EditCourseDialog from "@/components/dialogs/EditCourseDialog.vue";
import EditCourseDialog2 from "@/components/dialogs/EditCourseDialog2.vue";
import EditCourseDialog3 from "@/components/dialogs/EditCourseDialog3.vue";
import CreateCourseDialog2 from "@/components/dialogs/CreateCourseDialog2.vue";
import CreateCourseDialog3 from "@/components/dialogs/CreateCourseDialog3.vue";
import { useCourseStore } from "@/stores/course.store";
import type Course from "@/stores/types/Course";
import { useUserStore } from "@/stores/user.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type Enrollment from "@/stores/types/Enrollment";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useMessageStore } from "@/stores/message";

const courseStore = useCourseStore();
const userStore = useUserStore();
const enrollmentStore = useEnrollmentStore();
const currentStep = ref(1);
const router = useRouter();
const images = [
  "https://img.freepik.com/free-vector/realist-illustration-room-interior_52683-64752.jpg?w=1060&t=st=1714843452~exp=1714844052~hmac=e767aadc96b291547ce66a82185eb5e078cac3c31f6ca29c677e54174e142dbb",
  "https://i.pinimg.com/564x/ec/65/73/ec657382deed5cc8db3f7efb2329f7a3.jpg",
  "https://i.pinimg.com/564x/88/d0/2b/88d02b3ac90940257c7cfe02bd576ab2.jpg",
  "https://i.pinimg.com/564x/e5/76/f8/e576f8116717a0146760f8deac680893.jpg",
  "https://i.pinimg.com/736x/0c/9c/25/0c9c25cbe3f54193de0e2964eb629a65.jpg",
  "https://i.pinimg.com/564x/33/7a/d4/337ad486dba5d4532b106c77961e5559.jpg",
  "https://i.pinimg.com/564x/b4/b9/84/b4b98465bbd7d74a9b7adf1b00a8c6ec.jpg",
  "https://i.pinimg.com/564x/49/b6/53/49b6539f872e3b819706311d158d01db.jpg",
];
const randomImage = () => {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

const messageStore = useMessageStore();
onMounted(async () => {
  await userStore.getCurrentUser();
  await courseStore.getCourseByTeachId(userStore.currentUser!.userId!);
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

const advanceStep = () => {
  let hasError = false;
  if (currentStep.value === 1) {
    if (
      !courseStore.nameCourse ||
      courseStore.nameCourse.length < 1 ||
      courseStore.nameCourse.length >= 50
    ) {
      courseStore.courseNameError = "*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*";
      hasError = true;
    }
  }
  if (currentStep.value === 2) {
    if (courseStore.fullScore < 1 || courseStore.fullScore > 100) {
      courseStore.scoreError = "*กรุณากรอกตัวเลข 1-100*";
      hasError = true;
    }

    if (courseStore.timeInLec === "00:00") {
      courseStore.timeInLecError = "*กรุณากรอกเวลาเป็น HH:MM*";
      hasError = true;
    }

    if (courseStore.timeOutLec === "00:00") {
      courseStore.timeOutLecError = "*กรุณากรอกเวลาเป็น HH:MM*";
      hasError = true;
    }
    if (courseStore.typeCourse === "Lecture & Lab") {
      if (courseStore.timeInLab === "00:00") {
        courseStore.timeInLabError = "*กรุณากรอกเวลาเป็น HH:MM*";
        hasError = true;
      }

      if (courseStore.timeOutLab === "00:00") {
        courseStore.timeOutLabError = "*กรุณากรอกเวลาเป็น HH:MM*";
        hasError = true;
      }
    }
  }
  if (!hasError && currentStep.value < 3) {
    currentStep.value++;
  }
};

const advanceStep_Edit = () => {
  let hasError = false;

  if (currentStep.value === 1) {
    if (courseStore.currentCourse) {
      if (
        courseStore.currentCourse.nameCourses.length < 1 ||
        courseStore.currentCourse.nameCourses.length >= 50
      ) {
        courseStore.courseNameError = "*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*";
        hasError = true;
      }
      // if (courseStore.currentCourse!.coursesId.length < 8) {
      //   courseStore.courseIdError = "รหัสห้องเรียนต้องมีอย่างน้อย 8 ตัวอักษร";
      //   hasError = true;
      // }
    }
  }

  if (currentStep.value === 2) {
    if (
      courseStore.currentCourse!.fullScore < 1 ||
      courseStore.currentCourse!.fullScore > 100
    ) {
      courseStore.scoreError = "*กรุณากรอกตัวเลข 1-100*";
      hasError = true;
    }
    if (courseStore.currentCourse!.timeInLec === "00:00") {
      courseStore.timeInLecError = "*กรุณากรอกเวลาเป็น HH:MM*";
      hasError = true;
    }
    if (courseStore.currentCourse!.timeOutLec === "00:00") {
      courseStore.timeOutLecError = "*กรุณากรอกเวลาเป็น HH:MM*";
      hasError = true;
    }
    if (courseStore.currentCourse!.typeCourses === "Lecture & Lab") {
      if (courseStore.currentCourse!.timeInLab === "00:00") {
        courseStore.timeInLabError = "*กรุณากรอกเวลาเป็น HH:MM*";
        hasError = true;
      }
      if (courseStore.currentCourse!.timeOutLab === "00:00") {
        courseStore.timeOutLabError = "*กรุณากรอกเวลาเป็น HH:MM*";
        hasError = true;
      }
    }
  }
  if (!hasError && currentStep.value <= 3) {
    currentStep.value++;
  }
};

const retreatStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
  clearCourseError();
};
const clearCourse = () => {
  courseStore.nameCourse = "";
  courseStore.courseId = "";
  courseStore.typeCourse = "Lecture";
  courseStore.fullScore = 0;
  courseStore.session = "1";
  courseStore.dayInLab = "วันจันทร์";
  courseStore.dayInLec = "วันจันทร์";
  courseStore.timeInLab = "00:00";
  courseStore.timeOutLab = "00:00";
  courseStore.timeInLec = "00:00";
  courseStore.timeOutLec = "00:00";
};

const clearCourseError = () => {
  courseStore.courseNameError = "";
  courseStore.scoreError = "";
  courseStore.timeInLabError = "";
  courseStore.timeInLecError = "";
  courseStore.timeOutLabError = "";
  courseStore.timeOutLecError = "";
  courseStore.fileError = "";
};

const closeDialog = async () => {
  courseStore.showCreateDialog = false;
  courseStore.showEditDialog = false;
  currentStep.value = 1;
  await courseStore.getCourseByTeachId(userStore.currentUser!.userId!);
  clearCourse();
};

const finishCreation = async () => {
  if (courseStore.files.length <= 0) {
    {
      courseStore.fileError = "*กรุณาอัปโหลดไฟล์ .xlsx*";
      return;
    }
  }
  const newCourse = {
    coursesId: courseStore.courseId,
    nameCourses: courseStore.nameCourse,
    typeCourses: courseStore.typeCourse,
    credit: courseStore.credit,
    session: courseStore.session,
    dayInLab: courseStore.dayInLab,
    dayInLec: courseStore.dayInLec,
    timeInLab: courseStore.timeInLab,
    timeOutLab: courseStore.timeOutLab,
    timeInLec: courseStore.timeInLec,
    timeOutLec: courseStore.timeOutLec,
    fullScore: courseStore.fullScore,
    userId: userStore.currentUser?.userId ?? 0,
    createdDate: undefined,
    updatedDate: undefined,
    deletedDate: undefined,
  };
  try {
    await courseStore.createCourse(newCourse);
    clearCourse();
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
  messageStore.showInfo("สร้างรายวิชาเรียบร้อยแล้ว ");
  courseStore.getCourseByTeachId(userStore.currentUser!.userId!);
};

const updateCourse = async () => {
  if (enrollmentStore.selectedEnrollment.length > 0) {
    for (const id of enrollmentStore.selectedEnrollment) {
      await enrollmentStore.deleteEnrollment(id);
    }
    enrollmentStore.selectedEnrollment = [];
  }
  await courseStore.updateCourse(
    courseStore.currentCourse!.coursesId,
    courseStore.currentCourse!
  );
  currentStep.value = 1;
  courseStore.showEditDialog = false;
  messageStore.showInfo("อัปเดตรายวิชาเรียบร้อยแล้ว");
};

const delCourse = (idCourse: string, nameCourse: string, session: string) => {
  messageStore.showConfirm_(
    `ยืนยันการลบรายวิชา ${nameCourse} กลุ่มที่ ${session} ใช่หรือไม่`,
    () => confirmDelCourse(idCourse),
    () => {
      courseStore.showCreateDialog = false;
    }
  );
};

const confirmDelCourse = async (id: string) => {
  await courseStore.deleteCourse(id);
  await courseStore.getCourseByTeachId(userStore.currentUser?.userId!);
  messageStore.showInfo("ลบรายวิชาเรียบร้อยแล้ว");
};
</script>
<template>
  <v-container>
    <v-row v-if="courseStore.courses.length > 0">
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
          <v-img height="100" :src="randomImage()" cover>
            <v-card-title>
              <div class="text-white">กลุ่มเรียนที่ {{ item.session }}</div>
              <h1 class="text-white">{{ item.nameCourses }}</h1>
            </v-card-title>
            <v-menu offset-y>
              <template #activator="{ props }">
                <v-btn
                  icon
                  v-bind="props"
                  class="ma-2 text-white"
                  variant="text"
                  style="position: absolute; right: 0; top: 0; z-index: 2"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showEditDialog(item)">
                  <v-list-item-title style="color: #1e66c2"
                    ><v-icon>mdi-square-edit-outline</v-icon>
                    แก้ไขข้อมูล</v-list-item-title
                  >
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item
                  @click="delCourse(item.coursesId, item.nameCourses, item.session)"
                >
                  <v-list-item-title style="color: #cf0000"
                    ><v-icon>mdi-delete</v-icon> ลบห้องเรียน</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-menu>
          </v-img>
          <v-avatar size="100" class="avatar">
            <v-img src="https://cdn.vuetifyjs.com/images/john.png"></v-img>
          </v-avatar>
          <v-card-text>
            <div class="text-body" style="font-weight: bold">
              อาจารย์ {{ item.user?.firstName }}
            </div>
            <div class="text-body">รหัสเข้ารายวิชา {{ item.coursesId }}</div>
            <div class="text-body">
              เวลาเรียน Lecture
              {{
                item.dayInLec +
                " " +
                item.timeInLec +
                " น." +
                " - " +
                item.timeOutLec +
                " น."
              }}
            </div>
            <div class="text-body" v-if="item.typeCourses === 'Lecture & Lab'">
              เวลาเรียน Lab
              {{
                item.dayInLab +
                " " +
                item.timeInLab +
                " น." +
                " - " +
                item.timeOutLab +
                " น."
              }}
            </div>
            <div v-else>
              <div class="text-body">เวลาเรียน Lab -</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else style="padding-top: 120px">
      <v-col class="d-flex justify-center">
        <h1>ไม่มีรายวิชา</h1>
      </v-col>
    </v-row>
  </v-container>
  <v-btn
    class="bottom-list-item"
    size="60"
    style="border-radius: 50%"
    variant="elevated"
    color="#004BBC"
    @click="courseStore.showCreateDialog = true"
  >
    <v-icon icon="mdi-plus" size="40"></v-icon>
  </v-btn>
  <v-dialog v-model="courseStore.showCreateDialog" persistent>
    <v-stepper
      v-model="currentStep"
      hide-actions
      :items="['เพิ่มวิชา', 'เพิ่มรายละเอียดวิชา', 'เพิ่มรายชื่อนิสิต']"
      persistent
    >
      <template v-slot:item.1>
        <CreateCourseDialog />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ยกเลิก</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="advanceStep">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.2>
        <CreateCourseDialog2 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ยกเลิก</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
          <v-btn color="primary" @click="advanceStep">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.3>
        <CreateCourseDialog3 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ยกเลิก</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
          <v-btn color="primary" @click="finishCreation">เสร็จสิ้น</v-btn>
        </v-card-actions>
      </template>
    </v-stepper>
  </v-dialog>

  <v-dialog v-model="courseStore.showEditDialog" persistent>
    <v-stepper
      v-model="currentStep"
      hide-actions
      :items="['แก้ไขวิชา', 'แก้ไขรายละเอียดวิชา', 'แก้ไขรายชื่อนิสิต']"
      persistent
    >
      <template v-slot:item.1>
        <EditCourseDialog />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ยกเลิก</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="advanceStep_Edit">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.2>
        <EditCourseDialog2 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ยกเลิก</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="retreatStep">ย้อนกลับ</v-btn>
          <v-btn color="primary" @click="advanceStep_Edit">ถัดไป</v-btn>
        </v-card-actions>
      </template>
      <template v-slot:item.3>
        <EditCourseDialog3 />
        <v-card-actions>
          <v-btn color="error" @click="closeDialog">ยกเลิก</v-btn>
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
