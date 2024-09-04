import { defineStore } from "pinia";
import { ref } from "vue";
import type Notiforupdate from "./types/NotiforUpdate";
import notiforupdateService from "@/services/notiforupdate";

export const useNotiforupdate = defineStore("notiforupdateStore", () => {
  const notiforupdates = ref<Notiforupdate[]>([]);
  const currentNotiforupdate = ref<Notiforupdate>();

  // Fetch all notifications
  const fetchAllNotifications = async () => {
    try {
      const res = await notiforupdateService.getAllNotiforupdates();
      notiforupdates.value = res.data; // Store the fetched data in the ref
    } catch (error) {
      console.error('Error fetching all notifications:', error);
    }
  };

  // Get notiforupdate by ID
  const getNotiforupdateById = async (id: string) => {
    try {
      const res = await notiforupdateService.getNotiforupdateById(id);
      currentNotiforupdate.value = res.data;
    } catch (error) {
      console.log(error);
    }
  };

  // Delete notiforupdate
  const deleteNotiforupdate = async (id: string) => {
    try {
      const res = await notiforupdateService.deleteNotiforupdate(id);
      currentNotiforupdate.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };

  // Create notiforupdate
  const createNotiforupdate = async (notiforupdate: Notiforupdate) => {
    try {
      const res = await notiforupdateService.createNotiforupdate(notiforupdate);
      currentNotiforupdate.value = res.data;
    } catch (e) {
      console.error('Error creating notiforupdate:', e);
    }
  };

  // Get notiforupdate by UserId
  const getNotiforupdateByUserId = async (userId: string) => {
    try {
      const res = await notiforupdateService.getNotiforupdateByUserId(userId);
      notiforupdates.value = res.data;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    notiforupdates, // Make sure this is returned so the list can be used in components
    currentNotiforupdate,
    fetchAllNotifications,
    getNotiforupdateById,
    createNotiforupdate,
    deleteNotiforupdate,
    getNotiforupdateByUserId
  };
});
