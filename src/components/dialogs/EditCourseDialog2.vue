<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { watch } from "vue";

const courseStore = useCourseStore();
watch(() => courseStore.currentCourse!.fullScore, (newVal) => {
  if (newVal >= 1 && newVal <= 100) {
    courseStore.scoreError = "";
  }
});

watch(() => courseStore.currentCourse!.timeInLec, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeInLecError = "";
  }
});

watch(() => courseStore.currentCourse!.timeOutLec, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeOutLecError = "";
  }
});

watch(() => courseStore.currentCourse!.timeInLab, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeInLabError = "";
  }
});

watch(() => courseStore.currentCourse!.timeOutLab, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeOutLabError = "";
  }
});
</script>

<template>
  <v-card-title>
    <h3>แก้ไขรายละเอียดวิชา</h3>
  </v-card-title>
  <v-card-text>
    <v-card class="mb-4">
      <v-row>
        <v-col>
          <v-card-title>
            <h5>รายละเอียดวิชา</h5>
          </v-card-title>
          <v-card-text>
            <p>กลุ่มเรียนที่</p>
            <v-select :items="['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']" variant="outlined"
              v-model="courseStore.currentCourse!.session" :rules="[(v: any) => !!v || 'โปรดเลือกกลุ่มที่เรียน']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>จำนวนหน่วยกิต</p>
            <v-select :items="['1', '2', '3']" variant="outlined" v-model="courseStore.currentCourse!.credit"
              :rules="[(v: any) => !!v || 'โปรดเลือกจำนวนหน่วยกิต']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>คะแนนเต็ม</p>
            <v-text-field variant="outlined" v-model="courseStore.currentCourse!.fullScore" 
            :error-messages="courseStore.scoreError"
            :rules="[
              (v: any) => !!v || 'โปรดกรอกคะแนนเต็มให้ถูกต้อง',
              (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
              (v: number) => v >= 1 && v <= 100 || 'โปรดกรอกคะแนนตั้งแต่ 1 ถึง 100'
            ]"></v-text-field>
          </v-card-text>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card-title>
            <h5>วันเวลาเรียนเลคเชอร์</h5>
          </v-card-title>
          <v-card-text>
            <p>วันที่เรียนเลคเชอร์</p>
            <v-select prepend-icon="mdi-calendar-month"
              :items="['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์']" variant="outlined"
              v-model="courseStore.currentCourse!.dayInLec" 
              :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียนเลคเชอร์']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>เวลาเริ่มเรียนเลคเชอร์</p>
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" 
            :error-messages="courseStore.timeInLecError"
            v-model="courseStore.currentCourse!.timeInLec" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนเลคเชอร์ให้ถูกต้อง',
              (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || 'โปรดกรอกเวลาในรูปแบบ HH:MM',
            ]"></v-text-field>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>เวลาเลิกเรียนเลคเชอร์</p>
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" 
            :error-messages="courseStore.timeOutLecError"
            v-model="courseStore.currentCourse!.timeOutLec" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนเลคเชอร์ให้ถูกต้อง',
              (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || 'โปรดกรอกเวลาในรูปแบบ HH:MM',
            ]"></v-text-field>
          </v-card-text>
        </v-col>
      </v-row>
      <v-row v-if="courseStore.currentCourse!.typeCourses === 'เลคเชอร์และแลป'">
        <v-col>
          <v-card-title>
            <h5>วันเวลาเรียนแลป</h5>
          </v-card-title>
          <v-card-text>
            <p>วันที่เรียนแลป</p>
            <v-select prepend-icon="mdi-calendar-month"
              :items="['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์']" variant="outlined"
              v-model="courseStore.currentCourse!.dayInLab" :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียนแลป']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>เวลาเริ่มเรียนแลป</p>
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" 
            :error-messages="courseStore.timeInLabError"
            v-model="courseStore.currentCourse!.timeInLab" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนเลคเชอร์ให้ถูกต้อง',
              (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || 'โปรดกรอกเวลาในรูปแบบ HH:MM',
            ]"></v-text-field>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>เวลาเลิกเรียนแลป</p>
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" 
            :error-messages="courseStore.timeOutLabError"
            v-model="courseStore.currentCourse!.timeOutLab" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนเลคเชอร์ให้ถูกต้อง',
              (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || 'โปรดกรอกเวลาในรูปแบบ HH:MM',
            ]"></v-text-field>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </v-card-text>
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
