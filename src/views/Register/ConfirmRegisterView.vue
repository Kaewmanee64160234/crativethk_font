<script lang="ts" setup>
import { useMessageStore } from '@/stores/message';
import type { User } from '@/stores/types/User';
import { useUserStore } from '@/stores/user.store';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userStore = useUserStore();
const stdId = ref();
const user = ref<User | undefined>(undefined);
const route = useRoute();
const router = useRouter();
const images = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const url = "http://localhost:3000";
const imageStdUrl = ref('https://reg.buu.ac.th/registrar/getstudentimage.asp?id=');
const messageStore = useMessageStore();
stdId.value = route.params.stdId as string;

onMounted(async () => {
  if (stdId.value) {
    await userStore.getUsersByStdId(stdId.value);
    user.value = userStore.regisUser;
    images.value = user.value?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? [];
  }
});

const cancelRegister = () => {
  if (userStore.currentUser?.role == 'อาจารย์') {
    router.push(`/courseManagement`);
  }
  if (userStore.currentUser?.role == 'แอดมิน') {
    router.push('/userManagement');
  }
};
const confirmRegister = async () => {
  if (userStore.regisUser) {
    userStore.regisUser.registerStatus = 'confirmed';
    console.log("register", userStore.regisUser.registerStatus);
    try {
      await userStore.updateRegisterStatus(userStore.regisUser.userId!, userStore.regisUser);
      messageStore.showInfo("Successfully confirmed register");

      if (userStore.currentUser?.role === 'อาจารย์') {
        router.push(`/courseManagement`);
      } else if (userStore.currentUser?.role === 'แอดมิน') {
        router.push('/userManagement');
      }
    } catch (e) {
      console.error("Error in confirmRegister:", e);
      messageStore.showError("Failed to update register status");
    }
  } else {
    messageStore.showError("Registration user not found");
  }
};
</script>
<template>
  <v-container style="padding-top: 120px;">
    <v-card>
      <v-row>
        <v-col style="text-align: center;">
          <h1>ยืนยันการลงทะเบียนของนิสิต</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col style="text-align: center;">
          <h3>{{ userStore.regisUser?.studentId + " " + userStore.regisUser?.firstName + " " +
            userStore.regisUser?.lastName }}</h3>
        </v-col>
      </v-row>
      <v-row class="d-flex justify-center">
        <v-col cols="2" md="2" lg="2">
          <v-img :src="imageStdUrl + userStore.regisUser?.studentId" alt="User Image"
            class="rounded-lg d-flex align-center justify-center" />
        </v-col>
      </v-row>
      <v-row class="d-flex justify-center">
        <v-col v-for="(image, index) in images" :key="'existing-' + index" cols="2" md="2" lg="2"
          class="image-container">
          <v-img :src="image" aspect-ratio="1" class="rounded-lg d-flex align-center justify-center"></v-img>
        </v-col>
      </v-row>
      <v-card-actions>
        <v-btn color="error" @click="cancelRegister">ปฎิเสธ</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="confirmRegister">ยืนยัน</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style>
.image-container {
  position: relative;
  margin-bottom: 1rem;
}
</style>