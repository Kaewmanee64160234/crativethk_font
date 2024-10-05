<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { watch } from "vue";

const courseStore = useCourseStore();

watch(() => courseStore.fullScore, (newVal) => {
  if (newVal >= 1 && newVal <= 100) {
    courseStore.scoreError = "";
  }
});

watch(() => courseStore.timeInLec, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeInLecError = "";
  }
});

watch(() => courseStore.timeOutLec, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeOutLecError = "";
  }
});

watch(() => courseStore.timeInLab, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeInLabError = "";
  }
});

watch(() => courseStore.timeOutLab, (newVal) => {
  if (newVal !== '00:00') {
    courseStore.timeOutLabError = "";
  }
});

</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h3>เพิ่มรายละเอียดวิชา</h3>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title>
                <h5>กลุ่มเรียนที่</h5>
              </v-card-title>
              <v-card-text>
                <v-select :items="['1', '2', '3', '4', '5']" label="Session" variant="outlined"
                  v-model="courseStore.session" :rules="[(v: any) => !!v || 'โปรดเลือกกลุ่มที่เรียน']"></v-select>
              </v-card-text>
            </v-card>
            <v-card class="mb-4">
              <v-card-title>
                <h5>คะแนนเต็ม</h5>
              </v-card-title>
              <v-card-text>
                <v-text-field variant="outlined" v-model="courseStore.fullScore"
                  :error-messages="courseStore.scoreError"
                  :rules="[
                    (v: any) => !!v || '*กรุณากรอกตัวเลข 1-100*',
                    (v: string) => /^[0-9]+$/.test(v) || '*กรุณากรอกตัวเลข*',
                    (v: number) => v >= 1 && v <= 100 || '*กรุณากรอกตัวเลข 1-100*'
                  ]"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title>
                <h5>วันเวลาเรียน Lecture</h5>
              </v-card-title>
              <v-card-text>
                <p>วันที่เรียน</p>
                <v-select prepend-icon="mdi-calendar-month"
                  :items="['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์']"
                  variant="outlined" v-model="courseStore.dayInLec"
                  :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียน Lecture']"></v-select>
                <p>เวลาเริ่ม - เวลาเลิก</p>
                <v-row>
                  <v-col cols="6">
                    <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined"
                      v-model="courseStore.timeInLec"
                      :error-messages="courseStore.timeInLecError"
                      :rules="[(v: any) => !!v || '*กรุณากรอกเวลาเป็น HH:MM*']"></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined"
                      v-model="courseStore.timeOutLec"
                      :error-messages="courseStore.timeOutLecError"
                      :rules="[(v: any) => !!v || '*กรุณากรอกเวลาเป็น HH:MM*']"></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="courseStore.typeCourse === 'Lecture & Lab'">
          <v-col cols="12" md="6">
            <v-card class="mb-4">
              <v-card-title>
                <h5>วันเวลาเรียน Lab</h5>
              </v-card-title>
              <v-card-text>
                <p>วันที่เรียน</p>
                <v-select prepend-icon="mdi-calendar-month"
                  :items="['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์']"
                  variant="outlined" v-model="courseStore.dayInLab"
                  :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียน Lab']"></v-select>
                <p>เวลาเริ่ม - เวลาเลิก</p>
                <v-row>
                  <v-col cols="6">
                    <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined"
                      v-model="courseStore.timeInLab"
                      :error-messages="courseStore.timeInLabError"
                      :rules="[(v: any) => !!v || '*กรุณากรอกเวลาเป็น HH:MM*']"></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined"
                      v-model="courseStore.timeOutLab"
                      :error-messages="courseStore.timeOutLabError"
                      :rules="[(v: any) => !!v || '*กรุณากรอกเวลาเป็น HH:MM*']"></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
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
@media (max-width: 600px) {
  .mb-4 {
    margin-bottom: 8px;
  }
}
</style>
