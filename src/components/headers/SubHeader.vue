<template>
  <v-card>
    <v-navigation-drawer app permanent width="80">
      <v-layout style="margin-top: 10%; margin-left: 5%">
        <v-list density="compact">
          <v-list-item link to="/courseManagement">
            <v-icon size="40">mdi-home-circle</v-icon>
          </v-list-item>
          <v-list-item link>
            <v-icon size="40">mdi-account-circle</v-icon>
          </v-list-item>
          <v-list-item class="bottom-list-item" link to="/">
            <v-icon size="40">mdi-location-exit</v-icon>
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
