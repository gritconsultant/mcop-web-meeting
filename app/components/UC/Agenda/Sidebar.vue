<template>
  <aside v-if="open" class="w-72 shrink-0 border-r border-[#E4E7ED] pr-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold">{{ title }}</h2>
      <UCIconButton
        icon="i-lucide-chevron-left"
        label="ซ่อนระเบียบวาระ"
        tone="light"
        class="size-8! bg-[#3a3a3a] hover:bg-[#3a3a3a]! hover:opacity-100!"
        @click="open = false"
      />
    </div>

    <ul class="space-y-1 text-sm">
      <li v-for="a in agendas" :key="a.id">
        <p
          class="px-3 py-2 font-bold"
          :class="{ 'text-[#7C7C7C]': !a.topics.some((t) => t.id === active) }"
        >
          {{ a.title }}
        </p>
        <ul v-if="a.topics.length" class="ml-3 border-l-2 border-[#AFAFAF]">
          <li v-for="t in a.topics" :key="t.id">
            <button
              type="button"
              class="-ml-0.5 block w-full truncate border-l-4 px-3 py-2 text-left"
              :class="
                t.id === active
                  ? 'border-[#1A1E24] bg-[#f3f3f3] font-medium'
                  : 'border-transparent text-[#7C7C7C] hover:bg-black/5'
              "
              @click="active = t.id"
            >
              {{ t.title }}
            </button>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    agendas: {
      id: string;
      title: string;
      topics: { id: string; title: string }[];
    }[];
    title?: string;
  }>(),
  { title: "ระเบียบวาระ" },
);

const open = defineModel<boolean>("open", { default: true });
const active = defineModel<string>("active");
</script>
