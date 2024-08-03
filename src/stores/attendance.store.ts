import { defineStore } from "pinia";
import { ref } from "vue";
import attendaceService from "@/services/attendace.service";
import router from "@/router";
import { useAssignmentStore } from "./assignment.store";
import { useCourseStore } from "./course.store";
import type Attendance from "./types/Attendances";
import { useMessageStore } from "./message";
import type { User } from "./types/User";
export const useAttendanceStore = defineStore("attendanceStore", () => {
  const attendances = ref<Attendance[]>();
  const showDialog = ref(false);
  const userAttendance = ref<User>({
    userId: 0,
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    teacherId: "",
    role: "",
    status: "",
    major: "",
    year: "",
    profileImage: "",
  });
  const messageStore = useMessageStore();
  const editAttendance = ref<Attendance >({
    attendanceConfirmStatus: "",
    attendanceDate: new Date(),
    attendanceId: 0,
    attendanceImage: "",
    attendanceStatus: "",
  });
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
  // updateAttendanceTeacher
  const updateAttendanceTeacher = async (attendance: Attendance) => {
    try {
      const res = await attendaceService.updateAttendanceTeacher(attendance);
      if (res.status) {
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const confirmAttendance = async (attendance: Attendance,file:File) => {
    try {
      const res = await attendaceService.updateAttendance(attendance,file);
      await messageStore.showInfo("The information has been sent to the teacher. Please wait for confirmation..");
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
   
      router.push("/courseManagement");
    } catch (error) {
      console.log(error);
    }
  };
  //getAttendanceByCourseandStudentId
  const getAttendanceByCourseandStudentId = async (
    courseId: string,
    studentId: string
  ) => {
    try {
      const res = await attendaceService.getAttendanceByCourseandStudentId(
        courseId,
        studentId
      );
      attendances.value = res.data;
    } catch (error) {
      console.log(error);
    }
  };
  // getAttendanceByAssignmentAndStudent
  const getAttendanceByAssignmentAndStudent = async (
    assignmentId: string,
    studentId: string
  ) => {
    try {
      const res = await attendaceService.getAttendanceByAssignmentAndStudent(
        assignmentId,
        studentId
      );
      editAttendance.value = res.data;
      console.log('Attendance updated successfully', editAttendance.value);
      
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getAttendanceByCourseandStudentId,
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
    showDialog,
    editAttendance,
    userAttendance,
    updateAttendanceTeacher,
    getAttendanceByAssignmentAndStudent
  };
});