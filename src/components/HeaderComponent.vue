<script lang="ts">
import { supabase } from '../lib/appsupabase';

export default {
    name: "HeaderComponent",
    data() { 
        return {
            isMenuOpen: false, 
            role: "user",
        }
    },
    async created () {
        // Check if there's an existing session
        const {data: {session}} = await supabase.auth.getSession();
        if(session) {
            const {data: userdata, error: dbError} = await supabase.from('users').select().eq("uuid", session.user.id);
                if(dbError) {
                  await supabase.auth.signOut();
                  // logout the user 
                  throw dbError
            };
            if(userdata[0]['role'] == "admin"){
                this.role = "admin";
            }else{
                this.role = "user";
            }
        }
    }, 
    methods: {
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },
        async signOut() {
            try {
                const {error} = await supabase.auth.signOut();
                if(error) throw error; 
                //clear local storage 
                localStorage.removeItem('user');
                this.$router.push('/')
            } catch (err: any) {
                console.log('Logout error:', err.message);
            }
        }
    }
}
</script>

<template>
    <nav class="bg-white border-gray-200 dark:bg-gray-900">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
                <img src="/logo.png" class="h-8" alt="Flowbite Logo" />
                <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">FRSC</span>
            </a>
            <button 
                @click="toggleMenu"
                type="button" 
                class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                aria-controls="navbar-default" 
                :aria-expanded="isMenuOpen"
            >
                <span class="sr-only">Open main menu</span>
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
            <div 
                :class="{ 'hidden': !isMenuOpen }" 
                class="w-full md:block md:w-auto" 
                id="navbar-default"
            >
                <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                    <li v-if="role != 'admin'">
                        <RouterLink to="/dashboard" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Dashboard</RouterLink>
                    </li>

                    <li v-if="role != 'admin'">
                        <RouterLink to="/violation" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Violations</RouterLink>
                    </li>
                    <li v-if="role != 'admin'">
                        <RouterLink to="/product" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Products</RouterLink>
                    </li>
                    <li v-if="role == 'admin'">
                        <RouterLink to="/admin" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Home</RouterLink>
                    </li>
                    <li v-if="role == 'admin'">
                        <RouterLink to="/admin/reports" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Reports</RouterLink>
                    </li>
                    <li v-if="role == 'admin'">
                        <RouterLink to="/admin/command" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Commands</RouterLink>
                    </li>
                    <li v-if="role == 'admin'">
                        <RouterLink to="/users" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Users</RouterLink>
                    </li>
                    <li v-if="role == 'admin'">
                        <RouterLink to="/config" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0" @click="isMenuOpen = false">Config</RouterLink>
                    </li>
                    <li>
                        <a href="javascript:void(0)" @click="signOut" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>   
</template>