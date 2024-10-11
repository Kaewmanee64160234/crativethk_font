<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAttendanceStore } from "../../stores/attendance.store";

const attendanceStore = useAttendanceStore();
const selectedStatus = ref(attendanceStore.editAttendance?.attendanceStatus || "");
watch(
  () => attendanceStore.editAttendance,
  (newVal) => {
    if(newVal) {
      if(newVal!.attendanceStatus === "absent") {
        selectedStatus.value = "ไม่มาเรียน";
      } else if(newVal.attendanceStatus === "late") {
        selectedStatus.value = "มาสาย";
      } else {
        selectedStatus.value = "มาเรียน";
      }
    }
  }
);

// Define mappings for status
const statusMap = {
  present: "มาเรียน",
  absent: "ไม่มาเรียน",
  late: "มาสาย",
};

// Reverse the mapping for setting the internal values
const reverseStatusMap = {
  "มาเรียน": "present",
  "ไม่มาเรียน": "absent",
  "มาสาย": "late",
};

// Set initial selected status in Thai
selectedStatus.value = statusMap[attendanceStore.editAttendance?.attendanceStatus] || "";

// Watch the selectedStatus and adjust if the user sets the status to present
watch(
  () => selectedStatus.value,
  (newStatus) => {
    if (newStatus === "มาเรียน") {
      // Automatically adjust internal status if needed
      attendanceStore.editAttendance!.attendanceStatus = "present";
    }
  }
);

// Close the dialog
const closeDialog = () => {
  attendanceStore.showDialog = false;
};

// Update the attendance status
const updateAttendanceStatus = () => {
  if (!attendanceStore.editAttendance) {
    console.error("No attendance data available.");
    return;
  }

  // Convert the selected status back to English for storing
  attendanceStore.editAttendance.attendanceStatus = reverseStatusMap[selectedStatus.value];
  attendanceStore.updateAttendanceTeacher(attendanceStore.editAttendance);
  closeDialog();
};
</script>

<template>
  <!-- Dialog for updating attendance status -->
  <v-dialog v-model="attendanceStore.showDialog" persistent max-width="400px">
    <v-card>
      <v-card-title class="text-center font-weight-bold">
        แก้ไขสถานะการเช็คชื่อ
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
            <span
              :style="{
                color: attendanceStore.editAttendance?.attendanceStatus === 'absent'
                  ? 'red'
                  : attendanceStore.editAttendance?.attendanceStatus === 'late'
                  ? 'orange'
                  : 'green'
              }"
            >
              {{ statusMap[attendanceStore.editAttendance?.attendanceStatus] }}
            </span>
          </p>
        </div>
        <p style="margin-bottom: 2%">
          <strong>แก้ไขสถานะเข้าเรียน:</strong>
        </p>
        <v-select
          variant="solo"
          v-model="selectedStatus"
          :items="['มาเรียน', 'ไม่มาเรียน', 'มาสาย']"
          label="เลือกสถานะ"
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





<style scoped>
.text-center {
  text-align: center;
}

.font-weight-bold {
  font-weight: bold;
}

.v-card-title {
  font-size: 1.25rem;
}

.v-card-actions {
  display: flex;
  justify-content: flex-end;
}

.v-btn {
  text-transform: none;
}
</style>

