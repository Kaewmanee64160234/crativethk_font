import { defineStore } from "pinia";
import { ref } from "vue";
import type Notiforupdate from "./types/NotiforUpdate";
import notiforupdateService from "@/services/notiforupdate";

export const useNotiforupdate = defineStore("notiforupdateStore", () => {
  const notiforupdates = ref<Notiforupdate[]>([]);
  const currentNotiforupdate = ref<Notiforupdate>();

  // Fetch all notifications
//   const fetchAllNotifications = async () => {
//     try {
//       const res = await notiforupdateService.getAllNotiforupdates();
//       notiforupdates.value = res.data; // Store the fetched data in the ref
//     } catch (error) {
//       console.error('Error fetching all notifications:', error);
//     }
//   };

  // Get notiforupdate by ID
  const getNotiforupdateById = async (id: string) => {
    try {
      const res = await notiforupdateService.getNotiforupdateById(id);
      currentNotiforupdate.value = res.data;
    } catch (error) {
      console.log(error);
    }
  };
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
    notiforupdates, // Make sure this is returned so the list can be used in components
    currentNotiforupdate,
    // fetchAllNotifications,
    getNotiforupdateById,
    createNotiforupdate,
    // deleteNotiforupdate,
    getNotiforupdateByUserId
  };
});
