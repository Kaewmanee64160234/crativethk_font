<script setup lang="ts">
import { ref, computed } from "vue";
import { useAttendanceStore } from "../../stores/attendance.store";

const attendanceStore = useAttendanceStore();
const selectedStatus = ref(attendanceStore.editAttendance?.attendanceStatus || "");
// closeDialog
const closeDialog = () => {
  attendanceStore.showDialog = false;
};

// updateAttendanceStatus
const updateAttendanceStatus = () => {
  if (!attendanceStore.editAttendance) {
    console.error("No attendance data available.");
    return;
  }
  attendanceStore.editAttendance.attendanceStatus = selectedStatus.value;
  attendanceStore.updateAttendanceTeacher(attendanceStore.editAttendance);
  closeDialog();
};
</script>

<template>
  <!-- Dialog for updating attendance status -->
  <v-dialog v-model="attendanceStore.showDialog" persistent max-width="400px">
    <v-card>
      <v-card-title style="text-align: center; font-weight: bold">
        <span class="headline">แก้ไขสถานะการเช็คชื่อ</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <!-- Display user's name and current attendance status -->
        <div>
          <p>
            <strong>ชื่อผู้ใช้:</strong>
            {{
              attendanceStore.userAttendance.firstName +
              " " +
              attendanceStore.userAttendance.lastName
            }}
          </p>
          <p>
            <strong>สถานะเข้าเรียนปัจจุบัน:</strong>
            <v-span style="color: red">{{
              " " + attendanceStore.editAttendance?.attendanceStatus
            }}</v-span>
          </p>
        </div>
        <p style="margin-bottom: 2%">
          <strong>แก้ไขสถานะเข้าเรียน:</strong>
        </p>
        <v-select
          variant="solo"
          v-model="selectedStatus"
          :items="['มาเรียน', 'ไม่มาเรียน', 'มาสาย']"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn color="error" @click="closeDialog">ยกเลิก</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="updateAttendanceStatus">ยืนยัน</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
