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
            fullname:'',
            contact: '', // Phone or email
            headquarterCode:'',
            sectorCode: '',
            zonalCode: '',
            unitCode: '',
            personalCode: '',
            password: '',
            error: null as any,
            loading: false,
            success: false,
            contactType: 'email', // or 'phone'
            headquarterCommands: [] as Array<{ code: string, name: string }>,
            sectorCommands: [] as Array<{ code: string, name: string }>,
            zonalCommands: [] as Array<{ code: string, name: string }>,
            unitCommands: [] as Array<{ code: string, name: string }>,
        }
    },
    async created() {
        await this.fetchCommands();
        this.generatePersonalCode();
    },
    methods: {
        async fetchCommands() {
            try {
                // Fetch state, zonal, and unit commands from Supabase
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
        generatePersonalCode() {
            // Example: Generate a 2-digit random number for the personal code
            this.personalCode = String(Math.floor(10 + Math.random() * 90)); 
        },
        validateInputs() {
            // Reset error
            this.error = null;

            // Check if all fields are filled
            if (!this.fullname || !this.contact || !this.headquarterCode || !this.sectorCode || !this.zonalCode || 
                !this.unitCode || !this.personalCode || !this.password) {
                throw new Error('Please fill in all required fields');
            }

            // // Validate state command code (2 alpha)
            // if (!/^[A-Za-z]{2}$/.test(this.stateCode)) {
            //     throw new Error('State Command Code must be exactly 2 letters');
            // }

            // // Validate zonal command code (3 alpha)
            // if (!/^[A-Za-z]{3}$/.test(this.zonalCode)) {
            //     throw new Error('Zonal Command Code must be exactly 3 letters');
            // }

            // // Validate unit command code (2 digits)
            // if (!/^\d{2}$/.test(this.unitCode)) {
            //     throw new Error('Unit Command Code must be exactly 2 digits');
            // }

            // // Validate personal code (2 digits)
            // if (!/^\d{2}$/.test(this.personalCode)) {
            //     throw new Error('Personal Code must be exactly 2 digits');
            // }

            // Validate password (min 8 chars, alphanumeric + special)
            if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(this.password)) {
                throw new Error('Password must be at least 8 characters and include letters, numbers, and special characters');
            }

            // Validate contact (email or phone)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?\d{10,15}$/;
            
            if (!emailRegex.test(this.contact) && !phoneRegex.test(this.contact)) {
                throw new Error('Please enter a valid email address or phone number');
            }

            this.contactType = emailRegex.test(this.contact) ? 'email' : 'phone';
        },

        async createNew() {
            this.error = null;
            this.loading = true;
            
            try {
                // Validate all inputs
                this.validateInputs();
                let response;
                if(this.contactType == "email") {
                    // Create auth account
                     response = await supabase.auth.signUp( {
                            email: this.contact,
                            password: this.password,
                    });
                }else{
                    response = await supabase.auth.signUp( {
                            phone: this.contact,
                            password: this.password,
                    });
                }
 

                if (response.error) {
                    this.error = response.error.message;
                    return;
                }

                // Create user profile
                const { error } = await supabase.from('users').insert([{
                    [this.contactType]: this.contact,
                    uuid: response.data.user!.id,
                    fullname: this.fullname,
                    headquarter_code: this.headquarterCode.toUpperCase(),
                    sector_code_code: this.sectorCode.toUpperCase(),
                    zonal_code: this.zonalCode.toUpperCase(),
                    unit_code: this.unitCode,
                    personal_code: this.personalCode,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }]).select();

                if (error) {
                    this.error = error.message;
                    return;
                }

                // Show success message 
                this.success = true;
                alert("Account created");
                
                // Reset form
                this.resetForm();
                
                // Redirect to list view after short delay
                setTimeout(() => {
                    this.$router.push('/users');
                }, 1500);
            } catch (error: any) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        resetForm() {
            this.fullname = '';
            this.contact = '';
            this.headquarterCode = '';
            this.sectorCode = '';
            this.zonalCode = '';
            this.unitCode = '';
            this.personalCode = '';
            this.password = '';
            this.error = null;
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
                    <h2>Create User</h2>
                </div>

                <!-- Error Alert -->
                <div v-if="error" class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <div>
                        <span class="font-medium">Error:</span> {{ error }}
                    </div>
                </div>

                <form class="space-y-5" @submit.prevent="createNew">
                    <div class="mb-5">
                        <label for="fullname" class="block mb-2 text-sm font-medium text-gray-900">Fullname</label>
                        <input type="text" v-model="fullname" id="fullname"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required :disabled="loading" placeholder="Enter Fullname" />
                    </div>
                    <div class="mb-5">
                        <label for="contact" class="block mb-2 text-sm font-medium text-gray-900">Email or Phone Number</label>
                        <input type="text" v-model="contact" id="contact"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required :disabled="loading" placeholder="Enter email or phone number" />
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

                    <div class="mb-5">
                        <label for="zonalCode" class="block mb-2 text-sm font-medium text-gray-900">Zonal Command Code</label>
                        <select v-model="zonalCode" id="zonalCode" required :disabled="loading"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                            <option value="">Select Zonal Command</option>
                            <option v-for="zonal in zonalCommands" :key="zonal.code" :value="zonal.code">
                                {{ zonal.name }} ({{ zonal.code }})
                            </option>
                        </select>
                    </div>


                    <div class="mb-5">
                        <label for="unitCode" class="block mb-2 text-sm font-medium text-gray-900">Unit Command Code</label>
                        <select v-model="unitCode" id="unitCode" required :disabled="loading"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                            <option value="">Select Unit Command</option>
                            <option v-for="unit in unitCommands" :key="unit.code" :value="unit.code">
                                {{ unit.name }} ({{ unit.code }})
                            </option>
                        </select>
                    </div>


                    <div class="mb-5">
                        <label for="personalCode" class="block mb-2 text-sm font-medium text-gray-900">Personal Code</label>
                        <input type="text" v-model="personalCode" id="personalCode" maxlength="2"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            readonly/>
                    </div>

                    <div class="mb-5">
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                        <input type="password" v-model="password" id="password"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required :disabled="loading" placeholder="Min 8 chars (letters, numbers, special chars)" />
                    </div>

                    <button type="submit"
                        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        :disabled="loading">
                        {{ loading ? 'Creating...' : 'Create' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>