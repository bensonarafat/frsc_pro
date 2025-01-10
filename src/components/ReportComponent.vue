<script lang="ts">
import { supabase } from '../lib/appsupabase';
export default {
    name: "ReportComponent",
    data() { 
        return {
            loading: false,
            error: null,
            data: [] as any,
            filteredData: [] as any,
            start_date: '', 
            end_date: '', 
            type: '',
        }
    }, 
    computed: {
        totalAmount() {
            return this.filteredData.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)
                .toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    },
    watch: {
        start_date() {
            this.applyFilters();
        },
        end_date() {
            this.applyFilters();
        },
        type() {
            this.applyFilters();
        }
    },
    async created() {
        await this.fetchData();
    }, 
    methods: {
        async fetchData() {
            try {
                this.loading = true;
                const { data, error } = await supabase
                    .from('reports')
                    .select('*') 
                    .order('created_at');
                if (error) throw error;
                this.data = data;
                this.filteredData = data;
            } catch (err: any) {
                console.error('Error fetching data:', err.message);
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },
        applyFilters() {
            let filtered = [...this.data];

            if (this.type) {
                filtered = filtered.filter(item => item.type === this.type);
            }

            if (this.start_date) {
                filtered = filtered.filter(item => 
                    new Date(item.created_at).getTime() >= new Date(this.start_date).getTime()
                );
            }

            if (this.end_date) {
                filtered = filtered.filter(item => 
                    new Date(item.created_at).getTime() <= new Date(this.end_date).getTime()
                );
            }

            this.filteredData = filtered;
        }
    }
}
</script>

<template>
    <div>
        <div v-if="!loading">
            <div class="container mx-auto px-4 mb-5">
                <div class="flex">
                    <div class="mb-5">
                        <label for="type" class="block mb-2 text-sm font-medium text-gray-900">Type</label>
                        <select v-model="type" id="type" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required :disabled="loading">
                            <option value="">General</option>
                            <option value="zonal">Zonal Command</option>
                            <option value="sector">Sector Command</option>
                            <option value="unit">Unit Command</option>
                        </select>
                    </div>
                    <div class="mb-5 mx-5">
                        <label for="start_date">Start Date</label>
                        <input 
                            v-model="start_date"
                            type="date" 
                            name="start_date" 
                            id="start_date" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    </div>
                    <div class="mb-5 mx-5">
                        <label for="end_date">End Date</label>
                        <input 
                            v-model="end_date"
                            type="date" 
                            name="end_date" 
                            id="end_date" 
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    </div>
                </div>
            </div>
            <div class="container mx-auto px-4">
                <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <td scope="col" class="px-6 py-3">ID</td>
                                <td scope="col" class="px-6 py-3">Full name</td>
                                <td scope="col" class="px-6 py-3">Phone Number</td>
                                <th scope="col" class="px-6 py-3">Reference Code</th>
                                <th scope="col" class="px-6 py-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="filteredData.length === 0">
                                <td colspan="6" class="px-6 py-4 text-center">
                                    No reports found
                                </td>
                            </tr>
                            <tr 
                                v-for="dat in filteredData" 
                                :key="dat.id"
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50"
                            >
                                <td class="px-6 py-4">{{ dat.id }}</td>
                                <td class="px-6 py-4">{{ dat.full_name }}</td>
                                <td class="px-6 py-4">{{ dat.phone_number }}</td>
                                <td class="px-6 py-4">{{ dat.violation_reference_code }}</td>
                                <td class="px-6 py-4">NGN{{ dat.amount }}</td>
                            </tr>
                            <!-- Total row -->
                            <tr class="bg-gray-50 font-semibold">
                                <td colspan="4" class="px-6 py-4 text-right">Total Amount:</td>
                                <td class="px-6 py-4">NGN{{ totalAmount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="loading">
            <div class="flex mx-auto items-center justify-center w-56 h-56 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div role="status">
                    <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    </div>
</template>