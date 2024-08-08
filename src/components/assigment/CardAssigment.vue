<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssignmentStore } from '@/stores/assignment.store';
import type Assignment from '@/stores/types/Assignment';
import { useCourseStore } from '@/stores/course.store';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import EditAssignment from '@/components/dialogs/EditAssignment.vue';

const router = useRouter();
const courseStore = useCourseStore();
const assignmentStore = useAssignmentStore();
const confirmDlg = ref();
const route = useRoute();
const id = ref(route.params.idCourse);

onMounted(async () => {
    await assignmentStore.getAssignmentByCourseId(id.value.toString());
})
const props = defineProps<{
  post: Assignment
}>();

function formatThaiDate(date: Date) {
  return date.toLocaleDateString('th-TH', {
    day: 'numeric', // Numeric day of the month
    month: 'short'  // Abbreviated month name
  }).replace('.', ''); // Remove the dot after the month abbreviation
}

// Navigate to mapping for student
const gotoMappingForStudent = () => {
  assignmentStore.currentAssignment = props.post;
  router.push(`/mappingForStudent/course/${courseStore.currentCourse?.coursesId}/assignment/${props.post.assignmentId}`);
}

// Delete assignment and update UI
const deleteAssignment = async () => {
    await confirmDlg.value.openDialog(
    'Please Confirm',
    `Do you want to delete this Assignment?`,
    'Accept',
    'Cancel'
  )
  await assignmentStore.deleteAssignment(props.post.assignmentId);
  window.location.reload();
  await assignmentStore.getAssignmentByCourseId(id.value.toString());
  // Optionally, remove the item from a local list if not using a global store
}
// function edit
const editAssignment = async () => {
  assignmentStore.EditAssignment = true;
}

</script>

<template>
  <div>
    <v-card>
      <v-card-text>
        <h4>
          {{ props.post.course.user.firstName + ' ' + props.post.course.user.lastName }} โพสเนื้อหาใหม่ : {{ props.post.nameAssignment }}
        </h4>
      </v-card-text>
      <v-card-actions>
        <v-card-text>{{ formatThaiDate(new Date(props.post.createdDate)) }}</v-card-text>
        <v-spacer></v-spacer>
        <v-btn @click="gotoMappingForStudent()">
          <v-icon size="30">mdi-card-account-mail</v-icon>
        </v-btn>
        <v-btn @click="editAssignment()">
          <v-icon size="30">mdi mdi-book-edit</v-icon>
        </v-btn>
        <v-btn @click="deleteAssignment()">
          <v-icon size="30">mdi mdi-delete</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  <ConfirmDialog ref="confirmDlg" />
  <v-dialog v-model="assignmentStore.EditAssignment" persistent>
    <EditAssignment :post="props.post" :assignmentId="props.post.assignmentId ?? 0"></EditAssignment>
  </v-dialog>
</template>

<style scoped>
</style>
