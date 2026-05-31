<template>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
  <header>
    <div class="d-flex flex-row justify-content-between align-items-center">
      <router-link to="/"><img class="header-logo" src="../assets/DNDLOGO.png" alt="DND Logo" style="max-height: 50px;"/></router-link>
      <div id="nav">
        <router-link to="/CharacterSelect">Personajes</router-link>
        <router-link to="/Campaigns">Campañas</router-link>
        <router-link to="/MyCampaigns">Mis Campañas</router-link>
      </div>
      <div class="header-item d-flex flex-row">
        <p class="username m-0 me-3 text-light">{{ name }}</p>
        <router-link to="/Login">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" class="bi bi-person-circle" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
            <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
          </svg>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useUser } from "@/composables/useUser";
const { getName } = useUser();
const name = ref("");

onMounted(async () => {
  name.value = await getName($cookies.get("userId"));
});
</script>