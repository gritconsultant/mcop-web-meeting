<template>
  <header class="app-header">
    <div class="app-header__bar">
      <UCIconButton
        icon="i-lucide-menu"
        label="สลับเมนู"
        size="lg"
        @click="layout.toggleSidebar"
      />

      <div class="app-header__title">
        <span>ระบบสหกรณ์ออมทรัพย์</span>
        <span class="app-header__title-sep">|</span>
        <span>ชื่อสหกรณ์</span>
      </div>

      <div class="app-header__actions">
        <UCNotificationBell />
        <UCHeaderSeparator />
        <UCHeaderUserMenu
          :display-name="auth.displayName || 'ผู้ใช้งาน'"
          :items="userMenu"
        />
        <UCHeaderSeparator light />
        <UCIconButton
          icon="i-lucide-log-out"
          label="ออกจากระบบ"
          @click="onLogout"
        />
      </div>
    </div>

    <div class="app-header__meta">
      <div class="app-header__meta-en">
        The Savings and Credit Cooperative of Royal Thai Police Headquarters
        Limited
      </div>
      <div class="app-header__meta-app">
        APP : Meeting
        <span class="app-header__meta-sep">|</span>
        Coop :
        {{ auth.profile?.email ?? auth.user?.username ?? "-" }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const layout = useLayoutStore();
const auth = useAuthStore();
const { logout } = useAuth();

const userMenu = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: auth.displayName || "ผู้ใช้งาน",
      avatar: {
        src: auth.profile?.profile_image?.url || undefined,
        alt: auth.displayName || "ผู้ใช้",
      },
      type: "label",
    },
  ],
  [
    {
      label: "เปลี่ยนรหัสผ่าน",
      icon: "i-lucide-key-round",
      onSelect: () => navigateTo("/change-password"),
    },
  ],
  [
    {
      label: "ออกจากระบบ",
      icon: "i-lucide-log-out",
      color: "error",
      onSelect: onLogout,
    },
  ],
]);

const onLogout = async () => {
  const isConfirm = await showAlertLogout({
    type: "logout",
    title: "ออกจากระบบ",
    text: "คุณต้องออกจากระบบใช่หรือไม่?",
  });
  if (!isConfirm) return;

  await logout();
  showAlert({
    title: "ออกจากระบบแล้ว",
    type: "success",
    isToast: true,
  });
};
</script>
