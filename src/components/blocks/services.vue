<script setup>
const props = defineProps({
  blockData: {
    type: Array,
    required: true,
  },
});

const getDataValue = (dataArray, key) => {
  // Перевірка, що dataArray існує і є масивом
  if (!Array.isArray(dataArray)) {
    return null;
  }

  return dataArray.find((d) => d.key === key)?.value;
};

const activeTabTitle = ref(null);

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
      const itemsBlock = listBlock.data.find((d) => d.key === "items");
      const itemsRaw = itemsBlock?.items || [];

      const items = itemsRaw.map((item) => {
        const name = getDataValue(item.data, "name");
        // Ми припускаємо, що price є числом або рядком, який можна парсити
        const price = getDataValue(item.data, "price");
        return { name: name || "Послуга", price: price || 0 };
      });

      return {
        title: title || "Категорія",
        items: items,
      };
    });

  // Додаємо mock-дані для тестування (ТЕПЕР ВОНИ ЛИШЕ ДЛЯ ВІДОБРАЖЕННЯ)
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

// 5. >>> НОВИЙ КОД: Створення єдиного плоского масиву IService[] <<<
const flatServicesList = computed(() => {
  let uniqueId = 0;

  // Використовуємо .reduce або .flatMap для об'єднання всіх items
  const allServices = serviceLists.value.flatMap((category) => {
    return category.items.map((item) => {
      uniqueId++;

      // Формуємо об'єкт IService
      return {
        // Унікальний ID, генеруємо на клієнті, якщо його немає у GraphQL
        id: `srv-${uniqueId}`,
        name: item.name,
        // Перетворюємо ціну на число, якщо вона приходить рядком, або залишаємо 0
        price: parseFloat(item.price) || 0,
      };
    });
  });

  return allServices;
});

// 6. Експортуємо список послуг, щоб його міг отримати батьківський компонент
defineExpose({
  flatServicesList,
});
// <<< КІНЕЦЬ НОВОГО КОДУ

const activeServiceList = computed(() => {
  return serviceLists.value.find((list) => list.title === activeTabTitle.value);
});

const setActiveTab = (title) => {
  activeTabTitle.value = title;
};

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
              class="services-section__item-wrapper"
            >
              <button class="services-section__item">
                <span class="services-section__item-name">{{ item.name }}</span>
                <span
                  v-if="item?.price !== 0 && item?.price"
                  class="services-section__item-price"
                  >{{ item.price }}</span
                >
              </button>
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
