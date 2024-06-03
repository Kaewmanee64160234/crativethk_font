<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import CreateEnrolmentDialog2 from "./CreateEnrolmentDialog2.vue";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { onMounted, ref } from "vue";
import course from "@/services/course";
import { useUserStore } from "@/stores/user.store";
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const courseId = ref("");
const userStore = useUserStore();
const codeCourse = ref("");


onMounted(async () => {
  courseStore.getCourses();
  await userStore.getCurrentUser();

});
const saveEnrollment = () => {
  if (codeCourse.value.length < 8) {
    console.log("no data");
    return;
  }
  for (let i = 0; i < courseStore.courses.length; i++) {
    if (codeCourse.value == courseStore.courses[i].codeCourses) {
      //วน check ว่ามี courseId ที่ตรงกับที่กรอกมาหรือไม่
      console.log("enrollment", courseStore.courses[i]);
      const newEnrollment = {
        userId: userStore.currentUser?.userId, ///mouckup data
        courseId: courseId.value,
        createdDate: undefined,
        updatedDate: undefined,
        deletedDate: undefined,
      };
      try {
        // ส่งคำขอสร้าง enrollment
        enrollmentStore.createEnrollment(newEnrollment);
        console.log("enrollment", newEnrollment);
        courseStore.showCreateDialog2 = true;
        codeCourse.value = "";
      } catch (error) {
        console.error("Error creating enrollment:", error);
      }
    } else {
      console.log("no courseID"); // ไม่มี courseId ที่ตรงกับที่กรอกมา
      codeCourse.value = "";
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
                    (v) =>
                      /^[A-Za-z0-9]{8,}$/.test(v) ||
                      'โปรดกรอกรหัสห้องเรียนอย่างน้อย 8 ตัวอักษร',
                  ]"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions class="d-flex justify-end">
            <v-btn @click="courseStore.closeDialog">ยกเลิก</v-btn>
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
