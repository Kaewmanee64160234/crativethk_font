import { defineStore } from "pinia";
import { ref } from "vue";
import type Notiforupdate from "./types/NotiforUpdate";
import notiforupdateService from "@/services/notiforupdate";


export const useNotiforupdate = defineStore("notiforupdateStore", () => {
  const notiforupdates = ref<Notiforupdate[]>([]);
  const currentNotiforupdate = ref<Notiforupdate>();

  //get notiforupdateById
    const getNotiforupdateById = async (id:string) => {
        try {
        const res = await notiforupdateService.getNotiforupdateById(id);
        currentNotiforupdate.value = res.data;
        } catch (error) {
        console.log(error);
        }
    }

    // delete
    const deleteNotiforupdate = async (id:string) => {
        try {
        const res = await notiforupdateService.deleteNotiforupdate(id);
        currentNotiforupdate.value = res.data;
        } catch (e) {
        console.log(e);
        }
    }

    // create notification
    const createNotiforupdate = async (notiforupdate:FormData) => {
        try {
        const res = await notiforupdateService.createNotificationUpdate(notiforupdate);
        } catch (e) {
        console.error('Error creating notiforupdate:', e);
        }
    };

    // get notifications by userId
    const getNotiforupdateByUserId = async (userId:string) => {
        try {
        const res = await notiforupdateService.getNotiforupdateByUserId(userId);
        notiforupdates.value = res.data;
        } catch (error) {
        console.log(error);
        }
    }

  return {
    getNotiforupdateById, createNotiforupdate ,deleteNotiforupdate, getNotiforupdateByUserId  };
});
