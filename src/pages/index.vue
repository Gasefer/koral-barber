<script setup lang="ts">
import { computed } from "vue";
import type { IService } from "~/stores/useBookingStore";

const pageSlug = "main";

const { data: response } = await useAsyncData("mainPageData", () =>
  GqlMainPage({ slug: pageSlug })
);

const allBlocks = computed(() => response.value?.page?.blocks || []);

const getBlockData = (name: string) => {
  const targetName = name.toLowerCase();
  const foundBlock = allBlocks.value.find(
    (b) => b.name?.trim().toLowerCase() === targetName
  );
  return foundBlock?.block || [];
};

const servicesData = computed(() => getBlockData("послуги"));
const heroData = computed(() => getBlockData("головний блок"));
const aboutData = computed(() => getBlockData("про нас"));
const galleryData = computed(() => getBlockData("галерея"));
const contactData = computed(() => getBlockData("контакти"));

// 1. >>> НОВИЙ КОД: Створення Ref для доступу до компонента <<<
const servicesBlockRef = ref(null);

// 2. Обчислювана властивість для отримання реальних послуг з компонента
const actualServices = computed<IService[]>(() => {
  // Перевіряємо, чи компонент завантажився і чи експортував він flatServicesList
  if (servicesBlockRef.value && servicesBlockRef.value.flatServicesList) {
    return servicesBlockRef.value.flatServicesList;
  }
  // Повертаємо порожній масив за замовчуванням
  return [];
});
// <<< КІНЕЦЬ НОВОГО КОДУ

// !!! ВИДАЛЯЄМО ЗАХАРДКОДЖЕНІ ПОСЛУГИ !!!
// const mockServices: IService[] = [
//  { id: "1", name: "Чоловіча стрижка", price: 400 },
//  { id: "2", name: "Стрижка + Борода", price: 650 },
//  { id: "3", name: "Дитяча стрижка", price: 300 },
// ];
</script>

<template>
  <div class="page-main">
    <BlocksMainHero v-if="heroData.length" :block-data="heroData" />

    <BlocksAboutUs v-if="aboutData.length" :block-data="aboutData" />

    <BlocksServices
      v-if="servicesData.length"
      :block-data="servicesData"
      ref="servicesBlockRef"
    />
    <BlocksGallery v-if="galleryData.length" :block-data="galleryData" />

    <BaseFooter v-if="contactData.length" :block-data="contactData" />

    <ClientOnly>
      <ModalTheBookingModal :services="actualServices" />
    </ClientOnly>
  </div>
</template>
