import type Notiforupdate from "@/stores/types/NotiforUpdate";
import http from "./axios";

function getNotiforupdate() {
  return http.get("/notiforupdates");
}

function getNotiforupdateById(id:string) {
  return http.get(`/notiforupdates/${id}`);
}

function createNotiforupdate(data:Notiforupdate) {
  return http.post("/notiforupdates", data);
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



export default { getNotiforupdate,createNotiforupdate,getNotiforupdateById,updateNotiforupdate, deleteNotiforupdate, getNotiforupdateByUserId };