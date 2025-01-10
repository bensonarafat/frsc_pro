<script lang="ts">
import { supabase } from '../../lib/appsupabase';
import HeaderComponent from '../../components/HeaderComponent.vue';
import ReportComponent from '../../components/ReportComponent.vue';

export default {
    name: "ReportView",
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
    components: {
        HeaderComponent,
        ReportComponent
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
        <HeaderComponent/>
        <ReportComponent/>
    </div>
</template>