<script setup lang="ts">
import { computed } from "vue";
import type { IService } from "~/stores/useBookingStore";

const pageSlug = "main";

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
        data: {
          key: string;
          type: string;
          value: unknown;
        }[];
      }[];
    }[];
  };
  settings?: ISettings;
}

const { data: response } = await useAsyncData("mainPageData", () =>
  GqlMainPage({ slug: pageSlug })
);

const typedResponse = computed(
  () => response.value as IGqlMainPageResponse | null
);

const allBlocks = computed(() => typedResponse.value?.page?.blocks || []);

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

const availableBookingDates = computed<IDateSlot[]>(
  () => typedResponse.value?.settings?.dates || []
);

const servicesBlockRef = ref(null);

const actualServices = computed<IService[]>(() => {
  if (servicesBlockRef.value && servicesBlockRef.value.flatServicesList) {
    return servicesBlockRef.value.flatServicesList;
  }
  return [];
});
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
      <ModalTheBookingModal
        :services="actualServices"
        :dates="availableBookingDates"
      />
    </ClientOnly>
  </div>
</template>
