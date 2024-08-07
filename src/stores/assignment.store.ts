import { ref } from "vue";
import { defineStore } from "pinia";
import assignmentService from "@/services/assignment";
import type Assignment from "./types/Assignment";

export const useAssignmentStore = defineStore("assignmentStore", () => {
  const assignments = ref<Assignment[] >([
    {
      assignmentId: 0,

      assignmentTime: new Date(),
      imageAssignments: [""],
      statusAssignment: "",
      nameAssignment: "",
      course: {
        userId: -1,
        coursesId: "",
        credit: 0,
        fullScore: 0,
        nameCourses: "",
        session: "",
        stdAmount: 0,
        timeInLec: new Date(),
        timeOutLec: new Date(),
        typeCourses: "",
        codeCourses: "",

        user: {
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
          registerStatus: "",
        },
      },
    },
  ]);
  const EditAssignment = ref(false);
  const assignment = ref<Assignment>();
  const currentAssignment = ref<Assignment>();
  const dialogAssignmentTag = ref(false);

  //get
  const getAssignments = async () => {
    try {
      const res = await assignmentService.getAssignment();
      assignments.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };
  //getAssignmentByCourseId
  const getAssignmentByCourseId = async (id: string) => {
    try {
      const res = await assignmentService.getAssignmentByCourseId(id);
      //map assignment
      assignments.value = res.data;
      console.log(id);
    } catch (e) {
      console.log(e);
    }
  };
  //create Assignment
  const createAssignment = async (data: Assignment,files:File[]) => {
    try {
      const res = await assignmentService.createAssignment(data,files);
      if (res.data) {
        assignment.value = res.data;
        console.log("assignment created", res.data);
        await getAssignmentByCourseId(data.course.coursesId);
      } else {
        alert("Error creating assignment");
      }
    } catch (e) {
      console.error("Error creating assignment:", e);
    }
  };
  //get Assignment by id
  const getAssignmentById = async (id: string) => {
    try {
      const res = await assignmentService.getAssignmentById(id);
      currentAssignment.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };

  // update Assignment
  const updateAssignment = async (id: string, data: Assignment) => {
    try {
      const res = await assignmentService.updateAssignment(id, data);
      if (res.data) {
        console.log("assignment updated", res.data);
        await getAssignmentByCourseId(data.course.coursesId);
      } else {
        alert("Error updating assignment");
      }
    } catch (e) {
      console.error("Error updating assignment:", e);
    }
  };
  const deleteAssignment = async (id: string) => {
    try {
      const response = await assignmentService.deleteAssignment(id);
      if (response.status === 200) {
        // Remove the deleted assignment from the assignments list
        assignments.value = assignments.value.filter(assignment => assignment.assignmentId !== parseInt(id));
        console.log('Assignment deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };
  const closeEditDialog = () => {
    EditAssignment.value = false;
  }
  // assignments.value.push(res.data);

  return {
    assignments,
    getAssignmentByCourseId,
    getAssignments,
    assignment,
    createAssignment,
    currentAssignment,
    getAssignmentById,
    updateAssignment,
    dialogAssignmentTag,
    deleteAssignment,
    EditAssignment,
    closeEditDialog
  };
});
