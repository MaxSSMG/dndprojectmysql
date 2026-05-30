<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Popup from "@/components/Popup.vue";
import { useMisc } from "@/composables/useMisc";
import { useCampaigns } from "@/composables/useCampaigns";
import { ref, onMounted } from "vue"

const { campaigns, campaignsIn, loadUsersCampaigns, campaignMember } =
  useCampaigns();
const { drop, demoData } = useMisc();

const showLoginPopup = ref(false);


onMounted(async () => {
  const userId = $cookies.get("userId");

  if (!userId) {
    console.log(userId)
    showLoginPopup.value = true;
    return; 
  }

  await loadUsersCampaigns($cookies.get("userId"));
  await campaignMember($cookies.get("userId"));
  await demoData();
});
</script>

<template>
  <Header />
  <div class="content align-items-center">
    <h1 class="title">Play D&D</h1>
    <p class="description mb-3">
      Start playing D&D with our suite of digital tools, designed to immerse you
      in your games—in-person and online.
    </p>
    <div class="grid">
      <div class="leftColumn">
        <router-link to="/CharacterSelect" class="optionCard leftOptionCard">
          <img src="../assets/DndChars.jpg" alt="" />
          <p class="link">Personajes</p>
        </router-link>
      </div>
      <div class="d-flex flex-column gap-3">
        <router-link class="optionCard" to="/Campaigns">
          <img src="../assets/campaignArt.jpg" alt="" />
          <p class="link">Campañas</p>
        </router-link>
        <router-link to="/MyCampaigns" class="optionCard">
          <img src="../assets/myCampaigns.png" alt="" />
          <p class="link" >Mis Campañas</p>
        </router-link>
      </div>
    </div>
    <!-- <button @click="drop">Borrar base</button>
    <button @click="demoData">Generar datos demo</button> -->
    <div v-if="showLoginPopup" class="popup-overlay">
      <Popup />
    </div>
  </div>
  <Footer />
</template>
