import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import { ref } from 'vue';
const user = ref<any | null>(localStorage.getItem('users'))
const user_ = JSON.parse(user.value)
// const ezAutorized = () => {
//   if (user_.role.toLowerCase() === 'users') {
//     return router.push('/pageNotFound')
//   } else {
//     return true;
//   }
// }
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    //mappingView
    path: '/mapping/:idStudent',
    name: 'mapping',
    component: () => import(/* webpackChunkName: "mapping" */ '../views/MappingView.vue')
  }
  ,
  {
      //mappingView
      path: '/mapping2',
      name: 'mapping2',
      components: {
        default: () => import('../views/Attendance/MappingViewVersion2.vue'),
        header: () => import('../components/headers/MainHeader.vue'),
        menu: () => import('../components/headers/SubHeader.vue'),
      },
      meta: {
        layout: "FullLayout",
        // requiresAuth: true,
        // beforeEnter:[ ezAutorized]
      }
    }
  ,
  {
      //courseManagementView
      path: '/courseManagement',
      name: 'courseManagement',
      components: {
        default: () => import('../views/CourseManagementView.vue'),
        header: () => import('../components/headers/MainHeader.vue'),
        menu: () => import('../components/headers/SubHeader.vue'),
      },
      meta: {
        layout: "FullLayout",
      }
  },
  {
    //CourseDetail
    path: '/courseDetail/:idCourse',
    name: 'courseDetail',
    components: {
      default: () => import('../views/CouseDetailView.vue'),
      header: () => import('../components/headers/MainHeader.vue'),
      menu: () => import('../components/headers/SubHeader.vue'),
    },
    meta: {
      layout: "FullLayout",
    }
},

{
  //CheckAttendanceView
  path: '/checkAttendance/:idCourse',
  name: 'checkAttendance',
  components: {
    default: () => import('../views/CheckAttdentView.vue'),
    header: () => import('../components/headers/MainHeader.vue'),
    menu: () => import('../components/headers/SubHeader.vue'),
  },
  meta: {
    layout: "FullLayout",
  }
},

{
  //UserManagementView
  path: '/userManagement',
  name: 'userManagement',
  components: {
    default: () => import('../views/UserManagementView.vue'),
    header: () => import('../components/headers/MainHeader.vue'),
    menu: () => import('../components/headers/SubHeader.vue'),
  },
  meta: {
    layout: "FullLayout",
  }
},
{
  //enrolmentManagementView
  path: '/enrolmentManagement',
  name: 'enrolmentManagement',
  components: {
    default: () => import('../views/EnrolmentManagementView.vue'),
    header: () => import('../components/headers/MainHeader.vue'),
    menu: () => import('../components/headers/SubHeader.vue'),
  },
  meta: {
    layout: "FullLayout",
  }
},
{
  // mappingForStudent
  path: '/mappingForStudent/:assignmentId',
  name: 'mappingForStudent',
  components: {
    default: () => import('../views/Attendance/MappingForStudent.vue'),
    header: () => import('../components/headers/MainHeader.vue'),
    menu: () => import('../components/headers/SubHeader.vue'),
  },
},
//resheckMappingTeacher
{
  // mappingForStudent
  path: '/resheckMappingTeacher/:assignmentId',
  name: 'resheckMappingTeacher',
  components: {
    default: () => import('../views/Attendance/ReCheckMappingTeacher.vue'),
    header: () => import('../components/headers/MainHeader.vue'),
    menu: () => import('../components/headers/SubHeader.vue'),
  },
},
  
]


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

const isLoggedIn = () => {
  const user = localStorage.getItem('users')
  if (user) {
    return true
  } else {
    return false
  }
}
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return {
      path: '/',
      query: { redirect: to.fullPath }
    }
  }
})


export default router
