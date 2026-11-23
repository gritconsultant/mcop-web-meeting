<template>
  <UCSkeletonPageDetail v-if="!meeting && !loadFailed" />
  <div v-else-if="meeting" class="space-y-4">
    <UCBreadcrumb :items="breadcrumb" />

    <UCPageHeader :title="`รายงานการประชุม ครั้งที่ ${meetingNo}`">
      <template #actions>
        <UCButtonDownloadFile
          label="ดาวน์โหลดไฟล์รายงาน"
          :options="downloadItems"
        />
        <UCButtonDownloadFile
          label="ดาวน์โหลดไฟล์มติเฉพาะ"
          :options="downloadItems"
        />
      </template>

      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <UCDescriptionList :items="metaItems" />
        <UCButton label="รายชื่อผู้เข้าประชุม" @click="attendeeOpen = true" />
      </div>
    </UCPageHeader>

    <MeetingAttendeeModal
      :open="attendeeOpen"
      :meeting-id="String(route.params.id)"
      @close="attendeeOpen = false"
    />

    <div class="flex gap-6">
      <UCAgendaSidebar
        v-model:open="agendaOpen"
        v-model:active="activeTopicId"
        :agendas="agendas"
      />

      <section class="min-w-0 flex-1 space-y-4">
        <div class="flex items-center gap-3">
          <UCIconButton
            v-if="!agendaOpen"
            icon="i-lucide-chevron-right"
            label="แสดงระเบียบวาระ"
            tone="light"
            class="size-8! bg-[#3a3a3a] hover:bg-[#3a3a3a]! hover:opacity-100!"
            @click="agendaOpen = true"
          />
          <h2 class="text-lg font-bold">{{ activeAgenda?.title }}</h2>
        </div>

        <UCCard :title="activeTopic?.title">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-bold">{{ activeTopic?.heading }}</h3>
              <UCButton
                type="edit-warning"
                icon="i-lucide-square-pen"
                label="แก้ไขมติ"
                :active="isEditing"
                @click="onToggleEdit"
              />
            </div>

            <UCCard title="สาระสำคัญ / รายละเอียด" accordion>
              <div
                class="space-y-4 text-sm leading-6"
                v-html="topicDetailHtml"
              />
            </UCCard>

            <h3 class="text-lg font-bold">ไฟล์ที่เกี่ยวข้อง</h3>
            <div class="flex flex-wrap gap-3">
              <UCUploadFileCard
                v-for="f in activeTopic?.files"
                :key="f.id"
                :href="f.url"
                :name="f.file_names"
                :size-label="`${f.convert_size} - ${formatDate(f.created_at, 'th_dmy_time')}`"
              />
            </div>

            <div class="space-y-2">
              <p class="text-sm">
                บันทึกมติที่ประชุม ของ{{ activeTopic?.title }}
              </p>
              <UCInput
                v-model="resolution"
                multiline
                :rows="3"
                :disabled="!isEditing"
                placeholder="ที่ประชุมรับทราบ"
              />
              <div v-if="isEditing" class="flex justify-end gap-2">
                <UCButton label="ยกเลิก" @click="onToggleEdit" />
                <UCButton type="primary" label="บันทึก" disabled />
              </div>
            </div>
          </div>
        </UCCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from "#shared/types/api";
import type { MeetingDetail } from "#shared/types/meeting";
import DOMPurify from "dompurify";
import service from "~/service";
import { formatDate } from "~/utils/format/date";

const route = useRoute();
const meeting = ref<MeetingDetail>();
const loadFailed = ref(false);

const meetingNo = computed(
  () =>
    `${meeting.value?.meeting_no}/${meeting.value?.meeting_set?.year ?? "-"}`,
);

const agendas = computed(() =>
  (meeting.value?.agendas ?? []).map((a) => ({
    id: a.id,
    title: `ระเบียบวาระที่ ${a.agenda_no} ${a.agenda_title ?? a.agenda_type_name}`,
    topics: a.topics.map((t) => ({
      ...t,
      heading: t.title,
      title: `เรื่องที่ ${t.topic_no} ${t.title}`,
    })),
  })),
);

const breadcrumb = computed(() => [
  { label: "รายงานการประชุม", to: "/reports" },
  { label: meetingNo.value },
]);

const metaItems = computed(() => {
  const m = meeting.value!;
  const end = m.end_at ? ` - ${formatDate(m.end_at, "time")}` : "";
  return [
    {
      label: "วันที่ประชุม",
      value: `${formatDate(m.start_at)}  ${formatDate(m.start_at, "time")}${end}`,
    },
    { label: "คณะ", value: m.meeting_committee?.name ?? "-" },
    { label: "สถานที่", value: m.location },
  ];
});

const downloadItems = [
  { id: "pdf", name: "ดาวน์โหลดไฟล์ PDF" },
  { id: "excel", name: "ดาวน์โหลดไฟล์ Excel" },
];

const attendeeOpen = ref(false);
const agendaOpen = ref(true);
const activeTopicId = ref("");
const resolution = ref("");
const isEditing = ref(false);

const activeAgenda = computed(() =>
  agendas.value.find((a) => a.topics.some((t) => t.id === activeTopicId.value)),
);
const activeTopic = computed(() =>
  activeAgenda.value?.topics.find((t) => t.id === activeTopicId.value),
);
const topicDetailHtml = computed(() =>
  DOMPurify.sanitize(activeTopic.value?.detail ?? ""),
);

const onToggleEdit = () => {
  isEditing.value = !isEditing.value;
  resolution.value = activeTopic.value?.resolution_note ?? "";
};

watch(activeTopic, (t) => {
  resolution.value = t?.resolution_note ?? "";
  isEditing.value = false;
});

const getInfo = async () => {
  const id = String(route.params.id);
  meeting.value = undefined;
  loadFailed.value = false;
  try {
    const resp = (await service.meeting.getMeeting(
      id,
    )) as ApiResponse<MeetingDetail>;
    if (id !== String(route.params.id)) return;
    meeting.value = resp.data;
    activeTopicId.value = agendas.value[0]?.topics[0]?.id ?? "";
  } catch (err) {
    if (id !== String(route.params.id)) return;
    loadFailed.value = true;
    if (normalizeApiError(err).status === 404) {
      showError({ statusCode: 404, statusMessage: "Page Not Found" });
    }
  }
};

onMounted(() => watch(() => route.params.id, getInfo, { immediate: true }));
</script>
