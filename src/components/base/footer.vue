<script setup>
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

const footerImageOrVideo = computed(() => {
  const imageBlock = props.blockData.find((b) => b.type === "image");
  return imageBlock ? getDataValue(imageBlock.data, "image") : null;
});

const googleMapsLink = computed(() => getKeyValue("google_maps"));
const instagramLink = computed(() => getKeyValue("instagram"));

const mockAddress = ref("вул. Травнева, 2а, м. Луцьк");
const mockPhone = ref("+38 (011) 123-45-67");
</script>

<template>
  <footer id="contacts" class="footer">
    <div class="footer__container">
      <div class="footer__info-wrapper">
        <div class="footer__info">
          <div class="footer__col footer__col--info">
            <h3 class="footer__title">Контакти та Адреса</h3>

            <div class="footer__address-group">
              <address class="footer__address">
                {{ mockAddress }}
              </address>
              <a
                :href="`tel:${mockPhone.replace(/\s/g, '')}`"
                class="footer__phone"
              >
                {{ mockPhone }}
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
                v-if="footerImageOrVideo.endsWith('.MOV')"
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
        <h3 class="footer__title">Слідкуйте за нами</h3>

        <div class="footer__social-links">
          <a
            v-if="instagramLink"
            :href="instagramLink"
            target="_blank"
            rel="noopener noreferrer"
            class="footer__social-link footer__social-link--instagram"
          >
            Instagram
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
      <p>
        &copy; {{ new Date().getFullYear() }} Koral Barber. Всі права захищені.
      </p>
    </div>
  </footer>
</template>
