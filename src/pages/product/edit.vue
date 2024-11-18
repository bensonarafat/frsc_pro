<script lang="ts">
import HeaderComponent from '../../components/HeaderComponent.vue';
import { supabase } from '../../lib/appsupabase';

export default {
    name: "ProductEditView",
    components: {
        HeaderComponent,
    },
    data() {
        return {
            name: '',
            penalty: 0,
            error: null as string | null,
            loading: false,
            success: false, 
            // Image related properties
            imageFile: null as File | null,
            imagePreview: '',
            imageUrl: '' as string | null,
            existingImageUrl: '', // To store the current image URL
            uploadProgress: 0,
            isImageDeleted: false

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
                    this.name = data.name
                    this.penalty = data.penalty
                    this.existingImageUrl = data.image_url;
                    this.imageUrl = data.image_url;
                }
            } catch (err: any) {
                this.error = 'Error fetching product details'
                console.error('Error:', err.message)
            } finally {
                this.loading = false
            }
        },
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
                
                // Validate file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    this.error = 'Image must be less than 5MB';
                    return;
                }
                
                this.imageFile = file;
                this.isImageDeleted = false;
                
                // Create preview URL
                this.imagePreview = URL.createObjectURL(file);
            }
        },
        async deleteExistingImage() {
            if (this.existingImageUrl) {
                try {
                    // Extract file path from URL
                    const urlParts = this.existingImageUrl.split('/');
                    const filePath = `product-images/${urlParts[urlParts.length - 1]}`;

                    const { error } = await supabase.storage
                        .from('products')
                        .remove([filePath]);

                    if (error) throw error;

                    this.existingImageUrl = '';
                    this.imageUrl = '';
                    this.isImageDeleted = true;

                } catch (err: any) {
                    console.error('Error deleting image:', err.message);
                    // Continue even if delete fails - old image will remain in storage
                }
            }
        },
        async uploadImage(): Promise<string | null> {
            if (!this.imageFile) return null;
            
            try {
                const fileExt = this.imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `product-images/${fileName}`;
                
                // Delete existing image if there is one
                if (this.existingImageUrl) {
                    await this.deleteExistingImage();
                }
                
                // Upload new file
                const { error } = await supabase.storage
                    .from('products')
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
        async updateProduct() {
            this.error = ''
            this.loading = true

            try {
                // Validate required fields
                if (!this.name) {
                    throw new Error('Please fill in all required fields')
                }
                let imageUrl = this.existingImageUrl as string | null;

                // Handle image changes
                if (this.imageFile) {
                    imageUrl = await this.uploadImage();
                } else if (this.isImageDeleted) {
                    imageUrl = null;
                }

                const { error } = await supabase
                    .from('products')
                    .update({
                        name: this.name,
                        penalty: this.penalty,
                        image_url: imageUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.$route.params.id)

                if (error) throw error

                // Show success message
                this.success = true

                // Redirect to list view after short delay
                setTimeout(() => {
                    this.$router.push('/product')
                }, 1500)

            } catch (err: any) {
                this.error = err.message
                console.error('Error updating product:', err.message)
            } finally {
                this.loading = false
            }
        }, 
        removeImage() {
            if (this.existingImageUrl) {
                this.isImageDeleted = true;
            }
            this.imageFile = null;
            this.imagePreview = '';
            this.imageUrl = '';
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
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Name</label>
                        <input type="text" v-model="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                    </div>

                    <div class="mb-5">
                        <label for="penalty" class="block mb-2 text-sm font-medium text-gray-900">Amount</label>
                        <input type="number" v-model="penalty" id="penalty" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading"/>
                    </div>

                    <!-- Image Upload Section -->
                    <div class="mb-5">
                        <label class="block mb-2 text-sm font-medium text-gray-900">Image</label>
                        <div class="flex items-center justify-center w-full">
                            <label for="image-upload" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div v-if="!imagePreview && !existingImageUrl" class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p class="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                                </div>
                                <div v-else-if="imagePreview || existingImageUrl" class="relative w-full h-full">
                                    <img :src="imagePreview || existingImageUrl" class="object-cover w-full h-full rounded-lg" />
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

                    <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="loading">
                        {{ loading ? 'Updating...' : 'Update' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>