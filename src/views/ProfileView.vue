<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user.store';
import { useCourseStore } from "@/stores/course.store";
import { useEnrollmentStore } from "@/stores/enrollment.store";
import { useRouter } from 'vue-router';
import ImageDialog from '@/components/dialogs/ImageDialog.vue';
import type Course from '../stores/types/Course';
import type { User } from '@/stores/types/User';

const tab = ref(0);
const userStore = useUserStore();
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const url = import.meta.env.VITE_API_URL;
const router = useRouter();
const images = ref<string[]>([]);
const user = ref<User | undefined>(undefined);

const isStudent = computed(() => userStore.currentUser?.role === 'นิสิต');
const isTeacher = computed(() => userStore.currentUser?.role === 'อาจารย์');
const isAdmin = computed(() => userStore.currentUser?.role === 'แอดมิน');

console.log(userStore.currentUser)

const showChekingHistory = (course: Course) => {
    router.push('/checkingHistory/' + course.coursesId);
};

onMounted(async () => {
    await userStore.getCurrentUser();
    if (isTeacher.value && userStore.currentUser!.teacherId) {
        await courseStore.getCourseByTeachId(userStore.currentUser!.teacherId!);
    }
    if (isStudent.value && userStore.currentUser!.studentId) {
        // await userStore.createQrByStdId(userStore.currentUser!.studentId);
        await enrollmentStore.getCourseByStudentId(userStore.currentUser!.studentId!);
        await userStore.getUsersByStdId(userStore.currentUser!.studentId!);
        user.value = userStore.regisUser;
        images.value = user.value?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? [];
        if (images.value.length > 0 && user.value?.registerStatus == 'notConfirmed') {
            userStore.createQrByStdId(user.value.studentId!);
        }
        console.log("image",images.value)
    }
    await userStore.getUsersById(userStore.currentUser?.userId!);
    // await userStore.getCurrentUser();
    
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
                            <v-col class="d-flex justify-center align-center">
                                <img style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%;"
                                    :src="`${url}/users/${userStore.currentUser!.userId}/image`">
                            </v-col>
                            <v-col v-if="userStore.currentUser">
                                <v-row>
                                    <v-col cols="12" v-if="isStudent">
                                        <strong>รหัสนิสิต: </strong>{{ userStore.currentUser?.studentId }}
                                    </v-col>
                                    <v-col cols="12">
                                        <strong>ชื่อ-นามสกุล: </strong>{{ userStore.currentUser?.firstName }} {{
                                            userStore.currentUser?.lastName }}
                                    </v-col>
                                    <v-col cols="12" v-if="isStudent">
                                        <strong>ชั้นปี: </strong>{{ userStore.currentUser?.year }}
                                    </v-col>
                                    <v-col cols="12" v-if="isStudent">
                                        <strong>สาขา: </strong>{{ userStore.currentUser?.major }}
                                    </v-col>
                                    <v-col cols="12" v-if="isTeacher || isAdmin">
                                        <strong>ตำแหน่ง: </strong>{{ userStore.currentUser?.role }}
                                    </v-col>
                                    <v-col cols="12" v-if="isTeacher|| isAdmin">
                                        <strong>สถานะภาพ: </strong>{{ userStore.currentUser?.status }}
                                    </v-col>
                                    <v-col cols="12">
                                        <v-btn color="blue" @click="userStore.showImageDialog = true"
                                            v-if="isStudent">แสดงรูปภาพทั้งหมด</v-btn>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col>
                                <v-img :src="userStore.QR"
                                    style="width: 200px; height: 200px; object-fit: cover;"></v-img>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Attendance History Tab -->
        <v-row>
            <v-col cols="12">
                <v-card v-if="isTeacher || isStudent">
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
                                        <tr v-for="(item, index) of enrollmentStore.enrollments" :key="index">
                                            <td>{{ item.course?.nameCourses }}</td>
                                            <td class="text-center">
                                                <v-btn size="small" color="primary"
                                                    @click="showChekingHistory(item.course!)" class="ma-2">
                                                    ดูประวัติการเช็คชื่อ
                                                </v-btn>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tbody v-if="isTeacher">
                                        <tr v-for="(item, index) of courseStore.courses" :key="index">
                                            <td>{{ item.nameCourses }}</td>
                                            <td class="text-center">
                                                <v-btn size="small" color="primary" @click="showChekingHistory(item)"
                                                    class="ma-2">
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

    <!-- Image Dialog -->
    <v-dialog v-model="userStore.showImageDialog" persistent max-width="800px">
        <ImageDialog></ImageDialog>
    </v-dialog>
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

.v-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
}

img {
    border-radius: 50%;
}
</style>
