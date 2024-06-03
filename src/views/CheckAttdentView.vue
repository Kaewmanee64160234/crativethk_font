<script setup lang="ts">
import { useAssignmentStore } from '@/stores/assignment.store';
import { useCourseStore } from '@/stores/course.store';
import { useRoute, useRouter } from 'vue-router';


const students = [
    { id: '64160047', name: 'John Doe', status: 'Present', image1: 'https://plus.unsplash.com/premium_photo-1671718111036-0a4b73625a4a?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', image2: 'https://images.unsplash.com/photo-1712847333437-f9386beb83e4?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxzZWFyY2h8MXx8aHVtYW58ZW58MHx8MHx8fDA%3D', description: ' 98% Matching' },
    { id: '64160048', name: 'Jane Doe', status: 'Absent', image1: 'https://plus.unsplash.com/premium_photo-1671656333460-793292581bc6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', image2: 'https://plus.unsplash.com/premium_photo-1671656333460-793292581bc6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: '20% Matching' },

]
const items = ['Present', 'Absent']
const selected = ['Present']
//get parameter from url use router
const route = useRoute()
const  id  = route.params.courseId
const courseStore = useCourseStore()
const assigmentStore = useAssignmentStore()

</script>
<template>
    <v-container fluid style="margin-top: 5%; margin-left: 5%;">
        <v-row>
            <!-- Left Column for Student List -->
            <v-col cols="12" md="6" style="width: 40%;">
                <v-card class="pa-4">
                    <v-card-title>Student List</v-card-title>
                    <!-- create drop down button for filter -->
                    <v-select v-model="selected" :items="items" label="Select" multiple clearable
                        style="width: 25%"></v-select>
                    <v-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">ID</th>
                                    <th class="text-left">Name</th>
                                    <th class="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in students" :key="item.id">
                                    <td>{{ item.id }}</td>
                                    <td>{{ item.name }}</td>
                                    <td>{{ item.status }}</td>
                                </tr>
                            </tbody>
                        </template>
                    </v-table>
                </v-card>
            </v-col>

            <!-- Right Column for Statistics and Images -->
            <v-col cols="12" md="6" style="width: 60%;">
                <v-row>
                    <v-col cols="12" md="7" style="width: 65%;">
                        
                        <v-card-title>{{ assigmentStore.assignment?.nameAssignment }}</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="4" style="text-align: center"> <div>
                                        <v-card-title>96</v-card-title>
                                        <v-card-text>มา</v-card-text>
                                    </div> </v-col>
                                <v-col cols="4" style="text-align: center"> <div>
                                        <v-card-title>2</v-card-title>
                                        <v-card-text>รอดำเนินการ</v-card-text>

                                    </div> </v-col>
                                <v-col cols="4" style="text-align: center"><div>
                                        <v-card-title>1</v-card-title>
                                        <v-card-text>ระบุตัวตนไม่ได้</v-card-text>
                                    </div></v-col>
                            </v-row>
                        </v-card-text>

                    </v-col>

                    <v-container style="width: 50%;"></v-container>
                </v-row>

                <!-- Cards for Student Comparisons -->
                <v-container >
                    <v-row>
                        <v-col cols="12" md="5" v-for="(student, index) in students" :key="index">
                            <!-- Student Identification Card -->
                            <v-card class="mx-auto pa-3" outlined elevation="2">
                                <!-- Card Title with ID and Name -->
                                <v-card-title class="justify-space-between d-flex">
                                    <span>{{ student.id }} {{ student.name }}</span>
                                </v-card-title>

                                <!-- Images Row -->
                                <v-row>
                                    <v-col cols="6">
                                        <v-img :src="student.image1" aspect-ratio="1" class="grey lighten-2"></v-img>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-img :src="student.image2" aspect-ratio="1" class="grey lighten-2"></v-img>
                                    </v-col>
                                </v-row>

                                <!-- Card Text with Details -->
                                <v-card class="ma-3" outlined color="green" elevation="2">
                                    <v-card-text style="text-align: center">
                                        <div>{{ student.description }}</div>
                                        <div>รหัสนักศึกษา: 64160047 ฟาฟิศ</div>
                                        <div>รุ่นที่ตรวจสอบ: 64160047 ฟาฟิศ</div>
                                    </v-card-text>
                                </v-card>

                                <!-- Card Actions for Interaction -->
                                <v-card-actions>
                                    <v-btn color="error">ปฏิเสธ</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn color="success">ยืนยัน</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>
    </v-container>

</template>



<style>
/* Add styles here if needed */
</style>