<template>
  <ModalLayout
    :open="open"
    title="รายชื่อผู้เข้าประชุม"
    panel-class="max-w-3xl"
    @close="emit('close')"
  >
    <div class="relative">
      <LoadingCardOverlay
        :loading="loading"
        bg-class="rounded-lg bg-white"
      />
      <div class="grid grid-cols-2 gap-4">
        <UCCardSummary
          v-for="item in items"
          :key="item.label"
          :icon="item.icon"
          :label="item.label"
          :value="item.count"
        />
      </div>

      <NavigationNavbarLayout
        class="mt-6"
        type="tab"
        :menus="menus"
        @change-menu="(m) => (tab = tabs.find((t) => t.label === m.label)!.key)"
      />

      <div class="mt-4 max-h-[360px] overflow-y-auto">
        <table class="hrm-table">
          <thead class="sticky top-0">
            <tr>
              <th class="w-20">ลำดับ</th>
              <th class="is-left">ชื่อ - นามสกุล</th>
              <template v-if="tab === 'members'">
                <th class="is-left">ตำแหน่ง</th>
                <th class="w-36">สถานะ</th>
              </template>
              <th v-else class="is-left">รายละเอียด</th>
            </tr>
          </thead>
          <tbody v-if="tab === 'members'">
            <tr v-for="(item, i) in members" :key="item.employee_id">
              <td>{{ i + 1 }}</td>
              <td class="is-left">{{ fullName(item.employee) }}</td>
              <td class="is-left">{{ item.position?.name ?? "" }}</td>
              <td>{{ item.attendance_status_name ?? "" }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="(item, i) in participants" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td class="is-left">{{ item.full_name }}</td>
              <td class="is-left">{{ item.detail ?? "" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <UCButton type="outline" label="ปิด" @click="emit('close')" />
    </template>
  </ModalLayout>
</template>

<script setup lang="ts">
import starIcon from "~/assets/icon/meeting/icon-star.svg";
import memberIcon from "~/assets/icon/meeting/icon-member.svg";
import type { ApiResponse } from "#shared/types/api";
import type { MeetingGuest, MeetingMember } from "#shared/types/meeting";
import service from "~/service";

const props = defineProps<{ open: boolean; meetingId: string }>();

const emit = defineEmits<{ close: [] }>();

const members = ref<MeetingMember[]>([]);
const participants = ref<MeetingGuest[]>([]);

const fullName = (e: MeetingMember["employee"]) =>
  e
    ? [e.prefix_name_th, e.first_name_th, e.last_name_th]
        .filter(Boolean)
        .join(" ")
    : "";

const loading = ref(false);

const getList = async () => {
  const id = props.meetingId;
  loading.value = true;
  try {
    const [m, g] = (await Promise.all([
      service.meeting.getMembers(id),
      service.meeting.getGuests(id),
    ])) as [ApiResponse<MeetingMember[]>, ApiResponse<MeetingGuest[]>];
    if (id !== props.meetingId) return;
    members.value = m.data;
    participants.value = g.data;
  } catch (err) {
    showFetchError(err);
  } finally {
    if (id === props.meetingId) loading.value = false;
  }
};

const tab = ref<"members" | "participants">("members");

const tabs = [
  { key: "members", label: "ผู้เข้าประชุม" },
  { key: "participants", label: "ผู้เข้าร่วมประชุม" },
] as const;

const menus = computed(() =>
  tabs.map((t) => ({ label: t.label, active: tab.value === t.key })),
);

const items = computed(() => [
  { label: "ผู้เข้าประชุม (ท่าน)", count: members.value.length, icon: starIcon },
  {
    label: "ผู้เข้าร่วมประชุม (ท่าน)",
    count: participants.value.length,
    icon: memberIcon,
  },
]);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    tab.value = "members";
    members.value = [];
    participants.value = [];
    getList();
  },
);
</script>
