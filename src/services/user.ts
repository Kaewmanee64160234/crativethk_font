// src/services/user.ts
// src/services/user.ts
import type { User } from "@/stores/types/User";
import http from "./axios";
import axios from "axios";

function getUser() {
  return http.get("/users"
    , {headers: {
    'Authorization': `Bearer ${ localStorage.getItem('authToken') }`}
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
  formData.append('teacherId', user.teacherId!);
  formData.append('role', user.role!);
  formData.append('status', user.status!);
  formData.append('major', user.major!);
  formData.append('year', user.year!);

  // Check if files are available
  if (user.files && user.files.length > 0) {
      // Append the first file if it exists
      formData.append('files', user.files[0], user.files[0].name);
  } else {
      console.error("No files found in the user object.");
      // Optional: Handle the case where no files are provided
  }

  return http.post("/users", formData, {
      headers: {
          'Content-Type': 'multipart/form-data',
      }
  });
}

//update user
function updateUser(user: User & { files: File[] }, userId: number) {
  console.log(user);
  const formData = new FormData();

  // Append normal fields
  formData.append('firstName', user.firstName);
  formData.append('lastName', user.lastName);
  formData.append('email', user.email!);
  formData.append('studentId', user.studentId!);
  formData.append('teacherId', user.teacherId!);
  formData.append('role', user.role!);
  formData.append('status', user.status!);

  // Append files and face descriptions
  for (let i = 0; i < user.files.length; i++) {
    if (user.files[i]) {
      formData.append('files', user.files[i], user.files[i].name);
      // formData.append(`faceDescription${i + 1}`, JSON.stringify(user.faceDescriptions![i]));
    }
  }

  return http.patch(`/users/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
}

//delete user
function deleteUser(id: number) {
  return http.delete(`/users/${id}`);
}

function searchUsers(search: string) {
  return http.get('/users/search', {
    params: { search },
  });
}

//get user imageProfile by id
function getUserImage(id: number) {
  return http.get(`/users/profileImage/${id}`);
}

// getUserByCourseId
function getUserByCourseId(courseId: string) {
  return http.get(`/users/course/${courseId}`);
}

function getFileStd(formData: FormData) {
  return http.post("/users/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}






export default { getUser, getUserImage, saveUser, deleteUser, updateUser, searchUsers ,getUserByCourseId, getFileStd};
