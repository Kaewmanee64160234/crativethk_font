<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
const courseStore = useCourseStore();

</script>

<template>
  <v-col>
    <v-card-title style="margin-left: 3%; margin-top: 1%">
      <h2>แก้ไขห้องเรียน</h2>
    </v-card-title>
    <v-card variant="outlined" class="textarea" style="width: 90%; height: 80%;">
      <v-card-title>
        <h3 style="margin-bottom: 2%">สร้างรายละเอียดวิชา</h3>
        <v-row>
          <v-col cols="12" sm="6">
            <p>กลุ่มเรียนที่</p>
            <v-select :items="['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']" variant="outlined"
            v-model="courseStore.currentCourse!.session"  :rules="[(v: any) => !!v || 'โปรดเลือกกลุ่มที่เรียน']"></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <p>รหัสวิชา</p>
            <v-text-field variant="outlined" v-model="courseStore.currentCourse!.coursesId" :rules="[
              (v: string) =>
                /^[A-Za-z0-9]{8,}$/.test(v) ||
                'โปรดกรอกรหัสวิชาอย่างน้อย 8 ตัวอักษร',
            ]"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <p>จำนวนหน่วยกิต</p>
            <v-select :items="['1', '2', '3']" variant="outlined"
            v-model="courseStore.currentCourse!.credit"  :rules="[(v: any) => !!v || 'โปรดเลือกจำนวนหน่วยกิต']"></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <p>คะแนนเต็ม</p>
            <v-text-field variant="outlined" v-model="courseStore.currentCourse!.fullScore" :rules="[
              (v: any) => !!v || 'โปรดกรอกคะแนนเต็มให้ถูกต้อง', 
              (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
              (v: number) => v >= 1 && v <= 100 || 'โปรดกรอกคะแนนตั้งแต่ 1 ถึง 100'
            ]"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <p>วันที่เรียนเลคเชอร์</p>
            <v-select :items="['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์']" variant="outlined"
            v-model="courseStore.currentCourse!.dayInLec" :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียนเลคเชอร์']"></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <p>เวลาเริ่มเรียนเลคเชอร์</p>
            <v-text-field variant="outlined" v-model="courseStore.currentCourse!.timeInLec" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนเลคเชอร์ให้ถูกต้อง',
              (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
            ]"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6"></v-col>
          <v-col cols="12" sm="6">
            <p>เวลาเลิกเรียนเลคเชอร์</p>
          <v-text-field variant="outlined" v-model="courseStore.currentCourse!.timeOutLec" :rules="[
            (v: any) => !!v || 'โปรดกรอกเวลาเลิกเรียนเลคเชอร์ให้ถูกต้อง',
            (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
          ]"></v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="courseStore.currentCourse!.typeCourses === 'เลคเชอร์และแลป'">
          <v-col cols="12" sm="6">
            <p>วันที่เริ่มเรียนแลป</p>
            <v-select :items="['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์']" variant="outlined"
            v-model="courseStore.currentCourse!.dayInLab" :rules="[(v: any) => !!v || 'โปรดเลือกวันที่เรียนแลป']"></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <p>เวลาเริ่มเรียนแลป</p>
          <v-text-field variant="outlined" v-model="courseStore.currentCourse!.timeInLab" :rules="[
            (v: any) => !!v || 'โปรดกรอกเวลาเริ่มเรียนแลปให้ถูกต้อง',
            (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
          ]"></v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="courseStore.currentCourse!.typeCourses === 'เลคเชอร์และแลป'">
          <v-col cols="12" sm="6"></v-col>
          <v-col cols="12" sm="6">
            <p>เวลาเลิกเรียนแลป</p>
            <v-text-field variant="outlined" v-model="courseStore.currentCourse!.timeOutLab" :rules="[
              (v: any) => !!v || 'โปรดกรอกเวลาเลิกเรียนแลปให้ถูกต้อง',
              (v: string) => /^[0-9]+$/.test(v) || 'โปรดกรอกตัวเลขเท่านั้น',
            ]"></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>
    </v-card>
  </v-col>
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
