<!-- eslint-disable vue/multi-word-component-names -->
 <!-- eslint-disable-next-line vue/multi-word-component-names -->
 
<template>
  <div class="overlay" >
    <div class="loader-container">
      <div class="ml-2 loader"></div>
      <div class="mt-4">Loading...</div>
    </div>
  </div>
</template>

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader-container {
  text-align: center;
}

.loader {
  width: 64px;
  height: 64px;
  position: relative;
  background-image:
    linear-gradient(#38badb 16px, transparent 0),
    linear-gradient(#3051AC 16px, transparent 0),
    linear-gradient(#3051AC 16px, transparent 0),
    linear-gradient(#38badb 16px, transparent 0);
  background-repeat: no-repeat;
  background-size: 16px 16px;
  background-position: left top, left bottom, right top, right bottom;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  0% {
    width: 64px;
    height: 64px;
    transform: rotate(0deg);
  }
  50% {
    width: 30px;
    height: 30px;
    transform: rotate(180deg);
  }
  100% {
    width: 64px;
    height: 64px;
    transform: rotate(360deg);
  }
}
</style>
