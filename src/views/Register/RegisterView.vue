<script lang="ts" setup>
import router from '@/router';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();
const page = ref(1);
const itemsPerPage = 5;

const selectedFile = ref(null);
const uploadFile = async () => {
    if (selectedFile.value) {
        await userStore.getFileUser(selectedFile.value);
    }
};

onMounted(async () => {
    await userStore.getUsers();

});

const paginatedFiles = computed(() => {
    const start = (page.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return userStore.file_.slice(start, end);
});

const pageCount = computed(() => {
    return Math.ceil(userStore.file_.length / itemsPerPage);
});

const cancel = () => {
    userStore.file_ = [];
    selectedFile.value = null;
};

const goToUploadImage = (idUser:number) => {
  router.push(`/uploadImage/${idUser}`);
};

const saveUser = () => {
    for (let i = 0; i < userStore.file_.length; i++) {
        const nameParts = userStore.file_[i].name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        userStore.editUser.studentId = userStore.file_[i].id;
        userStore.editUser.firstName = firstName;
        userStore.editUser.lastName = lastName;
        userStore.editUser.major = userStore.file_[i].major;
        userStore.editUser.year = userStore.file_[i].year;
        userStore.editUser.email = userStore.file_[i].id + "@go.buu.ac.th";
        userStore.editUser.role = "นิสิต";
        userStore.editUser.status = "กำลังศึกษา";
        userStore.saveUser();
        console.log("User saved", userStore.editUser);
    }
};
</script>
<template>
    <v-container style="padding-top: 120px;">
        <v-row>
            <v-col col="6" style="text-align: center;">
                <v-icon size="100" color="#819DA9" style="padding-bottom: 5%;">mdi mdi-folder-arrow-up-outline</v-icon>
                <div></div>
                <v-file-input
                    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    label="Upload File" variant="outlined" prepend-icon="mdi-file-document-plus-outline"
                    v-model="selectedFile" @change="uploadFile()"></v-file-input>
            </v-col>
            <v-col col="6">
                <v-card>
                    <v-card-title>
                        <div>รายชื่อนิสิตทั้งหมด</div>
                    </v-card-title>
                    <div v-if="userStore.file_.length > 0">
                        <v-row v-for="(item, index) in paginatedFiles" :key="index">
                            <v-col style="padding-left: 5%;">
                                <h3>รหัสนิสิต: {{ item.id }}</h3>
                                <p>ชื่อ: {{ item.name }}</p>
                                <p>สาขา: {{ item.major }}</p>
                                <p>ชั้นปี: {{ item.year }}</p>
                            </v-col>
                        </v-row>
                    </div>
                    <div v-else>
                        <v-col style="text-align: center;color: red;">ไม่มีรายชื่อนิสิต</v-col>
                    </div>
                    <v-pagination v-model="page" :length="pageCount" :total-visible="7"></v-pagination>
                </v-card>
                <v-card-actions class="actions">
                    <v-btn color="error" variant="elevated" @click="cancel">ยกเลิก</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="success" variant="elevated" @click="saveUser()">เสร็จสิ้น</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.file-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
}

.actions {
    justify-content: flex-end;
}
</style>