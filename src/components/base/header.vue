<script setup>
const isMobileMenuOpen = ref(false);

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

watch(isMobileMenuOpen, (isOpen) => {
  if (import.meta.client) {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.body.classList.remove("no-scroll");
  }
});
</script>

<template>
  <header class="header">
    <div class="header__container">
      <NuxtLink to="/" class="header__logo">
        <NuxtImg
          src="/images/logo.webp"
          alt="Koral Barbershop Logo"
          width="50"
          height="50"
        />
      </NuxtLink>

      <button
        type="button"
        class="header__burger"
        :class="{ 'header__burger--active': isMobileMenuOpen }"
        @click="toggleMenu"
      >
        <span class="header__burger-line"></span>
        <span class="header__burger-line"></span>
        <span class="header__burger-line"></span>
      </button>

      <nav class="header__nav">
        <ul class="header__list header__list--desktop">
          <li class="header__item">
            <NuxtLink to="#about" class="header__link">Про нас</NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#services" class="header__link">Послуги</NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#gallery" class="header__link">Наші роботи</NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#contacts" class="header__link">Контакти</NuxtLink>
          </li>
          <li class="header__item">
            <HeaderBookingButton />
          </li>
        </ul>

        <ul
          class="header__list header__list--mobile"
          :class="{ 'header__list--mobile--active': isMobileMenuOpen }"
          @click="toggleMenu"
        >
          <li class="header__item">
            <NuxtLink to="#about" class="header__link">Про нас</NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#services" class="header__link">Послуги</NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#gallery" class="header__link">Наші роботи</NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#contacts" class="header__link">Контакти</NuxtLink>
          </li>
          <li class="header__item">
            <HeaderBookingButton />
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
