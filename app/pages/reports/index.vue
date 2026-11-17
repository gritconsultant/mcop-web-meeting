<template>
  <div class="space-y-4">
    <UCCard title="ค้นหา" accordion>
      <UCForm
        :state="form"
        class="flex flex-wrap items-end gap-4"
        @submit="onSearch"
      >
        <UCFormField label="ครั้งที่" name="meetingNo" class="w-52">
          <UCInput v-model="form.meetingNo" placeholder="กรอกครั้งที่" />
        </UCFormField>
        <UCFormField label="วันที่ประชุม" name="date" class="w-52">
          <UCInputDatePicker v-model="form.date" placeholder="เลือกวันที่ประชุม" />
        </UCFormField>
        <UCFormField label="สถานที่" name="place" class="w-52">
          <UCInput v-model="form.place" placeholder="กรอกสถานที่" />
        </UCFormField>
        <UCFormField label="สถานะ" name="status" class="w-52">
          <UCSelectInput
            v-model="form.status"
            :items="STATUS_ITEMS"
            placeholder="เลือกสถานะ"
          />
        </UCFormField>
        <UCButton type="search" label="ค้นหา" button-type="submit" />
        <UCButton
          class="ml-auto"
          icon="i-lucide-download"
          trailing-icon
          label="ดาวน์โหลดไฟล์รายงาน"
        />
      </UCForm>
    </UCCard>

    <UCDataTable
      :items="rows"
      :pagination="pagination"
      show-pagination
      :page-sizes="[5, 10, 20]"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #header>
        <tr>
          <th>ลำดับ</th>
          <th>ปีบัญชี</th>
          <th>ครั้งที่</th>
          <th>วันที่ประชุม</th>
          <th>คณะ</th>
          <th>สถานที่</th>
          <th>ผู้เข้าร่วม</th>
          <th>ความคืบหน้า</th>
          <th>สถานะ</th>
          <th />
        </tr>
      </template>
      <template #body="{ items }">
        <tr v-for="(item, i) in items" :key="item.id">
          <td>{{ seqNum(pagination, i) }}</td>
          <td>{{ item.fiscalYear }}</td>
          <td>{{ item.meetingNo }}</td>
          <td>{{ item.date }}</td>
          <td class="is-left">{{ item.committee }}</td>
          <td class="is-left">{{ item.place }}</td>
          <td>{{ item.attendees }} ท่าน</td>
          <td>{{ item.progress }}</td>
          <td>
            <UCStatusBadge
              :status="STATUS_META[item.status].tone"
              :label="STATUS_META[item.status].label"
            />
          </td>
          <td>
            <UCActionGroup>
              <UCActionButton
                action="next"
                filled
                @click="navigateTo(`/reports/${item.id}`)"
              />
            </UCActionGroup>
          </td>
        </tr>
      </template>
    </UCDataTable>
  </div>
</template>

<script setup lang="ts">
import type { StatusTone } from "#shared/types/status";
import { seqNum } from "~/utils/table/seqNum";

type ReportStatus = "ended" | "waiting" | "done";

interface ReportRow {
  id: string;
  fiscalYear: number;
  meetingNo: string;
  date: string;
  isoDate: string;
  committee: string;
  place: string;
  attendees: number;
  progress: string;
  status: ReportStatus;
}

const STATUS_META: Record<ReportStatus, { label: string; tone: StatusTone }> = {
  ended: { label: "จบการประชุม", tone: "info" },
  waiting: { label: "รอดำเนินการ", tone: "pending" },
  done: { label: "เสร็จสิ้น", tone: "approved" },
};

const STATUS_ITEMS = (Object.keys(STATUS_META) as ReportStatus[]).map((v) => ({
  value: v,
  label: STATUS_META[v].label,
}));

// ponytail: mock data + client-side filter/paging; swap for service call when report API exists
const MOCK: ReportRow[] = [
  {
    id: "1",
    fiscalYear: 2568,
    meetingNo: "6/2568",
    isoDate: "2025-07-28",
    date: "28 กรกฎาคม 2568  13:00 - 15:40",
    committee: "คณะกรรมการดำเนินการ",
    place: "ห้องประชุมชั้น 5",
    attendees: 15,
    progress: "0/15",
    status: "ended",
  },
  {
    id: "2",
    fiscalYear: 2568,
    meetingNo: "5/2568",
    isoDate: "2025-06-28",
    date: "28 มิถุนายน 2568  13:00 - 15:02",
    committee: "คณะบริหารความเสี่ยง",
    place: "ห้องประชุมชั้น 5",
    attendees: 15,
    progress: "3/8",
    status: "waiting",
  },
  {
    id: "3",
    fiscalYear: 2568,
    meetingNo: "4/2568",
    isoDate: "2025-05-25",
    date: "25 พฤษภาคม 2568  09:00 - 11:58",
    committee: "คณะกรรมการเงินกู้",
    place: "ห้องประชุมชั้น 5",
    attendees: 15,
    progress: "2/2",
    status: "waiting",
  },
  {
    id: "4",
    fiscalYear: 2565,
    meetingNo: "13/2565",
    isoDate: "2022-08-24",
    date: "24 สิงหาคม 2565  13:00 - 15:30",
    committee: "คณะกรรมการดำเนินการ",
    place: "อาคาร 5 (ชั้น G) สนง.ตำรวจแห่งชาติ",
    attendees: 18,
    progress: "5/5",
    status: "done",
  },
];

const emptyForm = () => ({
  meetingNo: "",
  date: undefined as string | undefined,
  place: "",
  status: undefined as string | undefined,
});

const form = reactive(emptyForm());
const applied = ref(emptyForm());
const query = reactive({ from: 0, size: 5 });
const { pagination, setPagination, applyPage, applyPageSize } =
  usePagination(5);

const filtered = computed(() =>
  MOCK.filter(
    (r) =>
      (!applied.value.meetingNo ||
        r.meetingNo.includes(applied.value.meetingNo)) &&
      (!applied.value.date || r.isoDate === applied.value.date) &&
      (!applied.value.place || r.place.includes(applied.value.place)) &&
      (!applied.value.status || r.status === applied.value.status),
  ),
);

const rows = computed(() =>
  filtered.value.slice(query.from, query.from + query.size),
);

watchEffect(() =>
  setPagination({
    from: query.from,
    size: query.size,
    total: filtered.value.length,
  }),
);

const onSearch = () => {
  applied.value = { ...form };
  applyPage(query, 0);
};
const onPageChange = (from: number) => applyPage(query, from);
const onPageSizeChange = (size: number) => applyPageSize(query, size);
</script>
