<script lang="ts" setup>
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/stores/types/User';
import { onMounted, ref } from 'vue';
import { decodeCredential, GoogleLogin } from 'vue3-google-login';
const authStore = useAuthStore();
const currentUser = ref<User>();
const loginError = ref(false);
const email = ref('');
const loginErrorMessage = ref('');
let galleryImageBase64 = '';

const login = async () => {
    authStore.login(email.value);
}
const callback = (response: any) => {
  console.log(response);

  if (response.credential) {
    const user:any = decodeCredential(response.credential);
    console.log('User:', user);
    console.log(user!.hd!);
    if (user!.hd! !== 'go.buu.ac.th') {
      alert(response.hd + ' is not a go.buu.ac.th domain');
    } else {
      authStore.currentUser = {
        email: user.email,
        firstName: user.given_name,
        lastName: user.family_name,
     
        picture: user.picture,
      }
      // authStore.login();
      router.push('/courseManagement');

    }
  } else {
    loginErrorMessage.value = 'Unable to login. Please try again.';
    loginError.value = true;
  }
};

function findGalleryItemByEmail() {
  const username = authStore.currentUser.email!.split('@')[0];
  const galleryItem = authStore.gallery.find(item => item.idStudent === username);
  const uint8Image = convertFloat32ToUint8(galleryItem?.descriptor);

  // Convert Uint8Array to string
  let str = '';
  for (let i = 0; i < uint8Image.length; i++) {
    str += String.fromCharCode(uint8Image[i]);
  }

  // Convert string to base64
  galleryImageBase64 = 'data:image/jpeg;base64,' + btoa(str);
}

function convertFloat32ToUint8(gallery: any) {
  const minValue = Math.min(...gallery);
  const maxValue = Math.max(...gallery);
  const uint8Array = new Uint8Array(gallery.length);
  for (let i = 0; i < gallery.length; i++) {
    const normalizedValue = (gallery[i] - minValue) / (maxValue - minValue);
    const uint8Value = Math.round(normalizedValue * 255);
    uint8Array[i] = uint8Value;
  }

  return uint8Array;
}

</script>
<template>

  <div class="centered-container">
    <v-card class="embossed-card" style="text-align: center; border-radius: 20px; border: 2px solid rgba(0, 0, 0, 0.1); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); opacity: 1; " width="75vw" height="70vh">
      <v-row no-gutters style="height: 100%;">
    <v-col cols="6">
      <h1 class = "headline" style="text-align: left; padding-top: 40pt; padding-left: 80pt;" >Student Attendance</h1><br>
      <h3 class = "text-body" style="text-align: left; font-size: larger; padding-left: 125pt; font-weight: normal; ">System Management</h3>
      <img class = "image-size" src="../assets/cttk humen.png" /> 
    </v-col>
    <v-col style="background-color: #ECEFF1;" cols="6" >
      <h2 class = "subtitle" style="text-align: right; padding-right: 45%; padding-top: 80pt; font-size: larger;" width="20vw" height="22vh">Sign in</h2><br><br>
      <h3 class = "card-subtitle" style="text-align: right; padding-right: 38%; font-weight: normal; " width="20vw" height="22vh">Hello Welcome</h3>
      <div v-if="authStore.currentUser.email=''">
      <v-img style="" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" height="100"></v-img>
    </div>  
      <div v-else>
        <div  style="text-align: center ; padding-top: 40pt; ">  
          <GoogleLogin :callback="callback" style="border-radius: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); width: 180px;" />

        <p v-if="loginError">{{ loginErrorMessage }}</p>
      </div>
    
        <!-- <h1 style="text-align: center;">Welcome, {{ authStore.currentUser?.firstName + ' ' + authStore.currentUser?.lastName }}</h1>
        <img :src="authStore.currentUser?.picture" alt="User Picture" style="border-radius: 50%;"/> -->
        <!-- button push to mapping2 -->
        <!-- <div style="margin-top: 3%;"> -->
        <v-btn>
          <router-link to="/mapping2">Mapping</router-link>
        </v-btn>
        <!-- </div> -->
        <v-text-field   v-model="email"  label="Login Name" required></v-text-field>
        <v-btn color="white" style="background-color: #5D9C59; width:410px; height: 50px; margin-left: 10%; border-radius: 50px; box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -5px;"
                      @click="login">Login</v-btn>
      </div>
    </v-col>
  </v-row>
      
    </v-card>
  </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Suez+One&family=Inter:wght@400;700&family=Istok+Web:wght@400;700&family=Inria+Sans:wght@400;700&display=swap');

.centered-container {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 100vh; /* This will make the container cover the entire viewport height */
  /* background-image: url('D:\Model create thinking\CreatethinkFont\cttk background.jpg'); */
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  height: 100vh;
  background-image: url('../assets/cttk background.jpg');
  background-size: cover;
  background-position: center;
  width: 100%;
}
.embossed-card {
  background-color: #f5f5f5c8; /* Set the background color to light gray */
  border: 2px solid rgba(0, 0, 0, 0.1); /* Add a border with a slight transparency */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08); /* Add multiple box shadows for an embossed effect */
}
.smaller-text-field {
    width: 320px; /* Set the width to your desired size */
    justify-content: center;
    align-items: center;
}
.image-size {
  width: 70%;
  height: 50%;
  /* display: flex; */
  justify-content: center;
  align-items: center;
}
.headline {
  font-family: 'Suez One', serif;
}

.text-body {
  font-family: 'Inter', sans-serif;
}

.subtitle {
  font-family: 'Istok Web', sans-serif;
}

.card-subtitle {
  font-family: 'Inria Sans', sans-serif;
}

</style>