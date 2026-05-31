<script setup>
defineProps({
  visible: Boolean,
  type: String,
});

const emit = defineEmits(["close"]);
</script>

<template>
  <div v-if="visible" id="popup">
    <div v-if="type === 'nivel'">
      <h2>El nivel es incorrecto</h2>
      <p>Debes ingresar un número para que sea válido.</p>
    </div>

    <div v-if="type === 'clase'">
      <h2>Le falta una clase</h2>
      <p>Debes seleccionar una clase para crear el personaje.</p>
    </div>

    <div v-if="type === 'nombre'">
      <h2>Falta nombre</h2>
      <p>Debes ingresar un nombre para el personaje.</p>
    </div>

    <div v-if="type === 'nombreCampaña'">
      <h2>Nombre cambiado</h2>
      <p>Se ha cambiado el nombre de la campaña.</p>
    </div>

    <button class="btn btn-danger" @click="emit('close')">
      Cerrar
    </button>
  </div>
</template>