// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "./types/User";
import auth from "../services/auth.service";
import router from "@/router";
import Swal from "sweetalert2";

export const useAuthStore = defineStore("authStore", () => {
  const currentUser = ref<User>({
    userId: -1,
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    profileImage: "",
  });
  const accessToken = ref("");
  const setCurrentUser = (user: User) => {
    currentUser.value = user;
  };
  //fetchUserProfile
  const fetchUserProfile = () => {
    const response = fetch("localhost:3000/auth/profile").then((res) =>
      res.json()
    );
    console.log(response);
  };
  //login user
  const login = async (value: string,image1:string) => {
    try {
      currentUser.value.email = value;
      currentUser.value.profileImage = image1;
      const response = await auth.login(currentUser.value);
      console.log("res", response);
      // console.log()
      if (response.status === 201 || response.status === 200) {
        const token = response.data.access_token;
        accessToken.value = token;
        setCurrentUser(response.data.user);
        localStorage.setItem("token", token);
        console.log("Stored token:", localStorage.getItem("token"));
        localStorage.setItem("users", JSON.stringify(response.data.user));
        console.log("current user", currentUser.value);
        console.log("role", currentUser.value.role);
        
        if (currentUser.value.role === "อาจารย์") {
          router.push("/courseManagement");
        }
        if (currentUser.value.role === "นิสิต") {
          router.push("/userProfile");
        }
        if (currentUser.value.role === "แอดมิน") {
          router.push("/userManagement");
        }
      } else {
        console.log("User not found");
        Swal.fire({
          icon: "error",
          title: "User not found",
          text: "Please check your credentials and try again.",
        });
        router.push("/");
      }
    } catch (error) {
      if ((error as any).response && (error as any).response.status === 404) {
        console.log("User not found");
        alert("User not found. Please check your credentials and try again.");
      } else {
        console.log("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };
  //logout user
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };


  return {
    currentUser,
    setCurrentUser,
    fetchUserProfile,
    login,
    logout,
  };
});
