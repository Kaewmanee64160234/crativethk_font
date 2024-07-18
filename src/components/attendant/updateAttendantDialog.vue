<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAttendanceStore } from '../../stores/attendance.store';

const attendanceStore = useAttendanceStore();
const selectedStatus = ref(attendanceStore.editAttendance.attendanceStatus || '');

// closeDialog
const closeDialog = () => {
  attendanceStore.showDialog = false;
};

// updateAttendanceStatus
const updateAttendanceStatus = () => {
  attendanceStore.editAttendance.attendanceStatus = selectedStatus.value;
  attendanceStore.updateAttendanceTeacher(attendanceStore.editAttendance);
  closeDialog();
};

</script>

<template>
  <!-- Dialog for updating attendance status -->
  <v-dialog v-model="attendanceStore.showDialog" persistent max-width="400px">
    <v-card>
      <v-card-title>
        <span class="headline">Update Attendance Status</span>
      </v-card-title>
      <v-card-text>
        <!-- Display user's name and current attendance status -->
        <div>
          <p><strong>User:</strong> {{attendanceStore.userAttendance.studentId+' '+ attendanceStore.userAttendance.firstName +" "+attendanceStore.userAttendance.lastName }}</p>
          <p><strong>Current Status:</strong> {{ attendanceStore.editAttendance.attendanceStatus }}</p>
        </div>
        <v-select
          v-model="selectedStatus"
          :items="['present', 'late', 'absent']"
          label="Select Status"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="updateAttendanceStatus">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
</style>
