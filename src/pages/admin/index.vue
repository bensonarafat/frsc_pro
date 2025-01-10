<script lang="ts">
import { supabase } from '../../lib/appsupabase';
import HeaderComponent from '../../components/HeaderComponent.vue';
export default {
    name: "AdminView", 
    components: {
        HeaderComponent,
    },
    data(){ 
        return {
            commandLoading: false,
            commandError: null,
            commandData: [] as any,
            // report
            reportLoading: false, 
            reportError: null, 
            reportData: [] as any, 
            // users 
            userLoading: false, 
            userError: null, 
            userData: [] as any,
        }
    }, 
    async created () {
       await this.fetchReport();
       await this.fetchCommands();
       await this.fetchUser();
    },
    methods: {
        async fetchReport() {

        },
        async fetchCommands() {
            try {
                this.commandLoading = true;
                const { data, error } = await supabase
                    .from('commands')
                    .select('*') 
                    .order('created_at').limit(10);
                if (error) throw error;
                this.commandData = data;
            } catch (err: any) {
                console.error('Error fetching data:', err.message);
                this.commandError = err.message;
            } finally {
                this.commandLoading = false;
            }
        },
        async fetchUser() {
            try {
                this.userLoading = true;
                const { data, error } = await supabase
                    .from('users')
                    .select('*') 
                    .order('created_at').limit(10);
                if (error) throw error;
                this.userData = data;
            } catch (err: any) {
                console.error('Error fetching data:', err.message);
                this.userError = err.message;
            } finally {
                this.userLoading = false;
            }
        },

    }
}
</script>
<template>
    <div>
        <HeaderComponent/>
        <!-- Reports -->
        <!-- Commands -->
        <div v-if="!commandLoading">
            <div class="container mx-auto px-4 mb-5">
                <div>Commands</div>
            </div>
        <div class="container mx-auto px-4">
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <td scope="col" class="px-6 py-3">
                                ID
                            </td>
                            <td scope="col" class="px-6 py-3">
                                Type
                            </td>
                            <td scope="col" class="px-6 py-3">
                                Name
                            </td>
                            <th scope="col" class="px-6 py-3">
                                Code
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="commandData.length === 0">
                            <td colspan="6" class="px-6 py-4 text-center">
                                No commands found
                            </td>
                        </tr>
                        <tr 
                            v-for="dat in commandData" 
                            :key="dat.id"
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50"
                        >
                            <td class="px-6 py-4">{{ dat.id }}</td>
                            <td class="px-6 py-4">{{ dat.type }}</td>
                            <td class="px-6 py-4">{{ dat.name }}</td>
                            <td class="px-6 py-4">{{ dat.code }}</td>
                        </tr>
                    </tbody>

                </table>
            </div>
        </div>
    </div>

        <div v-if="commandLoading">
            <div class="flex mx-auto items-center justify-center w-56 h-56 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div role="status">
                    <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
        <!-- Users -->
        <div v-if="!userLoading">
            <div class="container mx-auto px-4 mb-5">
                <div>Users</div>
            </div>
            <div class="container mx-auto px-4">
                <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <td scope="col" class="px-6 py-3">
                                    ID
                                </td>
                                <td scope="col" class="px-6 py-3">
                                    Full name
                                </td>
                                <th scope="col" class="px-6 py-3">
                                    Email / Phone 
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    FRSC Headquarters
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Sector Command Code
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Zonal Command Code
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Unit Command Code
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Personal Code
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="userData.length === 0">
                                <td colspan="6" class="px-6 py-4 text-center">
                                    No user found
                                </td>
                            </tr>
                            <tr 
                                v-for="dat in userData" 
                                :key="dat.id"
                                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50"
                            >
                                <td class="px-6 py-4">{{ dat.id }}</td>
                                <td class="px-6 py-4">{{ dat.fullname }}</td>
                                <td class="px-6 py-4">{{ dat.email ?? dat.phone  }}</td>
                                <td class="px-6 py-4">{{ dat.headquarter_code  }}</td>
                                <td class="px-6 py-4">{{ dat.sector_code  }}</td>
                                <td class="px-6 py-4">{{ dat.zonal_code  }}</td>
                                <td class="px-6 py-4">{{ dat.unit_code  }}</td>
                                <td class="px-6 py-4">{{ dat.personal_code  }}</td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            </div>
        </div>

        <div v-if="userLoading">
            <div class="flex mx-auto items-center justify-center w-56 h-56 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div role="status">
                    <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    </div>
</template>