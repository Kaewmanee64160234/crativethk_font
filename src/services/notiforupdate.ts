import type Notiforupdate from "@/stores/types/NotiforUpdate";
import http from "./axios";
import type { User } from "@/stores/types/User";

function getNotiforupdateById(id:string) {
  return http.get(`/notiforupdates/${id}`);
}

async function createNotificationUpdate(formData: FormData) {
  try {
    // Log formData contents for debugging
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    // Send the formData with images and face descriptors to the backend
    await http.post(`/notiforupdates`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.log(error);
  }
}



function updateNotiforupdateConfirm(id:string,data:Notiforupdate) {
  console.log(`updateNotiforupdate ${id}`);
  return http.patch(`/notiforupdates/${id}/confirm`, data);
}

function updateNotiforupdateReject(id:string,data:Notiforupdate) {
  console.log(`updateNotiforupdate ${id}`);
  return http.patch(`/notiforupdates/${id}/reject`, data);
}

function deleteNotiforupdate(id:string) {
  return http.delete(`/notiforupdates/${id}`);
}

// get notifications by userId
function getNotiforupdateByUserId(userId:string) {
  return http.get(`/notiforupdates/user/${userId}`);
}

//getAllNotiforupdates
function getAllNotiforupdates() {
  return http.get("/notiforupdates");
}

//getNotificationByUserReceive
function getNotificationByUserReceive(userReceive:string) {
  return http.get(`/notiforupdates/userReceive/${userReceive}`);
}

// notiforupdate.service.ts (Frontend service layer)
function sendEmailToTeacher(teacherFirstName: string, teacherLastName: string, userSender: User) {
  return http.post('/notiforupdates/sendEmailToTeacher', {
    teacherFirstName,
    teacherLastName,
    userSender,
  });
}


export default { sendEmailToTeacher,updateNotiforupdateReject, getNotificationByUserReceive,getAllNotiforupdates,createNotificationUpdate,getNotiforupdateById,updateNotiforupdateConfirm, deleteNotiforupdate, getNotiforupdateByUserId };
