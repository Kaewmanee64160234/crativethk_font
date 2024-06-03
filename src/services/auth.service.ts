import type { User } from "@/stores/types/User";
import http from "./axios";
function login(user:User) {
  // console.log(user);
  return http.post("/auth/login", user);
}
export default { login };