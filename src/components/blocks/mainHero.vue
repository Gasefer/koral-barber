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
const subTitle = getDataValue("sub_title", "sub_title");
const videoUrl = getDataValue("image", "image");
</script>

<template>
  <section class="hero-block">
    <video
      src="https://admin.koralbarber.com.ua/storage/blocks/01KAP1PAZ4KAY765BTP9993XD5.mp4"
      class="hero-block__video"
      autoplay
      loop
      muted
      playsinline
    />

    <div class="hero-block__overlay"></div>

    <div class="hero-block__content">
      <h1 class="hero-block__title">{{ title }}</h1>
      <h3 class="hero-block__subtitle">{{ subTitle }}</h3>
    </div>
  </section>
</template>
