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

// --- ЛОГІКА ВАЛІДАЦІЇ ДАТИ ТА ЧАСУ ---

// Допоміжна функція для отримання "зараз" у локальному форматі (YYYY-MM-DD та HH:MM)
const getCurrentDateTime = () => {
  const now = new Date();
  // YYYY-MM-DD
  const dateStr = now
    .toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split(".")
    .reverse()
    .join("-");
  // HH:MM (Force 24-hour format)
  const timeStr = now.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return { dateStr, timeStr };
};

// Генеруємо доступні часові слоти з інтервалом 30 хвилин
const availableTimeSlots = computed(() => {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ["00", "30"]) {
      slots.push(`${String(h).padStart(2, "0")}:${m}`);
    }
  }
  return slots;
});

// Обмежуємо вибір у календарі (min attribute)
const minDate = computed(() => getCurrentDateTime().dateStr);

const validateDate = () => {
  if (!selectedDate.value) return;

  const { dateStr: today } = getCurrentDateTime();

  // Якщо обрана дата менша за сьогоднішню — ставимо сьогоднішню
  if (selectedDate.value < today) {
    selectedDate.value = today;
    // Одразу перевіряємо час
    validateTime();
  }
};

const validateTime = () => {
  if (!selectedTime.value || !selectedDate.value) return;

  const { dateStr: today, timeStr: nowTimeStr } = getCurrentDateTime();

  // Перевіряємо час ТІЛЬКИ якщо обрана дата — це сьогодні
  if (selectedDate.value === today) {
    // Якщо обраний час менший за поточний
    if (selectedTime.value < nowTimeStr) {
      let slotToSet: string | null = null;

      // Знаходимо найближчий наступний слот (00 або 30) після поточного часу
      for (const slot of availableTimeSlots.value) {
        if (slot > nowTimeStr) {
          slotToSet = slot;
          break;
        }
      }

      // Встановлюємо найближчий слот, або 00:00 (якщо зараз > 23:30)
      selectedTime.value = slotToSet || availableTimeSlots.value[0];
    }
  }
};

// Ініціалізація часу, якщо він не встановлений (щоб уникнути пустого селекта)
if (!selectedTime.value && availableTimeSlots.value.length > 0) {
  // Встановлюємо сьогоднішню дату і викликаємо валідацію, щоб отримати найближчий час
  selectedDate.value = minDate.value;
  validateTime();
  if (!selectedTime.value) {
    selectedTime.value = availableTimeSlots.value[0];
  }
}

// --- КІНЕЦЬ ЛОГІКИ ВАЛІДАЦІЇ ---

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
              <input
                type="date"
                v-model="selectedDate"
                :min="minDate"
                @blur="validateDate"
                required
              />
            </label>
            <label>
              Час
              <select v-model="selectedTime" @change="validateTime" required>
                <option :value="null" disabled>Оберіть час</option>
                <option
                  v-for="time in availableTimeSlots"
                  :key="time"
                  :value="time"
                >
                  {{ time }}
                </option>
              </select>
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
