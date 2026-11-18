<template>
  <div class="meeting-list-page">
    <div class="meeting-list-page__card">
      <div class="meeting-list-page__title">ระเบียบการประชุม</div>

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

        <div class="meeting-list-filter__trailing">
          <button
            type="button"
            class="meeting-list-filter__add"
            @click="onAddMeeting"
          >
            <img
              :src="addIcon"
              alt=""
              class="meeting-list-filter__add-icon"
              width="24"
              height="24"
            />
            <span>เพิ่มวาระการประชุม</span>
          </button>
        </div>
      </div>

      <MeetingListTable
        :items="items"
        :loading="loading"
        :pagination="pagination"
        :page-sizes="[5, 10, 20, 30]"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        @view="onView"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  MeetingListApiRow,
  MeetingListFilters,
  MeetingListItem,
  MeetingStatus,
} from "#shared/types/meeting";
import { MEETING_STATUS_LABEL } from "#shared/types/meeting";
import { usePagination } from "~/composables/usePagination";
import service from "~/service";
import addIcon from "~/assets/icon/meeting/add-plus.svg";

/** mock ตาม Figma 932:83618 — ใช้เมื่อ API ว่างหรือ error */
const MEETING_LIST_MOCK: MeetingListApiRow[] = [
  {
    id: "c3d4e5f6-a7b8-4c9d-90e1-f2a3b4c5d6e8",
    meeting_committee_id: "123e4567-e89b-12d3-a456-426614174000",
    meeting_set_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    meeting_no: null,
    start_at: "2025-08-26T13:00:00",
    end_at: null,
    location: "ห้องประชุมชั้น 5 อาคารสำนักงาน",
    status: "draft",
    status_name: "ฉบับร่าง",
    member_count: 15,
    topic_count: 0,
    approved_topic_count: 0,
    created_at: "2025-08-10T09:00:00",
    updated_at: "2025-08-10T09:30:00",
    meeting_committee: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "คณะกรรมการดำเนินการ",
    },
    meeting_set: {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      set_number: 47,
      year: "2568",
    },
  },
  {
    id: "d4e5f6a7-b8c9-4d0e-91f2-a3b4c5d6e7f8",
    meeting_committee_id: "123e4567-e89b-12d3-a456-426614174000",
    meeting_set_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    meeting_no: 6,
    start_at: "2025-07-28T13:00:00",
    end_at: "2025-07-28T15:40:00",
    location: "ห้องประชุมชั้น 5",
    status: "completed",
    status_name: "เสร็จสิ้น",
    member_count: 15,
    topic_count: 15,
    approved_topic_count: 15,
    created_at: "2025-07-01T09:00:00",
    updated_at: "2025-07-28T15:40:00",
    meeting_committee: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "คณะกรรมการดำเนินการ",
    },
    meeting_set: {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      set_number: 47,
      year: "2568",
    },
  },
  {
    id: "e5f6a7b8-c9d0-4e1f-92a3-b4c5d6e7f8a9",
    meeting_committee_id: "987fcdeb-51a2-43d7-9012-345678901234",
    meeting_set_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    meeting_no: 5,
    start_at: "2025-06-25T09:00:00",
    end_at: "2025-06-25T11:30:00",
    location: "ห้องประชุมชั้น 5",
    status: "completed",
    status_name: "เสร็จสิ้น",
    member_count: 15,
    topic_count: 8,
    approved_topic_count: 8,
    created_at: "2025-06-01T09:00:00",
    updated_at: "2025-06-25T11:30:00",
    meeting_committee: {
      id: "987fcdeb-51a2-43d7-9012-345678901234",
      name: "คณะกรรมการเงินกู้",
    },
    meeting_set: {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      set_number: 47,
      year: "2568",
    },
  },
  {
    id: "f6a7b8c9-d0e1-4f2a-93b4-c5d6e7f8a9b0",
    meeting_committee_id: "123e4567-e89b-12d3-a456-426614174000",
    meeting_set_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    meeting_no: 4,
    start_at: "2025-05-24T13:00:00",
    end_at: "2025-05-24T16:00:00",
    location: "ห้องประชุมชั้น 5",
    status: "completed",
    status_name: "เสร็จสิ้น",
    member_count: 18,
    topic_count: 10,
    approved_topic_count: 10,
    created_at: "2025-05-01T09:00:00",
    updated_at: "2025-05-24T16:00:00",
    meeting_committee: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "คณะกรรมการดำเนินการ",
    },
    meeting_set: {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      set_number: 47,
      year: "2568",
    },
  },
];

const STATUSES = new Set<MeetingStatus>([
  "draft",
  "waiting",
  "meeting",
  "ended",
  "completed",
]);

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

const query = reactive({
  from: 0,
  size: 5,
  sort_by: "start_at",
  order_by: "desc",
});

const { pagination, setPagination, applyPage, applyPageSize } = usePagination(
  query.size,
);

const loading = ref(true);
const filters = ref<MeetingListFilters>({
  meetingNo: "",
  meetingDate: undefined,
  location: "",
});
const items = ref<MeetingListItem[]>([]);
const usingMock = ref(false);

const fetchList = async () => {
  loading.value = true;
  // TODO: เปิดยิงจริงทีหลัง (กัน 401)
  usingMock.value = true;
  applyMockPage();
  loading.value = false;

  // usingMock.value = false;

  // const params: Record<string, unknown> = {
  //   from: query.from,
  //   size: query.size,
  //   sort_by: query.sort_by,
  //   order_by: query.order_by,
  // };

  // const meetingNo = parseMeetingNo(filters.value.meetingNo);
  // if (meetingNo != null) params.meeting_no = meetingNo;

  // const meetingDate = filters.value.meetingDate?.trim();
  // if (meetingDate) params.meeting_date = meetingDate.slice(0, 10);

  // const location = filters.value.location.trim();
  // if (location) params.location = location;

  // try {
  //   const resp = await service.meeting.getMeetings(params);
  //   const { data, code, paginate } = resp as any;
  //   if (code == "200") {
  //     const rows = Array.isArray(data) ? data : [];
  //     if (!rows.length) {
  //       usingMock.value = true;
  //       applyMockPage();
  //       return;
  //     }
  //     items.value = rows.map((e: any) => mapRow(e));
  //   } else {
  //     items.value = [];
  //   }
  //   setPagination(paginate ?? { from: 0, size: query.size, total: 0 });
  // } catch (err: any) {
  //   usingMock.value = true;
  //   applyMockPage();
  //   showAlert({
  //     type: "warning",
  //     title: (err && "ดึงข้อมูลไม่สำเร็จ") || "",
  //     text: err?.message || "",
  //     isToast: true,
  //   });
  // } finally {
  //   loading.value = false;
  // }
};

const applyMockPage = () => {
  let rows = [...MEETING_LIST_MOCK];

  const meetingNo = parseMeetingNo(filters.value.meetingNo);
  if (meetingNo != null) {
    rows = rows.filter((r) => r.meeting_no === meetingNo);
  }

  const meetingDate = filters.value.meetingDate?.trim()?.slice(0, 10);
  if (meetingDate) {
    rows = rows.filter((r) => r.start_at.startsWith(meetingDate));
  }

  const location = filters.value.location.trim().toLowerCase();
  if (location) {
    rows = rows.filter((r) => r.location.toLowerCase().includes(location));
  }

  const total = rows.length;
  const size = query.size;
  const from = Math.min(query.from, Math.max(0, total - (total ? 1 : 0)));
  const aligned = Math.floor(from / size) * size;
  query.from = total === 0 ? 0 : aligned;

  items.value = rows.slice(query.from, query.from + size).map(mapRow);
  setPagination({ from: query.from, size, total });
};

const onSearch = () => {
  query.from = 0;
  fetchList();
};

const onPageChange = (from: number) => {
  applyPage(query, from);
  if (usingMock.value) {
    applyMockPage();
    return;
  }
  fetchList();
};

const onPageSizeChange = (size: number) => {
  applyPageSize(query, size);
  if (usingMock.value) {
    applyMockPage();
    return;
  }
  fetchList();
};

const onAddMeeting = () => {
  navigateTo("/meetings/new");
};

const onView = (item: MeetingListItem) => {
  navigateTo(`/meetings/${item.id}`);
};

onMounted(() => {
  fetchList();
});
</script>
