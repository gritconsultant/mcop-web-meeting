<template>
  <div class="meeting-form-review flex flex-col gap-5">
    <section class="meeting-form-panel">
      <h2 class="meeting-form-panel__title">ข้อมูลการประชุม</h2>
      <dl class="meeting-form-review__grid">
        <div>
          <dt>ชุด</dt>
          <dd>{{ info.setLabel || "-" }}</dd>
        </div>
        <div>
          <dt>คณะ</dt>
          <dd>{{ info.committeeLabel || "-" }}</dd>
        </div>
        <div>
          <dt>ครั้งที่</dt>
          <dd>{{ info.meetingNoLabel || "-" }}</dd>
        </div>
        <div>
          <dt>วันที่ประชุม</dt>
          <dd>{{ info.meetingDate || "-" }}</dd>
        </div>
        <div>
          <dt>เวลาเริ่มต้น</dt>
          <dd>{{ info.startTime || "-" }}</dd>
        </div>
        <div>
          <dt>สถานที่</dt>
          <dd>{{ info.location || "-" }}</dd>
        </div>
      </dl>
    </section>

    <section class="meeting-form-panel">
      <h2 class="meeting-form-panel__title">เชิญประชุม</h2>
      <dl class="meeting-form-review__grid">
        <div>
          <dt>กำหนดส่งอัตโนมัติ</dt>
          <dd>{{ remindLabel }}</dd>
        </div>
        <div>
          <dt>ช่องทาง</dt>
          <dd>{{ channelLabel }}</dd>
        </div>
        <div>
          <dt>ผู้รับคำเชิญ</dt>
          <dd>{{ invite.selectedCount }}/{{ invite.totalCount }} ท่าน</dd>
        </div>
        <div>
          <dt>URL การประชุม</dt>
          <dd>{{ invite.meetingUrl || "-" }}</dd>
        </div>
      </dl>
    </section>

    <section class="meeting-form-panel">
      <h2 class="meeting-form-panel__title mb-3">ระเบียบวาระ</h2>

      <div
        v-if="!agendas.length"
        class="text-sm text-[#7c7c7c]"
      >
        ยังไม่มีระเบียบวาระ
      </div>

      <div
        v-else
        class="meeting-form-agenda flex w-full items-start gap-5"
        :class="{ 'meeting-form-agenda--collapsed': navCollapsed }"
      >
        <aside
          class="meeting-form-agenda__nav flex w-[340px] max-w-[340px] shrink-0 flex-col gap-3 self-stretch border-r-[0.7px] border-[#afafaf] bg-white px-3 pb-5"
        >
          <div class="flex w-full items-center gap-3">
            <h3
              class="m-0 min-w-0 flex-1 text-xl font-bold leading-tight text-[#222]"
            >
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
              v-for="(agenda, index) in agendas"
              :key="agenda.key"
              class="flex flex-col items-start"
            >
              <button
                type="button"
                class="flex h-10 w-full items-center rounded px-3 py-2 text-left text-sm font-bold"
                :class="
                  agenda.key === selectedAgendaKey
                    ? 'bg-[#edecec] text-[#222]'
                    : 'bg-transparent text-[#7c7c7c] hover:bg-[#fafafa]'
                "
                @click="selectAgenda(agenda.key)"
              >
                <span class="truncate">{{ agenda.label }}</span>
              </button>

              <template v-if="agenda.key === selectedAgendaKey">
                <button
                  v-for="(topic, topicIndex) in agenda.topics"
                  :key="topic.key"
                  type="button"
                  class="ml-3 flex h-10 w-[256px] max-w-[256px] items-center pl-3 text-left text-sm"
                  :class="
                    topic.key === selectedTopicKey
                      ? 'bg-[#f6f6f6] text-[#222]'
                      : 'rounded bg-white text-[#7c7c7c] hover:bg-[#fafafa]'
                  "
                  @click="selectTopic(agenda.key, topic.key)"
                >
                  <span
                    class="flex h-full min-w-0 flex-1 items-center border-l-2 py-1 pl-2.5 pr-1"
                    :class="
                      topic.key === selectedTopicKey
                        ? 'border-[#222]'
                        : 'border-[#afafaf]'
                    "
                  >
                    <span class="truncate">
                      เรื่องที่ {{ topicIndex + 1 }} {{ topic.title }}
                    </span>
                  </span>
                </button>
              </template>
            </div>
          </div>
        </aside>

        <div class="meeting-form-agenda__detail min-w-0 flex-1">
          <div
            v-if="!selectedTopic"
            class="flex min-h-[360px] items-center justify-center text-sm text-[#222]"
          >
            กรุณาเลือกระเบียบวาระ
          </div>

          <template v-else>
            <div class="mb-2.5 flex h-10 items-center py-1">
              <h3
                class="m-0 min-w-0 flex-1 text-xl font-bold leading-tight text-[#222]"
              >
                {{ selectedAgenda?.label || "ระเบียบวาระ" }}
              </h3>
            </div>

            <div class="overflow-hidden rounded-xl border border-[#afafaf]">
              <div
                class="flex h-[45px] items-center rounded-t-xl border-b border-[#afafaf] bg-[#f9f9f9] px-4"
              >
                <span
                  class="min-w-0 flex-1 truncate text-base font-bold text-[#222]"
                >
                  เรื่องที่ {{ selectedTopicIndex + 1 }}
                  {{ selectedTopic.title ? ` ${selectedTopic.title}` : "" }}
                </span>
              </div>

              <div class="flex flex-col gap-5 p-5">
                <h4
                  class="m-0 text-xl font-bold leading-tight text-[#222]"
                >
                  {{ selectedTopic.title || "-" }}
                </h4>

                <div class="overflow-hidden rounded-xl border border-[#afafaf]">
                  <button
                    type="button"
                    class="flex h-[45px] w-full items-center justify-between gap-3 bg-[#f9f9f9] px-4 text-left"
                    @click="detailOpen = !detailOpen"
                  >
                    <span class="text-base font-bold text-[#222]">
                      สาระสำคัญ / รายละเอียด
                    </span>
                    <UIcon
                      :name="
                        detailOpen
                          ? 'i-lucide-chevron-up'
                          : 'i-lucide-chevron-down'
                      "
                      class="size-6 shrink-0 text-[#222]"
                    />
                  </button>
                  <div
                    v-show="detailOpen"
                    class="border-t border-[#afafaf] bg-white p-5"
                  >
                    <div
                      v-if="selectedTopic.detail"
                      class="meeting-form-review__detail prose max-w-none text-base leading-normal text-[#222]"
                      v-html="selectedTopic.detail"
                    />
                    <p v-else class="m-0 text-sm text-[#7c7c7c]">ไม่มีรายละเอียด</p>
                  </div>
                </div>

                <UCUpload
                  title="ไฟล์ที่เกี่ยวข้อง"
                  :currently-files="selectedTopic.files"
                  disabled
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  MeetingAgendaDraft,
  MeetingFormReviewInfo,
  MeetingFormReviewInvite,
} from "#shared/types/meeting";
import panelCollapseIcon from "~/assets/icon/meeting/panel-collapse.svg";

const props = defineProps<{
  info: MeetingFormReviewInfo;
  invite: MeetingFormReviewInvite;
  agendas: MeetingAgendaDraft[];
}>();

const selectedAgendaKey = ref<string | null>(null);
const selectedTopicKey = ref<string | null>(null);
const navCollapsed = ref(false);
const detailOpen = ref(true);

const selectedAgenda = computed(
  () => props.agendas.find((a) => a.key === selectedAgendaKey.value) ?? null,
);

const selectedTopic = computed(() => {
  const agenda = selectedAgenda.value;
  if (!agenda) return null;
  return agenda.topics.find((t) => t.key === selectedTopicKey.value) ?? null;
});

const selectedTopicIndex = computed(() => {
  const agenda = selectedAgenda.value;
  if (!agenda || !selectedTopicKey.value) return 0;
  const index = agenda.topics.findIndex(
    (t) => t.key === selectedTopicKey.value,
  );
  return index >= 0 ? index : 0;
});

const selectAgenda = (agendaKey: string) => {
  selectedAgendaKey.value = agendaKey;
  const first = props.agendas.find((a) => a.key === agendaKey)?.topics[0];
  selectedTopicKey.value = first?.key ?? null;
  detailOpen.value = true;
};

const selectTopic = (agendaKey: string, topicKey: string) => {
  selectedAgendaKey.value = agendaKey;
  selectedTopicKey.value = topicKey;
  detailOpen.value = true;
};

watch(
  () => props.agendas,
  (rows) => {
    if (!rows.length) {
      selectedAgendaKey.value = null;
      selectedTopicKey.value = null;
      return;
    }
    if (
      !selectedAgendaKey.value ||
      !rows.some((r) => r.key === selectedAgendaKey.value)
    ) {
      selectAgenda(rows[0]!.key);
    }
  },
  { immediate: true, deep: true },
);

const remindLabel = computed(() => {
  const parts: string[] = [];
  if (props.invite.remind7Days) parts.push("ก่อน 7 วัน");
  if (props.invite.remind2Days) parts.push("ก่อน 2 วัน");
  return parts.length ? parts.join(", ") : "-";
});

const channelLabel = computed(() => {
  const parts: string[] = [];
  if (props.invite.isEmail) parts.push("อีเมล");
  if (props.invite.isSms) parts.push("SMS");
  if (props.invite.isLine) parts.push("LINE");
  return parts.length ? parts.join(", ") : "-";
});
</script>

<style scoped>
.meeting-form-review__detail :deep(p) {
  margin: 0 0 0.75em;
}

.meeting-form-review__detail :deep(ul),
.meeting-form-review__detail :deep(ol) {
  margin: 0 0 0.75em;
  padding-left: 1.25rem;
}

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
