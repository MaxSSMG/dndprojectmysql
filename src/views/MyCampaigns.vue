<script setup>
import { onMounted, ref } from "vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { useCampaigns } from "@/composables/useCampaigns";

const {
  campaigns,
  campaignsIn,
  loadUsersCampaigns,
  createCampaign,
  campaignMember,
  deleteCampaign,
  leaveCampaign
} = useCampaigns();

const handleCreate = () => {
  createCampaign($cookies.get("userId"));
};

const handleDelete = async (id) => {
  await deleteCampaign(id);
  await loadUsersCampaigns($cookies.get("userId"));
}

const handleLeave = async (idCampaign) => {
  await leaveCampaign($cookies.get("userId"), idCampaign)
  await campaignMember($cookies.get("userId"))
}

onMounted(() => {
  loadUsersCampaigns($cookies.get("userId"));
  campaignMember($cookies.get("userId"));
});
</script>

<template>
  <Header />
  <div class="content row justify-content-around mt-3 h-100">
    <h2>Campañas de las que eres DM</h2>
    <div
      v-for="campaign in campaigns"
      v-bind:key="campaign.campId"
      class="col-5"
    >
      <div class="d-flex flex-row justify-content-start card mb-3 align-items-center">
        <div class="d-flex flex-column image">
          <img
            src="../assets/placeholder.png"
            alt=""
            class="placeholder-campaign"
          />
        </div>
        <router-link
          :to="'/CampaignOverview/' + campaign.campId"
          class="d-flex flex-column justify-content-start ms-3"
          style="text-decoration: none; color: white;"
        >
          <h5 class="card-title">{{ campaign.nombre }}</h5>
          <p class="card-text align-self-start">DM: {{ campaign.dm }}</p>
        </router-link>
        <button class="btn btn-danger btn-borrar ms-3" @click="handleDelete(campaign.campId)">Borrar</button>
      </div>
    </div>
    <h2>Campañas de las que formas parte</h2>
    <div
      v-for="campaign in campaignsIn"
      v-bind:key="campaign.campId"
      class="col-5"
    >
      <div class="d-flex flex-row justify-content-start align-items-center card mb-3">
        <div class="d-flex flex-column image">
          <img
            src="../assets/placeholder.png"
            alt=""
            class="placeholder-campaign"
          />
        </div>
        <router-link 
          :to="'/CampaignOverview/' + campaign.campId" 
          style="text-decoration: none; color: white;" 
          class="d-flex flex-column justify-content-start ms-3"
        >
          <h5 class="card-title">{{ campaign.nombre }}</h5>
          <p class="card-text align-self-start">DM: {{ campaign.dm }}</p>
        </router-link>
        <button class="btn btn-danger btn-borrar ms-3" @click="handleLeave(campaign.campId)">Salir</button>
      </div>
  </div>
  </div>
  <div v-if="!campaigns">
    <button type="button" @click="handleCreate">Crear campaña</button>
  </div>
  <Footer />
</template>
