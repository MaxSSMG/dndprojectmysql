<template>
  <Header />
  <div class="content CharacterCreate" v-if="character">
    <div>
      <label for="Nombre">Name:</label>
      <input id="Nombre" type="text" :value="character.nombre"/>
    </div>
    <div>
      <label for="Nivel">Nivel:</label>
      <input id="Nivel" type="text" :value="character.nivel"/>
    </div>

    <h2>Clases:</h2>
    <div v-for="claseEdit in clases" :key="claseEdit.id">
      <label :for="`clase-${claseEdit.id}`">{{ claseEdit.nombre }}</label>
      <input
        :id="`clase-${claseEdit.id}`"
        :class="claseEdit.dadoVida"
        type="radio"
        name="clase"
        :value="claseEdit.id"
        v-model="clase.id"
      />
    </div>
    <div v-for="(value, key) in abilityScores" v-bind:key="key">
      <label :for="`stat-${key}`">{{ key.toUpperCase() }}</label>
      <input
        :id="`stat-${key}`"
        type="number"
        :value="value"
        readonly
      />
    </div>
    <button @click="rollStats">Volver a tirar</button>
    <button @click="create()">Editar el personaje</button>
  </div>
  <Footer />
</template>

<script setup>
import { onMounted, ref } from "vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { useRoute, useRouter } from "vue-router";
import { useCharacters } from "@/composables/useCharacters";
import { useClases } from "@/composables/useClases";
import { useStats } from "@/composables/useStats";

const { clase, abilityScores, character, loadCharacterFromId, editCharacter } = useCharacters();
const { createStats } = useStats();
const { clases, loadClases } = useClases();
const route = useRoute();
const router = useRouter();

function rollStats() {
  const statNames = ["str", "dex", "con", "int", "wis", "cha"];
  const newScores = {};

  for (let i = 0; i < 6; i++) {
    const rolls = [];

    for (let j = 0; j < 4; j++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }

    rolls.splice(rolls.indexOf(Math.min(...rolls)), 1);

    newScores[statNames[i]] = rolls.reduce((a, b) => a + b, 0);
  }

  abilityScores.value = newScores;
  return abilityScores.value;
}

async function create() {
  let nombre = document.getElementById("Nombre").value;
  let nivel = document.getElementById("Nivel").value;
  let clase = document.querySelector('input[name="clase"]:checked').value;
  let vida = document.querySelector('input[name="clase"]:checked').classList[0];
  const statValues = Object.values(abilityScores.value);
  const statsId = await createStats(...statValues);
  await editCharacter(nombre, nivel, makeHP(vida, nivel), clase, statsId, route.params.id);
  router.push("/CharacterSelect");
}

function makeHP(vida, nivel) {
  return parseInt(vida.split("d")[1]) * nivel;
}

onMounted(async () => {
  await rollStats();
  await loadClases();
  await loadCharacterFromId(route.params.id);
});
</script>