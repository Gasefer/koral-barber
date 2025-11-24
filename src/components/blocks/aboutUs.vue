<script setup>
const props = defineProps({
  blockData: {
    type: Array,
    required: true,
  },
});

const getDataValue = (type, key) => {
  const blockType = props.blockData.find((b) => b.type === type);
  return blockType?.data.find((d) => d.key === key)?.value;
};

const title = getDataValue("title", "title");
const description = getDataValue("description", "description");
</script>

<template>
  <section id="about" class="about-us">
    <div class="container about-us__container">
      <h1 class="services-section__main-title">{{ title }}</h1>
      <p class="about-us__description">{{ description }}</p>
    </div>
  </section>
</template>
