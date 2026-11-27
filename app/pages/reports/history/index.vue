<template>
  <div class="flex flex-col gap-5">
    <UCForm
      :state="form"
      class="flex flex-wrap items-end gap-4"
      @submit="onSearch"
    >
      <UCFormField label="ครั้งที่" name="meetingNo" class="w-64">
        <UCInput v-model="form.meetingNo" placeholder="กรอกครั้งที่" />
      </UCFormField>
      <UCFormField label="คณะ" name="committee" class="w-64">
        <UCSelectInput
          v-model="form.committee"
          :items="committeeItems"
          :loading="loadingCommittees"
          placeholder="เลือกคณะ"
        />
      </UCFormField>
      <UCButton type="search" label="ค้นหา" button-type="submit" />
    </UCForm>

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
          <th>วันที่แก้ไข</th>
          <th>ครั้งที่</th>
          <th class="is-left">คณะ</th>
          <th class="is-left">ระเบียบวาระ</th>
          <th class="is-left">มติ</th>
          <th class="is-left">เจ้าหน้าที่ผู้ดำเนินการแก้ไข</th>
          <th class="is-left">หมายเหตุ</th>
          <th />
        </tr>
      </template>
      <template #body="{ items }">
        <tr v-for="(item, i) in items" :key="item.id">
          <td>{{ seqNum(pagination, i) }}</td>
          <td>{{ formatDate(item.edited_at) }}</td>
          <td>{{ item.meeting_no }}</td>
          <td class="is-left">{{ item.committee_name }}</td>
          <td class="is-left">{{ item.agenda }}</td>
          <td class="is-left">{{ item.resolution }}</td>
          <td class="is-left">{{ item.editor_name }}</td>
          <td class="is-left">{{ item.note }}</td>
          <td>
            <UCActionGroup>
              <UCActionButton
                action="next"
                filled
                @click="navigateTo(`/reports/history/${item.id}`)"
              />
            </UCActionGroup>
          </td>
        </tr>
      </template>
    </UCDataTable>
  </div>
</template>

<script setup lang="ts">
import type { Query } from "#shared/types/query";
import type { UCSelectItem } from "#shared/types/select";
import service from "~/service";
import { formatDate } from "~/utils/format/date";
import { seqNum } from "~/utils/table/seqNum";

interface HistoryRow {
  id: string;
  edited_at: string;
  meeting_no: string;
  committee_name: string;
  agenda: string;
  resolution: string;
  editor_name: string;
  note: string;
}

const form = reactive({
  meetingNo: "",
  committee: undefined as string | undefined,
});

const query = reactive<Query>({ from: 0, size: 5, sort_by: "", order_by: "" });
const { pagination, setPagination, applyPage, applyPageSize } =
  usePagination(5);

const MOCK_ROWS: HistoryRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  edited_at: "2025-09-20",
  meeting_no: `${i + 1}/2568`,
  committee_name: "คณะกรรมการดำเนินการ",
  agenda: "ระเบียบวาระที่ 1 เรื่องเสนอที่ประชุมทราบ",
  resolution: "เรื่องที่ 1 เรื่องที่ประธานแจ้งให้ทราบ",
  editor_name: "อัมพร เรืองสมัย",
  note: "ปรับตัวเลขวงเงินในข้อ 2 และต้องการเอกสารเพิ่มเติม",
}));

const rows = ref<HistoryRow[]>([]);
const loading = ref(false);
const getList = async () => {
  const filtered = MOCK_ROWS.filter((r) =>
    r.meeting_no.includes(form.meetingNo.trim()),
  );
  const from = query.from ?? 0;
  const size = query.size ?? 5;
  rows.value = filtered.slice(from, from + size);
  setPagination({ from, size, total: filtered.length });
};

const onSearch = () => {
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

const committeeItems = ref<UCSelectItem[]>([]);
const loadingCommittees = ref(false);
const fetchCommittees = async () => {
  loadingCommittees.value = true;
  try {
    const resp = (await service.meeting.getCommittees({
      from: 0,
      size: 99,
    })) as {
      data?: { id: string; name: string }[];
    };
    committeeItems.value = (resp.data ?? []).map((c) => ({
      value: c.id,
      label: c.name,
    }));
  } catch (err) {
    showFetchError(err);
  } finally {
    loadingCommittees.value = false;
  }
};

onMounted(() => {
  fetchCommittees();
  getList();
});
</script>
