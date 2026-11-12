<template>
  <div
    class="font-noto-sans-thai relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6"
  >
    <LoginBackground />

    <section
      class="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-black/5"
      aria-live="polite"
    >
      <img :src="logoUrl" alt="โลโก้สหกรณ์" class="mx-auto h-16" />

      <div class="mt-6 space-y-4">
        <Icon
          name="lucide:circle-alert"
          class="mx-auto size-12 text-[#D14343]"
        />
        <h1 class="text-xl font-semibold text-black-900">
          ระบบ SSO ยังไม่เปิดใช้งาน
        </h1>
        <p class="text-sm text-[#7C7C7C]">
          กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้งานและรหัสผ่าน
        </p>
        <NuxtLink
          to="/login?manual=1"
          class="inline-flex rounded-[6px] bg-[#0066DA] px-5 py-2.5 font-semibold text-white transition hover:bg-[#0055B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066DA]/50 focus-visible:ring-offset-2"
        >
          กลับหน้าเข้าสู่ระบบ
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import logoUrl from "~/assets/images/logo.svg";

/**
 * Keycloak SSO callback — เตรียม route ไว้แล้ว
 * เมื่อพร้อมเปิด SSO ให้คืน logic completeLogin จาก mcop-web-hrm
 */
definePageMeta({
  layout: "login",
  public: true,
});

useHead({ title: "ยืนยัน SSO — ระบบประชุม" });
</script>
