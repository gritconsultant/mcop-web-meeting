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

      <div v-if="processing" class="mt-6 space-y-3">
        <Icon
          name="lucide:loader-circle"
          class="mx-auto size-12 animate-spin text-[#0066DA]"
        />
        <h1 class="text-xl font-semibold text-[#222222]">
          กำลังยืนยันการเข้าสู่ระบบ SSO
        </h1>
        <p class="text-sm text-[#7C7C7C]">
          กรุณารอสักครู่
        </p>
      </div>

      <div v-else class="mt-6 space-y-4">
        <Icon
          name="lucide:circle-alert"
          class="mx-auto size-12 text-[#D14343]"
        />
        <h1 class="text-xl font-semibold text-[#222222]">
          ไม่สามารถเข้าสู่ระบบด้วย SSO ได้
        </h1>
        <p class="text-sm text-[#7C7C7C]">
          {{ errorMessage }}
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
import { DEFAULT_ROUTE } from "~/composables/useNavigation";
import { suppressAutoLogin, takeReturnTo } from "~/utils/auth/keycloakSso";
import {
  MEETING_NO_ACCESS_ERROR,
  isMeetingAccessDeniedError,
} from "~/utils/auth/role";

definePageMeta({
  layout: "login",
  public: true,
});

useHead({ title: "ยืนยัน SSO — ระบบประชุม" });

const route = useRoute();
const { completeLogin } = useKeycloakSso();
const { getProfile, ensureUser } = useAuth();
const { clearTokens } = useSession();
const store = useAuthStore();
const processing = ref(true);
const errorMessage = ref("โปรดเริ่มเข้าสู่ระบบใหม่อีกครั้ง");

onMounted(async () => {
  try {
    await completeLogin(route.query as Record<string, unknown>);
    ensureUser();
    await getProfile();
    await navigateTo(takeReturnTo(DEFAULT_ROUTE));
  } catch (error) {
    suppressAutoLogin();
    clearTokens();
    store.clearUser();
    if (isMeetingAccessDeniedError(error)) {
      await navigateTo({
        path: "/login",
        query: { error: MEETING_NO_ACCESS_ERROR },
      });
      return;
    }
    errorMessage.value =
      "การยืนยัน SSO ไม่สำเร็จ หรือไม่สามารถโหลดข้อมูลพนักงานได้ โปรดติดต่อผู้ดูแลระบบหรือลองใหม่อีกครั้ง";
    processing.value = false;
  }
});
</script>
