<script lang="ts">
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/appsupabase';

export default {
    name: "LoginView",
    data() {
        return {
            email: '', 
            password: '', 
            user: null as User | null, 
            error: null, 
            loading: false, 
        }
    }, 

    async created () {
        // Check if there's an existing session
        const {data: {session}} = await supabase.auth.getSession();
        if(session) {
            this.user = session.user;
            const {data: userdata, error: dbError} = await supabase.from('users').select().eq("uuid", this.user.id);
                if(dbError) {
                  await supabase.auth.signOut();
                  // logout the user 
                  throw dbError
            };
            if(userdata[0]['role'] == "admin"){
                // Redirect to dashbaord 
                this.$router.push("/admin")
                }else{
                // Redirect to dashbaord 
                this.$router.push("/dashboard")
              }
        }
    }, 
    methods: {
    async signIn() {
        this.loading = true;
        this.error = null;

        try {
            // Try email sign in first
            let { data: emailAuth, error: emailError } = await supabase.auth.signInWithPassword({
                email: this.email,
                password: this.password,
            });

            // Try phone sign in if email fails
            let { data: phoneAuth, error: phoneError } = emailError ? 
                await supabase.auth.signInWithPassword({
                    phone: this.email,
                    password: this.password,
                }) : { data: emailAuth, error: null };

            // If both authentication methods fail
            if (emailError && phoneError) {
                throw new Error(phoneError.message || emailError.message);
            }

            const user = phoneAuth?.user || emailAuth?.user;
            
            if (!user?.id) {
                throw new Error('Authentication successful but user data is missing');
            }

            // Fetch user data from database
            const { data: userData, error: dbError } = await supabase
                .from('users')
                .select()
                .eq("uuid", user.id)
                .single();

            if (dbError) {
                await supabase.auth.signOut();
                throw new Error('Failed to fetch user data: ' + dbError.message);
            }

            if (!userData) {
                await supabase.auth.signOut();
                throw new Error('User data not found in database');
            }

            // Store user data
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));

            // Navigate based on role
            this.$router.push(userData.role === 'admin' ? '/admin' : '/dashboard');

        } catch (error: any) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }
}
}
</script>

<template>
  <div class="mt-10">
    <div class="max-w-sm mx-auto">

        <div class="mb-10 flex justify-center">
            <img src="/logo.png" alt="" width="200" height="200">
        </div>
    <!-- Error -->
    <div v-if="error" class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
      <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <span class="sr-only">Info</span>
      <div>
        <span class="font-medium">Danger alert!</span> {{ error }}
      </div>
    </div>
      <div class="mb-5">
        <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email Address / Phone Number</label>
        <input type="text" autocomplete="" v-model="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="name@example.com" required />
      </div>
      <div class="mb-5">
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
        <input type="password" autocomplete=""  v-model="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
      </div>
      <button type="submit" @click="signIn" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Login</button>
    </div>
  </div>

</template>