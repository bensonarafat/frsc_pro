<script lang="ts">
import HeaderComponent from '../../components/HeaderComponent.vue';


export default {
    name: "ConfigView", 
    components: {
        HeaderComponent,
    },
    methods: {

        openPage(page: string) {
            this.$router.push(page);
        }   

    }
}
</script>
<template>
    <div>
        <HeaderComponent/>
        <div class="p-5 mt-10">
            <div class="flex flex-col justify-center">
                <button type="button" v-on:click="openPage('/config/bottom-navigation')" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Bottom Navigation Customization</button>
                <button type="button" v-on:click="openPage('/config/app-logo')" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">App & Logo</button>
                <button type="button" v-on:click="openPage('/config/page-heading')" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Page Headings</button>
            </div>
        </div>
    </div>
</template>