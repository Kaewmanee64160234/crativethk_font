<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-row class="fill-height">
        <v-col class="d-flex flex-column justify-center align-center text-center">
          <span class="loader"></span>
          <div class="mt-4">Loading...</div>
        </v-col>
      </v-row>
</template>

<style>
.fill-height {
    min-height: 80vh;
  }

.loader {
    width: 64px;
    height: 64px;
    position: relative;
    background-image:
      linear-gradient(#38badb 16px, transparent 0) ,
      linear-gradient(#3051AC 16px, transparent 0) ,
      linear-gradient(#3051AC 16px, transparent 0) ,
      linear-gradient(#38badb 16px, transparent 0);
    background-repeat: no-repeat;
    background-size: 16px 16px;
    background-position: left top , left bottom , right top , right bottom;
    animation: rotate 1s linear infinite;
  }
  @keyframes rotate {
    0% {
      width: 64px;
      height: 64px;
      transform: rotate(0deg)
    }
    50% {
      width: 30px;
      height: 30px;
      transform: rotate(180deg)
    }
    100% {
      width: 64px;
      height: 64px;
      transform: rotate(360deg)
    }
  }
</style>