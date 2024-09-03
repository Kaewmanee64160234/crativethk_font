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
function createAssignment(data:Assignment,files:File[]) {
    console.log("data",JSON.stringify(data));
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file, file.name);
    });
    formData.append("nameAssignment", data.nameAssignment);
    formData.append("assignmentTime", data.assignmentTime.toISOString());
    formData.append("statusAssignment", data.statusAssignment);
    formData.append("coursesId", data.course.coursesId);
    // formData.append("room", data.room);



    return http.post("/assignments", formData);
}
//get Assignment by course id
function getAssignmentByCourseId(id:string) {
    return http.get(`/assignments/course/${id}`);
}

// update Assignment
function updateAssignment(id:string,data:Assignment) {
    return http.patch(`/assignments/${id}`, data);
}
// delete Assignment
function deleteAssignment(id:string) {
    return http.delete(`/assignments/${id}`);
}

// getAssignmentImages
function getAssignmentImages(id:string) {
    return http.get(`/assignments/images/course/${id}`);
}


export default { getAssignment,createAssignment,getAssignmentById,getAssignmentByCourseId,updateAssignment, deleteAssignment,getAssignmentImages };