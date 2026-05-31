<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCharacters } from "@/composables/useCharacters";
import { useCampaigns } from "@/composables/useCampaigns";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import PopupCreation from "@/components/PopupCreation.vue";

const popupVisible = ref(false);
const popupType = ref("");

const route = useRoute();

const { campaign, loadCampaign, editCampaign, kickFromCampaign } =
  useCampaigns();

const { characters, loadCharactersFromCampaign } = useCharacters();

function isDM(campaignDm) {
  if (campaignDm == $cookies.get("userId")) {
    return true;
  } else {
    return false;
  }
}

function handleEdit() {
  const name = document.getElementById("campaignName").value.trim();
  editCampaign(name, route.params.id);
  if (campaign.value) {
    campaign.value = name;
  }
  popupType.value = "nombreCampaña";
  popupVisible.value = true;
}

async function handleKick(character, campaign) {
  kickFromCampaign(character, campaign);
  await loadCharactersFromCampaign(route.params.id);
}

onMounted(async () => {
  await loadCharactersFromCampaign(route.params.id);
  await loadCampaign(route.params.id);
});
</script>

<template>
  <Header />
  <input
    id="campaignName"
    type="text"
    :value="campaign?.nombre"
    @keyup.enter="handleEdit()"
  />
  <div class="content characterSelect row">
    <div v-for="character in characters" :key="character.charId">
      <div class="col-4">
        <router-link
          :to="'/Character/' + character.charId"
          class="d-flex flex-column justify-content-center p-3"
        >
          <div class="d-flex flex-row">
            <img
              src="../assets/placeholder.png"
              alt=""
              class="placeholder-charselect"
            />
          </div>
          <div class="d-flex flex-column">
            <div class="d-flex flex-row">{{ character.nombre }}</div>
            <div class="d-flex flex-row">
              <div class="d-flex flex-column me-3">
                Nivel:{{ character.nivel }}
              </div>
              <div class="d-flex flex-column">{{ character.clase }}</div>
            </div>
          </div>
        </router-link>
        <button
          class="btn btn-danger"
          v-if="isDM(campaign?.dmId)"
          @click.stop="handleKick(character.charId, campaign.campId)"
        >
          KICK
        </button>
      </div>
    </div>
    <div v-if="!characters">
      <p>Invita a tus amigos a unirse a tu campaña!</p>
    </div>
  </div>
  <Footer />
  <div v-if="popupVisible" class="popup-overlay">
    <PopupCreation
    :visible="popupVisible"
    :type="popupType"
    @close="popupVisible = false"
    />
  </div>
</template>
