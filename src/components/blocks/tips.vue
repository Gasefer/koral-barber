<script setup lang="ts">
interface IFieldData {
  key: string;
  value: string;
  type: string;
}

interface IFaqItem {
  type: "faq-item";
  data: IFieldData[];
}

interface IItemsData {
  key: "items";
  items: IFaqItem[];
}

interface IBlockData {
  type: string;
  data: (IFieldData | IItemsData)[];
}

const props = defineProps<{
  blockData: IBlockData[];
}>();

const faqBlock = computed(() => props.blockData.find((b) => b.type === "faq"));

const title = computed(() => {
  const field = faqBlock.value?.data.find((item) => item.key === "title") as
    | IFieldData
    | undefined;
  return field?.value || "Поради";
});

const questions = computed(() => {
  const container = faqBlock.value?.data.find(
    (item) => item.key === "items"
  ) as IItemsData | undefined;
  if (!container?.items) return [];

  return container.items.map((item) => ({
    question: item.data.find((f) => f.key === "question")?.value || "",
    answer: item.data.find((f) => f.key === "answer")?.value || "",
  }));
});

const activeIndex = ref<number | null>(null);

const toggleItem = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<template>
  <section class="tips">
    <div class="tips__container">
      <h2 v-if="title" class="services-section__main-title">{{ title }}</h2>

      <div class="tips__list">
        <div
          v-for="(item, index) in questions"
          :key="index"
          class="tips__item"
          :class="{ 'tips__item--open': activeIndex === index }"
        >
          <button class="tips__question" @click="toggleItem(index)">
            <span class="tips__question-text">{{ item.question }}</span>
            <span class="tips__icon"></span>
          </button>

          <div class="tips__answer-collapse">
            <div class="tips__answer-content">
              <div class="tips__answer">
                {{ item.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
