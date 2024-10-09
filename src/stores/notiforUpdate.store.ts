import { defineStore } from "pinia";
import { ref } from "vue";
import type Notiforupdate from "./types/NotiforUpdate";
import notiforupdateService from "@/services/notiforupdate";
import type { User } from "./types/User";
import { mapToNotice } from "./types/NotiforUpdate";

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
      currentNotiforupdate.value = mapToNotice(res.data);
      console.log("res data", res.data);
      
    } catch (error) {
      console.log(error);
    }
  };
  // create notification
  const createNotiforupdate = async (formData: FormData) => {
    try {
      await notiforupdateService.createNotificationUpdate(formData);
    } catch (error: any) {
      // Enhanced error logging
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
      } else {
        console.log('Error:', error.message);
      }
    }
  };

// normal updateNotiforupdate  
  const updateNotiforupdateConfirm = async (id: string, data: Notiforupdate) => {
    try {
      await notiforupdateService.updateNotiforupdateConfirm(id, data);
      console.log('Updated notification:', data);
    } catch (error) {
      console.log(error);
    }
  };
  // updateNotiforupdateReject
  const updateNotiforupdateReject = async (id: string, data: Notiforupdate) => {
    try {
      await notiforupdateService.updateNotiforupdateReject(id, data);
      console.log('Updated notification:', data);
    } catch (error) {
      console.log(error);
    }
  };

  // get notifications by userId
  const getNotiforupdateByUserId = async (userId: string) => {
    try {
      const res = await notiforupdateService.getNotiforupdateByUserId(userId);
      notiforupdates.value = res.data;
    } catch (error) {
      console.log(error);
    }
  }

  //getNotificationByUserReceive
  const getNotificationByUserReceive = async (userReceive: User) => {
    try {
      const res = await notiforupdateService.getNotificationByUserReceive(userReceive!.userId!);
      notiforupdates.value = res.data;
    } catch (error) {
      console.log(error);
    }
  }
  const sendEmailToTeacher = async (teacherFirstName: string, teacherLastName: string, userSender: User) => {
    try {
      await notiforupdateService.sendEmailToTeacher(teacherFirstName, teacherLastName, userSender);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  return {
    sendEmailToTeacher,
    notiforupdates, // Make sure this is returned so the list can be used in components
    currentNotiforupdate,
    fetchAllNotifications,
    getNotiforupdateById,
    createNotiforupdate,
    // deleteNotiforupdate,
    getNotiforupdateByUserId,
    getNotificationByUserReceive,
    updateNotiforupdateConfirm,
    updateNotiforupdateReject
  };
});
