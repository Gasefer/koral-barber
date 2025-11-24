<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  blockData: {
    type: Array,
    required: true,
  },
});

const getDataValue = (dataArray, key) => {
  return dataArray.find((d) => d.key === key)?.value;
};

// Стан для відстеження активної вкладки
const activeTabTitle = ref(null);

// 1. Обчислювана властивість для головного заголовка розділу
const sectionTitle = computed(() => {
  const titleBlock = props.blockData.find((b) => b.type === "title");
  if (titleBlock) {
    return getDataValue(titleBlock.data, "title");
  }
  return "Наші послуги";
});

// 2. Обчислювана властивість для списків послуг (категорії)
const serviceLists = computed(() => {
  const lists = props.blockData
    .filter((b) => b.type === "service-list")
    .map((listBlock) => {
      const title = getDataValue(listBlock.data, "title");
      const items = getDataValue(listBlock.data, "items");
      return {
        title: title || "Категорія",
        items: items || [],
      };
    });

  // Додаємо mock-дані для тестування, якщо немає реальних даних
  if (!lists.length) {
    lists.push(
      {
        title: "Стрижка",
        items: [
          { name: "Чоловіча стрижка", price: "400" },
          { name: "Стрижка дитяча (до 10 років)", price: "300" },
        ],
      },
      {
        title: "Борода",
        items: [
          { name: "Корекція бороди", price: "350" },
          { name: "Королівське гоління", price: "550" },
        ],
      }
    );
  }

  return lists;
});

// 3. Обчислювана властивість для відображення послуг активної вкладки
const activeServiceList = computed(() => {
  return serviceLists.value.find((list) => list.title === activeTabTitle.value);
});

// 4. Функція для зміни активної вкладки
const setActiveTab = (title) => {
  activeTabTitle.value = title;
};

// 5. Встановлення першої вкладки активною при завантаженні
onMounted(() => {
  if (serviceLists.value.length > 0 && !activeTabTitle.value) {
    activeTabTitle.value = serviceLists.value[0].title;
  }
});
</script>

<template>
  <section id="services" class="services-section">
    <div class="container services-section__container">
      <h1 class="services-section__main-title">{{ sectionTitle }}</h1>

      <div class="services-section__tabs-wrapper">
        <button
          v-for="(list, index) in serviceLists"
          :key="index"
          :class="[
            'services-section__tab',
            { 'services-section__tab--active': list.title === activeTabTitle },
          ]"
          @click="setActiveTab(list.title)"
        >
          {{ list.title }}
        </button>
      </div>

      <div class="services-section__content">
        <div v-if="activeServiceList" class="services-section__list-column">
          <h3 class="services-section__list-title">
            {{ activeServiceList.title }}
          </h3>

          <ul class="services-section__items">
            <li
              v-for="(item, itemIndex) in activeServiceList.items"
              :key="itemIndex"
              class="services-section__item"
            >
              <span class="services-section__item-name">{{ item.name }}</span>
              <span class="services-section__item-price"
                >{{ item.price }} ₴</span
              >
            </li>

            <li
              v-if="!activeServiceList.items.length"
              class="services-section__item services-section__item--placeholder"
            >
              <span class="services-section__item-name"
                >Послуги очікують наповнення</span
              >
              <span class="services-section__item-price">—</span>
            </li>
          </ul>
        </div>

        <div v-else class="services-section__no-data">
          Оберіть категорію або послуги відсутні.
        </div>
      </div>
    </div>
  </section>
</template>
