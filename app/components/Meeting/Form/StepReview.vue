<template>
  <div class="meeting-form-review">
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
      <h2 class="meeting-form-panel__title">ระเบียบวาระ</h2>
      <div v-if="!agendas.length" class="text-sm text-[#7c7c7c]">
        ยังไม่มีระเบียบวาระ
      </div>
      <div v-else class="meeting-form-review__agendas">
        <div
          v-for="agenda in agendas"
          :key="agenda.id"
          class="meeting-form-review__agenda"
        >
          <div class="font-semibold">{{ agenda.label }}</div>
          <ul>
            <li v-for="topic in agenda.topics" :key="topic.id">
              {{ topic.title }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  MeetingAgendaDraft,
  MeetingFormReviewInfo,
  MeetingFormReviewInvite,
} from "#shared/types/meeting";

const props = defineProps<{
  info: MeetingFormReviewInfo;
  invite: MeetingFormReviewInvite;
  agendas: MeetingAgendaDraft[];
}>();

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
