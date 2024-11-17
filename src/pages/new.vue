<script lang="ts">
import HeaderComponent from '../components/HeaderComponent.vue';
import { supabase } from '../lib/appsupabase';
export default  {
    name: "NewView", 
    components: {
        HeaderComponent,
    },
    data() {
        return {
            code:'', 
            name: '', 
            points: '',
            penalty: 0,
            category: '',
            error: null as any, 
            loading: false, 
            success: false, 
            // New image-related data properties
            imageFile: null as File | null,
            imagePreview: '',
            imageUrl: '',
            uploadProgress: 0

        }
    }, 
    methods: {

        handleImageChange(event: Event) {
            const input = event.target as HTMLInputElement;
            const files = input.files;
            
            if (files && files.length > 0) {
                const file = files[0];
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    this.error = 'Please upload an image file';
                    return;
                }
                
                // Validate file size (e.g., 5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    this.error = 'Image must be less than 5MB';
                    return;
                }
                
                this.imageFile = file;
                
                // Create preview URL
                this.imagePreview = URL.createObjectURL(file);
            }
        },

        async uploadImage(): Promise<string | null> {
            if (!this.imageFile) return null;
            
            try {
                const fileExt = this.imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `product-images/${fileName}`;
                
                // Upload file to Supabase Storage
                const { error } = await supabase.storage
                    .from('products')  // Your bucket name
                    .upload(filePath, this.imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (error) throw error;
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);
                
                return publicUrl;
                
            } catch (error: any) {
                console.error('Error uploading image:', error.message);
                throw error;
            }
        },

        async createNew() {
            // Reset error state
            this.error = null
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

                                // Upload image first if one is selected
                let imageUrl = null;
                if (this.imageFile) {
                    imageUrl = await this.uploadImage();
                }


                // Create new record  
                const {data, error } = await supabase.from('products').insert([{
                    code: this.code, 
                    name: this.name, 
                    points: Number(this.points), 
                    penalty: this.penalty,  
                    category: this.category, 
                    image_url: imageUrl, 
                    created_at: new Date().toISOString(), 
                    updated_at: new Date().toISOString(),
                }]).select();

                console.log("Date ", data);
                
                if(error) throw error 
                
                // Show success message 
                this.success = true 

                // Reset form
                this.resetForm()

                   // Redirect to list view after short delay
                setTimeout(() => {
                    this.$router.push('/dashboard')  // Adjust route as needed
                }, 1500)

            } catch (err: any) {
                this.error = err.message
                console.error('Error creating products:', err.message)
            } finally {
                this.loading = false
            }
        }, 
        resetForm() {
            this.code = ''
            this.name = ''
            this.points = ''
            this.penalty = 0
            this.category = ''
            this.error = null, 
            this.imageFile = null;
            this.imagePreview = '';
            this.imageUrl = '';
            this.uploadProgress = 0;
        },

        removeImage() {
            this.imageFile = null;
            this.imagePreview = '';
            this.imageUrl = '';
        }

    }
}
</script>

<template>
    <div>
        <HeaderComponent/>

        <div class="mt-10">
    <div class="max-w-sm mx-auto">

        <div class="mb-10 flex justify-center">
            <h2>Create New</h2>
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
                    <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Tick Infraingement</label>
                    <input type="text" v-model="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>
                <div class="mb-5">
                    <label for="code" class="block mb-2 text-sm font-medium text-gray-900">Code</label>
                    <input type="text"  v-model="code" id="code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>

                <div class="mb-5">
                    <label for="points" class="block mb-2 text-sm font-medium text-gray-900">Points</label>
                    <input type="number"  v-model="points" id="points" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading" />
                </div>

                <div class="mb-5">
                    <label for="penalty" class="block mb-2 text-sm font-medium text-gray-900">Penalty</label>
                    <input type="number"  v-model="penalty" id="penalty" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                </div>

                <!-- Image Upload Section -->
                <div class="mb-5">
                    <label class="block mb-2 text-sm font-medium text-gray-900">Image</label>
                    <div class="flex items-center justify-center w-full">
                        <label for="image-upload" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div v-if="!imagePreview" class="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                <p class="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                            </div>
                            <div v-else class="relative w-full h-full">
                                <img :src="imagePreview" class="object-cover w-full h-full rounded-lg" />
                                <button 
                                    @click.prevent="removeImage"
                                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <input 
                                id="image-upload" 
                                type="file" 
                                class="hidden" 
                                accept="image/*"
                                @change="handleImageChange"
                                :disabled="loading"
                            />
                        </label>
                    </div>
                </div>

                <div class="mb-5">
                    <label for="category" class="block mb-2 text-sm font-medium text-gray-900">Category</label>
                    <select name="category" id="category" v-model="category" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading">
                        <option value=""> Select an option</option>
                        <option value="1">Critical Safety Violations</option>
                        <option value="2">Administrative and Compliance Violation</option>
                        <option value="3">Equipment and Vehicle Maintenance Violations</option>
                        <option value="4">Road Infrastructure Violations</option>
                        <option value="5">Road Infrastructure Violations</option>
                    </select>
                </div>
                <button type="submit" @click="createNew" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                    {{ loading ? 'Creating....' : 'Create'}}
                </button>
            </form>
        </div>
     </div>

    </div>
</template>