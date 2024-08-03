import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { ref } from "vue";
const user = ref<any | null>(localStorage.getItem("users"));
const user_ = JSON.parse(user.value);
const ezAutorized = () => {
  if (user_.role.toLowerCase() === "users") {
    return router.push("/pageNotFound");
  } else {
    return true;
  }
};
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      //registerView
      path: "/register",
      name: "register",
      components: {
        default: () => import("../views/Register/RegisterView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
        // requiresAuth: true,
        // beforeEnter:[ ezAutorized]
      },
    },
    {
      //uploadImageView
      path: "/uploadImage/:userId",
      name: "uploadImage",
      components: {
        default: () => import("../views/Register/UploadImageView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
        // requiresAuth: true,
        // beforeEnter:[ ezAutorized]
      },
    },
    {
      //confirmRegisterView
      path: "/confirmRegister/:stdId",
      name: "confirmRegister",
      components: {
        default: () => import("../views/Register/ConfirmRegisterView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
        // requiresAuth: true,
        // beforeEnter:[ ezAutorized]
      },
    },
    {
      //registerHistory
      path: "/registerHistory",
      name: "registerHistory",
      components: {
        default: () => import("../views/Register/RegisterHistoryView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
        // requiresAuth: true,
        // beforeEnter:[ ezAutorized]
      },
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
    },
    {
      //mappingView
      path: "/mapping/:idStudent",
      name: "mapping",
      component: () =>
        import(/* webpackChunkName: "mapping" */ "../views/MappingView.vue"),
    },
    {
      //mappingView
      path: "/mapping2",
      name: "mapping2",
      components: {
        default: () => import("../views/Attendance/MappingViewVersion2.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
        // requiresAuth: true,
        // beforeEnter:[ ezAutorized]
      },
    },
    {
      //courseManagementView
      path: "/courseManagement",
      name: "courseManagement",
      components: {
        default: () => import("../views/CourseManagementView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
        requiresAuth: true,
        beforeEnter: [ezAutorized],
      },
    },
    {
      //CourseDetail
      path: "/courseDetail/:idCourse",
      name: "courseDetail",
      components: {
        default: () => import("../views/CouseDetailView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
      },
    },

    {
      //CheckAttendanceView
      path: "/checkAttendance/:idCourse",
      name: "checkAttendance",
      components: {
        default: () => import("../views/CheckAttdentView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
      },
    },

    {
      //UserManagementView
      path: "/userManagement",
      name: "userManagement",
      components: {
        default: () => import("../views/UserManagementView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
        requiresAuth: true,
        beforeEnter: [ezAutorized],
      },
    },
    {
      //enrolmentManagementView
      path: "/enrolmentManagement",
      name: "enrolmentManagement",
      components: {
        default: () => import("../views/EnrolmentManagementView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
      },
    },
    {
      // mappingForStudent
      path: "/mappingForStudent/course/:courseId/assignment/:assignmentId",
      name: "mappingForStudent",
      components: {
        default: () => import("../views/Attendance/MappingForStudent.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
    },
    //resheckMappingTeacher
    {
      // mappingForStudent
      path: "/reCheckMappingTeacher/course/:courseId/assignment/:assignmentId",
      name: "reCheckMappingTeacher",
      components: {
        default: () => import("../views/Attendance/ReCheckMappingTeacher.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
    },
    // profileView
    {
      path: "/userProfile",
      name: "userProfile",
      components: {
        default: () => import("../views/ProfileView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
    },
    // chekinghistory
    {
      path: "/checkingHistory",
      name: "checkingHistory",
      components: {
        default: () => import("../views/checkingHistory.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
    },
    {
      path: "/checkingHistory/:courseId",
      name: "checkingHistory",
      components: {
        default: () => import("../views/checkingHistory.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      // create page  not found
    },
    // tagging face 
    {
      path: "/taggingFace/course/:courseId/assignment/:assignmentId",
      name: "taggingFace",
      components: {
        default: () => import("../views/Attendance/ConfirmTaggingFaceView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
    },
    {
      // pagenot foun
      path: "/:catchAll(.*)",
      name: "pageNotFound",
      components: {
        default: () => import("../views/PageNotFoundView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
      },
    },
  ],
});

export default router;
