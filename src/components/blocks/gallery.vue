<script setup>
const props = defineProps({
  blockData: {
    type: Array,
    required: true,
  },
});

const galleryItems = computed(() => {
  if (!props.blockData.length) return [];

  const imageListBlock = props.blockData.find((b) => b.type === "image-list");
  if (!imageListBlock || !imageListBlock.data) return [];
  const imageItems = imageListBlock.data.find((d) => d.key === "image-item");

  const baseItems = [
    {
      id: 1,
      url: "https://ezebra.iai-shop.com/data/include/cms/BLOG-UA/krasivye-wolosy-7-sovetov/2.jpg",
    },
    {
      id: 2,
      url: "https://ezebra.iai-shop.com/data/include/cms/BLOG-UA/krasivye-wolosy-7-sovetov/2.jpg",
    },
    {
      id: 3,
      url: "https://ezebra.iai-shop.com/data/include/cms/BLOG-UA/krasivye-wolosy-7-sovetov/2.jpg",
    },
    {
      id: 4,
      url: "https://ezebra.iai-shop.com/data/include/cms/BLOG-UA/krasivye-wolosy-7-sovetov/2.jpg",
    },
    {
      id: 5,
      url: "https://ezebra.iai-shop.com/data/include/cms/BLOG-UA/krasivye-wolosy-7-sovetov/2.jpg",
    },
  ];

  return baseItems;
});
</script>

<template>
  <section id="gallery" class="gallery">
    <div class="gallery__container">
      <h1 class="services-section__main-title">Наша Галерея</h1>

      <div class="gallery__grid">
        <div v-for="item in galleryItems" :key="item.id" class="gallery__item">
          <img
            :src="item.url"
            :alt="`Галерея, фото ${item.id}`"
            class="gallery__image"
          />
        </div>
      </div>
    </div>
  </section>
</template>
