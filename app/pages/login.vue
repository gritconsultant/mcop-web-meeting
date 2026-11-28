<template>
  <div
    class="font-noto-sans-thai relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10"
  >
    <LoginBackground />

    <div
      class="animate-fade-up relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 sm:max-w-xl sm:p-8 md:max-w-2xl md:p-10"
      style="animation-delay: 80ms"
    >
      <LoadingCardOverlay
        :loading="ssoLoading"
        title="กำลังเชื่อมต่อระบบ SSO..."
      />

      <header
        class="h-29.5 -mx-6 -mt-6 flex items-center gap-3 rounded-t-2xl bg-cover bg-center bg-no-repeat px-6 py-6 sm:-mx-8 sm:-mt-8 sm:gap-4 sm:px-8 sm:py-8 md:-mx-10 md:-mt-10 md:px-10 md:py-10"
        :style="{ backgroundImage: `url(${bgLoginUrl})` }"
      >
        <img
          :src="logoUrl"
          alt="โลโก้สหกรณ์"
          class="animate-fade-up h-10 w-auto shrink-0 object-contain sm:h-14 md:h-16"
          style="animation-delay: 80ms"
        />
        <div class="animate-fade-up min-w-0" style="animation-delay: 160ms">
          <h1
            class="font-noto-sans-thai text-base font-bold leading-snug tracking-tight text-white sm:text-xl md:text-[30px]"
          >
            สหกรณ์ออมทรัพย์ตำรวจแห่งชาติ จำกัด
          </h1>
          <p
            class="font-noto-sans-thai mt-1 text-[9px] font-medium leading-relaxed tracking-wide text-white sm:text-[10px] md:text-xs"
          >
            The Savings and Credit Cooperative of Royal Thai Police Headquarters
            Limited
          </p>
        </div>
      </header>

      <div class="mx-auto flex w-full max-w-100 flex-col items-center">
        <h2
          class="font-noto-sans-thai animate-fade-up mt-12 text-center text-base font-bold text-[#222222] sm:text-3xl md:text-[32px]"
          style="animation-delay: 240ms"
        >
          ระบบประชุม
        </h2>

        <div
          class="font-noto-sans-thai animate-fade-up mt-4 text-center text-base text-[#222222] sm:text-lg md:text-[16px]"
          style="animation-delay: 240ms"
        >
          ลงชื่อเข้าใช้งาน
        </div>

        <div
          v-if="isNoAccess"
          role="alert"
          class="mt-6 w-full rounded-xl bg-[#F9F9F9] p-4 text-center"
        >
          <p class="font-sarabun text-base font-semibold text-[#811919]">
            บัญชีนี้ยังไม่มีสิทธิ์เข้าใช้งานระบบประชุม
          </p>
          <p class="mt-1 text-xs text-[#7C7C7C]">
            กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าใช้งาน
          </p>
        </div>

        <div v-if="ssoEnabled" class="mt-6 w-full">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            block
            size="lg"
            icon="i-lucide-log-in"
            :disabled="ssoLoading"
            :ui="{
              base: 'h-[40px] justify-center rounded-[6px] border-[#0066DA] font-semibold text-[#0066DA] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0066DA]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066DA]/50 focus-visible:ring-offset-2',
            }"
            @click="() => loginWithSso({ prompt: 'login' })"
          >
            เข้าสู่ระบบด้วย SSO
          </UButton>
        </div>

        <div
          v-else
          role="alert"
          class="mt-6 w-full rounded-xl bg-[#F9F9F9] p-4 text-center"
        >
          <p class="font-sarabun text-base font-semibold text-[#811919]">
            ระบบเข้าสู่ระบบยังไม่พร้อมใช้งาน
          </p>
          <p class="mt-1 text-xs text-[#7C7C7C]">
            กรุณาติดต่อผู้ดูแลระบบของสหกรณ์
          </p>
        </div>

        <p
          class="animate-fade-up mt-4 text-center text-[10px] text-[#7C7C7C]"
          style="animation-delay: 0.6s"
        >
          © {{ new Date().getFullYear() }} สหกรณ์ออมทรัพย์ตำรวจแห่งชาติ จำกัด
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoUrl from "~/assets/images/logo.svg";
import bgLoginUrl from "~/assets/images/bg_login.svg";
import { showAlert } from "~/utils/alert";
import {
  consumeAutoLoginSuppression,
  rememberReturnTo,
} from "~/utils/auth/keycloakSso";
import { MEETING_NO_ACCESS_ERROR } from "~/utils/auth/role";

definePageMeta({ layout: "login", public: true });

useHead({ title: "เข้าสู่ระบบ — ระบบประชุม" });

const route = useRoute();
const isNoAccess = computed(() => route.query.error === MEETING_NO_ACCESS_ERROR);
const { isEnabled: ssoEnabled, startLogin } = useKeycloakSso();
const ssoLoading = ref(false);

const loginWithSso = async (options?: { prompt?: string }) => {
  if (ssoLoading.value) return;
  ssoLoading.value = true;
  try {
    const isManual = route.query.manual === "1" || Boolean(route.query.error);
    const prompt = options?.prompt ?? (isManual ? "login" : undefined);
    await startLogin(prompt ? { prompt } : undefined);
  } catch {
    ssoLoading.value = false;
    showAlert({
      type: "error",
      title: "ไม่สามารถเชื่อมต่อระบบ SSO ได้",
      text: "กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ",
      isToast: true,
    });
  }
};

const resetSsoLoading = () => {
  ssoLoading.value = false;
};

onMounted(() => {
  window.addEventListener("pageshow", resetSsoLoading);
  rememberReturnTo(route.query.returnTo);

  const isManualMode =
    route.query.manual === "1" || Boolean(route.query.error);
  if (ssoEnabled.value && !isManualMode && !consumeAutoLoginSuppression()) {
    void loginWithSso();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("pageshow", resetSsoLoading);
});
</script>
