<script lang="ts" setup>
import { useUserStore } from "@/stores/user.store";

const userStore = useUserStore();
</script>
<template>
  <v-card>
    <!-- <v-navigation-drawer app permanent width="80" color="#F1F1F1">  -->
    <v-navigation-drawer expand-on-hover rail permanent color="#F1F1F1">
      <!-- <v-layout style="margin-top: 10%; margin-left: 5%"> -->
        <v-list>
          <div v-if="userStore.currentUser?.teacherId">
            <v-list-item link to="/courseManagement" prepend-icon="mdi-human-male-board" title="รายวิชาที่สอน" value="my-courses"></v-list-item>
            <!-- <v-list-item link to="/courseManagement" prepend-icon="mdi-human-male-board">
              <v-icon size="40" color="#819DA9">mdi mdi-human-male-board</v-icon>
            </v-list-item> -->
          </div>
          <div v-if="userStore.currentUser?.studentId && userStore.currentUser?.registerStatus == 'confirmed'">
            <v-list-item link to="/enrolmentManagement" prepend-icon="mdi-account-school" title="รายวิชาที่ลงทะเบียน" value="my-enrollment"></v-list-item>
            <!-- <v-list-item link to="/enrolmentManagement">
              <v-icon size="40" color="#819DA9">mdi mdi-human-male-board</v-icon>
            </v-list-item> -->
          </div>
          <div v-if="userStore.currentUser?.role === 'แอดมิน'">
            <v-list-item link to="/userManagement" prepend-icon="mdi-account-edit" title="การจัดการผู้ใช้" value="user-management"></v-list-item>
            <!-- <v-list-item link to="/userManagement">
              <v-icon size="40" color="#819DA9">mdi mdi-account-edit</v-icon>
            </v-list-item> -->
          </div>
          <v-list-item link to="/userProfile" prepend-icon="mdi-account-circle" title="ประวัติผู้ใช้งาน" value="my-profile"></v-list-item>
          <!-- <v-list-item link to="/userProfile">
            <v-icon size="40" color="#819DA9">mdi mdi-account</v-icon>
          </v-list-item> -->

          <div v-if="userStore.currentUser?.role === 'แอดมิน'">
            <v-list-item link to="/register" prepend-icon="mdi-folder-arrow-up" title="อัปโหลดข้อมูลนิสิต" value="upload-std"></v-list-item>
            <!-- <v-list-item link to="/register">
              <v-icon size="40" color="#819DA9">mdi mdi-book-plus</v-icon>
            </v-list-item> -->
          </div>
        </v-list>
        <v-list-item class="bottom-list-item" link to="/" prepend-icon="mdi-location-exit" title="ออกจากระบบ" value="exit"></v-list-item>
        <!-- <v-list-item class="bottom-list-item" link to="/">
          <v-icon size="40" color="#819DA9">mdi-location-exit</v-icon>
        </v-list-item> -->
      <!-- </v-layout> -->
      <RouterView name="menu"></RouterView>
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
