<script lang="ts">
import HeaderComponent from '../../components/HeaderComponent.vue';
import { supabase } from '../../lib/appsupabase';

export default {
    name: "UserEdit", 
    components: {
        HeaderComponent,
    },
    data() {
        return {
            id: '' as string,
            fullname: '',
            contact: '', // Phone or email
            headquarterCode:'',
            sectorCode: '',
            zonalCode: '',
            unitCode: '',
            personalCode: '',
            error: null as any,
            loading: false,
            success: false,
            contactType: 'email',
            headquarterCommands: [] as Array<{ code: string, name: string }>,
            sectorCommands: [] as Array<{ code: string, name: string }>,
            zonalCommands: [] as Array<{ code: string, name: string }>,
            unitCommands: [] as Array<{ code: string, name: string }>,
        }
    },
    async created() {
        await this.fetchCommands();
        await this.fetchUser();
    },
    methods: {
        async fetchCommands() {
            try {
                const { data, error } = await supabase.from('commands').select('*');
                if (error) throw error;
                // Filter commands into separate lists based on type
                this.headquarterCommands = data.filter((cmd: any) => cmd.type === 'Headquarter');
                this.sectorCommands = data.filter((cmd: any) => cmd.type === 'Sector');
                this.zonalCommands = data.filter((cmd: any) => cmd.type === 'Zonal');
                this.unitCommands = data.filter((cmd: any) => cmd.type === 'Unit');
            } catch (error: any) {
                this.error = error.message;
            }
        },
        async fetchUser() {
            const userId = this.$route.params.id as string;
            this.id = userId;
            try {
                const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
                if (error) throw error;
                this.fullname = data.fullname;
                this.contact = data.email || data.phone;
                this.headquarterCode = data.headquarter_code;
                this.sectorCode = data.state_code;
                this.zonalCode = data.zonal_code;
                this.unitCode = data.unit_code;
                this.personalCode = data.personal_code;
                this.contactType = data.email ? 'email' : 'phone';
            } catch (error: any) {
                this.error = error.message;
            }
        },
        async updateUser() {
            this.error = null;
            this.loading = true;
            try {
                const { error } = await supabase.from('users').update({
                    fullname: this.fullname,
                    headquarter_code: this.headquarterCode.toUpperCase(),
                    sector_code: this.sectorCode.toUpperCase(),
                    zonal_code: this.zonalCode.toUpperCase(),
                    unit_code: this.unitCode,
                    updated_at: new Date().toISOString(),
                }).eq('id', this.id);

                if (error) {
                    this.error = error.message;
                    return;
                }

                this.success = true;
                alert("User updated successfully");
                this.$router.push('/users');
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
    <div>
        <HeaderComponent />
        
        <div class="mt-10 max-w-sm mx-auto px-4">
            <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Edit User</h2>

            <!-- Error Alert -->
            <div v-if="error" class="flex items-center p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <div>{{ error }}</div>
            </div>

            <form @submit.prevent="updateUser" class="space-y-6">
                <!-- Fullname Field -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        Fullname
                    </label>
                    <input 
                        type="text" 
                        v-model="fullname" 
                        required 
                        :disabled="loading"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 
                        bg-gray-50 border p-2.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>

                <div class="mb-5">
                        <label for="stateCode" class="block mb-2 text-sm font-medium text-gray-900">Sector Headquarter Code</label>
                        <select v-model="headquarterCode" id="headquarterCode" required :disabled="loading"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                            <option value="">Select Sector Command</option>
                            <option v-for="hq in headquarterCommands" :key="hq.code" :value="hq.code">
                                {{ hq.name }} ({{ hq.code }})
                            </option>
                        </select>
                    </div>

                    <div class="mb-5">
                        <label for="stateCode" class="block mb-2 text-sm font-medium text-gray-900">Sector Command Code</label>
                        <select v-model="sectorCode" id="sectorCode" required :disabled="loading"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                            <option value="">Select Sector Command</option>
                            <option v-for="sector in sectorCommands" :key="sector.code" :value="sector.code">
                                {{ sector.name }} ({{ sector.code }})
                            </option>
                        </select>
                    </div>

                <!-- Zonal Command Code -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        Zonal Command Code
                    </label>
                    <select 
                        v-model="zonalCode" 
                        required 
                        :disabled="loading"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 
                        bg-gray-50 border p-2.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="" disabled selected>Select Zonal Command</option>
                        <option 
                            v-for="zonal in zonalCommands" 
                            :key="zonal.code" 
                            :value="zonal.code"
                            class="py-1"
                        >
                            {{ zonal.name }} ({{ zonal.code }})
                        </option>
                    </select>
                </div>

                <!-- Unit Command Code -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        Unit Command Code
                    </label>
                    <select 
                        v-model="unitCode" 
                        required 
                        :disabled="loading"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 
                        bg-gray-50 border p-2.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="" disabled selected>Select Unit Command</option>
                        <option 
                            v-for="unit in unitCommands" 
                            :key="unit.code" 
                            :value="unit.code"
                            class="py-1"
                        >
                            {{ unit.name }} ({{ unit.code }})
                        </option>
                    </select>
                </div>

                <!-- Personal Code -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        Personal Code
                    </label>
                    <input 
                        type="text" 
                        v-model="personalCode" 
                        readonly
                        class="block w-full rounded-md border-gray-300 shadow-sm 
                        bg-gray-100 border p-2.5 text-sm text-gray-900 cursor-not-allowed"
                    />
                </div>

                <!-- Submit Button -->
                <div class="pt-4">
                    <button 
                        type="submit" 
                        :disabled="loading"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm 
                        font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {{ loading ? 'Updating...' : 'Update' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
