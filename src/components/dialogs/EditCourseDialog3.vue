<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { onMounted, ref } from "vue";
import { useEnrollmentStore } from "@/stores/enrollment.store";
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const selectedEnrollment = ref<number[]>([]);

const deleteSelectedEnrollments = async () => {
  for (const id of selectedEnrollment.value) {
    await enrollmentStore.deleteEnrollment(id);
  }
  selectedEnrollment.value = []; // Clear selected enrollments
  courseStore.closeDialog2();
};

onMounted(async () => {
  await enrollmentStore.getStudentByCourseId(courseStore.currentCourse!.coursesId);
});
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-card style="width: 100%; max-width: 500px">
        <v-card-title class="title">
          <h2>แก้ไขรายชื่อนิสิต</h2>
        </v-card-title>
        <v-card
          variant="outlined"
          class="textarea"
          style="width: 90%; overflow-y: scroll"
        >
          <v-card-title>
            <div>เลือกนิสิตที่จะลบออกจากวิชานี้</div>
          </v-card-title>
          <div v-if="enrollmentStore.enrollments.length < 0">
            <v-row
              v-for="(item, index) of enrollmentStore.enrollments"
              :key="index"
              align="center"
            >
              <v-col cols="auto">
                <v-avatar size="50">
                  <v-img :src="item.user?.profileImage"></v-img>
                </v-avatar>
              </v-col>
              <v-col>
                <h3>{{ item.user?.firstName }} {{ item.user?.lastName }}</h3>
                <p>{{ item.user?.email }}</p>
              </v-col>
              <v-col cols="auto">
                <v-checkbox
                  color="primary"
                  v-model="selectedEnrollment"
                  :value="item.enrollmentId"
                ></v-checkbox>
              </v-col>
            </v-row>
          </div>
          <div v-else>
            <v-row>
              <v-col style="text-align: center; color: red">
                <p>ไม่มีนิสิตที่ลงทะเบียนในวิชานี้</p>
              </v-col>
            </v-row>
          </div>
        </v-card>
        <v-card-actions class="actions">
          <v-btn @click="courseStore.closeDialog2">ยกเลิก</v-btn>
          <v-btn @click="deleteSelectedEnrollments" class="colorText">เสร็จสิ้น</v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<style scoped>
.title {
  margin-left: 3%;
  margin-top: 1%;
}

.textarea {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  border-color: #e0e0e0;
}

.actions {
  justify-content: flex-end;
}

.colorText {
  color: #2a6ec5;
}
</style>
