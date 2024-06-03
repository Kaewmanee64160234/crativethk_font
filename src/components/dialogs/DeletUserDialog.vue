<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';
const userStore = useUserStore();

const deleteUser = (idUser : number) => {
    userStore.deleteUser(idUser);
    userStore.showDeleteDialog = false;
}

</script>

<template>
    <v-container>
        <v-row justify="center">
            <v-card class="cardText">
                <v-card-title class="text-h4 mt-6" style="text-align: center;">ต้องการลบผู้ใช้รหัส {{ userStore.currentUser?.studentId }} หรือไม่</v-card-title>
                <v-card-actions class="actions">
                    <v-btn class="text-h5" @click="userStore.showDeleteDialog = false">ยกเลิก</v-btn>
                    <v-btn class="colorText text-h5" @click="deleteUser(userStore.currentUser!.userId ?? 0)">ยืนยันการลบผู้ใช้
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-row>
    </v-container>
</template>


<style>
.actions {
    justify-content: flex-end;
    margin-top: 3%;
}
.colorText {
    color: #2A6EC5;
}
.cardText {
    width: auto;
    height: 18vh;
}
</style>