<template>
    <div class="centered-container">
      <v-card class="embossed-card" max-width="600" elevation="10">
        <v-row>
          <v-col cols="12" class="text-center">

            <h1 class="headline">403 - Forbidden</h1>
            <p class="subtitle-1">You do not have permission to access this page.</p>
            <v-btn
              color="primary"
              class="mt-4"
              @click="goHome"
              rounded
              large
            >
              Go to Home
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const userStore = useUserStore();
  
  const goHome = () => {
    if (userStore.currentUser?.role === 'นิสิต') {
      router.push('/enrolmentManagement');
    } else {
      router.push('/courseManagement');
    }
   
  };
  </script>
  
  <style scoped>
  .centered-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
  }
  
  .embossed-card {
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .headline {
    font-family: 'Suez One', serif;
    font-size: 32px;
    color: #333;
  }
  
  .subtitle-1 {
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    color: #666;
  }
  </style>
  