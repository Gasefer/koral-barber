<script setup>
const props = defineProps({
  blockData: {
    type: Array,
    required: true,
  },
});

const galleryItems = computed(() => {
  if (!props.blockData.length) return [];

  // 1. Знаходимо блок типу "image-list"
  const imageListBlock = props.blockData.find((b) => b.type === "image-list");
  if (!imageListBlock || !imageListBlock.data) return [];

  // 2. Знаходимо елемент з ключем "image-item"
  const imageItems = imageListBlock.data.find((d) => d.key === "image-item");
  if (!imageItems || !imageItems.items) return [];

  // 3. Перетворюємо масив "items" у потрібний нам формат { id, url }
  return imageItems.items
    .map((item, index) => {
      // Знаходимо об'єкт з ключем "image" всередині даних
      const imageData = item.data.find((d) => d.key === "image");

      // Повертаємо об'єкт з id та url зображення (з "value")
      return {
        id: `gallery-item-${index + 1}`, // Унікальний id
        url: imageData?.value,
      };
    })
    .filter((item) => item.url); // Фільтруємо на випадок відсутності url
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
