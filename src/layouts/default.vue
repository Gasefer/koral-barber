<script setup>
const bookingStore = useBookingStore();
</script>

<template>
  <BaseHeader />
  <NuxtPage />
  <button class="fixed-btn" @click="bookingStore.openModal()">
    Записатися
  </button>
</template>
