<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const showDialog = ref(true);
const url = "http://localhost:3000";
const imageUrls = ref<string[]>([]);
const imageFiles = ref<File[]>([]);

async function close() {
  userStore.closeImageDialog();
}

async function save() {
  await userStore.saveUser();
  userStore.resetUser();
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          try {
            const resizedImage = await resizeAndConvertImageToBase64(result, 800, 600);
            imageUrls.value.push(resizedImage);
            imageFiles.value.push(file);
          } catch (error) {
            console.error("Error resizing image:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const resizeAndConvertImageToBase64 = (imageUrl: string, maxWidth: number, maxHeight: number) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${imageUrl}`));
    img.src = imageUrl;
  });
};

// Example images array, replace with actual image sources from your store
const images = ref<string[]>(userStore.currentUser?.images?.map((image: string) => `${url}/users/image/filename/${image}`) ?? []);

function removeImage(index: number) {
  images.value.splice(index, 1);
  // Optionally, update the user store with the new images list
  userStore.currentUser.images = images.value.map(image => image.replace(`${url}/users/image/filename/`, ''));
}

function removeUploadeImage(index: number) {
  imageUrls.value.splice(index, 1);
  imageFiles.value.splice(index, 1); 
}


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
            <v-col v-for="(image, index) in images" :key="index" cols="6" md="4" lg="3" class="image-container">
              <v-img :src="image" aspect-ratio="1"></v-img>
              <v-btn icon small @click="removeImage(index)" class="close-button">
                <v-icon color="red">mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col  cols="6" md="4" lg="3" class="image-container" v-for="(image, index) in [...imageUrls]" :key="index">
              <v-img :src="image" aspect-ratio="1" class="ma-2"></v-img>
              <v-btn icon small @click="removeUploadeImage(index)" class="close-button">
                <v-icon color="red">mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="12">
              <!-- File Input -->
              <v-file-input label="Upload Images" prepend-icon="mdi-camera" filled @change="handleFileChange"
                accept="image/*" variant="outlined"></v-file-input>
            </v-col>
          </v-row>
          <v-row justify="end">
            <v-col cols="auto">
              <v-btn color="primary" @click="save">อัปโหลด</v-btn>
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

.image-container {
  position: relative;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
