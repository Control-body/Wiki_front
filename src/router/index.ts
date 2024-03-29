import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/home.vue'
import About from '../views/about.vue'
import AdminUser from "@/views/admin/admin-user.vue";
import AdminEbook from '../views/admin/admin-ebook.vue'
import Category from '../views/admin/admin-category.vue'
import AdminDoc from '../views/admin/admin-doc.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
    // // route level code-splitting
    // // this generates a separate chunk (about.[hash].js) for this route
    // // which is lazy-loaded when the route is visited. 先下面是懒加载的方式
    // component: () => import(/* webpackChunkName: "about" */ '../views/admin-ebook.vue')
  },
  {
    path: '/admin/user',
    name: 'AdminUser',
    component: AdminUser
  },

  {
    path: '/admin/ebook',
    name: 'AdminEbook',
    component: AdminEbook
  },
  {
    path: '/admin/category',
    name: 'Category',
    component: Category
  },  {
    path: '/admin/doc',
    name: 'AdminDoc',
    component: AdminDoc,
  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
