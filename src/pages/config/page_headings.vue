<script lang="ts">
import HeaderComponent from '../../components/HeaderComponent.vue';
import { supabase } from '../../lib/appsupabase';
export default {
    name: "PageHeading", 
    components: {
        HeaderComponent,
    },
    data() {
        return {
            nav1: '',
            nav2: '',
            nav3: '',
            nav4: '',
            error: null as string | null,
            loading: false,
            success: false,


        }
    },
    async created() {
        await this.fetchConfig()
    },
    methods: {
        async submitConfig() {
            this.error = null;
            this.success = false;
            this.loading = true;

            try {
                // Validate all inputs
                if (!this.validateInputs()) {
                    return;
                }


                // Prepare configuration object
                const configContent = {
                    nav1: this.nav1,
                    nav2: this.nav2,
                    nav3: this.nav3,
                    nav4: this.nav4,
                };

                // Update configuration in Supabase
                const { error } = await supabase
                    .from('configs')
                    .upsert({ 
                        id: 3, 
                        content: JSON.stringify(configContent) 
                    });

                if (error) throw error;

                this.success = true;
                this.error = null;
            } catch (err: any) {
                this.error = err.message || 'Error updating configuration';
                this.success = false;
                console.error('Error:', err);
            } finally {
                this.loading = false;
            }
        },
        validateInputs(): boolean {
            // Check text inputs
            if (!this.nav1 || !this.nav2 || !this.nav3 || !this.nav4) {
                this.error = 'All headings labels are required';
                this.loading = false;
                return false;
            }
            return true;
        },
     
        async fetchConfig() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('configs')
                    .select('*')
                    .eq('id', 3)
                    .maybeSingle()

                if (error) throw error

                if (data && data.content) {
                    const jsonData = JSON.parse(data.content);
                    this.nav1 = jsonData.nav1 || '';
                    this.nav2 = jsonData.nav2 || '';
                    this.nav3 = jsonData.nav3 || '';
                    this.nav4 = jsonData.nav4 || '';
                }

            } catch (err: any) {
                this.error = 'Error fetching config details'
                console.error('Error:', err.message)
            } finally {
                this.loading = false
            }
        },

    }
}
</script>
<template>
    <div>
        <HeaderComponent />
        <div class="mt-10">
            <div class="max-w-sm mx-auto">
                <div class="mb-10 flex justify-center">
                    <h2>Edit Heading titles</h2>
                </div>

                <!-- Error Alert -->
                <div v-if="error" class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                    <span class="sr-only">Info</span>
                    <div>
                        <span class="font-medium">Danger alert!</span> {{ error }}
                    </div>
                </div>

                <!-- Success Alert -->
                <div v-if="success" class="flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                    <div>
                        <span class="font-medium">Success!</span> Config updated successfully.
                    </div>
                </div>

                <form class="space-y-5" @submit.prevent="submitConfig">
                    <div class="mb-5">
                        <label for="nav1" class="block mb-2 text-sm font-medium text-gray-900">Heading 1</label>
                        <input 
                            type="text" 
                            v-model="nav1" 
                            id="nav1" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                        />

                    </div>
                 
                    <div class="mb-5">
                        <label for="nav2" class="block mb-2 text-sm font-medium text-gray-900">Heading 2</label>
                        <input 
                            type="text" 
                            v-model="nav2" 
                            id="nav2" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                        />

                    </div>
                   
                    <div class="mb-5">
                        <label for="nav3" class="block mb-2 text-sm font-medium text-gray-900">Heading 3</label>
                        <input 
                            type="text" 
                            v-model="nav3" 
                            id="nav3" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                        />

                    </div>
                  
                    <div class="mb-5">
                        <label for="nav4" class="block mb-2 text-sm font-medium text-gray-900">Heading 4</label>
                        <input 
                            type="text" 
                            v-model="nav4" 
                            id="nav4" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                        />

                    </div>
                    <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                        {{ loading ? 'Updating...' : 'Update' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>