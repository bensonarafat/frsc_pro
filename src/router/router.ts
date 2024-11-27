import { createWebHistory, createRouter } from 'vue-router' 
import DashboardView from '../pages/dashboard.vue';
import LoginView from '../pages/login.vue';
// Product View 
import ProductEditView from '../pages/product/edit.vue'
import ProductNewView from '../pages/product/new.vue'
import ProductView from '../pages/product/index.vue'

// Violation View 
import ViolationEditView from '../pages/violation/edit.vue'
import ViolationNewView from '../pages/violation/new.vue'
import ViolationView from '../pages/violation/index.vue'

// Users View 
import UserView from '../pages/user/index.vue'
import UserAdd from '../pages/user/add.vue'

import { supabase } from '../lib/appsupabase';

const routes= [
    {path : "/", component: LoginView, name: "login"}, 
    {path: "/dashboard", component: DashboardView, name: "dashboard", meta: {requiresAuth: true}},

    {path: "/product", component: ProductView, meta: {requiresAuth: true}},
    {path: "/product/new", component: ProductNewView, meta: {requiresAuth: true}},
    {path: "/product/edit/:id", component: ProductEditView, meta: {requiresAuth: true}},

    {path: "/violation", component: ViolationView, meta: {requiresAuth: true}},
    {path: "/violation/new", component: ViolationNewView, meta: {requiresAuth: true}},
    {path: "/violation/edit/:id", component: ViolationEditView, meta: {requiresAuth: true}},

    {path: "/users", component: UserView, meta: {requiresAuth: true}},
    {path: "/users/add", component: UserAdd, meta: {requiresAuth: true}},


];

const router = createRouter({
    history: createWebHistory(), 
    routes,
});


router.beforeEach(async (to, from, next ) => {
    if(to.matched.some(record => record.meta.requiresAuth) ) {
        const {data: {session}} = await supabase.auth.getSession() 
        if(!session ){
            next("/");
        }else{
            next()
        }
        from;
    }else {
        next()
    }
})
export default router;