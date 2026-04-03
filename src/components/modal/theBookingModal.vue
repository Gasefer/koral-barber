<script setup lang="ts">
import { vMaska } from "maska/vue";
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
  dates: DateSlot[];
  servicesData: any[];
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

const activeTab = ref(0);

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
  if (isNaN(date.getTime())) return dateString;

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };

  const formatted = date.toLocaleDateString("uk-UA", options);
  return (
    formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(".", "")
  );
};

const getDataValue = (dataArray, key) => {
  if (!Array.isArray(dataArray)) return null;
  return dataArray.find((d) => d.key === key)?.value;
};

const serviceLists = computed(() => {
  const lists = props.servicesData
    .filter((b) => b.type === "service-list")
    .map((listBlock) => {
      const title = getDataValue(listBlock.data, "title");
      const itemsBlock = listBlock.data.find((d) => d.key === "items");
      const itemsRaw = itemsBlock?.items || [];

      const items = itemsRaw
        .map((item) => {
          const name = getDataValue(item.data, "name");
          const price = getDataValue(item.data, "price");

          // Мапимо id з основного списку послуг за назвою
          const matchedService = props.services.find((s) => s.name === name);

          return {
            name: name || "Послуга",
            price: price || 0,
            id: matchedService?.id || null,
          };
        })
        .filter((item) => item.id); // Залишаємо тільки ті, що мають id

      return {
        title: title || "Категорія",
        items: items,
      };
    });

  return lists;
});

const selectedDateSlots = computed<TimeSlot[]>(() => {
  if (!selectedDate.value) return [];
  const dateSlot = props.dates.find((d) => d.date === selectedDate.value);
  return dateSlot ? dateSlot.times : [];
});

const selectServiceAndNext = (id: string) => {
  if (id == "srv-15" || id == "srv-16") {
    return;
  }

  selectedServiceId.value = id;
  if (bookingStore.isStepComplete) {
    nextStep();
  }
};

if (!selectedDate.value && props.dates.length > 0) {
  selectedDate.value = props.dates[0].date;
}

watch(selectedDate, (newDate, oldDate) => {
  if (oldDate && newDate !== oldDate) {
    selectedTime.value = null;
  }
});

watch([selectedDate, selectedTime], ([newDate, newTime]) => {
  setDateAndTime(newDate, newTime);
});

const contactForm = reactive<
  Pick<IOrderData, "name" | "phone" | "email" | "message">
>({
  name: orderData.value.name,
  phone: orderData.value.phone,
  email: orderData.value.email,
  message: orderData.value.message,
});

watch(contactForm, (newForm) => setContactInfo(newForm), { deep: true });

const handleSubmit = async () => {
  const { name, phone, email, message } = orderData.value;
  if (!isStepComplete.value) return;

  if (
    !orderData.value.service ||
    !orderData.value.date ||
    !orderData.value.time ||
    !name ||
    !phone
  ) {
    bookingStore.error = "Помилка: Заповніть усі обов'язкові поля.";
    return;
  }

  bookingStore.isLoading = true;
  bookingStore.error = null;

  try {
    const input = {
      reserved_at: `${orderData.value.date} ${orderData.value.time}`,
      name,
      phone,
      email: orderData.value.email || "",
      message,
      servises: `${orderData.value.service.name} ${orderData.value.service.price} грн`,
    };

    const response = await GqlCreateRequest({ input });
    const result = response?.createRequest;

    if (result && result.status === "success") {
      alert("Ваш запис успішно прийнято!✅");
      closeModal();
    } else {
      bookingStore.error = result?.message || "Невідома помилка сервера.";
    }
  } catch (err: any) {
    bookingStore.error = err.message || "Помилка зв'язку.";
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
          <div class="booking-modal__tabs">
            <button
              v-for="(list, index) in serviceLists"
              :key="index"
              type="button"
              class="booking-modal__tab"
              :class="{ 'booking-modal__tab--active': activeTab === index }"
              @click="activeTab = index"
            >
              {{ list.title }}
            </button>
          </div>

          <ul class="service-list">
            <li
              v-for="service in serviceLists[activeTab]?.items"
              :key="service.id"
              class="service-item"
              @click="selectServiceAndNext(service.id)"
            >
              <input
                v-if="service.id !== 'srv-15' && service.id !== 'srv-16'"
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
                <strong v-if="service?.price">{{ service.price }}</strong>
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
            <div class="time-selector time-selector--time" v-if="selectedDate">
              <div class="time-content">
                Час
                <div class="time-grid">
                  <div
                    v-for="timeSlot in selectedDateSlots"
                    :key="timeSlot.time"
                    class="time-slot"
                    :class="{
                      'is-reserved': !!timeSlot.reserved_at,
                      'is-selected': timeSlot.time === selectedTime,
                    }"
                    @click="
                      !timeSlot.reserved_at && (selectedTime = timeSlot.time)
                    "
                  >
                    {{ timeSlot.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <input
                type="tel"
                v-model="contactForm.phone"
                v-maska
                data-maska="+38 (###) ###-##-##"
                placeholder="+38 (099) 999-99-99"
                required
              />
            </label>
            <label>
              Email
              <input type="email" v-model="contactForm.email" />
            </label>
            <label>
              Коментар
              <textarea
                class="booking-modal__textarea"
                v-model="contactForm.message"
                placeholder="Введіть ваше повідомлення"
              />
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
