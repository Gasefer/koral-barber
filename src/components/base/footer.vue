<script setup>
// ref, computed вже доступні автоматично в Nuxt
const props = defineProps({
  blockData: {
    type: Array,
    required: true,
  },
});

const getDataValue = (dataArray, key) => {
  const target = dataArray.find((d) => d.key === key);
  return target ? target.value : null;
};

const getKeyValue = (key) => {
  const block = props.blockData.find(
    (b) => b.type === "key-value" && getDataValue(b.data, "key") === key,
  );
  return block ? getDataValue(block.data, "value") : null;
};

const getTitleValue = (titleKey) => {
  const block = props.blockData.find(
    (b) => b.type === "title" && getDataValue(b.data, "title") === titleKey,
  );
  return block ? getDataValue(block.data, "title") : null;
};

const footerImageOrVideo = computed(() => {
  const imageBlock = props.blockData.find((b) => b.type === "image");
  return imageBlock ? getDataValue(imageBlock.data, "image") : null;
});

const followUsTitle = computed(() => getTitleValue("СЛІДКУЙТЕ ЗА НАМИ"));
const contactsTitle = computed(() => getTitleValue("КОНТАКТИ ТА АДРЕСА"));

const contactDescription = computed(() => {
  const descBlock = props.blockData.find((b) => b.type === "description");
  return descBlock ? getDataValue(descBlock.data, "description") : null;
});

const parsedContacts = computed(() => {
  if (contactDescription.value) {
    const lines = contactDescription.value
      .split("\n")
      .filter((line) => line.trim() !== "");
    return {
      address: lines[0] || null,
      phone: lines[1] || null,
    };
  }
  return { address: null, phone: null };
});

const currentAddress = computed(() => parsedContacts.value.address);
const currentPhone = computed(() => parsedContacts.value.phone);

const googleMapsLink = computed(() => getKeyValue("google_maps"));

const socialMediaLinks = computed(() => {
  const keyValueBlocks = props.blockData.filter((b) => b.type === "key-value");
  const socialLinks = [];

  keyValueBlocks.forEach((block) => {
    const key = getDataValue(block.data, "key");
    const value = getDataValue(block.data, "value");

    if (key && value && key.toLowerCase() !== "google_maps") {
      socialLinks.push({
        name: key,
        url: value,
        cssClass: key.toLowerCase().replace(/\s/g, "_"),
      });
    }
  });

  return socialLinks;
});
</script>

<template>
  <footer id="contacts" class="footer">
    <div class="footer__container">
      <div class="footer__info-wrapper">
        <div class="footer__info">
          <div class="footer__col footer__col--info">
            <h3 class="footer__title">
              {{ contactsTitle || "Контакти та Адреса" }}
            </h3>

            <div
              v-if="currentAddress || currentPhone"
              class="footer__address-group"
            >
              <address v-if="currentAddress" class="footer__address">
                {{ currentAddress }}
              </address>
              <a
                v-if="currentPhone"
                :href="`tel:${currentPhone.replace(/[^0-9+]/g, '')}`"
                class="footer__phone"
              >
                {{ currentPhone }}
              </a>
            </div>
          </div>

          <div class="footer__col footer__col--nav">
            <h3 class="footer__title">Навігація</h3>
            <ul class="footer__nav-list">
              <li class="footer__nav-item">
                <NuxtLink to="/about" class="footer__nav-link"
                  >Про нас</NuxtLink
                >
              </li>
              <li class="footer__nav-item">
                <NuxtLink to="/services" class="footer__nav-link"
                  >Послуги</NuxtLink
                >
              </li>
              <li class="footer__nav-item">
                <NuxtLink to="/gallery" class="footer__nav-link"
                  >Галерея</NuxtLink
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="footer__content">
          <div class="footer__media">
            <template v-if="footerImageOrVideo">
              <video
                v-if="footerImageOrVideo.match(/\.(mp4|mov)$/i)"
                :src="footerImageOrVideo"
                class="footer__video"
                autoplay
                loop
                muted
                playsinline
              ></video>
              <img
                v-else
                :src="footerImageOrVideo"
                alt="Логотип"
                class="footer__logo"
              />
            </template>
          </div>

          <iframe
            v-if="googleMapsLink"
            class="footer__map"
            :src="googleMapsLink"
            width="600"
            height="450"
            style="border: 0"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <div class="footer__col footer__col--social">
        <h3 class="footer__title">
          {{ followUsTitle || "Слідкуйте за нами" }}
        </h3>

        <div v-if="socialMediaLinks.length" class="footer__social-links">
          <a
            v-for="social in socialMediaLinks"
            :key="social.name"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            :class="[
              'footer__social-link',
              `footer__social-link--${social.cssClass}`,
            ]"
          >
            {{ social.name }}
          </a>
        </div>

        <template v-if="googleMapsLink">
          <h3 class="footer__title footer__title--map">Де ми знаходимося</h3>
          <a
            :href="googleMapsLink"
            target="_blank"
            rel="noopener noreferrer"
            class="footer__map-link"
          >
            Переглянути на Карті
          </a>
        </template>
      </div>
    </div>

    <div class="footer__copyright">
      <p>© {{ new Date().getFullYear() }} Koral Barber. Всі права захищені.</p>
    </div>
  </footer>
</template>
