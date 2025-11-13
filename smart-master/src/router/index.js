import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/index.vue'),
    children: [
      {
        path: '',
        redirect: '/home/ai-comparison'
      },
      {
        path:'learning-analytics',
        name:'LearningAnalytics',
        component:() => import('@/views/learningAnalytics/index.vue')
      },
      {
        path: 'preview',
        name: 'Preview',
        component: () => import('../views/preview/index.vue')
      },
      {
        path: 'ai-comparison',
        name: 'AIComparison',
        component: () => import('../views/tools/aiComparison/index.vue')
      },
      {
        path: 'tools/intelligent-qa',
        name: 'IntelligentQA',
        component: () => import('@/views/tools/intelligentQA/index.vue'),
        meta: {
          title: '智能答疑'
        }
      },
      {
        path: 'learning-assistant',
        name: 'LearningAssistant',
        component: () => import('../views/tools/learningAssistant/index.vue')
      },
      {
        path: 'resource-assistant',
        name: 'ResourceAssistant',
        component: () => import('../views/tools/resourceAssistant/index.vue')
      },
      {
        path: 'ai-analysis',
        name: 'AIAnalysis',
        component: () => import('../views/tools/aiAnalysis/index.vue')
      },
      {
        path: 'courseware',
        name: 'Courseware',
        component: () => import('../views/courseware/index.vue')
      },
      {
        path: 'lesson-plan',
        name: 'LessonPlan',
        component: () => import('../views/lessonPlan/index.vue')
      },
      {
        path: 'homework',
        name: 'Homework',
        component: () => import('../views/homework/index.vue')
      },
      {
        path: 'resources',
        name: 'Resources',
        component: () => import('../views/resources/index.vue')
      },
      {
        path: 'tools/ppt-generation',
        name: 'PPTGeneration',
        component: () => import('@/views/tools/pptGeneration/index.vue'),
        meta: {
          title: 'PPT生成',
          icon: 'PictureFilled'
        }
      },
      {
        path:'profile',
        name:'Profile',
        component:() => import('@/views/profile/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，检查是否登录
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  
  if (to.path !== '/login' && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router