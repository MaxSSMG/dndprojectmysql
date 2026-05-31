<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUser } from "@/composables/useUser.js";
import PopupCreation from "@/components/PopupCreation.vue";

const popupVisible = ref(false);
const popupType = ref("");

$cookies.remove('userId');
const { login, register } = useUser();
const router = useRouter();

const handleLogin = async () => {
  let username = document.getElementById("username");
  let password = document.getElementById("password");
  if (!username.value || !password.value) {
    return;
  }
  const log = await login(username.value, password.value);
  console.log(log);
  if (log) {
    router.push("/");
  } else {
    popupVisible.value = true;
    popupType.value = "login";
  }
};

const handleRegister = async () => {
  let username = document.getElementById("username");
  let password = document.getElementById("password");
  if (!username.value || !password.value) {
    return;
  }
  await register(username.value, password.value);
  await handleLogin();
};

</script>

<template>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <div class="container-fluid vh-100 login">
    <div class="row h-100 g-0">
      
      <div class="h-100 sidebar d-none d-md-block col-md-4 col-lg-4 col-xl-4">
        <img src="@/assets/sidebar-appstore-today.jpg" alt="Sidebar image" class="w-100 h-100 sidebar-image">
      </div>

      <div class="d-flex flex-column justify-content-center align-items-center h-100 col-12 col-md-8 col-lg-8 col-xl-8">
        <img src="@/assets/DNDLOGO.png" alt="DND LOGO" class="w-25 mb-2">

        <input id="username" type="text" placeholder="User" class="form-control mb-2 w-50">
        <input id="password" type="password" placeholder="Password" class="form-control mb-2 w-50">

        <button type="button" @click="handleLogin" class="btn btn-danger mb-2 w-25">Login</button>
        <button type="button" @click="handleRegister" class="btn btn-outline-danger mb-2 w-25">Register</button>
      </div>

    </div>
  </div>
  <div v-if="popupVisible" class="popup-overlay">
    <PopupCreation
    :visible="popupVisible"
    :type="popupType"
    @close="popupVisible = false"
    />
  </div>
</template>