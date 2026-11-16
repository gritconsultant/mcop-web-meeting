<template>
  <div class="space-y-4">
    <UCBreadcrumb
      :items="[{ label: 'ระเบียบการประชุม' }]"
    />

    <UCPageHeader title="ระเบียบการประชุม">
      <template #actions>
        <UCButton
          type="outline"
          label="ทดลอง dialog สำเร็จ"
          @click="onDemoSuccess"
        />
        <UCButton
          type="add"
          label="เพิ่มวาระการประชุม"
          icon="i-lucide-plus"
          @click="onAddMeeting"
        />
      </template>
    </UCPageHeader>

    <UCFilterPanel variant="inline">
      <UCFormField label="ครั้งที่" name="meeting_no" class="w-[160px]">
        <UCInput
          v-model="filters.meetingNo"
          placeholder="เช่น 6/2568"
          @keyup.enter="onSearch"
        />
      </UCFormField>

      <UCFormField label="วันที่ประชุม" name="meeting_date" class="w-[200px]">
        <UCInput
          v-model="filters.meetingDate"
          placeholder="เลือกวันที่"
          @keyup.enter="onSearch"
        />
      </UCFormField>

      <UCFormField label="สถานที่" name="location" class="w-[220px]">
        <UCInput
          v-model="filters.location"
          placeholder="สถานที่ประชุม"
          @keyup.enter="onSearch"
        />
      </UCFormField>

      <template #actions>
        <UCButton type="search" label="ค้นหา" @click="onSearch" />
      </template>
    </UCFilterPanel>

    <UCDataTable
      :items="pagedItems"
      :loading="loading"
      :pagination="pagination"
      :skeleton-rows="5"
      :skeleton-columns="8"
      :page-sizes="[5, 10, 20, 30]"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #header>
        <tr>
          <th class="w-16">ลำดับ</th>
          <th class="w-28">ครั้งที่</th>
          <th class="is-left">วันที่ประชุม</th>
          <th class="is-left">คณะ</th>
          <th class="is-left">สถานที่</th>
          <th class="w-28">ผู้เข้าร่วม</th>
          <th class="w-36">สถานะการประชุม</th>
          <th class="w-20" />
        </tr>
      </template>

      <template #body="{ items: rows }">
        <tr v-for="(item, index) in rows" :key="item.id">
          <td>{{ pagination.from + index + 1 }}</td>
          <td>{{ item.meetingNo }}</td>
          <td class="is-left">{{ item.meetingDateLabel }}</td>
          <td class="is-left">{{ item.committee }}</td>
          <td class="is-left">{{ item.location }}</td>
          <td>{{ item.attendees }} ท่าน</td>
          <td>
            <UCStatusBadge status="approved" :label="item.statusLabel" />
          </td>
          <td>
            <UCActionButton action="view" @click="onView(item)" />
          </td>
        </tr>
      </template>
    </UCDataTable>

    <UCAgendaTree
      :key="agendaTreeKey"
      :items="agendaItems"
      title="ตัวอย่างระเบียบวาระ (ยุบ/ขยายได้)"
    >
      <template #actions>
        <UCButton type="outline" label="ขยายทั้งหมด" @click="expandAllAgenda" />
      </template>
    </UCAgendaTree>
  </div>
</template>

<script setup lang="ts">
import type { AgendaNode } from "#shared/types/agenda";
import { formatDate } from "~/utils/format/date";

type MeetingRow = {
  id: string;
  meetingNo: string;
  meetingDate: string;
  meetingDateLabel: string;
  committee: string;
  location: string;
  attendees: number;
  statusLabel: string;
};

const { pagination, setPagination } = usePagination(5);

const loading = ref(false);
const filters = reactive({
  meetingNo: "",
  meetingDate: "",
  location: "",
});

const allItems = ref<MeetingRow[]>([
  {
    id: "1",
    meetingNo: "6/2568",
    meetingDate: "2025-07-28T13:00:00+07:00",
    meetingDateLabel: "",
    committee: "คณะกรรมการดำเนินการ",
    location: "ห้องประชุมชั้น 5 อาคารหลัก",
    attendees: 15,
    statusLabel: "เสร็จสิ้น",
  },
  {
    id: "2",
    meetingNo: "5/2568",
    meetingDate: "2025-06-25T09:00:00+07:00",
    meetingDateLabel: "",
    committee: "คณะกรรมการเงินกู้",
    location: "ห้องประชุมชั้น 5",
    attendees: 15,
    statusLabel: "เสร็จสิ้น",
  },
  {
    id: "3",
    meetingNo: "4/2568",
    meetingDate: "2025-05-24T13:00:00+07:00",
    meetingDateLabel: "",
    committee: "คณะกรรมการดำเนินการ",
    location: "ห้องประชุมชั้น 5",
    attendees: 18,
    statusLabel: "เสร็จสิ้น",
  },
  {
    id: "4",
    meetingNo: "3/2568",
    meetingDate: "2025-04-22T13:00:00+07:00",
    meetingDateLabel: "",
    committee: "คณะกรรมการดำเนินการ",
    location: "ห้องประชุมชั้น 5",
    attendees: 16,
    statusLabel: "เสร็จสิ้น",
  },
  {
    id: "5",
    meetingNo: "2/2568",
    meetingDate: "2025-03-18T09:00:00+07:00",
    meetingDateLabel: "",
    committee: "คณะกรรมการเงินกู้",
    location: "ห้องประชุมชั้น 3",
    attendees: 12,
    statusLabel: "เสร็จสิ้น",
  },
  {
    id: "6",
    meetingNo: "1/2568",
    meetingDate: "2025-02-14T13:00:00+07:00",
    meetingDateLabel: "",
    committee: "คณะกรรมการดำเนินการ",
    location: "ห้องประชุมชั้น 5 อาคารหลัก",
    attendees: 20,
    statusLabel: "เสร็จสิ้น",
  },
]);

allItems.value = allItems.value.map((item) => ({
  ...item,
  meetingDateLabel: `${formatDate(item.meetingDate)} ${new Date(item.meetingDate).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
}));

const applied = ref({ ...filters });

const filteredItems = computed(() => {
  const no = applied.value.meetingNo.trim().toLowerCase();
  const date = applied.value.meetingDate.trim().toLowerCase();
  const location = applied.value.location.trim().toLowerCase();

  return allItems.value.filter((item) => {
    if (no && !item.meetingNo.toLowerCase().includes(no)) return false;
    if (date && !item.meetingDateLabel.toLowerCase().includes(date)) return false;
    if (location && !item.location.toLowerCase().includes(location)) return false;
    return true;
  });
});

const pagedItems = computed(() => {
  const start = pagination.value.from;
  const end = start + pagination.value.per_page;
  return filteredItems.value.slice(start, end);
});

const syncPagination = () => {
  const total = filteredItems.value.length;
  const size = pagination.value.per_page || 5;
  const from = Math.min(pagination.value.from, Math.max(0, total - 1));
  const alignedFrom = Math.floor(from / size) * size;
  setPagination({
    from: alignedFrom,
    size,
    total,
  });
};

const agendaItems = ref<AgendaNode[]>([
  {
    id: "a1",
    code: "1.",
    label: "เรื่องที่ประธานแจ้งให้ที่ประชุมทราบ",
    defaultOpen: true,
    children: [
      { id: "a1-1", code: "1.1", label: "ผลการดำเนินงานไตรมาสที่ 2" },
      { id: "a1-2", code: "1.2", label: "กำหนดการกิจกรรมประจำเดือน" },
    ],
  },
  {
    id: "a2",
    code: "2.",
    label: "รับรองรายงานการประชุมครั้งที่แล้ว",
    children: [
      { id: "a2-1", code: "2.1", label: "รายงานการประชุมครั้งที่ 5/2568" },
    ],
  },
  {
    id: "a3",
    code: "3.",
    label: "เรื่องเสนอเพื่อพิจารณา",
    defaultOpen: true,
    children: [
      {
        id: "a3-1",
        code: "3.1",
        label: "พิจารณาคำขอกู้เงิน",
        children: [
          { id: "a3-1-1", code: "3.1.1", label: "สมาชิก A" },
          { id: "a3-1-2", code: "3.1.2", label: "สมาชิก B" },
        ],
      },
      { id: "a3-2", code: "3.2", label: "พิจารณางบประมาณโครงการ" },
    ],
  },
  {
    id: "a4",
    code: "4.",
    label: "เรื่องอื่นๆ",
  },
]);

const onSearch = async () => {
  loading.value = true;
  applied.value = { ...filters };
  pagination.value.from = 0;
  await new Promise((r) => setTimeout(r, 350));
  syncPagination();
  loading.value = false;
};

const onPageChange = (from: number) => {
  pagination.value.from = from;
  syncPagination();
};

const onPageSizeChange = (size: number) => {
  pagination.value.per_page = size;
  pagination.value.from = 0;
  syncPagination();
};

const onAddMeeting = async () => {
  const ok = await confirmAction();
  if (!ok) return;
  await showSaveSuccess();
};

const onDemoSuccess = async () => {
  await showSaveSuccess("ระบบบันทึกรายการเรียบร้อยแล้ว");
};

const onView = async (item: MeetingRow) => {
  await showAlertConfirm({
    type: "warning",
    title: "เปิดรายละเอียด",
    text: `ต้องการเปิดการประชุมครั้งที่ ${item.meetingNo} หรือไม่`,
  });
};

const agendaTreeKey = ref(0);

const expandAllAgenda = () => {
  const markOpen = (nodes: AgendaNode[]): AgendaNode[] =>
    nodes.map((node) => ({
      ...node,
      defaultOpen: true,
      children: node.children ? markOpen(node.children) : undefined,
    }));
  agendaItems.value = markOpen(agendaItems.value);
  agendaTreeKey.value += 1;
};

onMounted(() => {
  syncPagination();
});
</script>
