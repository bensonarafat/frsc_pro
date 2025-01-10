<script lang="ts">
import { supabase } from '../../../lib/appsupabase';
import HeaderComponent from '../../../components/HeaderComponent.vue';

export default {
    name: "EditCommandView",
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
            commandId: null as string | null,
        }
    },
    async created() {
        // Get the command ID from route params
        this.commandId = this.$route.params.id as string
        await this.fetchCommand()
    },
    methods: {
        async fetchCommand() {
            try {
                this.loading = true
                const { data, error } = await supabase
                    .from('commands')
                    .select('*')
                    .eq('id', this.commandId)
                    .single()

                if (error) {
                    this.error = error.message
                    return
                }

                if (data) {
                    this.name = data.name
                    this.code = data.code
                    this.type = data.type
                }
            } catch (error: any) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        async updateCommand() {
            this.error = null
            this.loading = true
            try {
                // Validate required fields
                if (!this.name || !this.code) {
                    throw new Error('Please fill in all required fields')
                }

                const { error } = await supabase
                    .from('commands')
                    .update({
                        code: this.code,
                        name: this.name,
                        type: this.type,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', this.commandId)

                if (error) {
                    throw error
                }

                // Show success message
                this.success = true
                alert("Command Updated Successfully")
                
                // Redirect to list view after short delay
                setTimeout(() => {
                    this.$router.push('/admin/command')
                }, 1500)
            } catch (error: any) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        resetForm() {
            this.fetchCommand() // Reset to original values
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
                    <h2>Edit Command</h2>
                </div>

                <!-- Error -->
                <div v-if="error" class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span class="sr-only">Info</span>
                    <div>
                        <span class="font-medium">Danger alert!</span> {{ error }}
                    </div>
                </div>

                <form class="space-y-5" @submit.prevent="updateCommand">
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
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Name</label>
                        <input type="text" v-model="name" id="name"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required :disabled="loading" />
                    </div>
                    <div class="mb-5">
                        <label for="code" class="block mb-2 text-sm font-medium text-gray-900">Code</label>
                        <input type="text" v-model="code" id="code"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required :disabled="loading" />
                    </div>

                    <div class="flex space-x-2">
                        <button type="submit"
                            class="flex-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            :disabled="loading">
                            {{ loading ? 'Updating...' : 'Update' }}
                        </button>
                        <button type="button" @click="resetForm"
                            class="flex-1 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                            :disabled="loading">
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>