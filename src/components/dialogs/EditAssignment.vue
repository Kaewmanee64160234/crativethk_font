<script lang="ts" setup>
import { onMounted, ref,watch } from 'vue';
import { useAssignmentStore } from '@/stores/assignment.store';
import type Assignment from '@/stores/types/Assignment';

const assignmentStore = useAssignmentStore();
const showDialog = ref(true);
const isValid = ref(false); // State to track form validity

// Define properties for the component
const props = defineProps<{
  post: Assignment;
  assignmentId: number;
}>();

// Initialize editAssignment with assignmentId
const editAssignment = ref<any>({
  assignmentId: props.assignmentId || assignmentStore.currentAssignment?.assignmentId || 0,
  nameAssignment: assignmentStore.currentAssignment?.nameAssignment || '',
  assignmentTime: props.post.assignmentTime || assignmentStore.currentAssignment?.assignmentTime || '',
  assignmentImages: props.post.assignmentImages || assignmentStore.currentAssignment?.assignmentImages || [],
  statusAssignment: props.post.statusAssignment || assignmentStore.currentAssignment?.statusAssignment || '',
  room: props.post.room || assignmentStore.currentAssignment?.room || '',
  attdances: props.post.attdances || assignmentStore.currentAssignment?.attdances || [],
  course: props.post.course || assignmentStore.currentAssignment?.course || '',
});

// Function to save changes
async function save() {
  try {
    console.log('Assignment ID to update:', editAssignment.value.assignmentId);

    // Ensure that assignmentId is valid
    const id = editAssignment.value.assignmentId;
    if (!id || id <= 0) {
      throw new Error('Invalid assignment ID');
    }

    // Validate form before proceeding
    if (!isValid.value) {
      throw new Error('Form is not valid. Please check the inputs.');
    }

    // Attempt to update the assignment with the new name
    await assignmentStore.updateAssignment(String(id), editAssignment.value);
    console.log('Assignment updated successfully');
    close();
    window.location.reload();
  } catch (error) {
    console.error('Error updating assignment:', error);
  }
}

// Function to close dialog
function close() {
  showDialog.value = false;
  assignmentStore.closeEditDialog();
}

// Hook to initialize assignment data when the component is mounted
onMounted(() => {
  initializeEditAssignment();
});

// Function to initialize the assignment data
function initializeEditAssignment() {
  editAssignment.value = {
    assignmentId: props.assignmentId || assignmentStore.currentAssignment?.assignmentId || 0,
    nameAssignment: props.post.nameAssignment || assignmentStore.currentAssignment?.nameAssignment || '',
    assignmentTime: props.post.assignmentTime || assignmentStore.currentAssignment?.assignmentTime || '',
    assignmentImages: props.post.assignmentImages || assignmentStore.currentAssignment?.assignmentImages || [],
    statusAssignment: props.post.statusAssignment || assignmentStore.currentAssignment?.statusAssignment || '',
    room: props.post.room || assignmentStore.currentAssignment?.room || '',
    attdances: props.post.attdances || assignmentStore.currentAssignment?.attdances || [],
    course: props.post.course || assignmentStore.currentAssignment?.course || '',
  };
}

// Validate form method to check inputs
function validateForm() {
  // Ensure nameAssignment is between 1 and 50 characters
  isValid.value = !!editAssignment.value.nameAssignment && editAssignment.value.nameAssignment.length >= 1 && editAssignment.value.nameAssignment.length <= 50;
}

// Watch for changes in editAssignment fields and validate
watch(() => editAssignment.value.nameAssignment, validateForm);
</script>


<template>
  <v-container>
    <!-- Dialog for editing assignment details -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card>
        <!-- Dialog title with X button aligned to the right -->
        <v-card-title class="headline">
          Edit Assignment
          <v-spacer></v-spacer>
          <!-- Close button for dialog -->
          <v-btn icon @click="close" class="close-button">
            <v-icon color="red">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <!-- Dialog content -->
        <v-card-text>
          <!-- Form to edit assignment name -->
          <v-form ref="form" @submit.prevent="save" v-model="isValid">
            <!-- Text field to input the assignment name with validation -->
            <v-text-field
              v-model="editAssignment.nameAssignment"
              label="Assignment Name"
              variant="outlined"
              outlined
              required
              maxlength="50"
              :rules="[
                (v) => !!v || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*',
                (v) => (v && v.length >= 1 && v.length <= 50) || '*กรุณากรอกตัวอักษร 1-50 ตัวอักษร*'
              ]"
              prepend-inner-icon="mdi-assignment"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <!-- Dialog actions (buttons) -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- Button to save changes with form validation -->
          <v-btn color="primary" :disabled="!isValid" @click="save">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<style scoped>
.headline {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  margin-right: -12px; /* Adjust this value if necessary to align with the edge */
}
</style>