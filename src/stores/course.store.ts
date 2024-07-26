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
  const files = ref([] as {id:string, name:string}[]);
  const nameCourse = ref("");
  const courseId = ref("");
  const typeCourse = ref("");
  const session = ref("1");
  const credit = ref(0);
  const stdAmount = ref(0);
  const fullScore = ref(0);
  const timeInLab = ref(new Date());
  const timeOutLab = ref(new Date());
  const timeInLec = ref(new Date());
  const timeOutLec = ref(new Date());
  const showCreateDialog = ref(false);
  const showEditDialog = ref(false);
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

  const getFileUser = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await courseService.getFileCourse(formData);  // Make sure this matches the actual function that handles file uploads
      files.value = res.data;
      console.log("Upload successful", files.value );
    } catch (error) {
      console.error("Upload failed", error);
    }
  }


  return {
    session,
    credit,
    stdAmount,
    fullScore,
    typeCourse,
    courseId,
    nameCourse,
    timeInLab,
    timeOutLab,
    timeInLec,
    timeOutLec,
    currentCourse,
    createCourse,
    courses,
    getCourses,
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    editCourse,
    deleteCourse,
    getCourseByTeachId,
    course,
    updateCourse,
    getCourseById,
    getAllRooms,
    rooms,
    getFileUser,
    files,
  };
});
