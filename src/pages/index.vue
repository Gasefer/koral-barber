<script setup>
const pageSlug = "main";
let response = null;

try {
  response = await GqlMainPage({
    slug: pageSlug,
  });
} catch (error) {
  console.error("GraphQL запит не вдався:", error);
}

const allBlocks = computed(() => {
  return response?.page?.blocks || [];
});

const getBlockData = (name) => {
  const targetName = name.toLowerCase();

  const foundBlock = allBlocks.value.find(
    (b) => b.name?.trim().toLowerCase() === targetName
  );

  return foundBlock?.block || [];
};

const heroData = computed(() => getBlockData("головний блок"));
const aboutData = computed(() => getBlockData("про нас"));
const servicesData = computed(() => getBlockData("послуги"));
const galleryData = computed(() => getBlockData("галерея"));
const contactData = computed(() => getBlockData("контакти"));
</script>

<template>
  <div class="page-main">
    <BlocksMainHero v-if="heroData.length" :block-data="heroData" />

    <BlocksAboutUs v-if="aboutData.length" :block-data="aboutData" />

    <BlocksServices v-if="servicesData.length" :block-data="servicesData" />

    <BlocksGallery v-if="galleryData.length" :block-data="galleryData" />

    <BaseFooter v-if="contactData.length" :block-data="contactData" />
  </div>
</template>
