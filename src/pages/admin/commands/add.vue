<script lang="ts">
import { supabase } from '../../../lib/appsupabase';
import HeaderComponent from '../../../components/HeaderComponent.vue';
export default {
    name: "AddCommandView",
    components: {
        HeaderComponent,
    },
    data() {
        return {
            name: '', 
            code: '',
            type: '',
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
                if (!this.name || !this.code) {
                    throw new Error('Please fill in all required fields')
                }

                const {error}  = await supabase.from('commands').insert([{
                        code: this.code, 
                        name: this.name,
                        type: this.type,
                        created_at: new Date().toISOString(), 
                        updated_at: new Date().toISOString(),
                }]).select();
                
                if(error){
                    return false;
                }
            // Show success message 
            this.success = true 
            alert("New Command Created")
            // Reset form
            this.resetForm()
            // Redirect to list view after short delay
            setTimeout(() => {
            this.$router.push('/admin/command')  // Adjust route as needed
            }, 1500)
            } catch (error) {
                
            }
        }, 

        resetForm() {
            this.name = ''
            this.code = ''
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
            <h2>Create Command</h2>
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
                <label for="type" class="block mb-2 text-sm font-medium text-gray-900">Type</label>
                <select v-model="type" id="type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading">
                    <option value="">Select Type</option>
                    <option value="Headquarter">FRSC Headquarters </option>
                    <option value="Zonal">Zonal Command</option>
                    <option value="Sector">Sector Command</option>
                    <option value="Unit">Unit Command</option>
                </select>
            </div>


                <div class="mb-5">
                    <label for="name" class="block mb-2 text-sm font-medium text-gray-900"> Name</label>
                    <input type="text" v-model="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>
                <div class="mb-5">
                    <label for="code" class="block mb-2 text-sm font-medium text-gray-900">Code</label>
                    <input type="text"  v-model="code" id="code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>

                <button type="submit" @click="createNew" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                    {{ loading ? 'Creating....' : 'Create'}}
                </button>
            </form>
        </div>
     </div>

    </div>
</template>