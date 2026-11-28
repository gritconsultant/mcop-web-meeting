<template>
  <div class="meeting-list-table">
    <UCDataTable
      :items="items"
      :loading="loading"
      :pagination="pagination"
      :skeleton-rows="3"
      :skeleton-columns="8"
      :skeleton-column-variants="[
        'line',
        'text',
        'text',
        'text',
        'text',
        'amount',
        'badge',
        'action',
      ]"
      :page-sizes="pageSizes"
      @page-change="emit('pageChange', $event)"
      @page-size-change="emit('pageSizeChange', $event)"
    >
      <template #header>
        <tr>
          <th class="w-20">ลำดับ</th>
          <th class="w-[120px]">ครั้งที่</th>
          <th class="w-[200px]">วันที่ประชุม</th>
          <th class="is-left">คณะ</th>
          <th class="is-left">สถานที่</th>
          <th class="w-[120px]">ผู้เข้าร่วม</th>
          <th class="w-[140px]">สถานะการประชุม</th>
          <th :class="actionClass" />
        </tr>
      </template>

      <template #body="{ items: rows }">
        <tr v-for="(item, index) in rows" :key="item.id">
          <td>{{ (pagination?.from ?? 0) + index + 1 }}</td>
          <td>{{ item.meetingNo }}</td>
          <td>{{ formatMeetingDateTime(item.meetingDate) }}</td>
          <td class="is-left">{{ item.committee }}</td>
          <td class="is-left">{{ item.location }}</td>
          <td>{{ item.attendees }} ท่าน</td>
          <td>
            <MeetingStatusBadge
              :status="item.status"
              :status-name="item.statusName"
            />
          </td>
          <td>
            <slot name="action" :item="item">
              <button
                type="button"
                class="meeting-list-table__view"
                aria-label="ดูรายละเอียด"
                title="ดูรายละเอียด"
                @click="emit('view', item)"
              >
                <img
                  :src="viewIcon"
                  alt=""
                  width="32"
                  height="32"
                />
              </button>
            </slot>
          </td>
        </tr>
      </template>
    </UCDataTable>
  </div>
</template>

<script setup lang="ts">
import type { MeetingListItem } from "#shared/types/meeting";
import type { PaginationMeta } from "#shared/types/pagination";
import { formatDate } from "~/utils/format/date";
import viewIcon from "~/assets/icon/meeting/view-search.svg";

withDefaults(
  defineProps<{
    items: MeetingListItem[];
    loading?: boolean;
    pagination?: PaginationMeta;
    pageSizes?: number[];
    actionClass?: string;
  }>(),
  {
    loading: false,
    pageSizes: () => [5, 10, 20, 30, 50],
    actionClass: "w-20",
  },
);

const emit = defineEmits<{
  pageChange: [from: number];
  pageSizeChange: [size: number];
  view: [item: MeetingListItem];
}>();

const formatMeetingDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const dateLabel = formatDate(date);
  const timeLabel = date.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateLabel}  ${timeLabel}`;
};
</script>
