<script setup>
import { computed, ref } from "vue";

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
    (b) => b.type === "key-value" && getDataValue(b.data, "key") === key
  );
  return block ? getDataValue(block.data, "value") : null;
};

const getTitleValue = (titleKey) => {
  const block = props.blockData.find(
    (b) => b.type === "title" && getDataValue(b.data, "title") === titleKey
  );
  return block ? getDataValue(block.data, "title") : null;
};

// 1. Зображення/відео
const footerImageOrVideo = computed(() => {
  const imageBlock = props.blockData.find((b) => b.type === "image");
  return imageBlock ? getDataValue(imageBlock.data, "image") : null;
});

// 2. Заголовок "СЛІДКУЙТЕ ЗА НАМИ"
const followUsTitle = computed(() => getTitleValue("СЛІДКУЙТЕ ЗА НАМИ"));

// 3. Заголовок "КОНТАКТИ ТА АДРЕСА"
const contactsTitle = computed(() => getTitleValue("КОНТАКТИ ТА АДРЕСА"));

// 4. Адреса та телефон з блоку 'description'
const contactDescription = computed(() => {
  const descBlock = props.blockData.find((b) => b.type === "description");
  return descBlock ? getDataValue(descBlock.data, "description") : null;
});

const parsedContacts = computed(() => {
  if (contactDescription.value) {
    const lines = contactDescription.value
      .split("\n")
      .filter((line) => line.trim() !== "");
    const address = lines[0] || null;
    const phone = lines[1] || null;
    return { address, phone };
  }
  return { address: null, phone: null };
});

const currentAddress = computed(() => parsedContacts.value.address);
const currentPhone = computed(() => parsedContacts.value.phone);

// 5. Посилання на Google Maps (залишаємо окремо, бо це не соцмережа)
const googleMapsLink = computed(() => getKeyValue("google_maps"));

// *** ОНОВЛЕНО: Динамічне отримання всіх соціальних мереж ***
const socialMediaLinks = computed(() => {
  // Фільтруємо всі блоки типу 'key-value'
  const keyValueBlocks = props.blockData.filter((b) => b.type === "key-value");

  const socialLinks = [];

  keyValueBlocks.forEach((block) => {
    const key = getDataValue(block.data, "key");
    const value = getDataValue(block.data, "value");

    // Включаємо посилання, якщо 'key' не є 'google_maps' і 'value' існує
    if (key && value && key.toLowerCase() !== "google_maps") {
      socialLinks.push({
        name: key,
        url: value,
        // Створюємо CSS-клас, наприклад: "Тік ток" -> "tiktok"
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
                :href="`tel:${currentPhone
                  .replace(/\s/g, '')
                  .replace('(', '')
                  .replace(')', '')
                  .replace('-', '')}`"
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
                <NuxtLink to="#about" class="footer__nav-link"
                  >Про нас</NuxtLink
                >
              </li>
              <li class="footer__nav-item">
                <NuxtLink to="#services" class="footer__nav-link"
                  >Послуги</NuxtLink
                >
              </li>
              <li class="footer__nav-item">
                <NuxtLink to="#gallery" class="footer__nav-link"
                  >Наші роботи</NuxtLink
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="footer__content">
          <div class="footer__media">
            <template v-if="footerImageOrVideo">
              <video
                v-if="
                  footerImageOrVideo.toLowerCase().endsWith('.mov') ||
                  footerImageOrVideo.toLowerCase().endsWith('.mp4')
                "
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2523.36785221312!2d25.374567199999998!3d50.7687542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x472590b517603267%3A0xbc0a95196da7d83e!2z0LLRg9C70LjRhtGPINCi0YDQsNCy0L3QtdCy0LAsIDLQsCwg0JvRg9GG0YzQuiwg0JLQvtC70LjQvdGB0YzQutCwINC-0LHQu9Cw0YHRgtGMLCA0MzAwMA!5e0!3m2!1suk!2sua!4v1764269403221!5m2!1suk!2sua"
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

        <h3 v-if="googleMapsLink" class="footer__title footer__title--map">
          Де ми знаходимося
        </h3>
        <a
          v-if="googleMapsLink"
          :href="googleMapsLink"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__map-link"
        >
          Переглянути на Карті
        </a>
      </div>
    </div>

    <div class="footer__copyright">
      <p>© {{ new Date().getFullYear() }} Koral Barber. Всі права захищені.</p>
    </div>
  </footer>
</template>
