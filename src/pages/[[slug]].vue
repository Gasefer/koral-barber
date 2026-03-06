<script setup lang="ts">
import type { IService } from "~/stores/useBookingStore";

const route = useRoute();
const pageSlug = "main";
const currentSlug = computed(() => route.params.slug || "main");

// ОГОЛОШУЄМО ВСІ РЕФИ (назви мають збігатися з тими, що в template)
const heroRef = ref(null);
const aboutRef = ref(null);
const servicesRef = ref(null);
const galleryRef = ref(null);
const tipsRef = ref(null);
const contactsRef = ref(null);

interface ITimeSlot {
  time: string;
  reserved_at: string | null;
}

interface IDateSlot {
  date: string;
  times: ITimeSlot[];
}

interface ISettings {
  dates: IDateSlot[];
  settings: unknown[];
}

interface IGqlMainPageResponse {
  page?: {
    blocks: {
      id: string;
      name: string | null;
      type: string | null;
      block: {
        type: string;
        data: {
          key: string;
          type: string;
          value: unknown;
        }[];
      }[];
    }[];
    seo_title: string | null;
    seo_description: string | null;
  };
  settings?: ISettings;
}

const { data: response } = await useAsyncData("mainPageData", () =>
  GqlMainPage({ slug: pageSlug }),
);

const typedResponse = computed(
  () => response.value as IGqlMainPageResponse | null,
);

const allBlocks = computed(() => typedResponse.value?.page?.blocks || []);

const activeBlock = computed(() => {
  const slug = currentSlug.value.toString().toLowerCase();

  return allBlocks.value.find((b) => {
    const blockName = b.name?.toLowerCase().trim();
    if (slug === "main") return blockName === "головний блок";
    if (slug === "about") return blockName === "про нас";
    if (slug === "services") return blockName === "послуги";
    if (slug === "gallery") return blockName === "галерея";
    if (slug === "contact") return blockName === "контакти";
    return false;
  });
});

const getSeoFromBlock = (keyName: string) => {
  if (!activeBlock.value) return null;

  for (const subBlock of activeBlock.value.block) {
    if (subBlock.type === "key-value") {
      const keyEntry = subBlock.data.find(
        (d) => d.key === "key" && d.value === keyName,
      );
      if (keyEntry) {
        const valueEntry = subBlock.data.find((d) => d.key === "value");
        return valueEntry?.value || null;
      }
    }
  }
  return null;
};

const dynamicTitle = computed(() => {
  return (
    getSeoFromBlock("seo_title") ||
    typedResponse.value?.page?.seo_title ||
    "Koral Barber"
  );
});

const dynamicDescription = computed(() => {
  return (
    getSeoFromBlock("seo_description") ||
    typedResponse.value?.page?.seo_description ||
    "Koral Barber - найкраща перукарня у Луцьку!"
  );
});

useSeoMeta({
  title: () => dynamicTitle.value,
  description: () => dynamicDescription.value,
  ogTitle: () => dynamicTitle.value,
  ogDescription: () => dynamicDescription.value,
});

const getBlockData = (name: string) => {
  const targetName = name.toLowerCase();
  const foundBlock = allBlocks.value.find(
    (b) => b.name?.trim().toLowerCase() === targetName,
  );
  return foundBlock?.block || [];
};

const servicesData = computed(() => getBlockData("послуги"));
const heroData = computed(() => getBlockData("головний блок"));
const aboutData = computed(() => getBlockData("про нас"));
const galleryData = computed(() => getBlockData("галерея"));
const contactData = computed(() => getBlockData("контакти"));
const tipsData = computed(() => getBlockData("поради"));

const availableBookingDates = computed<IDateSlot[]>(
  () => typedResponse.value?.settings?.dates || [],
);

// Тепер використовуємо правильний реф для сервісів
const actualServices = computed<IService[]>(() => {
  if (servicesRef.value && (servicesRef.value as any).flatServicesList) {
    return (servicesRef.value as any).flatServicesList;
  }
  return [];
});

const scrollToActiveBlock = () => {
  const slug = currentSlug.value;
  let target = null;

  if (slug === "about") target = aboutRef.value;
  else if (slug === "services") target = servicesRef.value;
  else if (slug === "gallery") target = galleryRef.value;
  else if (slug === "contacts") target = contactsRef.value;
  else if (slug === "tips") target = tipsRef.value;
  else if (slug === "main") target = heroRef.value;

  if (target) {
    const el = target.$el || target;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

onMounted(() => {
  if (currentSlug.value !== "main") {
    setTimeout(() => {
      scrollToActiveBlock();
    }, 600);
  }
});

watch(currentSlug, () => {
  nextTick(() => {
    scrollToActiveBlock();
  });
});
</script>

<template>
  <div class="page-main">
    <BlocksMainHero
      v-if="heroData.length"
      :block-data="heroData"
      ref="heroRef"
    />

    <BlocksAboutUs
      v-if="aboutData.length"
      :block-data="aboutData"
      ref="aboutRef"
    />

    <BlocksServices
      v-if="servicesData.length"
      :block-data="servicesData"
      ref="servicesRef"
    />

    <BlocksGallery
      v-if="galleryData.length"
      :block-data="galleryData"
      ref="galleryRef"
    />

    <BlocksTips v-if="tipsData.length" :block-data="tipsData" ref="tipsRef" />

    <BaseFooter
      v-if="contactData.length"
      :block-data="contactData"
      ref="contactsRef"
    />

    <ClientOnly>
      <ModalTheBookingModal
        :services="actualServices"
        :dates="availableBookingDates"
      />
    </ClientOnly>
  </div>
</template>
