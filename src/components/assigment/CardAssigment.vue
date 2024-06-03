<script setup lang="ts">
import { defineProps } from 'vue';
import Assignment from '../../stores/types/Assignment';
import { useRouter } from 'vue-router';
import { useAssignmentStore } from '@/stores/assignment.store';

const router = useRouter();

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
    router.push('/mapping2');
}

const gotoMappinfForStudent = () => {
    assignmentStore.currentAssignment = props.post;
    router.push('/mappingForStudent/'+props.post.assignmentId);
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
                <!-- <v-btn @click="goToMapping2()" ><v-icon size="30">mdi-account-file-text-outline</v-icon></v-btn> -->
            </v-card-actions>
        </v-card>
    </div>
</template>

<style></style>