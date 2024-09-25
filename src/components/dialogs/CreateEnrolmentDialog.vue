<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import CreateEnrolmentDialog2 from "./CreateEnrolmentDialog2.vue";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { onMounted, ref } from "vue";
import course from "@/services/course";
import { useUserStore } from "@/stores/user.store";
import { useMessageStore } from "@/stores/message";
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const userStore = useUserStore();
const codeCourse = ref("");
const messageStore = useMessageStore();


onMounted(async () => {
  courseStore.getCourses();
  await userStore.getUsersById(userStore.currentUser?.userId!);

});
const saveEnrollment = () => {
  if (codeCourse.value.length < 10) {
    messageStore.showError("กรุณากรอกรหัสวิชาให้ครบ 10 ตัวอักษร");
    courseStore.showCreateDialog = false;
    return;
  }

  let courseFound = false;

  for (let i = 0; i < courseStore.courses.length; i++) {
    console.log("enrollment", courseStore.courses[i]);
    if (codeCourse.value === courseStore.courses[i].codeCourses) {
      // for (let j = 0; j < enrollmentStore.enrollments.length; j++) {
      //   if (codeCourse.value === userStore.currentUser.) {
      //     messageStore.showError("คุณได้เข้าร่วมวิชานี้แล้ว");
      //     courseStore.showCreateDialog = false;
      //     return;
      //   }
      // }
      courseFound = true;

      const newEnrollment = {
        userId: userStore.currentUser?.userId ?? 0,
        courseId: courseStore.courses[i].coursesId,
        createdDate: undefined,
        updatedDate: undefined,
        deletedDate: undefined,
      };

      try {
        enrollmentStore.createEnrollment(newEnrollment);
        console.log("enrollment", newEnrollment);
        courseStore.showCreateDialog2 = true;
        codeCourse.value = "";
        return;
      } catch (error) {
        console.error("Error creating enrollment:", error);
        messageStore.showError("เกิดข้อผิดพลาดในการสร้าง enrollment");
      }
    }
  }

  if (!courseFound) {
    console.log("no courseID"); 
    codeCourse.value = ""; 
    messageStore.showError("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    courseStore.showCreateDialog = false;
  }
};


</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title style="text-align: center;">
            <h2>เข้าร่วมรายวิชา</h2>
          </v-card-title>
          <v-card-text>
            <v-card class="mb-4">
              <v-card-title>
                <h4>รหัสวิชาที่เข้าร่วม</h4>
              </v-card-title>
              <v-card-text>
                <h3 class="colorText">*รหัสห้องเรียนต้องมีตัวอักษรอย่างน้อย 8 ตัวอักษร</h3>
                <v-text-field
                  clearable
                  label="รหัสวิชา"
                  variant="outlined"
                  v-model="codeCourse"
                  :rules="[
                    (v: string) =>
                    /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{10,}$/.test(v) ||
                      'โปรดกรอกรหัสห้องเรียน 10 ตัวอักษร',
                  ]"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions class="d-flex justify-end" >
            <v-btn style="font-weight: bold;" color="error" @click="courseStore.showCreateDialog = false">ยกเลิก</v-btn>
            <v-spacer></v-spacer>
            <v-btn style="font-weight: bold;" @click="saveEnrollment" color="primary">ต่อไป</v-btn>
          </v-card-actions>
          <v-dialog v-model="courseStore.showCreateDialog2" persistent>
            <CreateEnrolmentDialog2 />
          </v-dialog>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.title {
  word-wrap: break-word;
  white-space: normal;
  margin-bottom: 2%;
}
.colorText {
  color: red;
}
</style>
