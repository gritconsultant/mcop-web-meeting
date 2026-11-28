<template>
  <div class="meeting-list-page">
    <div class="meeting-list-page__card">
      <div class="meeting-list-page__title">ควบคุมการประชุม</div>

      <div class="meeting-control-set">
        <span class="meeting-control-set__label">ชุด :</span>
        <span class="meeting-control-set__value">{{ setLabel || "-" }}</span>
      </div>

      <div class="meeting-list-filter">
        <div class="meeting-list-filter__fields">
          <UCFormField
            label="ครั้งที่"
            name="meeting_no"
            class="meeting-list-filter__field"
          >
            <UCInput
              v-model="filters.meetingNo"
              placeholder="กรอกครั้งที่"
              @keyup.enter="onSearch"
            />
          </UCFormField>

          <UCFormField
            label="วันที่ประชุม"
            name="meeting_date"
            class="meeting-list-filter__field"
          >
            <UCInputDatePicker
              v-model="filters.meetingDate"
              placeholder="เลือกวันที่ประชุม"
              mode="date"
            />
          </UCFormField>

          <UCFormField
            label="สถานที่"
            name="location"
            class="meeting-list-filter__field"
          >
            <UCInput
              v-model="filters.location"
              placeholder="กรอกสถานที่"
              @keyup.enter="onSearch"
            />
          </UCFormField>

          <UCButton type="search" label="ค้นหา" @click="onSearch" />
        </div>
      </div>

      <MeetingListTable
        :items="items"
        :loading="loading"
        :pagination="pagination"
        :page-sizes="[5, 10, 20, 30]"
        action-class="w-[150px]"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #action="{ item }">
          <UCButton
            v-if="item.status === 'waiting' || item.status === 'meeting'"
            type="primary"
            :label="item.status === 'meeting' ? 'จบการประชุม' : 'เริ่มการประชุม'"
            :disabled="actingId === item.id"
            @click="onControl(item)"
          />
        </template>
      </MeetingListTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type {
  CommitteeSet,
  MeetingListFilters,
  MeetingListItem,
  MeetingListQuery,
  MeetingStatus,
} from "#shared/types/meeting";
import { MEETING_STATUS_LABEL } from "#shared/types/meeting";
import { usePagination } from "~/composables/usePagination";
import service from "~/service";

const STATUSES = new Set<MeetingStatus>([
  "draft",
  "waiting",
  "meeting",
  "ended",
  "completed",
]);

const currentSet = ref<CommitteeSet | null>(null);
const loading = ref(true);
const actingId = ref("");
const items = ref<MeetingListItem[]>([]);
const filters = ref<MeetingListFilters>({
  meetingNo: "",
  meetingDate: undefined,
  location: "",
});

const query = reactive<MeetingListQuery>({
  from: 0,
  size: 5,
  sort_by: "start_at",
  order_by: "desc",
  statuses: "waiting,meeting",
});

const { pagination, setPagination, applyPage, applyPageSize } = usePagination(
  query.size,
);

const setLabel = computed(() => {
  const set = currentSet.value;
  if (!set) return "";
  const year = set.year?.trim?.() ?? "";
  const setNo = set.set_number ?? "";
  if (!year) return `ชุดที่ ${setNo}`;
  const nextYear = Number(year);
  const endYear = Number.isFinite(nextYear) ? String(nextYear + 1) : year;
  return `ชุดที่ ${setNo} (01/10/${year} - 30/09/${endYear})`;
});

const mapRow = (e: any): MeetingListItem => {
  const statusRaw = e?.status ?? "waiting";
  const status: MeetingStatus = STATUSES.has(statusRaw) ? statusRaw : "waiting";
  const year = e?.meeting_set?.year?.trim?.() ?? "";
  const meetingNo =
    e?.meeting_no == null
      ? "-"
      : year
        ? `${e.meeting_no}/${year}`
        : String(e.meeting_no ?? "");

  return {
    id: e?.id ?? "",
    meetingNo,
    meetingDate: e?.start_at ?? "",
    committee: e?.meeting_committee?.name?.trim?.() || "-",
    location: e?.location?.trim?.() || "-",
    attendees: e?.member_count ?? 0,
    status,
    statusName: e?.status_name?.trim?.() || MEETING_STATUS_LABEL[status],
  };
};

const parseMeetingNo = (raw: string): number | undefined => {
  const head = raw.trim().split("/")[0]?.trim() ?? "";
  if (!head) return undefined;
  const n = Number(head);
  return Number.isInteger(n) && n >= 1 ? n : undefined;
};

const syncFiltersToQuery = () => {
  query.meeting_no = parseMeetingNo(filters.value.meetingNo);
  const meetingDate = filters.value.meetingDate?.trim();
  query.meeting_date = meetingDate ? meetingDate.slice(0, 10) : undefined;
  const location = filters.value.location.trim();
  query.location = location || undefined;
  query.meeting_set_id = currentSet.value?.id || undefined;
  query.statuses = "waiting,meeting";
};

const fetchCurrentSet = async () => {
  try {
    const resp = await service.meeting.getCommitteeSets({
      from: 0,
      size: 99,
    });
    const { data, code } = resp as any;
    const rows: CommitteeSet[] = code == "200" && Array.isArray(data) ? data : [];
    currentSet.value =
      rows.reduce<CommitteeSet | null>((latest, row) => {
        if (!latest) return row;
        return (row.set_number ?? 0) > (latest.set_number ?? 0) ? row : latest;
      }, null) ?? null;
  } catch (err: any) {
    currentSet.value = null;
    showAlert({
      type: "warning",
      title: "ดึงข้อมูลชุดไม่สำเร็จ",
      text: err?.message || "",
      isToast: true,
    });
  }
};

const fetchList = async () => {
  loading.value = true;
  syncFiltersToQuery();

  try {
    const resp = await service.meeting.getMeetings({ ...query });
    const { data, code, paginate } = resp as any;
    items.value = code == "200" && Array.isArray(data) ? data.map(mapRow) : [];
    setPagination(paginate ?? { from: 0, size: query.size, total: 0 });
  } catch (err: any) {
    items.value = [];
    setPagination({ from: 0, size: query.size, total: 0 });
    showAlert({
      type: "warning",
      title: "ดึงข้อมูลไม่สำเร็จ",
      text: err?.message || "",
      isToast: true,
    });
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  query.from = 0;
  fetchList();
};

const onPageChange = (from: number) => {
  applyPage(query, from);
  fetchList();
};

const onPageSizeChange = (size: number) => {
  applyPageSize(query, size);
  fetchList();
};

const onControl = async (item: MeetingListItem) => {
  if (actingId.value) return;
  const ending = item.status === "meeting";
  const ok = await showAlertConfirm({
    type: "warning",
    title: ending ? "จบการประชุม" : "เริ่มการประชุม",
    text: ending
      ? "ยืนยันการจบการประชุมนี้หรือไม่"
      : "ยืนยันการเริ่มการประชุมนี้หรือไม่",
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  });
  if (!ok) return;

  actingId.value = item.id;
  try {
    const resp = ending
      ? await service.meeting.endMeeting(item.id)
      : await service.meeting.startMeeting(item.id);
    const { code, message } = resp as any;
    if (code != "200") {
      await showAlert({
        type: "warning",
        title: message || (ending ? "จบการประชุมไม่สำเร็จ" : "เริ่มการประชุมไม่สำเร็จ"),
        isToast: true,
      });
      return;
    }
    await showAlert({
      type: "success",
      title: ending ? "จบการประชุมแล้ว" : "เริ่มการประชุมแล้ว",
      isToast: true,
    });
    await fetchList();
  } catch (err: any) {
    await showAlert({
      type: "warning",
      title: ending ? "จบการประชุมไม่สำเร็จ" : "เริ่มการประชุมไม่สำเร็จ",
      text: err?.message || "",
      isToast: true,
    });
  } finally {
    actingId.value = "";
  }
};

onMounted(async () => {
  await fetchCurrentSet();
  await fetchList();
});
</script>
