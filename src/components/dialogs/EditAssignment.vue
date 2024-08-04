<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useAssignmentStore } from '@/stores/assignment.store';
import type Assignment from '@/stores/types/Assignment';

const assignmentStore = useAssignmentStore();
const showDialog = ref(true);
const props = defineProps<{
  post: Assignment,
  assignmentId: number
}>();
const editAssignment = ref({
  assignmentId: props.assignmentId,
  nameAssignment: '',
});
// Function to save changes
async function save() {
  try {
    await assignmentStore.updateAssignment(editAssignment.value.assignmentId, {
      nameAssignment: editAssignment.value.nameAssignment,
    });
    close();
    // Optionally reload assignments list or provide feedback to the user
    console.log('Assignment updated successfully');
  } catch (error) {
    console.error('Error updating assignment:', error);
  }
}

// Function to close dialog
function close() {
  showDialog.value = false;
  assignmentStore.closeEditDialog(); // Ensure the store is cleared or updated
}
onMounted(() => {
  initializeEditAssignment();
});

// Function to initialize assignment data
function initializeEditAssignment() {
  if (!editAssignment.value.nameAssignment) {
    editAssignment.value.nameAssignment =
      assignmentStore.currentAssignment?.nameAssignment ?? '';
  }
}

</script>
<template>
  <v-container>
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="headline">
          Edit Assignment
          <v-spacer></v-spacer>
          <v-btn icon @click="close">
            <v-icon color="red">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="save">
            <v-text-field
              v-model="editAssignment.nameAssignment"
              label="Assignment Name"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="save">Save Changes</v-btn>
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

.image-container {
  position: relative;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
