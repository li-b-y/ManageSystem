import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'

Vue.use(Router)
//ES6的import方法实现路由懒加载
  const routes =  [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: () => import('../components/Home.vue'),
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: () => import('../components/index/Welcome.vue')
        },
        {
          path: '/users',
          component: () => import('../components/user/User.vue')
        },
        {
          path: '/rights',
          component: () => import('../components/right/Right.vue')
        },
        {
          path: '/roles',
          component: () => import('../components/right/Role.vue')
        },
        {
          path: '/categories',
          component: () => import('../components/goods/Cate.vue')
        },
        {
          path: '/params',
          component: () => import('../components/goods/Params.vue')
        },
        {
          path: '/goods',
          component: () => import('../components/goods/List.vue')
        },
        {
          path: '/goods/add',
          component: () => import('../components/goods/Add.vue')
        },
        {
          path: '/goods/edit',
          component: () => import('../components/goods/Edit.vue')
        },
        {
          path: '/orders',
          component: () => import('../components/order/Orders.vue')
        }
      ]
    }
  ]

  const router = new Router({
  routes
  })
//路由前置守卫 to：目标路由对象，from：来源, next: 放行
router.beforeEach((to,from,next) => {
  if(to.path == '/login') //如果访问登录页，直接放行
    return next();
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  if(!userInfo) //如果用户未登录成功，则直接返回登录界面
    return next('/login');
  next();
})

export default router
