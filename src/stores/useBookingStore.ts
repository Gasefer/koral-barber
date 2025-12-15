// useBookingStore.ts

import { defineStore } from "pinia";

export interface IService {
  id: string;
  name: string;
  price: number;
}

export interface IOrderData {
  service: IService | null;
  date: string | null;
  time: string | null;
  name: string;
  phone: string;
  email: string;
}

const DUMMY_SERVICES: IService[] = [
  { id: "1", name: "Базовий манікюр", price: 450 },
  { id: "2", name: "Манікюр + Гель-лак", price: 700 },
  { id: "3", name: "Педикюр", price: 600 },
  { id: "4", name: "Нарощування нігтів", price: 950 },
];

export const useBookingStore = defineStore("bookingStore", () => {
  // State
  const isModalOpen = ref(false);
  const currentStep = ref<1 | 2 | 3>(1);
  const orderData = reactive<IOrderData>({
    service: null,
    date: null,
    time: null,
    name: "",
    phone: "",
    email: "",
  });

  const services = ref<IService[]>(DUMMY_SERVICES);
  const isLoading = ref(false); // Залишаємо, щоб компонент міг його змінювати
  const error = ref<string | null>(null); // Залишаємо, щоб компонент міг його змінювати // Getters

  const isStepComplete = computed(() => {
    switch (currentStep.value) {
      case 1:
        return !!orderData.service;
      case 2:
        return !!(orderData.date && orderData.time);
      case 3: // УВАГА: Тут валідація має бути суворішою, ніж просто перевірка наявності об'єкта
        return !!(
          orderData.name &&
          orderData.phone &&
          orderData.name.trim() !== "" &&
          orderData.phone.trim() !== ""
        );
      default:
        return false;
    }
  });

  const stepTitle = computed(() => {
    switch (currentStep.value) {
      case 1:
        return "Крок 1: Вибір послуги";
      case 2:
        return "Крок 2: Вибір дати та часу";
      case 3:
        return "Крок 3: Ваші контактні дані";
      default:
        return "";
    }
  }); // Actions

  function openModal() {
    isModalOpen.value = true;
    currentStep.value = 1;
    if (import.meta.client) {
      document.body.classList.add("no-scroll");
    }
  }

  function closeModal() {
    isModalOpen.value = false;
    currentStep.value = 1; // Очищуємо всі дані
    orderData.service = null;
    orderData.date = null;
    orderData.time = null;
    orderData.name = "";
    orderData.phone = "";
    orderData.email = "";
    error.value = null; // Скидаємо помилку при закритті

    if (import.meta.client) {
      document.body.classList.remove("no-scroll");
    }
  }

  function nextStep() {
    if (currentStep.value < 3 && isStepComplete.value) {
      currentStep.value = (currentStep.value + 1) as 1 | 2 | 3;
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      if (currentStep.value === 2) {
        orderData.date = null;
        orderData.time = null;
      }
      currentStep.value = (currentStep.value - 1) as 1 | 2 | 3;
    }
  }

  function setService(service: IService | null) {
    orderData.service = service;
  }

  function setDateAndTime(date: string | null, time: string | null) {
    orderData.date = date;
    orderData.time = time;
  }

  function setContactInfo(info: {
    name: string;
    phone: string;
    email: string;
  }) {
    orderData.name = info.name;
    orderData.phone = info.phone;
    orderData.email = info.email;
  }

  return {
    isModalOpen,
    currentStep,
    orderData,
    isStepComplete,
    stepTitle,
    services,
    isLoading,
    error,
    openModal,
    closeModal,
    nextStep,
    prevStep,
    setService,
    setDateAndTime,
    setContactInfo,
  };
});
