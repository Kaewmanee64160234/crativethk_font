<script setup lang="ts">
import { defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssignmentStore } from '@/stores/assignment.store';
import type Assignment from '@/stores/types/Assignment';
import { useCourseStore } from '@/stores/course.store';
import { useUserStore } from '@/stores/user.store';

const router = useRouter();
const courseStore = useCourseStore();
const userStore = useUserStore();
const route = useRoute();
const courseId = route.params.courseId;

const props = defineProps<{
    post: Assignment
}>();

const assignmentStore = useAssignmentStore();
function formatThaiDate(date: Date) {
    return date.toLocaleDateString('th-TH', {
        day: 'numeric', // Numeric day of the month
        month: 'short'  // Abbreviated month name
    }).replace('.', ''); // Remove the dot after the month abbreviation
}

//create function goto mapping 2
const goToMapping2 = () => {
    assignmentStore.currentAssignment = props.post;
    router.push(`/reCheckMappingTeacher/course/${courseId}/assignment/${props.post.assignmentId}`);
}

const gotoMappinfForStudent = () => {
    assignmentStore.currentAssignment = props.post;
    router.push("/mappingForStudent/course/"+ courseStore.currentCourse?.coursesId+"/assignment/"+props.post.assignmentId);
}

</script>
<template>
    <div>
        <v-card>
            <v-card-text>
                <h4>{{ props.post.course.user.firstName + ' ' + props.post.course.user.lastName }} โพสเนื้อหาใหม่ : {{
                    props.post.nameAssignment }}</h4>
            </v-card-text>
            <v-card-actions>
                <v-card-text> {{ formatThaiDate(new Date(props.post.createdDate)) }}</v-card-text>
                <v-spacer></v-spacer>
                <v-btn @click="gotoMappinfForStudent()" > <v-icon size="30">mdi-card-account-mail</v-icon>
                </v-btn>
               <v-btn v-if="userStore.currentUser?.role == 'อาจารย์'" @click="goToMapping2()" ><v-icon size="30">mdi-account-file-text-outline</v-icon></v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<style></style>