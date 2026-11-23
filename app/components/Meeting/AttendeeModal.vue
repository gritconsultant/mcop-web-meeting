<template>
  <ModalLayout
    :open="open"
    title="รายชื่อผู้เข้าประชุม"
    panel-class="max-w-3xl"
    @close="emit('close')"
  >
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
        <tbody>
          <tr v-for="(p, i) in rows" :key="p.name">
            <td>{{ i + 1 }}</td>
            <td class="is-left">{{ p.name }}</td>
            <template v-if="tab === 'members'">
              <td class="is-left">{{ p.position }}</td>
              <td>{{ p.status }}</td>
            </template>
            <td v-else class="is-left">{{ p.detail }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <UCButton type="outline" label="ปิด" @click="emit('close')" />
    </template>
  </ModalLayout>
</template>

<script setup lang="ts">
import starIcon from "~/assets/icon/meeting/icon-star.svg";
import memberIcon from "~/assets/icon/meeting/icon-member.svg";

const props = defineProps<{ open: boolean }>();

const emit = defineEmits<{ close: [] }>();

// mock data
const members = [
  {
    name: "พล.ต.ต. สมชาย รัตนโภศล",
    position: "ประธานกรรมการ",
    status: "onsite",
  },
  {
    name: "พ.ต.อ. อรุณ ไชยวัฒน์",
    position: "รองประธานกรรมการ",
    status: "online",
  },
  {
    name: "พ.ต.อ.หญิง สุนีย์ พงษ์เจริญ",
    position: "กรรมการ",
    status: "ติดภารกิจ",
  },
  { name: "พ.ต.ท. วิชัย ศรีสมบัติ", position: "กรรมการ", status: "ติดภารกิจ" },
  { name: "พ.ต.ท.หญิง กาญจนา ทองสุข", position: "กรรมการ", status: "ลาประชุม" },
  { name: "ร.ต.อ. ธนกร บุญมาก", position: "กรรมการ", status: "onsite" },
  { name: "ร.ต.อ.หญิง มาลี ศิริวงศ์", position: "กรรมการ", status: "onsite" },
];
const participants = Array.from({ length: 15 }, (_, i) => ({
  name: `ผู้เข้าร่วมประชุม ${i + 1}`,
  detail: "ตัวแทน",
}));
type Row = {
  name: string;
  position?: string;
  status?: string;
  detail?: string;
};
const lists: Record<"members" | "participants", Row[]> = {
  members,
  participants,
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
  { label: "ผู้เข้าประชุม (ท่าน)", count: members.length, icon: starIcon },
  {
    label: "ผู้เข้าร่วมประชุม (ท่าน)",
    count: participants.length,
    icon: memberIcon,
  },
]);

const rows = computed(() => lists[tab.value]);

watch(
  () => props.open,
  (v) => v && (tab.value = "members"),
);
</script>
