<template>
  <div class="meeting-form-agenda">
    <aside class="meeting-form-agenda__nav">
      <div class="meeting-form-agenda__nav-head">
        <h3>ระเบียบวาระ</h3>
      </div>

      <div v-if="agendas.length" class="meeting-form-agenda__list">
        <div
          v-for="agenda in agendas"
          :key="agenda.id"
          class="meeting-form-agenda__group"
        >
          <button
            type="button"
            class="meeting-form-agenda__group-title"
            :class="{ 'is-active': agenda.id === selectedAgendaId }"
            @click="selectAgenda(agenda.id)"
          >
            {{ agenda.label }}
          </button>
          <button
            v-for="topic in agenda.topics"
            :key="topic.id"
            type="button"
            class="meeting-form-agenda__topic"
            :class="{ 'is-active': topic.id === selectedTopicId }"
            @click="selectTopic(agenda.id, topic.id)"
          >
            {{ topic.title }}
          </button>
          <button
            type="button"
            class="meeting-form-agenda__add-topic"
            @click="onAddTopic(agenda.id)"
          >
            <UIcon name="i-lucide-plus" class="size-3.5" />
            เพิ่มเรื่อง
          </button>
        </div>
      </div>

      <button
        type="button"
        class="meeting-form-agenda__add"
        @click="onAddAgenda"
      >
        <UIcon name="i-lucide-plus" class="size-4" />
        เพิ่มระเบียบวาระ
      </button>
    </aside>

    <section class="meeting-form-agenda__detail">
      <div v-if="!selectedTopic" class="meeting-form-agenda__empty">
        กรุณาเลือกระเบียบวาระ
      </div>

      <template v-else>
        <div class="meeting-form-agenda__detail-head">
          <h2 class="meeting-form-panel__title">
            {{ selectedAgenda?.label || "ระเบียบวาระ" }}
          </h2>
          <UCButton type="delete" label="ลบระเบียบวาระ" @click="onDeleteAgenda" />
        </div>

        <div class="meeting-form-agenda__topic-card">
          <div class="meeting-form-agenda__topic-card-head">
            <span>{{ selectedTopic.title }}</span>
            <button
              type="button"
              class="meeting-form-agenda__topic-delete"
              aria-label="ลบเรื่อง"
              @click="onDeleteTopic"
            >
              <UIcon name="i-lucide-trash-2" class="size-4" />
            </button>
          </div>

          <div class="meeting-form-agenda__topic-card-body">
            <UCFormField label="ชื่อเรื่อง" name="topic_title" required>
              <UCInput
                v-model="selectedTopic.title"
                placeholder="กรอกชื่อเรื่อง"
              />
            </UCFormField>

            <div class="meeting-form-agenda__editor mt-4">
              <div class="meeting-form-agenda__accordion">
                <span>สาระสำคัญ / รายละเอียด</span>
                <UIcon name="i-lucide-chevron-up" class="size-5" />
              </div>
              <div class="meeting-form-agenda__editor-body">
                <UCFormField label="" name="topic_detail">
                  <UCInput
                    v-model="selectedTopic.detail"
                    multiline
                    :rows="10"
                    placeholder="กรอกรายละเอียดเรื่อง"
                  />
                </UCFormField>
              </div>
            </div>

            <div class="mt-4">
              <UCUpload
                title="ไฟล์ที่เกี่ยวข้อง"
                :currently-files="selectedTopic.files"
                multiple
              />
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { MeetingAgendaDraft } from "#shared/types/meeting";

const agendas = defineModel<MeetingAgendaDraft[]>("agendas", {
  required: true,
});

const selectedAgendaId = ref<string | null>(null);
const selectedTopicId = ref<string | null>(null);

const selectedAgenda = computed(
  () => agendas.value.find((a) => a.id === selectedAgendaId.value) ?? null,
);

const selectedTopic = computed(() => {
  const agenda = selectedAgenda.value;
  if (!agenda) return null;
  return agenda.topics.find((t) => t.id === selectedTopicId.value) ?? null;
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
          title: "เรื่องที่ 1",
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
  const topicNo = agenda.topics.length + 1;
  agenda.topics.push({
    id: topicId,
    title: `เรื่องที่ ${topicNo}`,
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
