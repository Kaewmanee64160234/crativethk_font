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
const courseId = ref("");
const userStore = useUserStore();
const codeCourse = ref("");
const messageStore = useMessageStore();


onMounted(async () => {
  courseStore.getCourses();
  await userStore.getCurrentUser();

});
const saveEnrollment = () => {
  if (codeCourse.value.length < 10) {
    messageStore.showError("Please enter your password.");
    courseStore.showCreateDialog = false
    return;
  }
  for (let i = 0; i < courseStore.courses.length; i++) {
    if (codeCourse.value == courseStore.courses[i].codeCourses) {
      //วน check ว่ามี courseId ที่ตรงกับที่กรอกมาหรือไม่
      console.log("enrollment", courseStore.courses[i]);
      const newEnrollment = {
        userId: userStore.currentUser?.userId ?? 0, 
        courseId: courseStore.courses[i].coursesId,
        createdDate: undefined,
        updatedDate: undefined,
        deletedDate: undefined,
      };
      try {
        // ส่งคำขอสร้าง enrollment
        enrollmentStore.createEnrollment(newEnrollment);
        console.log("enrollment", newEnrollment);
        courseStore.showCreateDialog2= true;
        codeCourse.value = "";
      } catch (error) {
        console.error("Error creating enrollment:", error);
      }
    } else {
      console.log("no courseID"); // ไม่มี courseId ที่ตรงกับที่กรอกมา
      codeCourse.value = "";
      messageStore.showError("The password is incorrect. Please try again.");
      courseStore.showCreateDialog = false
      return;
    }
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title>
            <h2>เข้าร่วมชั้นเรียน</h2>
          </v-card-title>
          <v-card-text>
            <v-card class="mb-4">
              <v-card-title>
                <h3>รหัสห้องเรียน</h3>
              </v-card-title>
              <v-card-text>
                <div class="title">
                  สอบถามรหัสห้องเรียนจากอาจารย์ผู้สอน หลังจากนั้นให้กรอกลงในช่องด้านล่าง
                </div>
                <v-text-field
                  clearable
                  label="รหัสห้องเรียน"
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
          <v-card-actions class="d-flex justify-end">
            <v-btn @click="courseStore.showCreateDialog = false">ยกเลิก</v-btn>
            <v-btn @click="saveEnrollment" class="colorText">ต่อไป</v-btn>
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
.colorText {
  color: #2a6ec5;
}
.title {
  word-wrap: break-word;
  white-space: normal;
  margin-bottom: 2%;
}
</style>
