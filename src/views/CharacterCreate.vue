<template>
  <Header />
    <div class="content CharacterCreate">
      <div class="d-flex flex-row justify-content-center gap-3">
      <div>
        <label class="m-3" for="Nombre">Name:</label>
        <input id="Nombre" type="text"/>
      </div>
      <div>
        <label class="m-3" for="Nivel">Nivel:</label>
        <input id="Nivel" type="number"/>
      </div>
    </div>

    <h2>Clases:</h2>
    <div v-for="clase in clases" :key="clase.id">
      <label :for="`clase-${clase.id}`">{{ clase.nombre }}</label>
      <input
        :id="`clase-${clase.id}`"
        :class="clase.dadoVida"
        type="radio"
        name="clase"
        :value="clase.id"
      />
    </div>
    <h2>Atributos:</h2>
    <div class="d-flex flex-row gap-3 w-100 justify-content-around">
      <div class="d-flex flex-column col-1" v-for="stat in stats" :key="stat.id">
        <label :for="`stat-${stat.id}`">{{ stat.nombre }}</label>
        <input
          :id="`stat-${stat.id}`"
          type="number"
          :value="stat.valor"
          readonly
        />
      </div>
    </div>
    <div class="mt-3">
      <button class="btn btn-outline-danger" @click="rollStats">Roll Stats</button>
    </div>
    <div class="mt-3">
      <button class="btn btn-danger" @click="create()">Create Character</button>
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

<script setup>
import { onMounted, ref } from "vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import PopupCreation from "@/components/PopupCreation.vue";
import { useRouter } from "vue-router";
import { useCharacters } from "@/composables/useCharacters";
import { useClases } from "@/composables/useClases";
import { useStats } from "@/composables/useStats";

const popupVisible = ref(false);
const popupType = ref("");

const { createCharacter } = useCharacters();
const { createStats } = useStats();
const { clases, loadClases } = useClases();
const router = useRouter();

var stats = ref([]);

function rollStats() {
  stats.value = [];
  const statNames = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  for (let i = 0; i < 6; i++) {
    var rolls = [];
    for (let j = 0; j < 4; j++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    rolls.splice(rolls.indexOf(Math.min(...rolls)), 1);
    stats.value.push({
      nombre: statNames[i],
      valor: rolls.reduce((a, b) => a + b, 0),
    });
  }
  return stats.value;
}

async function create() {
  let nombre = document.getElementById("Nombre").value;
  let nivel = parseInt(document.getElementById("Nivel").value);
  let clase = document.querySelector('input[name="clase"]:checked')?.value;

  if (!nombre) {
    popupType.value = "nombre";
    popupVisible.value = true;
    return;
  }

  if (isNaN(nivel)) {
    popupType.value = "nivel";
    popupVisible.value = true;
    return;
  }

  if (!clase) {
    popupType.value = "clase";
    popupVisible.value = true;
    return;
  }

  let vida = document.querySelector('input[name="clase"]:checked').classList[0];
  const statValues = stats.value.map((stat) => stat.valor);
  const statsId = await createStats(...statValues);
  await createCharacter(nombre, nivel, makeHP(vida, nivel), clase, statsId, $cookies.get("userId"));
  router.push("/CharacterSelect");
}

function makeHP(vida, nivel) {
  return parseInt(vida.split("d")[1]) * nivel;
}

onMounted(() => {
  (rollStats(), loadClases());
});
</script>
