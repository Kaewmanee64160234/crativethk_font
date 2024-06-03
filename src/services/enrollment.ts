import type Enrollment from "@/stores/types/Enrollment";
import http from "./axios";

function getCourseByStudentId(studentId: string) {
  return http.get(`/enrollments/student/${studentId}`);
}

function getStudentByCourseId(courseId: string) {
  return http.get(`/enrollments/course/${courseId}`);
}


function deleteEnrollment(enrollmentId: number) {
  return http.delete(`/enrollments/${enrollmentId}`);
}

function createEnrollment(enrollment: Enrollment) {
  return http.post(`/enrollments/`, enrollment);
}
  
export default {  getCourseByStudentId , deleteEnrollment, createEnrollment, getStudentByCourseId };