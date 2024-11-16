<script lang="ts">
import HeaderComponent from '../components/HeaderComponent.vue';
import { supabase } from '../lib/appsupabase';

export default {
    name: "EditView",
    components: {
        HeaderComponent,
    },
    data() {
        return {
            code: '',
            name: '',
            points: '',
            penalty: 0,
            category: '',
            error: null as string | null,
            loading: false,
            success: false
        }
    },
    async created() {
        // Get the ID from route params
        const id = this.$route.params.id as any;
        await this.fetchProduct(id)
    },
    methods: {
        async fetchProduct(id: string) {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error

                if (data) {
                    this.code = data.code
                    this.name = data.name
                    this.points = data.points
                    this.penalty = data.penalty
                    this.category = data.category
                }
            } catch (err: any) {
                this.error = 'Error fetching product details'
                console.error('Error:', err.message)
            } finally {
                this.loading = false
            }
        },
        async updateProduct() {
            this.error = ''
            this.loading = true

            try {
                // Validate required fields
                if (!this.code || !this.name || !this.points || !this.category) {
                    throw new Error('Please fill in all required fields')
                }

                // Validate points and penalty are numbers
                if (isNaN(Number(this.points))) {
                    throw new Error('Points must be a valid number')
                }

                const { error } = await supabase
                    .from('products')
                    .update({
                        code: this.code,
                        name: this.name,
                        points: Number(this.points),
                        penalty: this.penalty,
                        category: this.category,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.$route.params.id)

                if (error) throw error

                // Show success message
                this.success = true

                // Redirect to list view after short delay
                setTimeout(() => {
                    this.$router.push('/dashboard')
                }, 1500)

            } catch (err: any) {
                this.error = err.message
                console.error('Error updating product:', err.message)
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<template>
    <div>
        <HeaderComponent />

        <div class="mt-10">
            <div class="max-w-sm mx-auto">
                <div class="mb-10 flex justify-center">
                    <h2>Edit Product</h2>
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
                        <span class="font-medium">Success!</span> Product updated successfully.
                    </div>
                </div>

                <form class="space-y-5" @submit.prevent="updateProduct">
                    <div class="mb-5">
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Tick Infringement</label>
                        <input type="text" v-model="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                    </div>

                    <div class="mb-5">
                        <label for="code" class="block mb-2 text-sm font-medium text-gray-900">Code</label>
                        <input type="text" v-model="code" id="code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                    </div>

                    <div class="mb-5">
                        <label for="points" class="block mb-2 text-sm font-medium text-gray-900">Points</label>
                        <input type="number" v-model="points" id="points" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                    </div>

                    <div class="mb-5">
                        <label for="penalty" class="block mb-2 text-sm font-medium text-gray-900">Penalty</label>
                        <input type="number" v-model="penalty" id="penalty" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                    </div>

                    <div class="mb-5">
                        <label for="category" class="block mb-2 text-sm font-medium text-gray-900">Category</label>
                        <select name="category" id="category" v-model="category" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading">
                            <option value="">Select an option</option>
                            <option value="1">Critical Safety Violations</option>
                            <option value="2">Administrative and Compliance Violation</option>
                            <option value="3">Equipment and Vehicle Maintenance Violations</option>
                            <option value="4">Road Infrastructure Violations</option>
                            <option value="5">Road Infrastructure Violations</option>
                        </select>
                    </div>

                    <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                        {{ loading ? 'Updating...' : 'Update' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>