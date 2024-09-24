<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";

const courseStore = useCourseStore();

</script>

<template>
  <v-card-title>
    <h3>เพิ่มรายละเอียดวิชา</h3>
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
              v-model="courseStore.session" :rules="[(v: any) => !!v || 'โปรดเลือกกลุ่มที่เรียน']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>จำนวนหน่วยกิต</p>
            <v-select :items="['1', '2', '3']" variant="outlined" v-model="courseStore.credit"
              :rules="[(v: any) => !!v || 'โปรดเลือกจำนวนหน่วยกิต']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>คะแนนเต็ม</p>
            <v-text-field variant="outlined" v-model="courseStore.fullScore" :rules="[
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
              v-model="courseStore.dayInLec" :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียนเลคเชอร์']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>เวลาเริ่มเรียนเลคเชอร์</p>
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" v-model="courseStore.timeInLec" :rules="[
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
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" v-model="courseStore.timeOutLec" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนเลคเชอร์ให้ถูกต้อง',
              (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || 'โปรดกรอกเวลาในรูปแบบ HH:MM',
            ]"></v-text-field>
          </v-card-text>
        </v-col>
      </v-row>
      <v-row v-if="courseStore.typeCourse === 'เลคเชอร์และแลป'">
        <v-col>
          <v-card-title>
            <h5>วันเวลาเรียนแลป</h5>
          </v-card-title>
          <v-card-text>
            <p>วันที่เรียนแลป</p>
            <v-select prepend-icon="mdi-calendar-month"
              :items="['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์']" variant="outlined"
              v-model="courseStore.dayInLab" :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียนแลป']"></v-select>
          </v-card-text>
        </v-col>
        <v-col>
          <v-card-title>
            <h5>&nbsp;</h5>
          </v-card-title>
          <v-card-text>
            <p>เวลาเริ่มเรียนแลป</p>
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" v-model="courseStore.timeInLab" :rules="[
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
            <v-text-field prepend-icon="mdi-clock-time-four" variant="outlined" v-model="courseStore.timeOutLab" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนเลคเชอร์ให้ถูกต้อง',
              (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || 'โปรดกรอกเวลาในรูปแบบ HH:MM',
            ]"></v-text-field>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </v-card-text>
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
