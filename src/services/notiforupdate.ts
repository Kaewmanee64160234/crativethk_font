import type Notiforupdate from "@/stores/types/NotiforUpdate";
import http from "./axios";

function getNotiforupdateById(id:string) {
  return http.get(`/notiforupdates/${id}`);
}

async function createNotificationUpdate(formData: FormData) {
  try {
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


function updateNotiforupdate(id:string,data:Notiforupdate) {
  return http.patch(`/notiforupdates/${id}`, data);
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

export default { getAllNotiforupdates,createNotificationUpdate,getNotiforupdateById,updateNotiforupdate, deleteNotiforupdate, getNotiforupdateByUserId };
