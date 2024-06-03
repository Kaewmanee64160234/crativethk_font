// src/services/course.ts
import type Course from "@/stores/types/Course";
import http from "./axios";

function getCourse() {
  return http.get("/courses");
}

function deleteCourse(id: string) {
  return http.delete(`/courses/${id}`);
}
function updateCourse(id: string, course: Course) {
  return http.patch(`/courses/${id}`, course);
}

function getCourseByTeachId(teachId: string) {
  return http.get(`/courses/teach/${teachId}`);
}

function createCourse(course: Course) {
  return http.post("/courses/", course);
}

// getCourseById
function getCourseById(id: string) {
  return http.get(`/courses/${id}`);
}

//get all room
function getAllRooms() {
  return http.get("/rooms");
}

export default {
  getCourse,
  deleteCourse,
  updateCourse,
  getCourseByTeachId,
  createCourse,
  getCourseById,
  getAllRooms,
};
