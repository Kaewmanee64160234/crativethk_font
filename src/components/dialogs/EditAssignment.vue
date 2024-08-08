<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useAssignmentStore } from '@/stores/assignment.store';
import type Assignment from '@/stores/types/Assignment';

const assignmentStore = useAssignmentStore();
const showDialog = ref(true);

// Define properties for the component
const props = defineProps<{
  post: Assignment;
  assignmentId: number; // Ensure this is being set correctly when the component is used
}>();

// Initialize editAssignment with assignmentId
const editAssignment = ref<Assignment>({
  assignmentId: props.assignmentId ? props.assignmentId : assignmentStore.currentAssignment?.assignmentId ,
  nameAssignment: assignmentStore.currentAssignment?.nameAssignment || '',
  assignmentTime: props.post.assignmentTime ? props.post.assignmentTime : assignmentStore.currentAssignment?.assignmentTime,
  assignmentImages: props.post.assignmentImages ? props.post.assignmentImages : assignmentStore.currentAssignment?.assignmentImages,
  statusAssignment: props.post.statusAssignment ? props.post.statusAssignment : assignmentStore.currentAssignment?.statusAssignment,
  room: props.post.room ? props.post.room : assignmentStore.currentAssignment?.room,
  attdances: props.post.attdances ? props.post.attdances : assignmentStore.currentAssignment?.attdances,
  course: props.post.course ? props.post.course : assignmentStore.currentAssignment?.course,
});
// Function to save changes
async function save() {
  try {
    // Debug: Check if assignmentId is correctly set
    console.log('Assignment ID to update:', editAssignment.value.assignmentId);

    // Ensure that assignmentId is valid
    if (!editAssignment.value.assignmentId || parseInt(editAssignment.value.assignmentId) === 0) {
      throw new Error('Invalid assignment ID');
    }

    // Attempt to update the assignment with the new name
    await assignmentStore.updateAssignment(editAssignment.value.assignmentId+'',editAssignment.value );
    close();
    window.location.reload();
    console.log('Assignment updated successfully'); // Log success
  } catch (error) {
    console.error('Error updating assignment:', error); // Log any errors
  }
}

// Function to close dialog
function close() {
  showDialog.value = false;
  assignmentStore.closeEditDialog(); // Ensure the store is cleared or updated
}

// Hook to initialize assignment data when the component is mounted
onMounted(() => {
  initializeEditAssignment();
});

// Function to initialize the assignment data
function initializeEditAssignment() {
  editAssignment.value = {
    assignmentId: props.assignmentId?.toString() || assignmentStore.currentAssignment?.assignmentId?.toString() || '',
    nameAssignment: assignmentStore.currentAssignment?.nameAssignment || '',
  };
}
console.log('Props:', props);
console.log('Edit Assignment ID:', editAssignment.value.assignmentId);

</script>

<template>
  <v-container>
    <!-- Dialog for editing assignment details -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card>
        <!-- Dialog title -->
        <v-card-title class="headline">
          Edit Assignment
          <v-spacer></v-spacer>
          <!-- Close button for dialog -->
          <v-btn icon @click="close">
            <v-icon color="red">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <!-- Dialog content -->
        <v-card-text>
          <!-- Form to edit assignment name -->
          <v-form ref="form" @submit.prevent="save">
            <!-- Text field to input the assignment name -->
            <v-text-field v-model="editAssignment.nameAssignment" label="Assignment Name" required></v-text-field>
          </v-form>
        </v-card-text>
        <!-- Dialog actions (buttons) -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- Button to save changes -->
          <v-btn color="primary" @click="save">บันทึก</v-btn>
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
</style>