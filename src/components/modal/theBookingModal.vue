<script setup lang="ts">
import {
  useBookingStore,
  type IService,
  type IOrderData,
} from "~/stores/useBookingStore";
import { storeToRefs } from "pinia";

interface Props {
  services: IService[];
}
const props = defineProps<Props>();

const bookingStore = useBookingStore();
const {
  isModalOpen,
  orderData,
  isLoading,
  currentStep,
  error,
  isStepComplete,
  stepTitle,
} = storeToRefs(bookingStore);
const {
  setService,
  setDateAndTime,
  setContactInfo,
  closeModal,
  nextStep,
  prevStep,
} = bookingStore;

const selectedServiceId = computed({
  get: () => orderData.value.service?.id || null,
  set: (id) => {
    const service = props.services.find((s) => s.id === id) || null;
    setService(service as IService);
  },
});

const selectedDate = ref<string | null>(orderData.value.date);
const selectedTime = ref<string | null>(orderData.value.time);

watch([selectedDate, selectedTime], ([newDate, newTime]) => {
  setDateAndTime(newDate, newTime);
});

const contactForm = reactive<Pick<IOrderData, "name" | "phone" | "email">>({
  name: orderData.value.name,
  phone: orderData.value.phone,
  email: orderData.value.email,
});

const isContactFormValid = computed(() => {
  return contactForm.name.trim() !== "" && contactForm.phone.trim() !== "";
});

watch(
  contactForm,
  (newForm) => {
    setContactInfo(newForm);
  },
  { deep: true }
);

const handleNextStep = () => {
  if (isStepComplete.value) {
    nextStep();
  }
};

const handleSubmit = async () => {
  if (!isStepComplete.value) return;

  if (
    !orderData.value.service ||
    !orderData.value.date ||
    !orderData.value.time
  ) {
    bookingStore.error = "Помилка: Не всі дані для запису заповнені.";
    return;
  }

  bookingStore.isLoading = true;
  bookingStore.error = null;

  try {
    const input = {
      reserved_at: `${orderData.value.date} ${orderData.value.time}`,
      name: orderData.value.name,
      phone: orderData.value.phone,
      email: orderData.value.email || "",
      servises:
        orderData.value.service.name +
        " " +
        orderData.value.service.price +
        " грн",
      message: "Запис через форму бронювання.",
    };

    const response = await GqlCreateRequest({ input });

    // Перевірка помилок
    const result = response?.createRequest;

    if (result && result.status === "success") {
      alert("Ваш запис успішно прийнято!✅");
      closeModal();
    } else {
      bookingStore.error =
        result?.message || "Невідома помилка сервера при записі.";
    }
  } catch (err: any) {
    console.error("Помилка при відправці замовлення:", err);
    bookingStore.error =
      err.message ||
      "Помилка зв'язку. Перевірте з'єднання або спробуйте пізніше.";
  } finally {
    bookingStore.isLoading = false;
  }
};
</script>

<template>
  <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
    <div class="booking-modal">
      <h2 class="booking-modal__title">{{ stepTitle }}</h2>

      <button class="booking-modal__close-btn" @click="closeModal">
        &times;
      </button>

      <form @submit.prevent="handleSubmit" class="booking-modal__form">
        <div v-show="currentStep === 1" class="booking-modal__step step-1">
          <h3>Оберіть послугу</h3>
          <ul class="service-list">
            <li
              v-for="service in props.services"
              :key="service.id"
              class="service-item"
              @click="selectedServiceId = service.id"
            >
              <input
                type="radio"
                :id="`service-${service.id}`"
                :value="service.id"
                v-model="selectedServiceId"
              />
              <label
                :for="`service-${service.id}`"
                class="service-item__content"
              >
                <span>{{ service.name }}</span>
                <strong>{{ service.price }} грн</strong>
              </label>
            </li>
          </ul>
        </div>

        <div v-show="currentStep === 2" class="booking-modal__step step-2">
          <h3>Оберіть дату та час</h3>
          <div class="datepicker-placeholder">
            <label>
              Дата
              <input type="date" v-model="selectedDate" required />
            </label>
            <label>
              Час
              <input type="time" v-model="selectedTime" required />
            </label>
          </div>
          <p v-if="currentStep === 2 && !isStepComplete" class="error-message">
            Оберіть дату та час для запису.
          </p>
        </div>

        <div v-show="currentStep === 3" class="booking-modal__step step-3">
          <h3>Ваші контактні дані</h3>

          <div class="contact-form">
            <label>
              Ім'я <span style="color: red">*</span>
              <input type="text" v-model="contactForm.name" required />
            </label>
            <label>
              Телефон <span style="color: red">*</span>
              <input type="tel" v-model="contactForm.phone" required />
            </label>
            <label>
              Email <span style="color: red">*</span>
              <input type="email" v-model="contactForm.email" />
            </label>
          </div>
        </div>

        <p v-if="error" class="error-message">Помилка: {{ error }}</p>

        <div class="booking-modal__navigation">
          <button
            v-if="currentStep > 1"
            type="button"
            class="prev-btn"
            @click="prevStep"
          >
            Назад
          </button>

          <div v-else></div>
          <button
            v-if="currentStep < 3"
            type="button"
            class="next-btn"
            :disabled="!isStepComplete"
            @click="handleNextStep"
          >
            Далі
          </button>

          <button
            v-if="currentStep === 3"
            type="submit"
            class="next-btn"
            :disabled="!isStepComplete || isLoading"
          >
            <span v-if="isLoading">Відправлення...</span>
            <span v-else>Записатися!</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
