import { createMemoryHistory, createRouter } from 'vue-router' 
import DashboardView from '../pages/dashboard.vue';
import LoginView from '../pages/login.vue';
import CategoryView from '../pages/category.vue';
import NewView from '../pages/new.vue'; 
import EditView from '../pages/edit.vue';

import { supabase } from '../lib/appsupabase';

const routes= [
    {path : "/", component: LoginView, name: "login"}, 
    {path: "/dashboard", component: DashboardView, name: "dashboard", meta: {requiresAuth: true}},
    {path: "/category", component: CategoryView, name: "category",meta: {requiresAuth: true}},  
    {path: "/new", component: NewView, name: "new", meta: {requiresAuth: true}}, 
    {path: "/edit/:id", component: EditView, name: "edit", meta: {requiresAuth: true}}
];

const router = createRouter({
    history: createMemoryHistory(), 
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