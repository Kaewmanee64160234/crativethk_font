<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAttendanceStore } from '../../stores/attendance.store';
import { useRoute } from 'vue-router';
import { useAssignmentStore } from '@/stores/assignment.store';
import type Attendance from '@/stores/types/Attendances';

const attendanceStore = useAttendanceStore();
const assignmentStore = useAssignmentStore();
const route = useRoute();
const url = 'http://localhost:3000'
onMounted(async () => {
    const id = route.params.assignmentId;
  await attendanceStore.getAttendanceByStatusInAssignment(id+'') // Assuming this function exists and fetches the attendances
});

// confirm student 
const confirmAttendance = async (attendance:Attendance) => {
  if (confirm("Do you want to confirm this attendance?")) {
    try {
      attendance.attendanceStatus = 'present';
      attendance.attendanceConfirmStatus = 'confirmed';
      await attendanceStore.confirmAttendanceByTeacher(attendance.attendanceId+'');
      alert('Attendance has been confirmed.');
    } catch (error) {
      console.error("Error recording attendance:", error);
      alert('Failed to confirm attendance.');
    }
  }
};
//reject student
const reCheckAttendance = async (attendance:Attendance) => {
  try {
    attendance.attendanceStatus = 'present';
    attendance.attendanceConfirmStatus = 'recheck';
    await attendanceStore.rejectAttendanceByTeacher(attendance.attendanceId+'');
    alert('Attendance has been recheck.');
  } catch (error) {
    console.error("Error recording attendance:", error);
    alert('Failed to recheck attendance.');
  }
};
</script>

<template>
  <v-container style="margin-top: 10%;margin-left: 10%;">
    <v-row>
      <v-btn @click="attendanceStore.checkAllAttendance( route.params.assignmentId+'')">ยืนยันการcheckชื่อ</v-btn>

      <v-col cols="12" md="8">
       <!-- table -->
        <v-simple-table>
          
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">รหัสนักศึกษา</th>
                <th class="text-left">ชื่อ-สกุล</th>
                <th class="text-left">สถานะ</th>
                <!-- <th class="text-left">ยืนยัน</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="attendee in attendanceStore.attendances" :key="attendee.attendanceId">
                <td>{{ attendee.user?.studentId }}</td>
                <td>{{ attendee.user?.firstName }} {{ attendee.user?.lastName }}</td>
                <td>{{ attendee.attendanceStatus }}</td>
                <!-- <td>
                  <v-btn @click="confirmAttendance(attendee)" color="success">ยืนยัน</v-btn>
                  <v-btn @click="reCheckAttendance(attendee)" color="warning">ตรวจสอบ</v-btn>
                </td> -->
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col cols="12" md="4">
        <div v-for="attendee in attendanceStore.attendances" :key="attendee.attendanceId">
          <v-card class="mb-4">
            <v-img :src="`${url}/attendances/image/${attendee.attendanceImage}`" height="200px"></v-img>
            <!-- <v-img :src="attendee." height="200px"></v-img> -->
         
            <v-card-title>{{ attendee.user?.firstName }} {{ attendee.user?.lastName }} </v-card-title>
            <v-card-subtitle>{{ attendee.user?.studentId }}</v-card-subtitle>
            <v-card-text>
              <div>เข้าเรียน: {{ attendee.attendanceStatus }}</div>
              <!-- <div>คะแนน: {{ attendee.points }}%</div> -->
            </v-card-text>
            <v-card-actions>
                <v-btn @click="confirmAttendance(attendee)" color="success">ยืนยัน</v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="reCheckAttendance(attendee)" color="warning">ยกเลิก </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* You can add additional styles here */
</style>
