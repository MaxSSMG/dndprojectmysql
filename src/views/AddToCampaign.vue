<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCharacters } from "@/composables/useCharacters";
import { useCampaigns } from "@/composables/useCampaigns"
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const route = useRoute();
const router = useRouter();
const { addToCampaign } = useCampaigns();
const {
  characters,
  loadCharactersFromUser
} = useCharacters();

async function handleAdding(character) {
  await addToCampaign(route.params.id, character)
  router.push("/MyCampaigns")
}

onMounted(async () => {
  await loadCharactersFromUser(parseInt($cookies.get("userId")));
});

</script>

<template>
  <Header />
  <h2>Añadir personaje a la campaña</h2>
  <div class="content addToCampaign row" v-if="characters">
    <div v-for="character in characters" :key="character.charId"
      class="d-flex flex-column col-4 justify-content-center p-3">
      <div class="d-flex flex-row">
        <img src="../assets/placeholder.png" alt="" class="placeholder-charselect">
      </div>
      <div class="d-flex flex-column">
        <div class="d-flex flex-row">{{ character.nombre }}</div>
        <div class="d-flex flex-row">
          <div class="d-flex flex-column me-3">Nivel: {{ character.nivel }}</div>
          <div class="d-flex flex-column">{{ character.clase }}</div>
        </div>
        <div class="d-flex flex-row">{{ character.campanya }}</div>
      </div>
      <div>
        <button @click="handleAdding(character.charId)">Añadir a la campaña</button>
      </div>
    </div>
    </div>
    <div v-else class="d-flex flex-column align-items-center content">
      <router-link to="/CharacterCreate" type="button" class="btn btn-primary">Create a character!</router-link>
    </div>
  <Footer />
</template>