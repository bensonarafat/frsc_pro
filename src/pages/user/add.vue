<script lang="ts">
import HeaderComponent from '../../components/HeaderComponent.vue';
import { supabase } from '../../lib/appsupabase';
export default {
    name: "UserAdd", 
    components: {
        HeaderComponent,
    },
    data() {
        return {
            fullname: '', 
            email: '',
            password: '',
            error: null as any, 
            loading: false, 
            success: false, 

        }
    }, 
    methods: {
        async createNew() {
            // Reset error state
            this.error = null
            this.loading = true 
            try {
                // Validate required fields
                if (!this.password || !this.email || !this.fullname) {
                    throw new Error('Please fill in all required fields')
                }

                const response = await supabase.auth.signUp({
                                            email: this.email,
                                            password: this.password,
                                        })
                if(response.error){
                    this.error = response.error.message
                    return;
                }
                const {error}  = await supabase.from('users').insert([{
                        email: this.email, 
                        uuid: response.data.user!.id,
                        fullname: this.fullname, 
                        created_at: new Date().toISOString(), 
                        updated_at: new Date().toISOString(),
                }]).select();
                
                if(error){
                    return false;
                }
            // Show success message 
            this.success = true 
            alert("Account created, Check your email to verify account")
            // Reset form
            this.resetForm()
            // Redirect to list view after short delay
            setTimeout(() => {
            this.$router.push('/users')  // Adjust route as needed
            }, 1500)
            } catch (error) {
                
            }
        }, 

        resetForm() {
            this.email = ''
            this.fullname = ''
            this.password = ''
            this.error= null
        },
    }
}

</script>
<template>
    <div>
        <HeaderComponent/>

        <div class="mt-10">
    <div class="max-w-sm mx-auto">

        <div class="mb-10 flex justify-center">
            <h2>Create User</h2>
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

            <form class="space-y-5" @submit.prevent="createNew">
                <div class="mb-5">
                    <label for="fullname" class="block mb-2 text-sm font-medium text-gray-900">Full Name</label>
                    <input type="text" v-model="fullname" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>
                <div class="mb-5">
                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                    <input type="text"  v-model="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>

                <div class="mb-5">
                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                    <input type="text"  v-model="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>

                <button type="submit" @click="createNew" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                    {{ loading ? 'Creating....' : 'Create'}}
                </button>
            </form>
        </div>
     </div>

    </div>
</template>