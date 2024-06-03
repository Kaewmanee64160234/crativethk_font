// src/stores/course.store.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import courseService from "@/services/course";
import { mapToUser } from "./types/User";
import type Course from "./types/Course";
import type Room from "./types/Room";

export const useCourseStore = defineStore("courseStore", () => {
  const courses = ref<Course[]>([]);
  const course = ref<Course>();
  const showCreateDialog = ref(false);
  const showCreateDialog2 = ref(false);
  const showCreateDialog3 = ref(false);
  const showEditDialog = ref(false);
  const showEditDialog2 = ref(false);
  const showEditDialog3 = ref(false);
  const showDeleteDialog = ref(false);
  const currentCourse = ref<Course>();
  const editCourse = ref<Course>();
  const rooms = ref<Room[]>([]);
  //get
  const getCourses = async () => {
    try {
      const res = await courseService.getCourse();
      courses.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const res = await courseService.deleteCourse(id);
      currentCourse.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };

  const closeDialog = () => {
    showCreateDialog.value = false;
    showCreateDialog2.value = false;
    showCreateDialog3.value = false;
  };

  const closeDialog2 = () => {
    showEditDialog.value = false;
    showEditDialog2.value = false;
    showEditDialog3.value = false;
  };

  const getCourseByTeachId = async (userId: string) => {
    try {
      const res = await courseService.getCourseByTeachId(userId);
      courses.value = res.data;
      console.log(courses.value);
    } catch (error) {
      console.log(error);
    }
  };

  const createCourse = async (course: Course) => {
    try {
      const res = await courseService.createCourse(course);
      currentCourse.value = res.data;
      console.log("store course", res.data);
    } catch (e) {
      console.error("Error creating Course:", e);
    }
  };

  const updateCourse = async (id: string, course: Course) => {
    try {
      const res = await courseService.updateCourse(id, course);
      currentCourse.value = res.data;
    } catch (e) {
      console.error("Error updating Course:", e);
    }
  };

  // getCourseById
  const getCourseById = async (id: string) => {
    try {
      const res = await courseService.getCourseById(id);

      currentCourse.value = res.data;
      console.log(currentCourse.value);
    } catch (e) {
      console.log(e);
    }
  };

  //getAllRoom
  const getAllRooms = async () => {
    try {
      const res = await courseService.getAllRooms();
      rooms.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };

  return {
    currentCourse,
    createCourse,
    courses,
    getCourses,
    showCreateDialog,
    showCreateDialog2,
    closeDialog,
    showCreateDialog3,
    showEditDialog,
    showEditDialog2,
    showEditDialog3,
    closeDialog2,
    showDeleteDialog,
    editCourse,
    deleteCourse,
    getCourseByTeachId,
    course,
    updateCourse,
    getCourseById,
    getAllRooms,
    rooms
  };
});
