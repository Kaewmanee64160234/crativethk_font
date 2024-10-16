// src/services/user.ts
// src/services/user.ts
import type { User } from "@/stores/types/User";
import http from "./axios";
import axios from "axios";

function getUser() {
  return http.get("/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });
}
//create user
function saveUser(user: User & { files: File[] }) {
  console.log(user);
  const formData = new FormData();

  // Append normal fields
  formData.append('firstName', user.firstName);
  formData.append('lastName', user.lastName);
  formData.append('email', user.email!);
  formData.append('studentId', user.studentId!);
  // formData.append('adminId', user.adminId!);
  formData.append('role', user.role!);
  formData.append('status', user.status!);
  formData.append('major', user.major!);
  formData.append('year', user.year!);
  formData.append('registerStatus', user.registerStatus!);

  // Check if files are available
  // if (user.files && user.files.length > 0) {
  // Append the first file if it exists
  // formData.append('files', user.files[0], user.files[0].name);
  // } else {
  //     console.error("No files found in the user object.");
  // Optional: Handle the case where no files are provided

  if (user.role == 'นิสิต') {
    if (user.faceDescriptions!.length > 0) {
      // Append files and face descriptions
      for (let i = 0; i < user.faceDescriptions!.length; i++) {
        formData.append("files", user.files[i], user.files[i].name); // Ensure there are exactly 5 files
        formData.append(`faceDescription${i + 1}`, user.faceDescriptions![i]);
      }
    }
  } else if (user.role == 'แอดมิน' || user.role == 'อาจารย์') {
    
    for (let i = 0; i < user.files.length; i++) {

      formData.append("files", user.files[i], user.files[i].name); // Ensure there are exactly 5 files
      formData.append(`faceDescription${i + 1}`, user.faceDescriptions![i]);
    }
  }
  // console.log('created User Dto', formData);
  

  // Log form data
  // for (const [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value);
  // }
  // console.log(user);

  return http.post("/users", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

//update user
function updateUser(user: User & { files: File[] }, userId: number) {
  console.log(user);
  const formData = new FormData();

  // Append normal fields
  formData.append("firstName", user.firstName);
  formData.append("lastName", user.lastName);
  formData.append("email", user.email!);
  formData.append("studentId", user.studentId!);
  // formData.append("teacherId", user.teacherId!);
  // formData.append("admindId", user.adminId!);
  formData.append("role", user.role!);
  formData.append("status", user.status!);
  formData.append('major', user.major!);
  formData.append('year', user.year!);
  formData.append('registerStatus', user.registerStatus!);

  // Append files and face descriptions
  if (user.role == 'นิสิต') {
    if (user.faceDescriptions!.length > 0) {
      // Append files and face descriptions
      for (let i = 0; i < user.faceDescriptions!.length; i++) {
        formData.append("files", user.files[i], user.files[i].name); // Ensure there are exactly 5 files
        formData.append(`faceDescription${i + 1}`, user.faceDescriptions![i]);
      }
    }
  } else if (user.role == 'แอดมิน' || user.role == 'อาจารย์') {
    
    for (let i = 0; i < user.files.length; i++) {

      formData.append("files", user.files[i], user.files[i].name); // Ensure there are exactly 5 files
      formData.append(`faceDescription${i + 1}`, user.faceDescriptions![i]);
    }
  }
  return http.patch(`/users/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function updateRegisterStatus(userId: number, user: User) {
  return http.patch(`/users/${userId}/register-status`, {
    registerStatus: user.registerStatus
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

//delete user
function deleteUser(id: number) {
  return http.delete(`/users/${id}`);
}

function searchUsers(search: string) {
  return http.get("/users/search", {
    params: { search },
  });
}

// search years
function searchYears(year: string) {
  return http.get("/users/search/year", {
    params: { year },
  });
}
//search majors
// function searchMajors(major: string) {
//   return http.get("/users/search/major", {
//     params: { major },
//   });
// }

//search major paginate
function searchMajorPagination(major: string, page: number, limit: number) {
  return http.get(`/users/search/major/pagination`, {
    params: { major, page, limit },
  });
}
//search satus paginate
function searchStatusPagination(status: string, page: number, limit: number) {
  return http.get(`/users/search/status/pagination`, {
    params: { status, page, limit },
  });
}

// In userService
function searchUsersByMajorAndStatus(major: string, status: string, page: number, limit: number) {
  return http.get('/users/search', {
    params: { major, status, page, limit },
  });
}


// //search statuses
// function searchStatus(status: string) {
//   return http.get("/users/search/status", {
//     params: { status },
//   });
// }

//get user imageProfile by id
function getUserImage(id: number) {
  return http.get(`/users/profileImage/${id}`);
}

// getUserByCourseId
function getUserByCourseId(courseId: string) {
  return http.get(`/users/course/${courseId}`);
}

// getUserById
function getUserById(id: number) {
  return http.get(`/users/${id}`);
}

function getUserByStdId(id: string) {
  return http.get(`/users/std/${id}`);
}

function getFileStd(formData: FormData) {
  return http.post("/users/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

function getStdQR(stdId: string) {
  return http.get(`/users/${stdId}/qr`);
}

function getTeachers() {
  return http.get("/users/teachers"); // Assuming your API base URL is correctly set up
}

function checkEmailDuplicate(email: string, userId?: number) {
  return http.get(`/users/email/${email}`, {
    params: { email, userId },
  });
}

  //check studentId duplicate
  function checkStudentIdDuplicate(studentId: string) {
    return http.get(`/users/studentId/${studentId}`, {
      params: { studentId },
    });
  }

   //getUserpagination
    function getUserPagination(page: number, limit: number) {
      return http.get(`/users/pagination`, {
        params: { page, limit },
      });
    } 

    //paginate get admin
    function getAdminPagination(page: number, limit: number) {
      return http.get(`/users/admins/pagination`, {
        params: { page, limit },
      });
    }
    //paginate get teacher
    function getTeacherPagination(page: number, limit: number) {
      return http.get(`/users/teachers/pagination`, {
        params: { page, limit },
      });
    }

    //paginate get student
    function getStudentPagination(page: number, limit: number) {
      return http.get(`/users/students/pagination`, {
        params: { page, limit },
      });
    }

    //searchStatusTeacher
    function searchStatusTeacherAndAdmin(status: string) {
      return http.get(`/users/search/statusTeacherAdmin`, {
        params: { status },
      });
    }
    const fetchPaginatedFilterUsers = async (params: {
      role?: string,
      major?: string,
      status?: string,
      search?: string
      page?: number,
      limit?: number,
    }) => {
      try {
        const response = await http.get(`users/filter`, { params });
        return response;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

export default {
  searchUsersByMajorAndStatus,
  searchStatusTeacherAndAdmin,
  getStudentPagination,
  getTeacherPagination,
  getAdminPagination,
  searchStatusPagination,
  getUserPagination,
  checkStudentIdDuplicate,
  checkEmailDuplicate,
  getTeachers,
  searchMajorPagination,
  searchYears,
  getUserById,
  getUser,
  getUserImage,
  saveUser,
  deleteUser,
  updateUser,
  searchUsers,
  getUserByCourseId,
  getFileStd,
  getStdQR,
  getUserByStdId,
  updateRegisterStatus,
  fetchPaginatedFilterUsers
};
