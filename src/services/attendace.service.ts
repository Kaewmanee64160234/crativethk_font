import type Attendance from "@/stores/types/Attendances";
import http from "./axios";

//create function get All attendance
function getAttendance() {
  return http.get("/attendances");
}
//create function get attendance by id
function getAttendanceById(id: string) {
  return http.get(`/attendances/${id}`);
}
function printFormData(formData: FormData) {
  formData.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });
}

function createAttendance(data: Attendance, file: File) {
  const formData = new FormData();
  if (data.user!.studentId === undefined) {
    formData.append("studentId", "null");
  } else {
    formData.append("studentId", data.user!.studentId!);
  }
  formData.append("assignmentId", data.assignment!.assignmentId!.toString());
  formData.append("file", file);
  formData.append("attendanceConfirmStatus", data.attendanceConfirmStatus);
  formData.append("date", data.attendanceDate.toString());
  formData.append("attendanceStatus", data.attendanceStatus);
  formData.append("confirmStatus", data.attendanceConfirmStatus);

  // attendanceConfirmStatus
  formData.append("confirmStatus", data.attendanceConfirmStatus);

  printFormData(formData);
  return http.post("/attendances", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

//create function get attendance by course id

function getAttendanceByCourseId(id: string) {
  return http.get(`/attendances/courses/${id}`);
}

//create function get attendance by ass Assignment id

function getAttendanceByAssignmentId(id: string) {
  return http.get(`/attendances/assignments/${id}`);
}
// getAttendanceByUserId
function getAttendanceByUserId(userId: string) {
  return http.get(`/attendances/user/${userId}`);
}

// updateAttendance

function updateAttendance(attendance: Attendance) {
  return http.patch(`/attendances/${attendance.attendanceId}`, attendance);
}
// updateAttendanceTeacher

function  updateAttendanceTeacher(attdentTeacher:Attendance){
  return http.patch(`/attendances/teacher/${attdentTeacher.attendanceId}`, attdentTeacher);
}

// getAttendanceByStatusInAssignment

function getAttendanceByStatusInAssignment(assignmentId: string) {
  return http.get(`/attendances/assignments/status/${assignmentId}`);
}

// get attendance by course and studentId
function getAttendanceByCourseandStudentId(courseId: string, studentId: string){
  return http.get(`/attendances/courses/${courseId}/students/${studentId}`);
}
// confirmAttendance function
function confirmAttendance(attendaceId: string) {
  return http.patch(`/attendances/confirm/${attendaceId}`);
}
//rejectAttendance function

function rejectAttendance(attendaceId: string) {
  return http.patch(`/attendances/reject/${attendaceId}`);
}
// checkAllAttendance

function checkAllAttendance(assigmentId:string){
  // '/checkAllAttendance/:courseId
  console.log(assigmentId);
  return http.get(`/attendances/checkAllAttendance/${assigmentId}`);
}




export default {
  getAttendance,
  createAttendance,
  getAttendanceById,
  getAttendanceByCourseId,
  getAttendanceByAssignmentId,
  getAttendanceByUserId,
  updateAttendance,
  getAttendanceByStatusInAssignment,
  confirmAttendance,
  rejectAttendance,
  checkAllAttendance,
  updateAttendanceTeacher,
  getAttendanceByCourseandStudentId
};
