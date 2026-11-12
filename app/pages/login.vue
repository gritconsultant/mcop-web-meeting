<template>
  <div
    class="font-noto-sans-thai relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10"
  >
    <LoginBackground />

    <div
      class="animate-fade-up relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 sm:max-w-xl sm:p-8 md:max-w-2xl md:p-10"
      style="animation-delay: 80ms"
    >
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
          class="font-noto-sans-thai animate-fade-up mt-12 text-center text-base font-bold text-black-900 sm:text-3xl md:text-[32px]"
          style="animation-delay: 240ms"
        >
          ระบบประชุม
        </h2>

        <div
          class="font-noto-sans-thai animate-fade-up mt-4 text-center text-base text-black-900 sm:text-lg md:text-[16px]"
          style="animation-delay: 240ms"
        >
          ลงชื่อเข้าใช้งาน
        </div>

        <!-- ชั่วคราว: กดเข้าได้เลย ยังไม่บังคับ login จริง -->
        <div class="mt-8 w-full">
          <UCButton
            type="primary"
            button-type="button"
            label="เข้าสู่ระบบ"
            class="w-full"
            @click="enterApp"
          />
        </div>

        <!-- TODO: เปิด form username/password + captcha เมื่อ AUTH_REQUIRED = true
        <UCForm ... />
        -->

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
import { DEFAULT_ROUTE } from "~/composables/useNavigation";

definePageMeta({ layout: "login", public: true });

const enterApp = async () => {
  await navigateTo(DEFAULT_ROUTE);
};
</script>
