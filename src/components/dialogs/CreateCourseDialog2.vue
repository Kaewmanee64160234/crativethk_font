<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { ref, watch } from "vue";
import { useUserStore } from "@/stores/user.store";
import { useMessageStore } from "@/stores/message";

const courseStore = useCourseStore();
const userStore = useUserStore();
const selectedDate = ref(new Date());
const showDatePicker = ref(false);
const selectedTime = ref("00:00");
const showTimePicker = ref(false);
const showDatePicker2 = ref(false);
const selectedTime2 = ref("00:00");
const showTimePicker2 = ref(false);
const selectedDate3 = ref(new Date());
const showDatePicker3 = ref(false);
const selectedTime3 = ref("00:00");
const showTimePicker3 = ref(false);
const showDatePicker4 = ref(false);
const selectedTime4 = ref("00:00");
const showTimePicker4 = ref(false);
const messageStore = useMessageStore();

// courseStore.timeInLec = new Date(formatISODateTime(selectedDate.value, selectedTime.value));
// courseStore.timeOutLec = new Date(formatISODateTime(selectedDate.value, selectedTime2.value));
// if (courseStore.typeCourse === "เลคเชอร์และแลป") {
//   courseStore.timeInLab = new Date(formatISODateTime(selectedDate3.value, selectedTime3.value));
//   courseStore.timeOutLab = new Date(formatISODateTime(selectedDate.value, selectedTime4.value));
// }

function formatThaiDate(date: Date) {
  return date
    .toLocaleDateString("th-TH", {
      weekday: "long", // Full weekday name
    })
    .replace(".", "");
}

function formatISODateTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(":");
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toISOString();
}

// Watchers to update courseStore properties
watch([selectedDate, selectedTime], ([newDate, newTime]) => {
  courseStore.timeInLec = new Date(formatISODateTime(newDate, newTime));
});

watch([selectedDate, selectedTime2], ([newDate, newTime]) => {
  courseStore.timeOutLec = new Date(formatISODateTime(newDate, newTime));
});

watch([selectedDate3, selectedTime3], ([newDate, newTime]) => {
  if (courseStore.typeCourse === "เลคเชอร์และแลป") {
    courseStore.timeInLab = new Date(formatISODateTime(newDate, newTime));
  }
});

watch([selectedDate3, selectedTime4], ([newDate, newTime]) => {
  if (courseStore.typeCourse === "เลคเชอร์และแลป") {
    courseStore.timeOutLab = new Date(formatISODateTime(newDate, newTime));
  }
});

</script>

<template>
  <v-card>
    <!-- <v-card-title>
                <h3>รายละเอียดวิชา</h3>
              </v-card-title> -->
    <v-card-text>
      <v-row>
        <v-col>
          <p>กลุ่มเรียนที่</p>
          <v-text-field variant="outlined" v-model="courseStore.session" :rules="[(v: any) => !!v || 'โปรดกรอกกลุ่มที่เรียนให้ถูกต้อง',
          (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
          ]"></v-text-field>
        </v-col>
        <v-col>
          <p>จำนวนหน่วยกิต</p>
          <v-text-field variant="outlined" v-model="courseStore.credit" :rules="[
            (v: any) => !!v || 'โปรดกรอกจำนวนหน่วยกิตให้ถูกต้อง',
            (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
          ]"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <p>จำนวนนักเรียน</p>
          <v-text-field variant="outlined" v-model="courseStore.stdAmount" :rules="[
            (v: any) => !!v || 'โปรดกรอกจำนวนนักเรียนให้ถูกต้อง',
            (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
          ]"></v-text-field>
        </v-col>
        <v-col>
          <p>คะแนนเต็ม</p>
          <v-text-field variant="outlined" v-model="courseStore.fullScore" :rules="[
            (v: any) => !!v || 'โปรดกรอกคะแนนเต็มให้ถูกต้อง',
            (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
          ]"></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <p>วันที่</p>
          <v-menu v-model="showDatePicker" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field label="วันที่เริ่มเลคเชอร์" v-model="selectedDate" :value="formatThaiDate(selectedDate)"
                variant="outlined" readonly @click:append="showDatePicker = !showDatePicker">
                <template v-slot:append>
                  <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="selectedDate" show-adjacent-month></v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <p>เวลา</p>
          <v-menu v-model="showTimePicker" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="selectedTime" variant="outlined" readonly label="เวลาเริ่มเลคเชอร์">
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
        <v-col>
          <p>วันที่</p>
          <v-menu v-model="showDatePicker2" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field label="วันที่เลิกเลคเชอร์" v-model="selectedDate" :value="formatThaiDate(selectedDate)"
                variant="outlined" readonly @click:append="showDatePicker2 = !showDatePicker2">
                <template v-slot:append>
                  <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="selectedDate" show-adjacent-month></v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <p>เวลา</p>
          <v-menu v-model="showTimePicker2" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="selectedTime2" variant="outlined" readonly label="เวลาเลิกเลคเชอร์">
                <template v-slot:append>
                  <v-icon v-bind="props">mdi-clock-outline</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-time-picker v-model="selectedTime2" format="24hr"></v-time-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-row v-if="courseStore.typeCourse === 'เลคเชอร์และแลป'">
        <v-col>
          <p>วันที่</p>
          <v-menu v-model="showDatePicker3" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field label="วันที่เริ่มแลป" v-model="selectedDate3" :value="formatThaiDate(selectedDate3)"
                variant="outlined" readonly @click:append="showDatePicker3 = !showDatePicker3">
                <template v-slot:append>
                  <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="selectedDate3" show-adjacent-month></v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <p>เวลา</p>
          <v-menu v-model="showTimePicker3" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="selectedTime3" variant="outlined" readonly label="เวลาเริ่มแลป">
                <template v-slot:append>
                  <v-icon v-bind="props">mdi-clock-outline</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-time-picker v-model="selectedTime3" format="24hr"></v-time-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-row v-if="courseStore.typeCourse === 'เลคเชอร์และแลป'">
        <v-col>
          <p>วันที่</p>
          <v-menu v-model="showDatePicker4" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field label="วันที่เลิกแลป" v-model="selectedDate3" :value="formatThaiDate(selectedDate3)"
                variant="outlined" readonly @click:append="showDatePicker4 = !showDatePicker4">
                <template v-slot:append>
                  <v-icon v-bind="props">mdi-calendar-clock-outline</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-date-picker v-model="selectedDate3" show-adjacent-month></v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <p>เวลา</p>
          <v-menu v-model="showTimePicker4" :close-on-content-click="false" transition="scale-transition" offset-y
            position-x="right">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="selectedTime4" variant="outlined" readonly label="เวลาเลิกแลป">
                <template v-slot:append>
                  <v-icon v-bind="props">mdi-clock-outline</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-time-picker v-model="selectedTime4" format="24hr"></v-time-picker>
          </v-menu>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.actions {
  justify-content: flex-end;
}

.mb-4 {
  margin-bottom: 1rem;
}

.colorText {
  color: #2a6ec5;
}
</style>
