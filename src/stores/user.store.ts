// src/stores/user.ts
import { defineStore } from "pinia";
import { getCurrentInstance, ref, watch } from "vue";
import userService from "@/services/user"; // Import the userService module
import { mapToUser, type User } from "./types/User";
import user from "@/services/user";
import { useMessageStore } from "./message";
import notiforupdate from "@/services/notiforupdate";
import router from "@/router";

export const useUserStore = defineStore("userStore", () => {
  const users = ref<User[]>([]);
  const searchQuery = ref<string>("");
  const searchDropdown = ref<string>("");
  const searchDropdown2 = ref<string>("");
  const searchDropdown3 = ref<string>("");
  const searchDropdown4 = ref<string>("");
  const searchDropdown5 = ref<string>("");
  const file_ = ref([] as { id: string, name: string, major: string, year: string }[]);
  const showDialog = ref(false);
  const showImageDialog = ref(false);
  const showDialog2 = ref(false);
  const showDialog3 = ref(false);
  const showDialog4 = ref(false);
  const showDeleteDialog = ref(false);
  const showEditDialog = ref(false);
  const showEditDialog2 = ref(false);
  const showEditDialog3 = ref(false);
  const QR = ref("");
  const keyword = ref("");
  const messageStore = useMessageStore()
  const currentUser = ref<User>();
  const regisUser = ref<User>();
  const notiUser = ref<User>();
  const totalUsers = ref(0);
  const currentPage = ref(1);
  const itemsPerPage = ref(20);
  const teachers = ref<User[]>([]);

  const editUser = ref<User & { files: File[] }>({
    userId: 0,
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    adminId: "",
    major: "",
    year: "",
    role: "",
    status: "",
    registerStatus: "",
    profileImage: "",
    faceDescriptions: [],
    images: [],
    files: [],
  });

  // watch for searchQuery
  watch(searchQuery, (value) => {
    console.log(searchQuery.value)
    if (value === "") {
      getUsers();
    } else {
      searchUser();
    }
  });


  // watch for searchDropdown
  watch(searchDropdown, async (value) => {
    currentPage.value = 1;
    console.log(searchDropdown.value)
    if (value === "") {
      await getStudentPagination();
    } else {
      searchYear();
    }
  });

  // watch for searchDropdown2
  // watch(searchDropdown2, async (value) => {
  //   currentPage.value = 1;
  //   console.log(searchDropdown2.value)
  //   if (value === "") {
  //     await getStudentPagination();
  //   } else {
  //     searchMajorPagination(searchDropdown2.value);
  //   }
  // });

  //watch searchUsersByMajorAndStatus
  // watch([searchDropdown2, searchDropdown3], async () => {
  //   currentPage.value = 1;
  //   if (searchDropdown2.value === "" && searchDropdown3.value === "") {
  //     await getStudentPagination();
  //   } else {
  //   searchUsersByMajorAndStatus(searchDropdown2.value, searchDropdown3.value);
  //   }
  // });

  //watch for searchDropdown2 paginate
  watch(searchDropdown2, async (value) => {
    currentPage.value = 1;
    console.log(searchDropdown2.value)
    if (value === "") {
      await getStudentPagination();
    } else {
      searchMajorPagination(searchDropdown2.value);
    }
  });

  // //watch for searchDropdown3
  watch(searchDropdown3, async (value) => {
    currentPage.value = 1;
    console.log(searchDropdown3.value)
    if (value === "") {
      await getStudentPagination();
    } else {
      searchStatusPagination(searchDropdown3.value);
    }
  });

  //watch for searchDropdown4
  watch(searchDropdown4, async (value) => {
    currentPage.value = 1;
    console.log(searchDropdown4.value)
    if (value === "") {
      await getTeacherPagination();
      await getAdminPagination();
    } else {
      searchStatusTeacherAndAdmin();
    }
  });


  // searchUsers
  const searchUser = async () => {
    try {
      const response = await userService.searchUsers(searchQuery.value);
      users.value = response.data;
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };
  //search years
  const searchYear = async () => {
    try {
      const response = await userService.searchYears(searchDropdown.value);
      users.value = response.data;
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // search majors
  // const searchMajor = async () => {
  //   try {
  //     const response = await userService.searchMajors(searchDropdown2.value);
  //     users.value = response.data;
  //   } catch (error) {
  //     console.error('Error searching users:', error);
  //   }
  // };

//searchUsersByMajorAndStatus paginate
  const searchUsersByMajorAndStatus = async (major: string, status: string) => {
    try {
      const response = await userService.searchUsersByMajorAndStatus(major, status, currentPage.value, itemsPerPage.value);
      users.value = response.data.data.map((user: any) => mapToUser(user));
      totalUsers.value = response.data.total;
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  
  //search majors paginate
  const searchMajorPagination = async (major: string) => {
    try {
      const response = await userService.searchMajorPagination(major, currentPage.value, itemsPerPage.value);
      users.value = response.data.data.map((user: any) => mapToUser(user));
      totalUsers.value = response.data.total;
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };
  //searchStatusPagination
  const searchStatusPagination = async (status: string) => {
    try {
      const response = await userService.searchStatusPagination(status, currentPage.value, itemsPerPage.value);
      users.value = response.data.data.map((user: any) => mapToUser(user));
      totalUsers.value = response.data.total;
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

    // search status student
  // const searchStatus = async () => {
  //   try {
  //     const response = await userService.searchStatus(searchDropdown3.value);
  //     users.value = response.data;
  //   } catch (error) {
  //     console.error('Error searching users:', error);
  //   }
  // };
  
  //search status teacher and admin
  const searchStatusTeacherAndAdmin = async () => {
    try {
      const response = await userService.searchStatusTeacherAndAdmin(searchDropdown4.value);
      users.value = response.data;
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };


  const getUsers = async () => {
    try {
      const res = await userService.getUser(); // Fetch user data
      // Assuming res.data is an array of user objects
      console.log("res", res.data);
      users.value = res.data.map((user: any) => mapToUser(user)); // Transform each user data
      console.log("users", users.value);
    } catch (e) {
      console.error("Failed to fetch users:", e);
      messageStore.showError("Oops!, cannot get data users.");
    }
  };
  // function resetUser
  const resetUser = () => {
    editUser.value = {
      userId: 0,
      firstName: "",
      lastName: "",
      email: "",
      studentId: "",
      adminId: "",
      major: "",
      year: "",
      role: "",
      status: "",
      registerStatus: "",
      profileImage: "",
      faceDescriptions: [],
      images: [],
      files: [],
    };
  };
  //save user
  const saveUser = async () => {
    try {
      if (editUser.value.userId && editUser.value.userId !== 0) {
        await userService.updateUser(editUser.value, editUser.value.userId);
        // Update user in the register array
      } else {
        await userService.saveUser(editUser.value);
      }


      // closeDialog();
    } catch (e) {
      console.error("Failed to save user:", e);
      messageStore.showError("บันทึกข้อมูลผู้ใช้ไม่สำเร็จ");
    }
  };
  //delete user by id
  const deleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      messageStore.showInfo("User has been deleted successfully.");
    } catch (e) {
      console.log(e);
    }
  };

  //get user image by id
  const getUserImage = async (id: number) => {
    try {
      const res = await userService.getUserImage(id);
      users.value = res.data;
    } catch (e) {
      console.log(e);
    }
  };
  const closeDialog = () => {
    showDialog.value = false;
    showDialog2.value = false;
    showDialog3.value = false;
    showDialog3.value = false;
    showDialog4.value = false;
    showEditDialog.value = false;
    showEditDialog2.value = false;
    showEditDialog3.value = false;
  };

  const closeImageDialog = () => {
    showImageDialog.value = false;
  }

  //create function to get current user from local storage
  const getCurrentUser = async () => {
    const userString = localStorage.getItem("users");
    console.log("userString", userString);

    if (userString !== null) {
      try {
        const userObject = JSON.parse(userString);

        // Directly assign the parsed userObject to currentUser.value
        if (userObject && typeof userObject === 'object') {
          currentUser.value = mapToUser(userObject);
          console.log("currentUser", currentUser.value);
        } else {
          console.error("User data is not properly formatted.");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      console.error("No user data found in localStorage.");
    }
  };




  // getUserByCourseId
  const getUserByCourseId = async (courseId: string) => {
    try {
      const res = await userService.getUserByCourseId(courseId);
      users.value = res.data.map((user: any) => mapToUser(user));
      console.log("users.value", users.value);

    } catch (e) {
      console.log(e);
    }
  }

  const updateRegisterStatus = async (userId: number, user: User) => {
    try {
      const res = await userService.updateRegisterStatus(userId, user);
      console.log("data", res.data);
      regisUser.value = res.data;
      console.log("users.value", regisUser.value);
    } catch (e) {
      console.log(e);
    }
  }

  //getUsersById
  const getUsersById = async (id: number) => {
    try {
      const res = await userService.getUserById(id);
      console.log("API response:", res.data);
      currentUser.value = mapToUser(res.data); // Ensure mapToUser maps 'updatedAt'
    } catch (e) {
      console.error("Failed to fetch user by ID:", e);
    }
  };

  const getUsersByStdId = async (id: string) => {
    try {
      const res = await userService.getUserByStdId(id);
      console.log("res std", res.data);
      regisUser.value = mapToUser(res.data); // Directly map the single user object
    } catch (e) {
      console.log(e);
    }
  }

  const getFileUser = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await userService.getFileStd(formData);  // Make sure this matches the actual function that handles file uploads
      file_.value = res.data;
      console.log("Upload successful", file_.value);
    } catch (error) {
      console.error("Upload failed", error);
      messageStore.showError("รูปแบบไฟล์ที่อัปโหลดไม่ถูกต้อง กรุณาลองอัปโหลดใหม่อีกครั้ง")
      file_.value = [];
    }
  }

  // get teacher
  const getTeachers = async () => {
    try {
      const res = await userService.getTeachers();
      teachers.value = res.data.map((user: any) => mapToUser(user));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  async function createQrByStdId(stdId: string) {
    try {
      const res = await userService.getStdQR(stdId);
      const imageDataUrl = `${res.data}`;
      QR.value = imageDataUrl;
      editUser.value.studentId = stdId;
      console.log("found", QR.value);
    } catch (error) {
      console.error("Error while fetching QR code:", error);
    }
  }
  
  const checkEmailDuplicate = async (email: string, userId?: number) => {
    try {
      const res = await userService.checkEmailDuplicate(email, userId);
      console.log("res", res);
      return res.data;
    } catch (error) {
      console.error("Error while checking email duplicate:", error);
    }
  };
  

  //check studentId duplicate
  const checkStudentIdDuplicate = async (studentId: string) => {
    try {
      const res = await userService.checkStudentIdDuplicate(studentId);
      console.log("res", res);
      return res.data;
    } catch (error) {
      console.error("Error while checking studentId duplicate:", error);
    }
  };

  // watch userStore.currentPage
  // watch([currentPage, itemsPerPage], () => {
  //   fetchPaginatedUsers();
  // });

  //getUser pagination
  const fetchPaginatedUsers = async () => {
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
    };
    try {
      const res = await userService.getUserPagination(params.page, params.limit);
      if (res.status === 200) {
        users.value = res.data.data.map((user: any) =>
          mapToUser(user)
        );
        console.log("users", users.value);
        totalUsers.value = res.data.total;
      }
    } catch (error) {
      console.error("Error while fetching paginated users:", error);
    }
  };

  //paginate get student
  const getStudentPagination = async () => {
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
    };
    try {
      const res = await userService.getStudentPagination(params.page, params.limit);
      if (res.status === 200) {
        users.value = res.data.data.map((user: any) =>
          mapToUser(user)
        );
        totalUsers.value = res.data.total;
        currentPage.value = res.data.currentPage;
      }
    } catch (error) {
      console.error("Error while fetching paginated students:", error);
    }
  };  

  //paginate get teacher
  const getTeacherPagination = async () => {
    try {
      const res = await userService.getTeacherPagination(currentPage.value,
        itemsPerPage.value);
      if (res.status === 200) {
        users.value = res.data.data.map((user: any) =>
          mapToUser(user)
        );
        totalUsers.value = res.data.total;
      }
    } catch (error) {
      console.error("Error while fetching paginated teachers:", error);
    }
  };

  //paginate get admin
  const getAdminPagination = async () => {
    try {
      const res = await userService.getAdminPagination(currentPage.value,
        itemsPerPage.value);
      if (res.status === 200) {
        users.value = res.data.data.map((user: any) =>
          mapToUser(user)
        );
        totalUsers.value = res.data.total;
      }
    } catch (error) {
      console.error("Error while fetching paginated admins:", error);
    }
  };

  // logpout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('users');
    currentUser.value = undefined;
    window.location.reload();
    router.push('/');

  };


  return {
    searchUsersByMajorAndStatus,
    searchStatusPagination,
    searchStatusTeacherAndAdmin,
    getStudentPagination,
    getTeacherPagination,
    getAdminPagination,
    fetchPaginatedUsers,
    checkStudentIdDuplicate,
    checkEmailDuplicate,
    searchMajorPagination,
    getTeachers,
    createQrByStdId,
    getCurrentUser,
    currentUser,
    getUserImage,
    showEditDialog2,
    keyword,
    showEditDialog,
    users,
    getUsers,
    showDeleteDialog,
    showDialog,
    showDialog2,
    closeDialog,
    showDialog3,
    showDialog4,
    showEditDialog3,
    editUser,
    saveUser,
    deleteUser,
    resetUser,
    searchQuery,
    getUserByCourseId,
    searchDropdown,
    searchDropdown2,
    getFileUser,
    showImageDialog,
    closeImageDialog,
    file_,
    getUsersById,
    getUsersByStdId,
    QR,
    regisUser,
    notiUser,
    updateRegisterStatus,
    currentPage,
    totalUsers,
    itemsPerPage,
    searchDropdown3,
    searchDropdown4,
    searchDropdown5,
    logout,
    teachers
  };
});