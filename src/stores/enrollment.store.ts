import enrollmentService from "@/services/enrollment";
import { defineStore } from "pinia";
import { ref } from "vue";
import type Enrollment from "./types/Enrollment";

export const useEnrollmentStore = defineStore("enrollmentStore", () => {
  const enrollments = ref<Enrollment[]>([]);
  const codeCourse = ref("");
  const currentEnrollment = ref<Enrollment>();
  const selectedEnrollment = ref<number[]>([]);

  const getCourseByStudentId = async (userId: string) => {
    try {
      const res = await enrollmentService.getCourseByStudentId(userId);
      enrollments.value = res.data;
      // console.log("course enrolment",enrollments.value);
    }   catch (error) {
      console.log(error);
    }
  }

  const getStudentByCourseId = async (courseId: string) => {
    try {
      const res = await enrollmentService.getStudentByCourseId(courseId);
      enrollments.value = res.data;
      // console.log("std store",enrollments.value);
    } catch (error) {
      console.log(error);
    }
  }

  const deleteEnrollment = async (id: number) => {
    try {
      const res = await enrollmentService.deleteEnrollment(id);
      currentEnrollment.value = res.data;
      // window.location.reload();
    } catch (e) {
      console.log(e);
    }
  }
  const createEnrollment =  async (enrollment:Enrollment) => {
    try {
      const res = await enrollmentService.createEnrollment(enrollment);
      currentEnrollment.value = res.data;
      // console.log("store enrollment",res.data);
    } catch (e) {
      console.error('Error creating enrollment:', e);
    }
  };

  return {
    enrollments,codeCourse, getCourseByStudentId ,currentEnrollment , deleteEnrollment , createEnrollment, getStudentByCourseId,selectedEnrollment
  };
});
