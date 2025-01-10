<script lang="ts">
import HeaderComponent from '../../components/HeaderComponent.vue';
import { supabase } from '../../lib/appsupabase';
export default {
    name: "AppLogoView", 
    components: {
        HeaderComponent,
    },
    data() {
        return {
            logo: null as File | null,
            loading: false,
            success: false,
            error: '' as null | string,
            logoPreview: '', 

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
                const logoImageUrl = await this.uploadImage(this.logo, 'logo');

                // Prepare configuration object
                const configContent = {
                    logo: logoImageUrl,
                };

                // Update configuration in Supabase
                const { error } = await supabase
                    .from('configs')
                    .upsert({ 
                        id: 2, 
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
          
            // Check image inputs
            const imageInputs = [
                { image: this.logo, name: 'Logo' },
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
                        this.logo = file;
                        this.logoPreview = URL.createObjectURL(file);
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
                    .eq('id', 2)
                    .maybeSingle()

                if (error) throw error

                if (data && data.content) {
                    const _data = JSON.parse(data);
                    this.logoPreview = _data.logo
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
                    <h2>Edit Logos</h2>
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
                        <label for="nav1image" class="block mb-2 text-sm font-medium text-gray-900">App Logo</label>
                        <input 
                            type="file" 
                            id="nav1image" 
                            @change="(event) => handleImageChange(event, 1)"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                            required 
                            :disabled="loading"
                            accept="image/*"
                        />
                        <img v-if="logoPreview" :src="logoPreview" class="mt-2 max-h-32 object-cover" />
                    </div>
                    <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                        {{ loading ? 'Updating...' : 'Update' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>