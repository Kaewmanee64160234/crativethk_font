<script lang="ts" setup>
import { useUserStore } from "@/stores/user.store";

const userStore = useUserStore();
</script>
<template>
  <v-card>
    <v-navigation-drawer app permanent width="80" color="#F1F1F1">
      <v-layout style="margin-top: 10%; margin-left: 5%">
        <v-list density="compact">
          <div v-if="userStore.currentUser?.teacherId">
            <v-list-item link to="/courseManagement">
              <v-icon size="40" color="#819DA9">mdi mdi-human-male-board</v-icon>
            </v-list-item>
          </div>
          <div v-if="userStore.currentUser?.studentId">
            <v-list-item link to="/enrolmentManagement">
              <v-icon size="40" color="#819DA9">mdi mdi-human-male-board</v-icon>
            </v-list-item>
          </div>
          <div v-if="userStore.currentUser?.role === 'แอดมิน'">
            <v-list-item link to="/userManagement">
              <v-icon size="40" color="#819DA9">mdi mdi-account-edit</v-icon>
            </v-list-item>
          </div>
          <div v-if="userStore.currentUser?.teacherId">
            <v-list-item link to="/enrolmentManagement">
            <v-icon size="40" color="#819DA9">mdi mdi-book</v-icon>
          </v-list-item>
          </div>
          <div v-if="userStore.currentUser?.role === 'แอดมิน'">
            <v-list-item link to="/register">
            <v-icon size="40" color="#819DA9">mdi mdi-book-plus</v-icon>
          </v-list-item>
          </div>
          <v-list-item class="bottom-list-item" link to="/">
            <v-icon size="40" color="#819DA9">mdi-location-exit</v-icon>
          </v-list-item>
        </v-list>
      </v-layout>
      <RouterView name="menu"></RouterView>
      <!-- แสดงเมนูที่เป็น dynamic component -->
    </v-navigation-drawer>
  </v-card>
</template>

<style>
.bottom-list-item {
  position: fixed;
  bottom: 0;
  width: 100%;
  margin-bottom: 20px;
}
</style>
