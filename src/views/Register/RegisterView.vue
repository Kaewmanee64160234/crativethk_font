<script lang="ts" setup>
import router from '@/router';
import { useMessageStore } from '@/stores/message';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import Loader from "@/components/loader/Loader.vue";
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();
const page = ref(1);
const itemsPerPage = 5;
const isLoading = ref(false);
const messageStore = useMessageStore();

const selectedFile = ref(null);
const uploadFile = async () => {
    if (selectedFile.value) {
        try {
            isLoading.value = true;
            await userStore.getFileUser(selectedFile.value);
            for (let i = userStore.file_.length - 1; i >= 0; i--) {
                for (let y = 0; y < userStore.users.length; y++) {
                    if (userStore.users[y].studentId == userStore.file_[i].id || userStore.users[y].email == userStore.file_[i].id + "@go.buu.ac.th") {
                        messageStore.showError("มีนิสิตที่มีรายชื่ออยู่ในระบบแล้ว");
                        userStore.file_.splice(i, 1);
                        break;
                    }
                }
            }
            if (userStore.file_.length === 0) {
                selectedFile.value = null;
            }
            console.log("Updated file list:", userStore.file_);

        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            isLoading.value = false;
        }
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

const saveUser = async () => {
    if (userStore.file_.length === 0) {
        messageStore.showError("ไม่มีรายชื่อนิสิต กรุณาอัปโหลดไฟล์");
        return;
    }
    console.log(userStore.file_.length);
    for (let i = 0; i < userStore.file_.length; i++) {
        const nameParts = userStore.file_[i].name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        userStore.editUser = {
            ...userStore.editUser,  // Spread existing editable user properties if any
            studentId: userStore.file_[i].id,
            firstName: firstName,
            lastName: lastName,
            major: userStore.file_[i].major,
            year: userStore.file_[i].year,
            email: userStore.file_[i].id + "@go.buu.ac.th",
            registerStatus: "notConfirmed",
            role: "นิสิต",
            status: "กำลังศึกษา",
        };
        try {
            await userStore.saveUser();
        } catch (error) {
            console.error("Failed to save user:", error);
        }
    }
    userStore.file_ = [];  // Clear the file list after processing
    selectedFile.value = null;
    messageStore.showInfo("New user created successfully.");
};
</script>
<template>
    <v-container style="padding-top: 120px;">
        <div v-if="isLoading" class="loader-overlay">
            <Loader></Loader>
        </div>
        <v-row>
            <v-col col="6" style="text-align: center;">
                <v-icon size="100" color="#819DA9" style="padding-bottom: 5%;">mdi mdi-folder-arrow-up-outline</v-icon>
                <div></div>
                <v-file-input
                    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    label="Upload File" variant="outlined" prepend-icon="mdi-file-document-plus-outline"
                    v-model="selectedFile" @change="uploadFile()"></v-file-input>
                <div style="color: red;">*อัปโหลดได้เฉพาะ file Excel เท่านั้น</div>
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
                    <v-btn color="error" variant="elevated" @click="cancel">
                        <v-icon left>mdi-close-thick</v-icon>ยกเลิก</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="success" variant="elevated" @click="saveUser()"><v-icon
                            left>mdi-check-bold</v-icon>เสร็จสิ้น</v-btn>
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

.loader-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
}
</style>