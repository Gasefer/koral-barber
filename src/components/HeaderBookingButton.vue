<script setup lang="ts">
import { useBookingStore } from "~/stores/useBookingStore";
const bookingStore = useBookingStore();
</script>

<template>
  <button
    class="header__link header__link--button"
    @click="bookingStore.openModal()"
  >
    Записатися
  </button>
</template>
