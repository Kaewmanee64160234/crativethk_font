<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { ref, watch } from "vue";
import EditCourseDialog3 from "./EditCourseDialog3.vue";
import { useUserStore } from "@/stores/user.store";
const courseStore = useCourseStore();
const userStore = useUserStore();
const selectedDate = ref(new Date());
const showDatePicker = ref(false);
const selectedTime = ref("00:00");
const showTimePicker = ref(false);
const selectedDate2 = ref(new Date());
const showDatePicker2 = ref(false);
const selectedTime2 = ref("00:00");
const showTimePicker2 = ref(false);
const selectedDate3 = ref(new Date());
const showDatePicker3 = ref(false);
const selectedTime3 = ref("00:00");
const showTimePicker3 = ref(false);
const selectedDate4 = ref(new Date());
const showDatePicker4 = ref(false);
const selectedTime4 = ref("00:00");
const showTimePicker4 = ref(false);

function formatThaiDate(date: Date) {
  return date
    .toLocaleDateString("th-TH", {
      weekday: "long", // Full weekday name
    })
    .replace(".", "");
}

if (courseStore.currentCourse?.timeInLec) {
  const timeInLec = new Date(courseStore.currentCourse.timeInLec);
  selectedDate.value = timeInLec;
  selectedTime.value = `${timeInLec.getHours()}:${timeInLec.getMinutes()}`;
}
if (courseStore.currentCourse?.timeOutLec) {
  const timeOutLec = new Date(courseStore.currentCourse.timeOutLec);
  selectedDate2.value = timeOutLec;
  selectedTime2.value = `${timeOutLec.getHours()}:${timeOutLec.getMinutes()}`;
}
if (courseStore.currentCourse?.timeInLab) {
  const timeInLab = new Date(courseStore.currentCourse.timeInLab);
  selectedDate3.value = timeInLab;
  selectedTime3.value = `${timeInLab.getHours()}:${timeInLab.getMinutes()}`;
}
if (courseStore.currentCourse?.timeOutLab) {
  const timeOutLab = new Date(courseStore.currentCourse.timeOutLab);
  selectedDate4.value = timeOutLab;
  selectedTime4.value = `${timeOutLab.getHours()}:${timeOutLab.getMinutes()}`;
}

// watch(
//   () => courseStore.currentCourse?.timeInLec,
//   (newVal) => {
//     if (newVal) {
//       const timeInLec = new Date(newVal);
//       selectedDate.value = timeInLec;
//       selectedTime.value = `${timeInLec.getHours()}:${timeInLec.getMinutes()}`;
//     }
//   }
// );

// watch(
//   () => courseStore.currentCourse?.timeOutLec,
//   (newVal) => {
//     if (newVal) {
//       const timeOutLec = new Date(newVal);
//       selectedDate2.value = timeOutLec;
//       selectedTime2.value = `${timeOutLec.getHours()}:${timeOutLec.getMinutes()}`;
//     }
//   }
// );

// watch(
//   () => courseStore.currentCourse?.timeInLab,
//   (newVal) => {
//     if (newVal) {
//       const timeInLab = new Date(newVal);
//       selectedDate3.value = timeInLab;
//       selectedTime3.value = `${timeInLab.getHours()}:${timeInLab.getMinutes()}`;
//     }
//   }
// );

// watch(
//   () => courseStore.currentCourse?.timeOutLab,
//   (newVal) => {
//     if (newVal) {
//       const timeOutLab = new Date(newVal);
//       selectedDate4.value = timeOutLab;
//       selectedTime4.value = `${timeOutLab.getHours()}:${timeOutLab.getMinutes()}`;
//     }
//   }
// );
function formatISODateTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(":");
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toISOString();
}

const editCourse2 = () => {
  if (courseStore.currentCourse) {
    if (
      courseStore.currentCourse.coursesId.length < 8 ||
      courseStore.currentCourse.credit <= 0 ||
      courseStore.currentCourse.session === "" ||
      courseStore.currentCourse.stdAmount <= 0 ||
      courseStore.currentCourse.fullScore <= 0
    ) {
      console.log("no data");
      return;
    } else {
      courseStore.currentCourse.timeInLec = new Date(
        formatISODateTime(selectedDate.value, selectedTime.value)
      );
      courseStore.currentCourse.timeOutLec = new Date(
        formatISODateTime(selectedDate2.value, selectedTime2.value)
      );
      if (courseStore.currentCourse.typeCourses === "เลคเชอร์และแลป") {
        courseStore.currentCourse.timeInLab = new Date(
          formatISODateTime(selectedDate3.value, selectedTime3.value)
        );
        courseStore.currentCourse.timeOutLab = new Date(
          formatISODateTime(selectedDate4.value, selectedTime4.value)
        );
      }
      courseStore.updateCourse(
        courseStore.currentCourse.coursesId,
        courseStore.currentCourse
      );
      console.log("currentCourse", courseStore.currentCourse);
    }
    courseStore.showEditDialog3 = true;
  }
};

const cancelEditCourse = () => {
  courseStore.closeDialog2();
  courseStore.getCourseByTeachId(userStore.currentUser!.teacherId!);
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card style="height: 90%">
          <v-card-title style="margin-left: 3%; margin-top: 1%">
            <h2>แก้ไขห้องเรียน</h2>
          </v-card-title>
          <v-card
            variant="outlined"
            class="textarea"
            style="width: 90%; height: 80%; overflow-y: scroll"
          >
            <v-card-title>
              <h3 style="margin-bottom: 2%">สร้างรายละเอียดวิชา</h3>
              <v-row>
                <v-col cols="12" sm="6">
                  <p>กลุ่มเรียนที่</p>
                  <v-text-field
                    variant="outlined"
                    v-model="courseStore.currentCourse!.session"
                    :rules="[(v: any) => !!v || 'โปรดกรอกกลุ่มที่เรียนให้ถูกต้อง']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <p>รหัสวิชา</p>
                  <v-text-field
                    variant="outlined"
                    v-model="courseStore.currentCourse!.coursesId"
                    :rules="[
                      (v: string) =>
                        /^[A-Za-z0-9]{8,}$/.test(v) ||
                        'โปรดกรอกรหัสวิชาอย่างน้อย 8 ตัวอักษร',
                    ]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <p>จำนวนหน่วยกิต</p>
                  <v-text-field
                    variant="outlined"
                    v-model="courseStore.currentCourse!.credit"
                    :rules="[
                      (v: any) => !!v || 'โปรดกรอกจำนวนหน่วยกิตให้ถูกต้อง',
                      (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
                    ]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <p>จำนวนนักเรียน</p>
                  <v-text-field
                    variant="outlined"
                    v-model="courseStore.currentCourse!.stdAmount"
                    :rules="[
                      (v: any) => !!v || 'โปรดกรอกจำนวนนักเรียนให้ถูกต้อง',
                      (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
                    ]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <p>วันที่</p>
                  <v-menu
                    v-model="showDatePicker"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        label="เวลาเริ่มเลคเชอร์"
                        v-model="selectedDate"
                        :value="formatThaiDate(selectedDate)"
                        variant="outlined"
                        readonly
                        @click:append="showDatePicker = !showDatePicker"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="selectedDate"
                      show-adjacent-month
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <p>เวลา</p>
                  <v-menu
                    v-model="showTimePicker"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="selectedTime"
                        variant="outlined"
                        readonly
                        label="วันที่เริ่มเลคเชอร์"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-time-picker v-model="selectedTime" format="24hr"></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <p>วันที่</p>
                  <v-menu
                    v-model="showDatePicker2"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        label="วันที่เลิกเลคเชอร์"
                        v-model="selectedDate2"
                        :value="formatThaiDate(selectedDate2)"
                        variant="outlined"
                        readonly
                        @click:append="showDatePicker2 = !showDatePicker2"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="selectedDate2"
                      show-adjacent-month
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <p>เวลา</p>
                  <v-menu
                    v-model="showTimePicker2"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="selectedTime2"
                        variant="outlined"
                        readonly
                        label="เวลาเลิกเลคเชอร์"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-time-picker v-model="selectedTime2" format="24hr"></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row v-if="courseStore.currentCourse!.typeCourses === 'เลคเชอร์และแลป'">
                <v-col cols="12" sm="6">
                  <p>วันที่</p>
                  <v-menu
                    v-model="showDatePicker3"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        label="วันที่เริ่มแลป"
                        v-model="selectedDate3"
                        :value="formatThaiDate(selectedDate3)"
                        variant="outlined"
                        readonly
                        @click:append="showDatePicker3 = !showDatePicker3"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="selectedDate3"
                      show-adjacent-month
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <p>เวลา</p>
                  <v-menu
                    v-model="showTimePicker3"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="selectedTime3"
                        variant="outlined"
                        readonly
                        label="เวลาเริ่มแลป"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-time-picker v-model="selectedTime3" format="24hr"></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row v-if="courseStore.currentCourse!.typeCourses === 'เลคเชอร์และแลป'">
                <v-col cols="12" sm="6">
                  <p>วันที่</p>
                  <v-menu
                    v-model="showDatePicker4"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        label="วันที่เลิกแลป"
                        v-model="selectedDate4"
                        :value="formatThaiDate(selectedDate4)"
                        variant="outlined"
                        readonly
                        @click:append="showDatePicker4 = !showDatePicker4"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="selectedDate4"
                      show-adjacent-month
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <p>เวลา</p>
                  <v-menu
                    v-model="showTimePicker4"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    position-x="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="selectedTime4"
                        variant="outlined"
                        readonly
                        label="เวลาเลิกแลป"
                      >
                        <template v-slot:append>
                          <v-icon v-bind="props">mdi-clock-outline</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-time-picker v-model="selectedTime4" format="24hr"></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <p>คะแนนเต็ม</p>
                  <v-text-field
                    variant="outlined"
                    v-model="courseStore.currentCourse!.fullScore"
                    :rules="[
                      (v: any) => !!v || 'โปรดกรอกคะแนนเต็มให้ถูกต้อง',
                      (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
                    ]"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-title>
          </v-card>
          <v-card-actions class="actions">
            <v-btn @click="cancelEditCourse">ยกเลิก</v-btn>
            <v-btn @click="editCourse2" class="colorText">ต่อไป</v-btn>
          </v-card-actions>
          <v-dialog v-model="courseStore.showEditDialog3" persistent>
            <EditCourseDialog3 />
          </v-dialog>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.actions {
  justify-content: flex-end;
}

.textarea {
  margin-left: 5%;
  border-color: #e0e0e0;
}

.colorText {
  color: #2a6ec5;
}

.font-bold {
  font-weight: bold;
}
</style>
