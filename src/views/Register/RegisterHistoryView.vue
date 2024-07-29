<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
</script>
<template>
    <v-container style="padding-top: 120px;">
        <v-row>
            <v-col style="text-align: center;">
                <h1>ประวัติการลงทะเบียนของนิสิต</h1>
            </v-col></v-row>
        <v-row>
            <v-col col="6">จำนวนนิสิต {{ userStore.register.length }} คน</v-col>
            <v-col col="6"><v-text-field v-model="userStore.searchQuery" label="ค้าหารหัสหรือชื่อนิสิต"
                    append-inner-icon="mdi-magnify" hide-details dense variant="solo"
                    class="search-bar"></v-text-field></v-col>
        </v-row>
        <v-card style="margin-top: 3%;">
            <!-- <div v-if="userStore.register.length > 0"> -->
            <v-table>
                <thead>
                    <tr>
                        <th class="text-center vertical-divider">รหัสนิสิต</th>
                        <th class="text-center vertical-divider">ชื่อ</th>
                        <th class="text-center vertical-divider">ชั้นปี</th>
                        <th class="text-center vertical-divider">สาขา</th>
                        <th class="text-center vertical-divider">สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in userStore.register" :key="index">
                        <td>{{ item.studentId }}</td>
                        <td>{{ item.firstName + " " + item.lastName }}</td>
                        <td>{{ item.year }}</td>
                        <td>{{ item.major }}</td>
                        <td></td>
                    </tr>
                </tbody>
            </v-table>
            <!-- </div> -->
            <!-- <div v-else>
                <v-col style="text-align: center;color: red;">ไม่มีรายชื่อนิสิต</v-col>
            </div> -->
        </v-card>
    </v-container>
</template>

<style>
.vertical-divider {
    border-left: 1px solid #e0e0e0;
    /* สีของเส้นแบ่ง */
    height: auto;
    /* ให้สูงตามความสูงของ col */
}
</style>