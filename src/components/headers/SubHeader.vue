<script lang="ts" setup>
import { useUserStore } from "@/stores/user.store";
const userStore = useUserStore();
</script>
<template>
  <v-card>
    <v-navigation-drawer expand-on-hover rail permanent color="#F1F1F1">
        <v-list color="#2D4C7A">
          <div v-if="userStore.currentUser?.role === 'อาจารย์'">
            <v-list-item link to="/courseManagement" prepend-icon="mdi-home-circle" title="รายวิชาที่สอน" value="my-courses"></v-list-item>
          </div>
          <div v-if="userStore.currentUser?.registerStatus === 'confirmed'">
            <v-list-item link to="/enrolmentManagement" prepend-icon="mdi-account-school" title="รายวิชาที่ลงทะเบียน" value="my-enrollment"></v-list-item>
          </div>
          <div v-if="userStore.currentUser?.role === 'แอดมิน'">
            <v-list-item link to="/userManagement" prepend-icon="mdi-account-edit" title="การจัดการผู้ใช้" value="user-management"></v-list-item>
          </div>

          <v-list-item link to="/userProfile" prepend-icon="mdi-account-circle" title="ประวัติผู้ใช้งาน" value="my-profile"></v-list-item>
          <div v-if="userStore.currentUser?.role === 'แอดมิน'">
            <v-list-item link to="/register" prepend-icon="mdi-folder-arrow-up" title="อัปโหลดข้อมูลนิสิต" value="upload-std"></v-list-item>
          </div>
        </v-list>
        <v-list-item class="bottom-list-item" link to="/" prepend-icon="mdi-location-exit" title="ออกจากระบบ" value="exit"></v-list-item>
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
