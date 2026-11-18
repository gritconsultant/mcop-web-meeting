<template>
  <div
    class="meeting-form-agenda flex w-full items-start gap-5"
    :class="{ 'meeting-form-agenda--collapsed': navCollapsed }"
  >
    <aside
      class="meeting-form-agenda__nav flex w-[340px] max-w-[340px] shrink-0 flex-col gap-3 self-stretch border-r-[0.7px] border-[#afafaf] bg-white px-3 pb-5"
    >
      <div class="flex w-full items-center gap-3">
        <h3 class="m-0 min-w-0 flex-1 text-xl font-bold leading-tight text-[#222]">
          ระเบียบวาระ
        </h3>
        <button
          type="button"
          class="inline-flex size-8 shrink-0 items-center justify-center"
          :aria-label="navCollapsed ? 'ขยายเมนู' : 'ยุบเมนู'"
          @click="navCollapsed = !navCollapsed"
        >
          <img
            :src="panelCollapseIcon"
            alt=""
            class="size-8 transition-transform"
            :class="{ 'rotate-180': navCollapsed }"
          />
        </button>
      </div>

      <div
        v-if="!navCollapsed"
        class="flex min-h-0 flex-1 flex-col overflow-auto"
      >
        <div
          v-for="agenda in agendas"
          :key="agenda.id"
          class="flex flex-col items-start"
        >
          <button
            type="button"
            class="flex h-10 w-full items-center rounded px-3 py-2 text-left text-sm font-bold"
            :class="
              agenda.id === selectedAgendaId
                ? 'bg-[#edecec] text-[#222]'
                : 'bg-transparent text-[#7c7c7c] hover:bg-[#fafafa]'
            "
            @click="selectAgenda(agenda.id)"
          >
            <span class="truncate">{{ agenda.label }}</span>
          </button>

          <template v-if="agenda.id === selectedAgendaId">
            <button
              v-for="(topic, topicIndex) in agenda.topics"
              :key="topic.id"
              type="button"
              class="ml-3 flex h-10 w-[256px] max-w-[256px] items-center pl-3 text-left text-sm"
              :class="
                topic.id === selectedTopicId
                  ? 'bg-[#f6f6f6] text-[#222]'
                  : 'rounded bg-white text-[#7c7c7c] hover:bg-[#fafafa]'
              "
              @click="selectTopic(agenda.id, topic.id)"
            >
              <span
                class="flex h-full min-w-0 flex-1 items-center border-l-2 py-1 pl-2.5 pr-1"
                :class="
                  topic.id === selectedTopicId
                    ? 'border-[#222]'
                    : 'border-[#afafaf]'
                "
              >
                <span class="truncate">
                  เรื่องที่ {{ topicIndex + 1 }} {{ topic.title }}
                </span>
              </span>
            </button>

            <div class="mt-2.5 flex w-full justify-end">
              <button
                type="button"
                class="inline-flex h-8 items-center justify-center gap-2 rounded-md border-[0.7px] border-[#7c7c7c] bg-white px-4 text-sm font-bold text-[#0066da]"
                @click="onAddTopic(agenda.id)"
              >
                <UIcon name="i-lucide-plus" class="size-5" />
                เพิ่มเรื่อง
              </button>
            </div>
          </template>
        </div>

        <div class="mt-6 flex w-full justify-end">
          <button
            type="button"
            class="inline-flex h-8 items-center justify-center gap-2 rounded-md border-[0.7px] border-[#7c7c7c] bg-white px-4 text-sm font-bold text-[#0066da]"
            @click="onAddAgenda"
          >
            <UIcon name="i-lucide-plus" class="size-5" />
            เพิ่มระเบียบวาระ
          </button>
        </div>
      </div>
    </aside>

    <section class="meeting-form-agenda__detail min-w-0 flex-1">
      <div
        v-if="!selectedTopic"
        class="flex min-h-[360px] items-center justify-center text-sm text-[#222]"
      >
        กรุณาเลือกระเบียบวาระ
      </div>

      <template v-else>
        <div class="mb-2.5 flex h-10 items-center justify-between gap-3 py-1">
          <h2 class="m-0 min-w-0 flex-1 text-xl font-bold leading-tight text-[#222]">
            {{ selectedAgenda?.label || "ระเบียบวาระ" }}
          </h2>
          <UCButton
            type="delete"
            label="ลบระเบียบวาระ"
            icon="i-lucide-trash-2"
            @click="onDeleteAgenda"
          />
        </div>

        <div class="overflow-hidden rounded-xl border border-[#afafaf]">
          <div
            class="flex h-[45px] items-center justify-between gap-3 rounded-t-xl border-b border-[#afafaf] bg-[#f9f9f9] px-4"
          >
            <span class="min-w-0 flex-1 truncate text-base font-bold text-[#222]">
              เรื่องที่ {{ selectedTopicIndex + 1 }}
            </span>
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center"
              aria-label="ลบเรื่อง"
              @click="onDeleteTopic"
            >
              <img :src="trashRedIcon" alt="" class="size-8" />
            </button>
          </div>

          <div class="flex flex-col gap-5 p-5">
            <div class="grid max-w-[580px] grid-cols-1">
              <UCFormField label="ชื่อเรื่อง" name="topic_title" required>
                <UCInput
                  v-model="selectedTopic.title"
                  placeholder="กรอกชื่อเรื่อง"
                />
              </UCFormField>
            </div>

            <UCFormField
              label="สาระสำคัญ / รายละเอียด"
              name="topic_detail"
              required
            >
              <UCEditor
                v-model="selectedTopic.detail"
                placeholder="กรอกรายละเอียดเรื่อง"
              />
            </UCFormField>

            <UCUpload
              title="ไฟล์ที่เกี่ยวข้อง"
              :currently-files="selectedTopic.files"
              multiple
            />
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { MeetingAgendaDraft } from "#shared/types/meeting";
import panelCollapseIcon from "~/assets/icon/meeting/panel-collapse.svg";
import trashRedIcon from "~/assets/icon/meeting/trash-red.svg";

const agendas = defineModel<MeetingAgendaDraft[]>("agendas", {
  required: true,
});

const selectedAgendaId = ref<string | null>(null);
const selectedTopicId = ref<string | null>(null);
const navCollapsed = ref(false);

const selectedAgenda = computed(
  () => agendas.value.find((a) => a.id === selectedAgendaId.value) ?? null,
);

const selectedTopic = computed(() => {
  const agenda = selectedAgenda.value;
  if (!agenda) return null;
  return agenda.topics.find((t) => t.id === selectedTopicId.value) ?? null;
});

const selectedTopicIndex = computed(() => {
  const agenda = selectedAgenda.value;
  if (!agenda || !selectedTopicId.value) return 0;
  const index = agenda.topics.findIndex((t) => t.id === selectedTopicId.value);
  return index >= 0 ? index : 0;
});

const selectAgenda = (agendaId: string) => {
  selectedAgendaId.value = agendaId;
  const first = agendas.value.find((a) => a.id === agendaId)?.topics[0];
  selectedTopicId.value = first?.id ?? null;
};

const selectTopic = (agendaId: string, topicId: string) => {
  selectedAgendaId.value = agendaId;
  selectedTopicId.value = topicId;
};

const onAddAgenda = () => {
  const no = agendas.value.length + 1;
  const agendaId = `agenda-${Date.now()}`;
  const topicId = `topic-${Date.now()}`;
  agendas.value = [
    ...agendas.value,
    {
      id: agendaId,
      label: `ระเบียบวาระที่ ${no} เรื่องอื่น ๆ`,
      agendaType: "other",
      topics: [
        {
          id: topicId,
          title: "",
          detail: "",
          files: [],
        },
      ],
    },
  ];
  selectedAgendaId.value = agendaId;
  selectedTopicId.value = topicId;
};

const onAddTopic = (agendaId: string) => {
  const agenda = agendas.value.find((a) => a.id === agendaId);
  if (!agenda) return;
  const topicId = `topic-${Date.now()}`;
  agenda.topics.push({
    id: topicId,
    title: "",
    detail: "",
    files: [],
  });
  selectedAgendaId.value = agendaId;
  selectedTopicId.value = topicId;
};

const onDeleteAgenda = () => {
  if (!selectedAgendaId.value) return;
  agendas.value = agendas.value.filter((a) => a.id !== selectedAgendaId.value);
};

const onDeleteTopic = () => {
  const agenda = selectedAgenda.value;
  if (!agenda || !selectedTopicId.value) return;
  agenda.topics = agenda.topics.filter((t) => t.id !== selectedTopicId.value);
  selectedTopicId.value = agenda.topics[0]?.id ?? null;
};

watch(
  agendas,
  (rows) => {
    if (!rows.length) {
      selectedAgendaId.value = null;
      selectedTopicId.value = null;
      return;
    }
    if (
      !selectedAgendaId.value ||
      !rows.some((r) => r.id === selectedAgendaId.value)
    ) {
      selectAgenda(rows[0]!.id);
    }
  },
  { immediate: true, deep: true },
);
</script>

<style scoped>
.meeting-form-agenda--collapsed .meeting-form-agenda__nav {
  width: 56px;
  max-width: 56px;
  padding-inline: 8px;
}

.meeting-form-agenda--collapsed .meeting-form-agenda__nav h3 {
  display: none;
}

@media (max-width: 960px) {
  .meeting-form-agenda {
    flex-direction: column;
  }

  .meeting-form-agenda__nav {
    width: 100% !important;
    max-width: none !important;
    border-right: 0;
    border-bottom: 0.7px solid #afafaf;
  }
}
</style>
