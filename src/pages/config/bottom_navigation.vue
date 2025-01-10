<script lang="ts">
import HeaderComponent from '../../components/HeaderComponent.vue';
import { supabase } from '../../lib/appsupabase';
export default {
    name: "BottomNavigationView", 
    components: {
        HeaderComponent,
    },
    data() {
        return {
            nav1: '',
            nav2: '',
            nav3: '',
            nav4: '',
            nav1Image: null as File | null,
            nav2Image: null as File | null,
            nav3Image: null as File | null,
            nav4Image: null as File | null,
            error: null as string | null,
            loading: false,
            success: false,
            nav1ImagePreview: '',
            nav2ImagePreview: '',
            nav3ImagePreview: '',
            nav4ImagePreview: '',

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

                // Upload images
                const nav1ImageUrl = await this.uploadImage(this.nav1Image, 'nav1');
                const nav2ImageUrl = await this.uploadImage(this.nav2Image, 'nav2');
                const nav3ImageUrl = await this.uploadImage(this.nav3Image, 'nav3');
                const nav4ImageUrl = await this.uploadImage(this.nav4Image, 'nav4');

                // Prepare configuration object
                const configContent = {
                    nav1: this.nav1,
                    nav2: this.nav2,
                    nav3: this.nav3,
                    nav4: this.nav4,
                    nav1ImageUrl,
                    nav2ImageUrl,
                    nav3ImageUrl,
                    nav4ImageUrl
                };

                // Update configuration in Supabase
                const { error } = await supabase
                    .from('configs')
                    .upsert({ 
                        id: 1, 
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
                this.error = 'All navigation labels are required';
                this.loading = false;
                return false;
            }

            // Check image inputs
            const imageInputs = [
                { image: this.nav1Image, name: 'Nav 1' },
                { image: this.nav2Image, name: 'Nav 2' },
                { image: this.nav3Image, name: 'Nav 3' },
                { image: this.nav4Image, name: 'Nav 4' }
            ];

            for (const input of imageInputs) {
                if (!input.image) {
                    this.error = `${input.name} image is required`;
                    this.loading = false;
                    return false;
                }

                // Validate file type
                if (!input.image.type.startsWith('image/')) {
                    this.error = `${input.name} must be an image file`;
                    this.loading = false;
                    return false;
                }

                // Validate file size (5MB limit)
                if (input.image.size > 5 * 1024 * 1024) {
                    this.error = `${input.name} image must be less than 5MB`;
                    this.loading = false;
                    return false;
                }
            }

            return true;
        },
        handleImageChange(event: Event, navNumber: number) {
            const input = event.target as HTMLInputElement;
            const files = input.files;
            
            if (files && files.length > 0) {
                const file = files[0];
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    this.error = 'Please upload an image file';
                    return;
                }
                
                // Validate file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    this.error = 'Image must be less than 5MB';
                    return;
                }
                
                // Set image and preview based on nav number
                switch(navNumber) {
                    case 1:
                        this.nav1Image = file;
                        this.nav1ImagePreview = URL.createObjectURL(file);
                        break;
                    case 2:
                        this.nav2Image = file;
                        this.nav2ImagePreview = URL.createObjectURL(file);
                        break;
                    case 3:
                        this.nav3Image = file;
                        this.nav3ImagePreview = URL.createObjectURL(file);
                        break;
                    case 4:
                        this.nav4Image = file;
                        this.nav4ImagePreview = URL.createObjectURL(file);
                        break;
                }
            }
        },

        async fetchConfig() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('configs')
                    .select('*')
                    .eq('id', 1)
                    .maybeSingle()

                if (error) throw error

                if (data && data.content) {
                    const jsonData = JSON.parse(data.content);
                    this.nav1 = jsonData.nav1 || '';
                    this.nav2 = jsonData.nav2 || '';
                    this.nav3 = jsonData.nav3 || '';
                    this.nav4 = jsonData.nav4 || '';
                    this.nav1ImagePreview = jsonData.nav1ImageUrl
                    this.nav2ImagePreview = jsonData.nav2ImageUrl
                    this.nav3ImagePreview = jsonData.nav3ImageUrl
                    this.nav4ImagePreview = jsonData.nav4ImageUrl
                }

            } catch (err: any) {
                this.error = 'Error fetching config details'
                console.error('Error:', err.message)
            } finally {
                this.loading = false
            }
        },
        async uploadImage(imageFile: File | null, navName: string): Promise<string | null> {
            if (!imageFile) return null;
            
            try {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${navName}-${Date.now()}.${fileExt}`;
                const filePath = `bottom-nav-images/${fileName}`;
                
                // Upload new file
                const { error } = await supabase.storage
                    .from('products')
                    .upload(filePath, imageFile, {
                        cacheControl: '3600',
                        upsert: true
                    });
                
                if (error) throw error;
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);
                
                return publicUrl;
                
            } catch (error: any) {
                console.error(`Error uploading ${navName} image:`, error.message);
                throw error;
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
                    <h2>Edit Bottom Navigation</h2>
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
                        <label for="nav1" class="block mb-2 text-sm font-medium text-gray-900">Nav 1</label>
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
                        <label for="nav1image" class="block mb-2 text-sm font-medium text-gray-900">Nav 1 Image</label>
                        <input 
                            type="file" 
                            id="nav1image" 
                            @change="(event) => handleImageChange(event, 1)"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                            accept="image/*"
                        />
                        <img v-if="nav1ImagePreview" :src="nav1ImagePreview" class="mt-2 max-h-32 object-cover" />
                    </div>
                    <div class="mb-5">
                        <label for="nav2" class="block mb-2 text-sm font-medium text-gray-900">Nav 2</label>
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
                        <label for="nav2image" class="block mb-2 text-sm font-medium text-gray-900">Nav 2 Image</label>
                        <input 
                            type="file" 
                            id="nav2image" 
                            @change="(event) => handleImageChange(event, 2)"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                            accept="image/*"
                        />
                        <img v-if="nav2ImagePreview" :src="nav2ImagePreview" class="mt-2 max-h-32 object-cover" />
                    </div>
                    <div class="mb-5">
                        <label for="nav3" class="block mb-2 text-sm font-medium text-gray-900">Nav 3</label>
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
                        <label for="nav3image" class="block mb-2 text-sm font-medium text-gray-900">Nav 3 Image</label>
                        <input 
                            type="file" 
                            id="nav3image" 
                            @change="(event) => handleImageChange(event, 3)"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                            accept="image/*"
                        />
                        <img v-if="nav3ImagePreview" :src="nav3ImagePreview" class="mt-2 max-h-32 object-cover" />
                    </div>
                    <div class="mb-5">
                        <label for="nav4" class="block mb-2 text-sm font-medium text-gray-900">Nav 4</label>
                        <input 
                            type="text" 
                            v-model="nav4" 
                            id="nav4" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                        />

                    </div>

                    <div class="mb-5">
                        <label for="nav4image" class="block mb-2 text-sm font-medium text-gray-900">Nav 4 Image</label>
                        <input 
                            type="file" 
                            id="nav4image" 
                            @change="(event) => handleImageChange(event, 4)"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                            accept="image/*"
                        />
                        <img v-if="nav4ImagePreview" :src="nav4ImagePreview" class="mt-2 max-h-32 object-cover" />
                    </div>
                    <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                        {{ loading ? 'Updating...' : 'Update' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>