// assignmentService
import type Assignment from "@/stores/types/Assignment";
import http from "./axios";
// getAssignment
function getAssignment() {
    return http.get("/assignments");
}
// getAssignmentById
function getAssignmentById(id:string) {
    return http.get(`/assignments/${id}`);
}
// createAssignment
function createAssignment(data:Assignment) {
    console.log("data",JSON.stringify(data));
    return http.post("/assignments", {...data,date:new Date()});
}
//get Assignment by course id
function getAssignmentByCourseId(id:string) {
    return http.get(`/assignments/course/${id}`);
}

// update Assignment
function updateAssignment(id:string,data:Assignment) {
    return http.patch(`/assignments/${id}`, data);
}

export default { getAssignment,createAssignment,getAssignmentById,getAssignmentByCourseId,updateAssignment };