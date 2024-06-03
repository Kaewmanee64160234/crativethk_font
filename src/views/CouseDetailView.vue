<script setup lang="ts">
//get id from param
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssignmentStore } from '@/stores/assignment.store';
//import component CardAssigment
import CardAssigment from '@/components/assigment/CardAssigment.vue';
import { useCourseStore } from '@/stores/course.store';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user.store';
import { useAttendanceStore } from '@/stores/attendance.store';
import type Attendance from '@/stores/types/Attendances';
import type Assignment from '@/stores/types/Assignment';
const route = useRoute();
const id = ref(route.params.idCourse);
const tabs = [
    { id: 1, title: 'Posts' },
    { id: 2, title: 'Members' },

    { id: 3, title: 'Record' },
];

const router = useRouter();
const tab = ref('posts');
const posts = ref<Assignment[]>([]);
const imageUrls = ref([]);
const imageUrlsResize = ref([]);
const assigmentStore = useAssignmentStore();
const courseStore = useCourseStore();
const showTextArea = ref(false);
const nameAssignment = ref('');
const authStore = useAuthStore();
const imageUrl = ref(null); // Store the image URL
const file = ref(null); // File reference for uploads
const userStore = useUserStore();
const url = 'http://localhost:3000';
const attendanceStore = useAttendanceStore();
const roomSelect = ref<string>();
//mounted get assigment by course id
onMounted(async () => {
    await assigmentStore.getAssignmentByCourseId(id.value.toString());
    await attendanceStore.getAttendanceByCourseId(id.value.toString());
    await userStore.getUserByCourseId(id.value.toString());
    await courseStore.getCourseById(id.value.toString());
    await courseStore.getAllRooms();
    posts.value = assigmentStore.assignments;
    console.log(assigmentStore.assignments);
    console.log(attendanceStore.attendances);

});
const processFile = (url: string) => {

    imageUrls.value.push(url);
};
const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        imageUrls.value = []; // Reset or initialize the array to store new uploads
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const result = e.target?.result as string;
                if (result) {
                    try {
                        const resizedImage = await resizeAndConvertImageToBase64(result, 800, 600);
                        imageUrlsResize.value.push(resizedImage);
                    } catch (error) {
                        console.error('Error resizing image:', error);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }
};

const openPost = () => {
    showTextArea.value = !showTextArea.value;
};
const resizeAndConvertImageToBase64 = (imageUrl, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // If images are from an external source
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const width = img.width * ratio;
            const height = img.height * ratio;

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
        img.src = imageUrl;
    });
};

//create Post
const createPost = async () => {
    if (nameAssignment.value === '') {
        return;
    }
    //find room by roomSelect
    const room = courseStore.rooms.find(r => r.roomNumber === roomSelect.value);

    const newAssignment = {
        assignmentTime: new Date(),
        nameAssignment: nameAssignment.value,
        course: { ...courseStore.currentCourse! },
        assignmentId: 0,
        attdances: [],
        room: room,
        createdDate: new Date(),
        updatedDate: undefined,
        deletedDate: undefined
    };

    await assigmentStore.createAssignment(newAssignment);
    if (imageUrlsResize.value.length > 0) {
        router.push({ path: '/mapping2', query: { imageUrls: imageUrlsResize.value } });
        nameAssignment.value = '';
        imageUrlsResize.value = []; // Clear the images after posting
    } else {
        console.error('No images available for posting.');
    }
}
// getAttendanceStatus
function getAttendanceStatus(attendances: Attendance[], userId: number, assignmentId: number): string {
    const attendance = attendances?.find(att => att.user?.userId === userId && att.assignment?.assignmentId === assignmentId);
    return attendance ? attendance.attendanceStatus : 'No Record Found';
}

</script>
<template>
    <div style="margin-top: 5%; margin-left: 5%;">
        <v-tabs v-model="tab">
            <v-tab v-for="item in tabs" :key="item.id" :value="item.title">
                {{ item.title }}
            </v-tab>
        </v-tabs>

        <v-container>
            <!-- Tab content for posts -->
            <v-tab-item v-if="tab === 'Posts'" value="Posts">
                <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px;">
                    <v-card-title>
                        <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
                    </v-card-title>
                </v-card>

                <v-btn color="primary" @click="openPost" style="margin: 10px 0;">Create Post</v-btn>
                <!-- Conditional text area -->
                <v-card v-if="showTextArea" style="margin: 10px;">
                    <v-container>
                        <v-autocomplete v-model="roomSelect" :items="courseStore.rooms.map(r => r.roomNumber)"
                            item-text="roomNumber" item-value="roomNumber" label="Select a room" outlined
                            return-object></v-autocomplete>
                        <v-textarea v-model="nameAssignment" label="Enter your post" outlined></v-textarea>
                        <v-file-input label="Upload Images" prepend-icon="mdi-camera" filled @change="handleFileChange"
                            accept="image/*" outlined multiple>
                        </v-file-input>
                    </v-container>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="error" @click="showTextArea = false">Cancel</v-btn>
                        <v-btn color="primary" @click="createPost()">Post</v-btn>
                    </v-card-actions>
                </v-card>



                <v-row>
                    <v-col cols="12" sm="12" md="12" v-for="post in posts" :key="post.assignmentId">
                        <CardAssigment :post="post"></CardAssigment>
                    </v-col>
                </v-row>
            </v-tab-item>

            <!-- Tab content for Members -->
            <v-tab-item v-else-if="tab === 'Members'" value="Members">
                <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px;">
                    <v-card-title>
                        <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
                    </v-card-title>
                </v-card>
                <div style="width: 100%; padding: 20px;">

                    <!-- Teacher Section -->
                    <div style="margin-bottom: 30px;">
                        <v-row>
                            <v-col>
                                <h3>Teacher</h3>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="2">
                                <v-avatar size="56">
                                    <v-img
                                        :src="`${url}/users/${courseStore.currentCourse?.user?.userId}/image`"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="10" style="display: flex; align-items: center;">
                                <div>{{ courseStore.currentCourse?.user?.firstName + ' ' +
            courseStore.currentCourse?.user?.lastName }}</div>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- Students Section -->
                    <div>
                        <v-row>
                            <v-col cols="6">
                                <h3>Students</h3>
                            </v-col>
                            <v-col cols="6" style="text-align: end;">
                                <p>{{ userStore.users.length }} Members</p>
                            </v-col>
                        </v-row>
                        <v-row v-for="(member, index) in userStore.users" :key="index">
                            <v-col cols="2">
                                <v-avatar size="56">
                                    <v-img :src="`${url}/users/${member.userId}/image`"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="10" style="display: flex; align-items: center;">
                                <div>{{ member.firstName + ' ' + member.lastName }}</div>
                            </v-col>
                        </v-row>
                    </div>

                </div>
            </v-tab-item>


            <!-- Tab content for Assignments -->
            <!-- Tab Item for Users -->
            <v-tab-item v-else>
                <v-card class="mx-auto" color="primary" max-width="1200" outlined style="padding: 20px;">
                    <v-card-title>
                        <h1 class="text-h5">{{ courseStore.currentCourse?.nameCourses }}</h1>
                    </v-card-title>
                </v-card>
                <!-- Tab Item for Assignment Attendance -->
                <v-card class="mx-auto" outlined style="padding: 20px; margin-top: 10px;">
                    <v-card-title>Assignment Attendance Details</v-card-title>
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-left">Student Name</th>
                                <th class="text-left">Full Score</th>
                                <th v-for="assignment in assigmentStore.assignments" :key="assignment.assignmentId">
                                    {{ assignment.nameAssignment }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr v-for="user in userStore.users" :key="user.userId">
                                <td>{{ user.firstName + ' ' + user.lastName }}</td>
                                <td>{{ courseStore.currentCourse?.fullScore }}%</td>
                                <td v-for="assignment in assigmentStore.assignments" :key="assignment.assignmentId">
                                    <template
                                        v-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'present'">
                                        <v-icon color="green">mdi-check-circle</v-icon> Present
                                    </template>
                                    <template
                                        v-else-if="getAttendanceStatus(attendanceStore.attendances!, user.userId!, assignment.assignmentId!) === 'late'">
                                        <v-icon color="orange">mdi-clock-outline</v-icon> Late
                                    </template>
                                    <template v-else>
                                        <v-icon color="red">mdi-close-circle</v-icon> Absent
                                    </template>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-tab-item>

        </v-container>
    </div>
</template>

<style scoped>
.v-col {
    padding: 10px 0;
    /* Provides consistent vertical spacing between rows */
}
</style>import type Assignment from '@/stores/types/Assignment';
import type Attendance from '@/stores/types/Attendances';
import type Assignment from '@/stores/types/Assignment';
import type Attendance from '@/stores/types/Attendances';

