import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { ref } from "vue";
import { useUserStore } from "@/stores/user.store";
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
      allowedRoles: ['แอดมิน'], 

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
      allowedRoles: ['แอดมิน','อาจารย์'], 

      },
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore();
        const role = userStore.currentUser?.role;
        const allowedRoles = ["แอดมิน", "อาจารย์"]; // บทบาทที่อนุญาตให้เข้าถึงเส้นทางนี้
    
        if (allowedRoles.includes(role ?? "")) {
          next(); // อนุญาตให้ผ่านไปยังเส้นทาง
        } else {
          next({ name: "unauthorized" }); // ส่งผู้ใช้ไปยังเส้นทางอื่นหากไม่มีสิทธิ์
        }
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
      path: "/mapping2/assignment/:assignmentId/course/:courseId",
      name: "mapping2",
      components: {
        default: () => import("../views/Attendance/MappingViewVersion2.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
      allowedRoles: ['นิสิต','อาจารย์'], 

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
        allowedRoles: ['นิสิต','อาจารย์','แอดมิน'], 

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
        allowedRoles: ['นิสิต','อาจารย์','แอดมิน'], 

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
        allowedRoles: ['นิสิต','อาจารย์','แอดมิน'], 

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
        allowedRoles: ['แอดมิน'], 

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
        allowedRoles: ['นิสิต','อาจารย์','แอดมิน'], 

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
      meta: {
        allowedRoles: ['นิสิต','อาจารย์'], 
      }
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
      meta: {
        allowedRoles: ['อาจารย์'], 
      }
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
      meta: {
        allowedRoles: ['นิสิต','อาจารย์','แอดมิน'], 
      },
    },

    // confirmRejectNotic
    {
      path: "/confirmRejectNotic/:noticId",
      name: "confirmRejectNotic",
      components: {
        default: () => import("../views/Noticification/ConfirmRejectView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        allowedRoles: ['อาจารย์'], 
      }
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
      meta:{
        allowedRoles: ['นิสิต'], 

      }
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

    {
      path: '/forbidden',
      name: 'forbidden',
      components: {
        default: () => import("../views/ForbiddenView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        layout: "FullLayout",
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const userRole = userStore.currentUser?.role;  // Get the current user's role
  const token = localStorage.getItem('token');   // Check if the user is logged in
  
  // Check if route requires authentication and roles
  if (to.meta.requiresAuth && !token) {
    next('/');  // Redirect to home if not authenticated
  } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
    next('/forbidden');  // Redirect to 403 page if user doesn't have the correct role
  } else {
    next();  // Continue navigation if everything is OK
  }
});


export default router;
