import { defineStore } from "pinia";
import { ref } from "vue";
import attendaceService from "@/services/attendace.service";
import router from "@/router";
import { useAssignmentStore } from "./assignment.store";
import { useCourseStore } from "./course.store";
import type Attendance from "./types/Attendances";
import { useMessageStore } from "./message";
export const useAttendanceStore = defineStore("attendanceStore", () => {
  const attendances = ref<Attendance[]>();
  const messageStore = useMessageStore();
  const assigmentStore = useAssignmentStore();
  const currentAttendance = ref<Attendance & { files: File[] }>({
    attendanceConfirmStatus: "",
    attendanceDate: new Date(),
    attendanceId: 0,
    attendanceImage: "",
    attendanceStatus: "",
    files: [],
  });

  const courseStore = useCourseStore();
  // create attendance
  const createAttendance = async (attendance: Attendance, file: File) => {
    try {
      const res = await attendaceService.createAttendance(attendance, file);
      if (res!.status) {
        console.log(res!.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //get attendace by assigment id
  const getAttendanceByAssignmentId = async (id: string) => {
    try {
      const response = await attendaceService.getAttendanceByAssignmentId(id);
      console.log(response.data);

      attendances.value = response.data;
    } catch (e) {
      console.error("Failed to fetch attendances:", e);
    }
  };

  //get attdent by user id
  const getAttendanceByUserId = async (id: string) => {
    try {
      const res = await attendaceService.getAttendanceByUserId(id);
      attendances.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };
  //update attendace
  const updateAttendance = async (attendance: Attendance) => {
    try {
      const res = await attendaceService.updateAttendance(attendance);
      if (res.status) {
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const confirmAttendance = async (attendance: Attendance) => {
    try {
      const res = await attendaceService.updateAttendance(attendance);
       messageStore.showInfo("The information has been sent to the teacher. Please wait for confirmation..");
    } catch (error) {
      // Log the error object which might contain additional info
      console.error("Error confirming attendance:", error);

      window.alert("An error occurred during confirmation");
    }
  };

  // getAttendanceByStatusInAssignment
  async function getAttendanceByStatusInAssignment(assignmentId: string) {
    try {
      const res = await attendaceService.getAttendanceByStatusInAssignment(
        assignmentId
      );
      console.log(res.data);

      attendances.value = res.data;
    } catch (error) {
      console.error(
        "An error occurred during getAttendanceByStatusInAssignment:",
        error
      );
    }
  }

  //confirmAttendance

  const confirmAttendanceByTeacher = async (attendanceId: string) => {
    try {
      const res = await attendaceService.confirmAttendance(attendanceId);
      if (res.data) {
        currentAttendance.value = res.data;

        getAttendanceByStatusInAssignment(
          currentAttendance.value.assignment?.assignmentId + ""
        );
      }
    } catch (error) {
      console.error("An error occurred during confirmAttendance");
    }
  };

  // rejectAttendanceByTeacher
  const rejectAttendanceByTeacher = async (attendanceId: string) => {
    try {
      const res = await attendaceService.rejectAttendance(attendanceId);
      if (res.data) {
        currentAttendance.value = res.data;
        getAttendanceByStatusInAssignment(
          currentAttendance.value.assignment?.assignmentId + ""
        );
      }
    } catch (error) {
      console.log(error);
      console.error("An error occurred during rejectAttendance");
    }
  };

  //// getAttendanceByCourseId
  const getAttendanceByCourseId = async (id: string) => {
    try {
      const res = await attendaceService.getAttendanceByCourseId(id);
      attendances.value = res.data;
    } catch (error) {
      console.log(error);
    }
  };

  // checkAllAttendance
  const checkAllAttendance = async (
    assignmentId: string,

  ) => {
    try {
      const res = await attendaceService.checkAllAttendance(assignmentId);
      console.log(res.data);
      router.push("/enrolmentManagement");
    } catch (error) {
      console.log(error);
    }
  };

  return {
    attendances,
    currentAttendance,
    createAttendance,
    getAttendanceByAssignmentId,
    getAttendanceByUserId,
    updateAttendance,
    confirmAttendance,
    getAttendanceByStatusInAssignment,
    confirmAttendanceByTeacher,
    rejectAttendanceByTeacher,
    getAttendanceByCourseId,
    checkAllAttendance,
  };
});
