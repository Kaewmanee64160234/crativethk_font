<script lang="ts" setup>
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';


const userStore = useUserStore();
const getStatus = (item: any) => {
    return item.image1 != null ? 'ลงทะเบียนเสร็จสิ้น' : 'ยังไม่ลงทะเบียน';
};

</script>
<template>
    <v-container style="padding-top: 120px;">
        <v-row>
            <v-col style="text-align: center;">
                <h1>ประวัติการลงทะเบียนของนิสิต</h1>
            </v-col></v-row>
    </v-container>
</template>

<style>
</style>