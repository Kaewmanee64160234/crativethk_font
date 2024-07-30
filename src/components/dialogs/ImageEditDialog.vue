<script lang="ts" setup>
  import { ref } from 'vue';
  import { useUserStore } from '@/stores/user.store';
  
  const userStore = useUserStore();
  const showDialog = ref(true);
  const url = "http://localhost:3000";
  

  async function close() {
    userStore.closeImageDialog();
}
  
  // Example images array, replace with actual image sources from your store
  const images = userStore.editUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? [];
  </script>
  
<template>
    <v-container style="padding-top: 120px;">
      <v-dialog v-model="showDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline" style="display: flex; justify-content: space-between;">
            รูปภาพทั้งหมด
            <v-btn icon @click="close">
              <v-icon color="red">mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="(image, index) in images" :key="index" cols="6" md="4" lg="3">
                <v-img :src="image" aspect-ratio="1"></v-img>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </template>

  <style scoped>
  .headline {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>
  