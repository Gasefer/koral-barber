<script setup lang="ts">
import {
  useBookingStore,
  type IService,
  type IOrderData,
} from "~/stores/useBookingStore";
import { storeToRefs } from "pinia";

interface TimeSlot {
  time: string;
  reserved_at: string | null;
}

interface DateSlot {
  date: string;
  times: TimeSlot[];
}

interface Props {
  services: IService[];
  dates: DateSlot[]; // Використовуємо новий інтерфейс
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

const formatDayAndDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Перевірка на валідність дати, хоча вона має бути валідна, оскільки приходить з бекенду
  if (isNaN(date.getTime())) {
    return dateString;
  }

  // Використовуємо "uk-UA" для отримання української назви дня тижня та місяця
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // Пн, Вт, Ср, ...
    day: "2-digit", // 08
    month: "short", // Гру
  };

  const formatted = date.toLocaleDateString("uk-UA", options);

  // Приведення першої літери дня тижня до верхнього регістру,
  // і заміна 'гр.' на 'гру.' для кращого вигляду
  return (
    formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(".", "")
  );
};

/**
 * Обчислюваний список часових слотів для обраної дати.
 */
const selectedDateSlots = computed<TimeSlot[]>(() => {
  if (!selectedDate.value) {
    return [];
  }
  const dateSlot = props.dates.find((d) => d.date === selectedDate.value);
  return dateSlot ? dateSlot.times : [];
});

const selectServiceAndNext = (id: string) => {
  // Встановлюємо послугу через setter, який вже викликає setService(service)
  selectedServiceId.value = id;

  // Оскільки setService() був викликаний, isStepComplete тепер true,
  // і ми можемо перейти на наступний крок.
  if (bookingStore.isStepComplete) {
    nextStep();
  }
};

// Автоматично обираємо перший день, якщо дата ще не обрана.
// Виконується тільки на початку.
if (!selectedDate.value && props.dates.length > 0) {
  selectedDate.value = props.dates[0].date;
}

// Перевіряємо, чи обраний час валідний для нової дати.
watch(selectedDate, (newDate) => {
  // Якщо обрано нову дату, але раніше обраний час недоступний або зайнятий, скидаємо час.
  if (newDate) {
    const currentSlots =
      props.dates.find((d) => d.date === newDate)?.times || [];

    const isTimeStillAvailable = currentSlots.some(
      (slot) => slot.time === selectedTime.value && slot.reserved_at === null
    );

    if (!isTimeStillAvailable) {
      selectedTime.value = null; // Скидаємо, якщо час зайнятий або недоступний
    }
  }
});

// --- КІНЕЦЬ НОВОЇ ЛОГІКИ ДАТИ ТА ЧАСУ ---

// Видалено: minDate, validateDate, validateTime, availableTimeSlots
// Збережено: watch для setDateAndTime та логіка контакту й сабміту

watch([selectedDate, selectedTime], ([newDate, newTime]) => {
  setDateAndTime(newDate, newTime);
});

const contactForm = reactive<Pick<IOrderData, "name" | "phone" | "email">>({
  name: orderData.value.name,
  phone: orderData.value.phone,
  email: orderData.value.email,
});

watch(
  contactForm,
  (newForm) => {
    setContactInfo(newForm);
  },
  { deep: true }
);

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
              @click="selectServiceAndNext(service.id)"
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
                <strong v-if="service?.price">{{ service.price }} грн</strong>
              </label>
            </li>
          </ul>
        </div>

        <div v-show="currentStep === 2" class="booking-modal__step step-2">
          <h3>Оберіть дату та час</h3>
          <div class="datepicker-placeholder">
            <div class="time-selector">
              <label>
                Дата
                <select v-model="selectedDate" required>
                  <option :value="null" disabled>Оберіть дату</option>
                  <option
                    v-for="dateSlot in props.dates"
                    :key="dateSlot.date"
                    :value="dateSlot.date"
                  >
                    {{ formatDayAndDate(dateSlot.date) }}
                  </option>
                </select>
              </label>
            </div>

            <div class="time-selector" v-if="selectedDate">
              <label>
                Час
                <select v-model="selectedTime" required>
                  <option :value="null" disabled>Оберіть час</option>
                  <option
                    v-for="timeSlot in selectedDateSlots"
                    :key="timeSlot.time"
                    :value="timeSlot.time"
                    :disabled="!!timeSlot.reserved_at"
                    :class="{ 'is-reserved': !!timeSlot.reserved_at }"
                  >
                    {{ timeSlot.time }}
                    <span v-if="!!timeSlot.reserved_at" style="color: grey"
                      >(Зайнято)</span
                    >
                  </option>
                </select>
              </label>
            </div>
          </div>
          <p v-if="!selectedDate" style="margin-top: 10px; color: #555">
            Оберіть дату, щоб побачити доступний час.
          </p>

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
              Email
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
            v-if="currentStep > 1 && currentStep < 3"
            type="button"
            class="next-btn"
            :disabled="!isStepComplete"
            @click="nextStep"
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
