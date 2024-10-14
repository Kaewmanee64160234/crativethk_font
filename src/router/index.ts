import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { ref } from "vue";
import { useUserStore } from "@/stores/user.store";
import jwtDecode from 'jwt-decode';

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
        requiresAuth: true,

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
        requiresAuth: true,

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
      requiresAuth: true,


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
        requiresAuth: true,

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
        requiresAuth: true,

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
        requiresAuth: true,

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
        requiresAuth: true,

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
        requiresAuth: true,

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
        requiresAuth: true,

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
        requiresAuth: true,

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
        requiresAuth: true,

        allowedRoles: ['นิสิต'], 

      }
    },
    {
      path: "/checkingHistory/:courseId",
      name: "checkingHistory",
      components: {
        default: () => import("../views/checkingHistory.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta:{
        requiresAuth: true,

        allowedRoles: ['นิสิต'], 

      }
      // create page  not found
    },
    {
      path: "/confirmRejectNotic/:noticId",
      name: "confirmRejectNotic",
      components: {
        default: () => import("../views/Noticification/ConfirmRejectView.vue"),
        header: () => import("../components/headers/MainHeader.vue"),
        menu: () => import("../components/headers/SubHeader.vue"),
      },
      meta: {
        requiresAuth: true,

        allowedRoles: ['อาจารย์'], 
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


function isTokenExpired(token: string) {
  try {
    const decodedToken: any = jwtDecode(token); // Decode the token
    const currentTime = Date.now() / 1000;  // Get current time in seconds
    return decodedToken.exp < currentTime;  // Check if token is expired
  } catch (error) {
    return true; // If there's an error decoding, assume the token is expired
  }
}

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const token = localStorage.getItem('token');   // Retrieve the token from localStorage
  userStore.getCurrentUser();
  const userRole = userStore.currentUser?.role;  // Get the current user's role
  
  if (to.meta.requiresAuth) {
    if (!token) {
      return next('/');
    }

    if (isTokenExpired(token)) {
      userStore.logout(); 
      return next('/');  
    }



    // If the route has role-based restrictions, check the user's role
    if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
      return next('/forbidden');  // Redirect to 403 page if user doesn't have the correct role
    }
  }

  next();  // Allow navigation if everything is fine
});

export default router;


