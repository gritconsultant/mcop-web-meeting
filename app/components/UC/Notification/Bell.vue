<template>
  <UPopover :content="{ align: 'end', sideOffset: 8 }">
    <UCIconButton
      icon="i-lucide-bell"
      label="การแจ้งเตือน"
      :size="size"
      :tone="tone"
    />

    <template #content>
      <div class="w-80 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
        <div
          class="flex items-center justify-between border-b border-neutral-100 px-4 py-3"
        >
          <h3 class="text-sm font-bold text-[#222]">การแจ้งเตือน</h3>
          <span
            v-if="items.length"
            class="rounded-full bg-[#811919]/10 px-2 py-0.5 text-[10px] font-bold text-[#811919]"
          >
            {{ items.length }}
          </span>
        </div>

        <div v-if="!items.length" class="px-4 py-10 text-center">
          <UIcon
            name="i-lucide-bell-off"
            class="mx-auto size-8 text-neutral-300"
          />
          <p class="mt-3 text-sm font-medium text-neutral-600">
            ยังไม่มีการแจ้งเตือน
          </p>
          <p class="mt-1 text-xs text-neutral-400">
            เมื่อมีรายการใหม่ จะแสดงที่นี่
          </p>
        </div>

        <ul v-else class="max-h-80 divide-y divide-neutral-100 overflow-y-auto">
          <li
            v-for="item in items"
            :key="item.id"
            class="px-4 py-3 transition hover:bg-neutral-50"
          >
            <p class="text-sm font-medium text-[#222]">{{ item.title }}</p>
            <p v-if="item.description" class="mt-0.5 text-xs text-neutral-500">
              {{ item.description }}
            </p>
            <p v-if="item.time" class="mt-1 text-[10px] text-neutral-400">
              {{ item.time }}
            </p>
          </li>
        </ul>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
}

withDefaults(
  defineProps<{
    items?: NotificationItem[];
    size?: "sm" | "md" | "lg";
    tone?: "light" | "dark" | "muted";
  }>(),
  {
    items: () => [],
    size: "md",
    tone: "light",
  },
);
</script>
