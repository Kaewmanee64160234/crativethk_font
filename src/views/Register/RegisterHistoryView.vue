<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
</script>
<template>
    <v-container style="padding-top: 120px;">
        <v-row>
            <v-col style="text-align: center;">
                <h1>ประวัติการลงทะเบียนของนิสิต</h1>
            </v-col></v-row>
        <v-row>
            <v-col col="6">จำนวนนิสิต____คน</v-col>
            <v-col col="6"><v-text-field v-model="userStore.searchQuery" label="ค้าหารหัสหรือชื่อนิสิต" append-inner-icon="mdi-magnify"
                hide-details dense variant="solo" class="search-bar"></v-text-field></v-col>
        </v-row>
            <v-card style="margin-top: 3%;">
                <v-row>
                <v-col style="padding-left: 5%;">
                    <div>รหัสนิสิต</div>
                </v-col>
                </v-row>
            </v-card>
    </v-container>
</template>