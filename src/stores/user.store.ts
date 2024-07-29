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
  const showDialog2 = ref(false);
  const showDialog3 = ref(false);
  const showDeleteDialog = ref(false);
  const showEditDialog = ref(false);
  const showEditDialog2 = ref(false);
  const keyword = ref("");
  const messageStore = useMessageStore()
  const currentUser = ref<User>();
  const register = ref<User[]>([]);

  const editUser = ref<User & { files: File[] }>({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    teacherId: "",
    role: "",
    status: "",
    year: "",
    major: "",
    profileImage: "",
    faceDescriptions:[],
    
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
      year: "",
      major: "",
      profileImage: "",
      files: [],
    };
  }
  //save user
  const saveUser = async () => {
    try {
      console.log("save user", editUser.value);
      if (editUser.value.userId && editUser.value.userId !== 0) {
        await userService.updateUser(editUser.value, editUser.value.userId);
      } else {
        await userService.saveUser(editUser.value);
        messageStore.showInfo("User has been saved successfully.");
      }
      getUsers(); // Refresh or reload user list
      // resetUser(); 
      closeDialog();
    } catch (e) {
      console.log(e);
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
        console.log("res", res.data);
        users.value = res.data.map((user: any) => mapToUser(user));
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


  return {
    register,
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
    file_
  };
});
