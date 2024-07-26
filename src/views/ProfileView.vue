<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user.store';
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useRouter } from 'vue-router'; // Import the 'useRouter' function from the 'vue-router' package
import type Course from '../stores/types/Course';
const tab = ref(0);
const userStore = useUserStore();
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const url = 'http://localhost:3000';

const router = useRouter(); // Create a 'router' object using the 'useRouter' function


const isStudent = computed(() => userStore.currentUser?.role === 'นิสิต');
const isTeacher = computed(() => userStore.currentUser?.role === 'อาจารย์');


const showChekingHistory = (course: Course) => {
    router.push('/checkingHistory/' + course.coursesId);
};

onMounted(async () => {
  await courseStore.getCourseByTeachId(userStore.currentUser!.teacherId!);
  await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
});


</script>
<template>
    <v-container style="padding-top: 120px;">
        <v-text style="font-size: 24px; font-weight: bold;">ประวัติผู้ใช้งาน</v-text>
        <!-- Profile Card -->
        <v-row class="my-4">
            <v-col cols="12">
                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="4" class="d-flex justify-center align-center">
                                <img style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%;"
                                    :src="`${url}/users/${userStore.currentUser!.userId}/image`">
                            </v-col>
                            <v-col cols="12" md="8" v-if="userStore.currentUser">
                                <v-row>
                                    <v-col cols="12">
                                        <strong v-if="isStudent">รหัสนิสิต: </strong>{{ userStore.currentUser?.studentId
                                        }}
                                        <strong v-if="isTeacher">รหัสอาจารย์: </strong>{{
                                        userStore.currentUser?.teacherId }}
                                    </v-col>
                                    <v-col cols="12">
                                        <strong>ชื่อ-นามสกุล: </strong>{{ userStore.currentUser?.firstName }} {{
                                        userStore.currentUser?.lastName }}
                                    </v-col>
                                    <v-col cols="12">
                                        <v-btn color="blue">แสดงรูปภาพทั้งหมด</v-btn>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Attendance History Tab -->
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-tabs v-model="tab" bg-color="primary">
                        <v-tab style="margin-top: auto">ประวัติการเช็คชื่อ</v-tab>
                    </v-tabs>
                    <v-card-text>
                        <v-tab-item v-if="tab === 0">
                            <v-table dense>
                                <template v-slot:default>
                                    <thead>
                                        <tr>
                                            <th class="text-left" style="font-weight: bold;">รายวิชา</th>
                                            <th class="text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="isStudent">
                                        <tr  v-for="(item, index) of enrollmentStore.enrollments" :key="index">
                                            <td >{{ item.course?.nameCourses }}</td>
                                            <td class="text-center">
                                                <v-btn size="small" color="primary" @click="showChekingHistory(item.course!)" class="ma-2">
                                                    ดูประวัติการเช็คชื่อ
                                                 </v-btn>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <!-- tbody -->
                                    <tbody v-if="isTeacher">
                                        <tr  v-for="(item, index) of courseStore.courses" :key="index">
                                            <td >{{ item.nameCourses }}</td>
                                            <td class="text-center">
                                                 <v-btn size="small" color="primary" @click="showChekingHistory(item)" class="ma-2">
                                                    ดูรายวิชา
                                                 </v-btn>
                                            </td>
                                        </tr>
                                    </tbody>

                                </template>
                            </v-table>
                        </v-tab-item>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.circle-image {
    border-radius: 50%;
}

.v-card-title {
    background-color: #3051AC;
    color: white;
    padding: 10px;
}

.v-card-text {
    padding: 20px;
}

.v-btn {
    margin-top: 10px;
}
</style>