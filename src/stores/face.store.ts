// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref } from "vue";
// import { User } from "./types/User";

export const useFaceStore = defineStore("faceStore", () => {
  const faceDescriptions = ref<Float32Array[]>([]);
  const currentUnkownImage = ref();
  //get
  const getFaceDescriptions = () => {
    return faceDescriptions.value;
  };
  //set
  const setFaceDescriptions = (descriptions: Float32Array[]) => {
    faceDescriptions.value = descriptions;
  };

  return { faceDescriptions, getFaceDescriptions, setFaceDescriptions,currentUnkownImage };
});
