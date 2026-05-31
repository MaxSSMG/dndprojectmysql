<script setup>
import { onMounted, ref } from "vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { useCampaigns } from "@/composables/useCampaigns";
import { useRouter } from "vue-router";

const { campaigns, lastCampaign, loadCampaigns, createCampaign, searchCampaign, getLastCampaign } = useCampaigns();
const router = useRouter();

const handleCreate = async () => {
    await createCampaign($cookies.get("userId"));
    await getLastCampaign();
    router.push("/MyCampaigns")
}

const query = ref("")
function handleSearch() {
    const search = query.value.trim();
    if (search == "") {
        loadCampaigns($cookies.get("userId"));
    } else {
        searchCampaign(search);
    }
}

onMounted(() => {
    loadCampaigns($cookies.get("userId"));
});
</script>

<template>
    <Header />
    <div class="d-flex flex-row justify-content-center align-items-center mt-3">
        <div id="searchBar" class="mx-3">
            <input id="search" type="text" v-model="query" @keyup.enter="handleSearch()" @input="handleSearch()"/>
        </div>
        <div>
            <button class="btn btn-danger" @click="handleCreate">Crear campaña</button>
        </div>
    </div>
    <div class="content">
        <div v-if="campaigns">
            <div class="grid gap-3 mt-3">
                <router-link :to="'/AddToCampaign/' + campaign.campId" style="text-decoration: none; color: white;" v-for="campaign in campaigns" v-bind:key="campaign.campId">
                    <div class="d-flex flex-row justify-content-start align-items-center campaignCard">
                        <div class="d-flex flex-column image">
                            <img src="../assets/placeholder.png" alt="" class="placeholder-campaign">
                        </div>
                        <div class="text-start ms-3">
                            <h5 class="card-title">{{ campaign.nombre }}</h5>
                            <p class="card-text align-self-start">DM: {{ campaign.dm }}</p>
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
    <Footer />
</template>