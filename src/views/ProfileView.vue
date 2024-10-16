<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user.store";
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useRouter } from "vue-router";
import ImageDialog from "@/components/dialogs/ImageDialog.vue";
import type Course from "../stores/types/Course";
import type { User } from "@/stores/types/User";

const tab = ref(0);
const userStore = useUserStore();
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const url = import.meta.env.VITE_API_URL;
const router = useRouter();
const images = ref<string[]>([]);
const user = ref<User | undefined>(undefined);

const isStudent = computed(() => userStore.currentUser?.role === "นิสิต");
const isTeacher = computed(() => userStore.currentUser?.role === "อาจารย์");

const showChekingHistory = (course: Course) => {
  router.push("/checkingHistory/" + course.coursesId);
};

onMounted(async () => {
  await userStore.getCurrentUser();
  if (isTeacher.value && userStore.currentUser!.role === "อาจารย์") {
    await courseStore.getCourseByTeachId(userStore.currentUser!.userId!);
  }
  if (isStudent.value && userStore.currentUser!.studentId) {
    await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
    await userStore.getUsersByStdId(userStore.currentUser!.studentId!);
    user.value = userStore.regisUser;
    images.value =
      user.value?.images?.map(
        (image: string) => `${url}/users/image/filename/${image}`
      ) ?? [];
    if (
      (images.value.length > 0 && user.value?.registerStatus == "notConfirmed") ||
      user.value?.registerStatus == "reConfirmed"
    ) {
      await userStore.createQrByStdId(user.value.studentId!);
    }
    console.log("image", images.value);
  }
  await userStore.getUsersById(userStore.currentUser?.userId!);
});
const showConditionImage = () => {
  const pdfUrl = "/pdf/condition.pdf";
  window.open(pdfUrl, "_blank");
};
const firstPart = () => {
  const major = userStore.currentUser?.major || "";
  const parts = major.split("และ").length > 1 ? major.split("และ") : major.split("เพื่อ");
  return parts[0].trim();
};
const secondPart = () => {
  const major = userStore.currentUser?.major || "";
  let parts = major.split("และ");
  let delimiter = "และ";
  if (parts.length === 1) {
    parts = major.split("เพื่อ");
    delimiter = "เพื่อ";
  }

  if (parts.length > 1) {
    return delimiter + parts[1].trim();
  }
  return "";
};
</script>

<template>
  <v-container style="padding-top: 120px">
    <v-text style="font-size: 24px; font-weight: bold">ประวัติผู้ใช้งาน</v-text>
    <!-- Profile Card -->
    <v-row class="my-4">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col col="4" class="d-flex justify-center align-center">
                <img   style="
                    width: 200px;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 50%;
                  "  :src="`${userStore.currentUser!.profileImage}`"/>

              
              </v-col>
              <v-col col="4" v-if="userStore.currentUser">
                <v-row>
                  <v-col cols="12">
                    <strong style="color: #093271">ชื่อ-นามสกุล </strong
                    >{{ userStore.currentUser?.firstName }}
                    {{ userStore.currentUser?.lastName }}
                  </v-col>
                  <v-col cols="12" v-if="isStudent">
                    <strong style="color: #093271">รหัสนิสิต </strong
                    >{{ userStore.currentUser?.studentId }}
                  </v-col>
                  <v-col cols="12" v-if="isStudent">
                    <strong style="color: #093271">ชั้นปี </strong
                    >{{ userStore.currentUser?.year }}
                  </v-col>
                  <v-col cols="12" v-if="isTeacher" style="white-space: pre-wrap">
                    <strong style="color: #093271">สาขา </strong
                    >{{ userStore.currentUser?.major }}
                  </v-col>
                  <v-col cols="12" md="9" v-if="isStudent" style="white-space: pre-wrap">
                    <strong style="color: #093271">สาขา </strong>
                    <span>{{ firstPart() }}</span>
                    <br v-if="secondPart()" />
                    <span v-if="secondPart()" style="margin-left: 18%">{{
                      secondPart()
                    }}</span>
                  </v-col>
                  <v-col cols="12">
                    <strong style="color: #093271">ตำแหน่ง </strong
                    >{{ userStore.currentUser?.role }}
                  </v-col>
                  <v-col cols="12">
                    <strong style="color: #093271">สถานภาพ </strong>
                    <span style="color: #00a341">{{
                      userStore.currentUser?.status
                    }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col col="2" v-if="isStudent">
                <v-img
                  :src="userStore.QR"
                  style="width: 200px; height: 200px; object-fit: cover"
                ></v-img>
              </v-col>
              <v-col col="2">
                <v-row>
                  <v-col>
                    <v-btn
                      color="blue"
                      @click="userStore.showImageDialog = true"
                      v-if="isStudent"
                    >
                      อัปโหลดรูปภาพ
                    </v-btn>
                  </v-col>
                  <v-col class="d-flex mt-16" v-if="isStudent">
                    <v-btn
                      variant="text"
                      color="#004BBC"
                      style="text-decoration: underline"
                      @click="showConditionImage"
                    >
                      คลิกเพื่อดูเงื่อนไขการถ่ายรูป
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Attendance History Tab -->
    <v-row>
      <v-col cols="12">
        <v-card v-if="isTeacher || isStudent">
          <v-tabs v-model="tab" bg-color="primary">
            <v-tab style="margin-top: auto">ประวัติการเช็คชื่อ</v-tab>
          </v-tabs>
          <v-card-text>
            <v-tab-item v-if="tab === 0">
              <v-table dense>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left" style="font-weight: bold">รายวิชา</th>
                      <th class="text-center"></th>
                    </tr>
                  </thead>
                  <tbody v-if="isStudent && enrollmentStore.enrollments.length > 0">
                    <tr
                      v-for="(item, index) of enrollmentStore.enrollments"
                      :key="index"
                      style="font-weight: bold"
                    >
                      <td>
                        {{
                          item.course?.nameCourses +
                          " " +
                          "กลุ่มที่" +
                          " " +
                          item.course?.session
                        }}
                      </td>
                      <td class="text-center">
                        <v-btn
                          size="small"
                          variant="text"
                          color="#004BBC"
                          style="text-decoration: underline"
                          @click="showChekingHistory(item.course!)"
                          class="ma-2"
                        >
                          ดูรายละเอียด
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-if="isTeacher && courseStore.courses.length > 0">
                    <tr v-for="(item, index) of courseStore.courses" :key="index">
                      <td>
                        {{ item.nameCourses + " " + "กลุ่มที่" + " " + item.session }}
                      </td>
                      <td class="text-center">
                        <v-btn
                          size="small"
                          variant="text"
                          color="#004BBC"
                          style="text-decoration: underline"
                          @click="showChekingHistory(item)"
                          class="ma-2"
                        >
                          ดูรายละเอียด
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-if="isStudent && enrollmentStore.enrollments.length < 1">
                    <tr>
                      <td
                        style="
                          text-align: center;
                          color: #cf0000;
                          padding-top: 3%;
                          font-weight: bold;
                        "
                        colspan="100%"
                      >
                        ไม่มีรายวิชา
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-if="isTeacher && courseStore.courses.length < 1">
                    <tr>
                      <td
                        style="
                          text-align: center;
                          color: #cf0000;
                          padding-top: 3%;
                          font-weight: bold;
                        "
                        colspan="100%"
                      >
                        ไม่มีรายวิชา
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-table>
            </v-tab-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Image Dialog -->
  <v-dialog v-model="userStore.showImageDialog" persistent max-width="800px">
    <ImageDialog></ImageDialog>
  </v-dialog>
</template>

<style scoped>
.circle-image {
  border-radius: 50%;
}

.v-card-title {
  background-color: #3051ac;
  color: white;
  padding: 10px;
}

.v-card-text {
  padding: 20px;
}

.v-btn {
  margin-top: 10px;
}

.v-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  border-radius: 50%;
}
</style>
