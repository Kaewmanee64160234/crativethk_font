<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { onMounted, ref } from "vue";
import { useEnrollmentStore } from "@/stores/enrollment.store";
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();

const selectedCheckboxes = ref<{ [key: number]: boolean }>({});

onMounted(async () => {
  await enrollmentStore.getStudentByCourseId(courseStore.currentCourse!.coursesId);
  enrollmentStore.enrollments.forEach(item => {
    selectedCheckboxes.value[item.enrollmentId!] = true;
  });
});

function handleCheckboxChange(enrollmentId: number, checked: boolean) {
  if (!checked) {
    enrollmentStore.selectedEnrollment.push(enrollmentId);
  } else {
    enrollmentStore.selectedEnrollment = enrollmentStore.selectedEnrollment.filter(id => id !== enrollmentId); // ลบ id เมื่อไม่ถูกเลือก
  }
  console.log("สถานะการเลือก", enrollmentStore.selectedEnrollment);
}
</script>

<template>
  <v-card-title>
    <h3>แก้ไขรายชื่อนิสิต</h3>
  </v-card-title>
  <v-card-text>
    <v-card variant="outlined" class="textarea" style="width: 90%; overflow-y: scroll">
      <v-card-title>
        <p>เลือกนิสิตที่ต้องการให้อยู่ในรายวิชา</p>
      </v-card-title>
      <div v-if="enrollmentStore.enrollments.length > 0">
        <v-row v-for="(item, index) of enrollmentStore.enrollments" :key="index" align="center">
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
              v-model="selectedCheckboxes[item.enrollmentId!]"
              @change="handleCheckboxChange(item.enrollmentId!, selectedCheckboxes[item.enrollmentId!])"
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
  </v-card-text>
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
