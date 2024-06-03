// src/stores/user.ts
import { defineStore } from "pinia";
import { getCurrentInstance, ref, watch } from "vue";
import userService from "@/services/user"; // Import the userService module
import { mapToUser, type User,} from "./types/User";
import user from "@/services/user";

export const useUserStore = defineStore("userStore", () => {
  const users = ref<User[]>([]);
  const showDialog = ref(false);
  const showDialog2 = ref(false);
  const showDialog3 = ref(false);
  const showDeleteDialog = ref(false);
  const showEditDialog = ref(false);
  const showEditDialog2 = ref(false);
  const keyword = ref("");
  const currentUser = ref<User>();

  const editUser = ref<User & { files: File[] }>({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    teacherId: "",
    role: "",
    status: "",
    profileImage: "",
    files: [],
  });

  

  const getUsers = async () => {
    try {
      const res = await userService.getUser(); // Fetch user data
      // Assuming res.data is an array of user objects
      console.log("res", res.data);
      users.value = res.data.map((user: any) => mapToUser(user)); // Transform each user data
      console.log("users", users.value);
    } catch (e) {
      console.error("Failed to fetch users:", e);
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
      }
      getUsers(); // Refresh or reload user list
      closeDialog();
    } catch (e) {
      console.log(e);
    }
  };
  //delete user by id
  const deleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      await getUsers();
    } catch (e) {
      console.log(e);
    }
  };

  //get user by studentId and teacherId
  const getUserBystidId = async (studentId: string, teacherId: string) => {
    try {
      const res = await userService.getUserBystidId(studentId, teacherId);
      currentUser.value = res.data;
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
        users.value = res.data.map((user: any) => mapToUser(user));
    } catch (e) {
        console.log(e);
    }
}


  return {
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
    getUserBystidId,
    getUserByCourseId,
    
  };
});
