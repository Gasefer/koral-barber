<script setup>
// ref не потрібно імпортувати
const isMobileMenuOpen = ref(false);

const toggleMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Відстежуємо зміни isMobileMenuOpen
watch(isMobileMenuOpen, (isOpen) => {
  if (process.client) {
    // Перевірка, щоб код виконувався лише в браузері
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }
});

// Додатково: видаляємо клас при розмонтуванні компонента,
// хоча це Header, він зазвичай не розмонтовується.
onUnmounted(() => {
  if (process.client) {
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
            <NuxtLink to="#about" class="header__link"> Про нас </NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#services" class="header__link"> Послуги </NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#gallery" class="header__link">
              Наші роботи
            </NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#contacts" class="header__link"> Контакти</NuxtLink>
          </li>
          <li class="header__item">
            <button class="header__link header__link--button">
              Записатися
            </button>
          </li>
        </ul>

        <ul
          v-if="isMobileMenuOpen"
          class="header__list header__list--mobile"
          @click="toggleMenu"
        >
          <li class="header__item">
            <NuxtLink to="#about" class="header__link"> Про нас </NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#services" class="header__link"> Послуги </NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#gallery" class="header__link">
              Наші роботи
            </NuxtLink>
          </li>
          <li class="header__item">
            <NuxtLink to="#contacts" class="header__link"> Контакти</NuxtLink>
          </li>
          <li class="header__item">
            <button class="header__link header__link--button">
              Записатися
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
