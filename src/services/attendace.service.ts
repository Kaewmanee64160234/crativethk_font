import type Attendance from "@/stores/types/Attendances";
import http from "./axios";
import type { Identification } from "@/stores/types/identification.type";
import type Assignment from "@/stores/types/Assignment";

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
  formData.append("attendanceScore", data.attendanceScore!.toString());

  // attendanceConfirmStatus
  formData.append("confirmStatus", data.attendanceConfirmStatus);

  console.log("formData", data);

  // printFormData(formData);
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

function updateAttendance(attendance: Attendance, file?: File) {
  const formData = new FormData();
  if (attendance.user!.studentId === undefined) {
    formData.append("studentId", "null");
  } else {
    formData.append("studentId", attendance.user!.studentId!);
  }
  formData.append(
    "assignmentId",
    attendance.assignment!.assignmentId!.toString()
  );
  // user Id
  formData.append("userId", attendance.user!.studentId!.toString());
  if (file != null) {
    formData.append("file", file, file.name);
  }


  // assignMentTime
  const assignMentTime = new Date();
  formData.append("assignmentMentTime", assignMentTime.toISOString());
  formData.append(
    "attendanceConfirmStatus",
    attendance.attendanceConfirmStatus
  );
  formData.append("date", attendance.attendanceDate.toString());
  formData.append("attendanceStatus", attendance.attendanceStatus);
  formData.append("confirmStatus", attendance.attendanceConfirmStatus);
  formData.append("attendanceScore", attendance.attendanceScore!.toString());

  return http.patch(`attendances/${attendance.attendanceId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
// updateAttendanceTeacher

function base64ToBlob(base64: string, mimeType: string): Blob {
  // Regex to check if the base64 string contains the proper prefix
  const base64Pattern = /^data:(.*);base64,/;
  let byteCharacters;

  try {
    // Check if base64 string contains the proper data prefix (e.g., data:image/jpeg;base64,)
    if (base64Pattern.test(base64)) {
      // Strip the data URI prefix if present
      byteCharacters = atob(base64.split(",")[1]);
    } else {
      // Handle case where there is no prefix and attempt to decode the entire string
      byteCharacters = atob(base64);
    }
  } catch (error) {
    console.error("Error decoding base64 string:", error, base64);
    throw new Error("Invalid base64 string provided.");
  }

  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}
const submitAttendancesInBatches = async (
  identifications: Identification[],
  croppedImagesDataUrls: string[],
  currentAssignment: Assignment,
  status: string,
  confirmStatus: string,
  batchSize: number = 100 // Define a batch size
) => {
  const totalRecords = identifications.length;
  const totalBatches = Math.ceil(totalRecords / batchSize);

  for (let batch = 0; batch < totalBatches; batch++) {
    // Create a batch of attendances and images
    const batchIdentifications = identifications.slice(
      batch * batchSize,
      (batch + 1) * batchSize
    );
    const batchImages = croppedImagesDataUrls.slice(
      batch * batchSize,
      (batch + 1) * batchSize
    );

    // Send each batch
    try {
      await submitAttendances(batchIdentifications, batchImages, currentAssignment, status, confirmStatus);
      console.log(`Batch ${batch + 1} of ${totalBatches} submitted successfully.`);
    } catch (error) {
      console.error(`Error submitting batch ${batch + 1}:`, error);
    }
  }
};

const submitAttendances = async (
  identifications: Identification[],
  croppedImagesDataUrls: string[],
  currentAssignment: Assignment,
  status: string,
  confirmStatus: string
) => {
  const formData = new FormData();

  // Serialize the attendance data as JSON and append it as a form field
  const attendanceData = identifications.map((identification, i) => ({
    studentId: identification.studentId,
    attendanceStatus: status,
    attendanceConfirmStatus: confirmStatus,
    attendanceScore: identification.score.toFixed(2),
    assignmentId: currentAssignment.assignmentId!.toString(),
  }));

  formData.append('attendances', JSON.stringify(attendanceData));
  console.log('attendances', attendanceData);

  // Add the images to FormData
  croppedImagesDataUrls.forEach((dataUrl, i) => {
    const blob = base64ToBlob(dataUrl, 'image/jpeg');
    formData.append('images', blob, `attendance_${Date.now()}_${i}.jpg`);
  });

  try {
    return await http.post(`/attendances/upload`, formData);
  } catch (error) {
    console.error('Error submitting attendances:', error);
  }
};




function updateAttendanceTeacher(attdentTeacher: Attendance) {
  return http.patch(
    `/attendances/teacher/${attdentTeacher.attendanceId}`,
    attdentTeacher
  );
}

// getAttendanceByStatusInAssignment

function getAttendanceByStatusInAssignment(assignmentId: string) {
  return http.get(`/attendances/assignments/status/${assignmentId}`);
}

// get attendance by course and studentId
function getAttendanceByCourseandStudentId(
  courseId: string,
  studentId: string
) {
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

function checkAllAttendance(assigmentId: string) {
  // '/checkAllAttendance/:courseId
  console.log(assigmentId);
  return http.get(`/attendances/checkAllAttendance/${assigmentId}`);
}

// getAttendanceByAssignmentAndStudent
// /assignment/:assignmentId/student/:studentId
function getAttendanceByAssignmentAndStudent(
  assignmentId: string,
  studentId: string
) {
  return http.get(
    `/attendances/assignment/${assignmentId}/student/${studentId}`
  );
}

// removev attdent
function removeAttendance(attendanceId: string) {
  return http.delete(`/attendances/${attendanceId}`);
}

// revalidate/:assignmentId
function revalidateAttendance(assignmentId: string) {
  return http.get(`/attendances/revalidate/${assignmentId}`);
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
  getAttendanceByCourseandStudentId,
  getAttendanceByAssignmentAndStudent,
  removeAttendance,
  revalidateAttendance,
  submitAttendances,
  submitAttendancesInBatches
};
