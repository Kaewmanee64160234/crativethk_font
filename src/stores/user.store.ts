// src/stores/user.ts
import { defineStore } from "pinia";
import { getCurrentInstance, ref, watch } from "vue";
import userService from "@/services/user"; // Import the userService module
import { mapToUser, type User } from "./types/User";
import user from "@/services/user";
import { useMessageStore } from "./message";

export const useUserStore = defineStore("userStore", () => {
  const users = ref<User[]>([]);
  const searchQuery = ref<string>("");
  const file_ = ref([] as {id:string, name:string,major:string,year:string}[]);
  const showDialog = ref(false);
  const showImageDialog = ref(false);
  const showDialog2 = ref(false);
  const showDialog3 = ref(false);
  const showDeleteDialog = ref(false);
  const showEditDialog = ref(false);
  const showEditDialog2 = ref(false);
  const QR = ref("");
  const keyword = ref("");
  const messageStore = useMessageStore()
  const currentUser = ref<User>();
  const regisUser = ref<User>();

  const editUser = ref<User & { files: File[] }>({
    userId: 0,
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    teacherId: "",
    major: "",
    year: "",
    role: "",
    status: "",
    registerStatus: "",
    profileImage: "",
    faceDescriptions:[],
    images:[],
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

  // searchUsers
  const searchUser = async () => {
    try {
      const response = await userService.searchUsers(searchQuery.value);
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
  function resetUser() {
    editUser.value = {
      studentId: "",
      teacherId: "",
      firstName: "",
      email: "",
      lastName: "",
      role: "",
      status: "",
      major: "",
      year: "",
      registerStatus: "",
      profileImage: "",
      files: [],
    };
  }
  //save user
  const saveUser = async () => {
    try {
        if (editUser.value.userId && editUser.value.userId !== 0) {
            await userService.updateUser(editUser.value, editUser.value.userId);
            // Update user in the register array
        } else {
            await userService.saveUser(editUser.value);
            messageStore.showInfo("New user created successfully.");
        }

        await getUsers(); // Refresh or reload user list
        closeDialog();  // Close the dialog
    } catch (e) {
        console.error("Failed to save user:", e);
        messageStore.showError("Failed to save user.");
    }
};
  //delete user by id
  const deleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      messageStore.showInfo("User has been deleted successfully.");
      await getUsers();
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
    showEditDialog.value = false;
    showEditDialog2.value = false;
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
            if (userObject.user) { // Access the nested 'user' object
                currentUser.value = mapToUser(userObject.user);
                console.log("currentUser", currentUser.value);
            } else {
                console.error("User data is not properly formatted.");
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
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

const updateRegisterStatus = async (userId: number, user:User) => {
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
      console.log("res", res.data);
      currentUser.value = mapToUser(res.data); // Directly map the single user object
  } catch (e) {
      console.log(e);
  }
}

const getUsersByStdId = async (id: string) => {
  try {
      const res = await userService.getUserByStdId(id);
      console.log("res std", res.data);
      regisUser.value = mapToUser(res.data); // Directly map the single user object
  } catch (e) {
      console.log(e);
  }
}

// getUserFromLocalStorage
const getUserFromLocalStorage = () => {
    const userString = localStorage.getItem("users");
    if (userString !== null) {
        try {
            const userObject = JSON.parse(userString);
            if (userObject.user) {
                currentUser.value = mapToUser(userObject.user);
            } else {
                console.error("User data is not properly formatted.");
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }
  }

  const getFileUser = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await userService.getFileStd(formData);  // Make sure this matches the actual function that handles file uploads
      file_.value = res.data;
      console.log("Upload successful", file_.value );
    } catch (error) {
      console.error("Upload failed", error);
    }
  }

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


  return {
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
    editUser,
    saveUser,
    deleteUser,
    resetUser,
    searchQuery,
    getUserByCourseId,
    getUserFromLocalStorage,
    getFileUser,
    showImageDialog,
    closeImageDialog,
    file_,
    getUsersById,
    getUsersByStdId,
    QR,
    regisUser,
    updateRegisterStatus
  };
});