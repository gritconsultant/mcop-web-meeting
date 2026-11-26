<template>
  <div class="space-y-4">
    <UCBreadcrumb :items="breadcrumb" />

    <UCPageHeader :title="topicTitle" />

    <div class="flex justify-between pb-4">
      <span class="text-xl font-bold">
        {{ selectedTab == "old" ? "ก่อนแก้ไข" : "หลังแก้ไข" }}
      </span>
      <UCCardHistorySwitch
        v-model:is-switch="selectedTab"
        main-title="ก่อนแก้ไข"
        sub-title="หลังแก้ไข"
      />
    </div>

    <UCDescriptionList :items="metaItems" />
    <UCDescriptionList :items="editItems" />

    <UCCard :title="topicTitle" class="mx-auto max-w-5xl">
      <div class="space-y-4">
        <UCCard title="สาระสำคัญ / รายละเอียด" accordion>
          <div class="text-sm leading-6" v-html="current.detail" />
        </UCCard>

        <UCUpload
          title="ไฟล์ที่เกี่ยวข้อง"
          :currently-files="current.files"
          disabled
          multiple
        />

        <div class="space-y-2">
          <p class="text-sm">บันทึกมติที่ประชุม ของ{{ topicTitle }}</p>
          <div
            class="min-h-20 rounded-md border p-3 text-sm"
            :class="resolutionClass"
          >
            {{ current.resolution }}
          </div>
        </div>
      </div>
    </UCCard>
  </div>
</template>

<script setup lang="ts">
import type { CurrentlyFile } from "#shared/types/file";

const topicTitle = "เรื่องที่ 1 เรื่องที่ประธานแจ้งให้ทราบ";

const breadcrumb = [
  { label: "ประวัติการแก้ไข", to: "/reports/history" },
  { label: topicTitle },
];

const metaItems = [
  { label: "วันที่ประชุม", value: "28 กรกฎาคม 2568  13:00 - 15:40" },
  { label: "คณะ", value: "คณะกรรมการดำเนินการ" },
  { label: "สถานที่", value: "ห้องประชุมชั้น 5" },
  { label: "ระเบียบวาระ", value: "ระเบียบวาระที่ 1 เรื่องเสนอที่ประชุมทราบ" },
];

const editItems = [
  { label: "วันที่แก้ไข", value: "25/09/2568" },
  { label: "เจ้าหน้าที่ผู้ดำเนินการแก้ไข", value: "อัมพร เรืองสมัย" },
  {
    label: "หมายเหตุ",
    value: "ปรับตัวเลขวงเงินในข้อ 2 และต้องการเอกสารเพิ่มเติม",
  },
];

const file = (id: string, name: string, type: string): CurrentlyFile => ({
  id,
  url: "#",
  file_names: name,
  file_types: type,
  convert_size: "2 MB - 28/08/2569 11:21",
});

const SNAPSHOTS = {
  old: {
    detail: "<p>วงเงินตามข้อ 2 จำนวน 1,000,000 บาท</p>",
    resolution: "ที่ประชุมรับทราบ",
    files: [
      file("1", "รายงานการประชุมที่ครั้งที่...", "application/pdf"),
      file("2", "รายการบัญชี", "application/vnd.ms-excel"),
    ],
  },
  new: {
    detail: "<p>วงเงินตามข้อ 2 จำนวน 1,200,000 บาท พร้อมเอกสารเพิ่มเติม</p>",
    resolution: "ที่ประชุมรับทราบและให้ดำเนินการตามเสนอ",
    files: [
      file("1", "รายงานการประชุมที่ครั้งที่...", "application/pdf"),
      file("2", "รายการบัญชี", "application/vnd.ms-excel"),
      file("3", "รายการบัญชี (แก้ไข)", "application/vnd.ms-excel"),
    ],
  },
};

const selectedTab = ref<"old" | "new">("old");
const current = computed(() => SNAPSHOTS[selectedTab.value]);
const resolutionClass = computed(() => {
  if (SNAPSHOTS.old.resolution === SNAPSHOTS.new.resolution) return "";
  return selectedTab.value == "old"
    ? "border-[#FF3838] bg-[#FFF4F4] text-[#FF3838]"
    : "border-[#0066DA] text-grayText";
});
</script>
