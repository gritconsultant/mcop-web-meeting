<template>
  <div class="flex flex-col gap-5">
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
          <UCInputDatePicker
            v-model="form.date"
            placeholder="เลือกวันที่ประชุม"
          />
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
          class="ml-auto rounded-full! border-[#66A9FF]! bg-[#EAF4FF]! text-[#0066DA]! text-xs! font-bold! hover:bg-[#DDEEFF]!"
          icon="i-lucide-download"
          trailing-icon
          label="ดาวน์โหลดไฟล์รายงาน"
        />
      </UCForm>
    </UCCard>

    <UCDataTable
      :items="rows"
      :loading="loading"
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
          <th class="is-left">วันที่ประชุม</th>
          <th class="is-left">คณะ</th>
          <th class="is-left">สถานที่</th>
          <th>ผู้เข้าร่วม (ท่าน)</th>
          <th>ความคืบหน้า</th>
          <th>สถานะ</th>
          <th />
        </tr>
      </template>
      <template #body="{ items }">
        <tr v-for="(item, i) in items" :key="item.id">
          <td>{{ seqNum(pagination, i) }}</td>
          <td>{{ item.meeting_set?.year ?? "" }}</td>
          <td>{{ item.meeting_no ?? "" }}</td>
          <td class="is-left">
            <template v-if="item.start_at">
              {{ formatDate(item.start_at) }}
              {{ formatDate(item.start_at, "time") }}
            </template>
          </td>
          <td class="is-left">{{ item.meeting_committee?.name ?? "" }}</td>
          <td class="is-left">{{ item.location ?? "" }}</td>
          <td>
            <template v-if="item.member_count != null">
              {{ item.member_count }}
            </template>
          </td>
          <td>
            <template
              v-if="
                item.approved_topic_count != null && item.topic_count != null
              "
            >
              {{ item.approved_topic_count }}/{{ item.topic_count }}
            </template>
          </td>
          <td>
            <UCStatusBadge
              v-if="item.status_name"
              :status="STATUS_META[item.status as ReportStatus]?.tone ?? 'info'"
              :label="item.status_name"
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
import type { ApiResponse } from "#shared/types/api";
import type { ReportListItem, QueryMeetings } from "#shared/types/meeting";
import type { PaginateSlice } from "#shared/types/pagination";
import type { StatusTone } from "#shared/types/status";
import service from "~/service";
import { formatDate } from "~/utils/format/date";
import { seqNum } from "~/utils/table/seqNum";

type ReportStatus = "ended" | "completed" | "rejected" | "in_progress";

const STATUS_META: Record<ReportStatus, { label: string; tone: StatusTone }> = {
  ended: { label: "จบการประชุม", tone: "info" },
  completed: { label: "เสร็จสิ้น", tone: "approved" },
  rejected: { label: "ตีกลับ", tone: "rejected" },
  in_progress: { label: "รอดำเนินการ", tone: "pending" },
};

const STATUS_ALL = "all";

const STATUS_ITEMS = [
  { value: STATUS_ALL, label: "ทั้งหมด" },
  ...(Object.keys(STATUS_META) as ReportStatus[]).map((v) => ({
    value: v,
    label: STATUS_META[v].label,
  })),
];

const form = reactive({
  meetingNo: "",
  date: undefined as string | undefined,
  place: "",
  status: STATUS_ALL,
});
const allStatuses = Object.keys(STATUS_META).join(",");
const query = reactive<QueryMeetings>({
  from: 0,
  size: 10,
  meeting_no: undefined,
  meeting_date: undefined,
  location: undefined,
  sort_by: "created_at",
  order_by: "desc",
  statuses: allStatuses,
});
const { pagination, setPagination, applyPage, applyPageSize } =
  usePagination(10);

const rows = ref<ReportListItem[]>([]);
const loading = ref(false);

const getList = async () => {
  loading.value = true;
  try {
    const resp = (await service.meeting.getMeetings({
      ...query,
    })) as ApiResponse<ReportListItem[]> & {
      paginate: PaginateSlice;
    };
    rows.value = resp.data;
    setPagination(resp.paginate);
  } catch (err) {
    showFetchError(err);
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  query.meeting_no = form.meetingNo || undefined;
  query.meeting_date = form.date || undefined;
  query.location = form.place || undefined;
  query.statuses = form.status === STATUS_ALL ? allStatuses : form.status;
  applyPage(query, 0);
  getList();
};
const onPageChange = (from: number) => {
  applyPage(query, from);
  getList();
};
const onPageSizeChange = (size: number) => {
  applyPageSize(query, size);
  getList();
};

onMounted(getList);
</script>
