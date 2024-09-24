<script lang="ts" setup>
import { useCourseStore } from "@/stores/course.store";
import { useMessageStore } from "@/stores/message";
import { useUserStore } from "@/stores/user.store";
import { onMounted, ref } from "vue";
const courseStore = useCourseStore();
const userStore = useUserStore();
const selectedFile = ref(null);
const checkStd = ref(true);

const uploadFile = async () => {
  if (selectedFile.value) {
    await courseStore.getFileUser(selectedFile.value);
  }
};

onMounted(async () => {
  await userStore.getUsers();

});

</script>

<template>
  <v-card-title>
    <h3>เพิ่มรายชื่อนิสิต</h3>
  </v-card-title>
  <v-card-text>
    <v-card class="mb-4">
      <v-row>
        <v-col col="12" sm="6">
          <v-card-title>
            <h5>อัปโหลดไฟล์</h5>
          </v-card-title>
          <v-card-text>
            <v-file-input
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              label="เลือกไฟล์อัปโหลด" variant="outlined" prepend-icon="mdi-file-document-plus-outline"
              v-model="selectedFile" @change="uploadFile()"></v-file-input>
          </v-card-text>
        </v-col>
      </v-row>
      <v-card style="max-height: 300px; width: 95%; margin: 0 auto; overflow-y: auto;">
          <v-row>
            <v-col>
              <div v-if="courseStore.files.length > 0">
                <v-row align="center" v-for="(item, index) in courseStore.files" :key="index">
                  <v-col cols="auto">
                    <v-avatar size="50">
                      <v-img></v-img>
                    </v-avatar>
                  </v-col>
                  <v-col>
                    <h3>{{ item.id }}</h3>
                    <p>{{ item.name }}</p>
                  </v-col>
                  <v-col cols="auto">
                    <v-checkbox color="primary" v-model="checkStd"></v-checkbox>
                  </v-col>
                </v-row>
              </div>
              <div v-else>
                <v-col style="text-align: center;color: red;">ไม่มีรายชื่อนิสิต</v-col>
              </div>
            </v-col>
          </v-row>
        </v-card>
    </v-card>
  </v-card-text>
</template>

<style scoped>
.title {
  margin-left: 3%;
  margin-top: 1%;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
