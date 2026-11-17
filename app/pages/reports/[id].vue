<template>
  <div class="space-y-4">
    <UCBreadcrumb :items="breadcrumb" />

    <UCPageHeader :title="`รายงานการประชุม ครั้งที่ ${meeting.meetingNo}`">
      <template #actions>
        <UCButtonDownloadFile
          label="ดาวน์โหลดไฟล์รายงาน"
          :options="downloadItems"
        />
        <UCButtonDownloadFile
          label="ดาวน์โหลดไฟล์มติเฉพาะ"
          :options="downloadItems"
        />
      </template>

      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <UCDescriptionList :items="metaItems" />
        <UCButton label="รายชื่อผู้เข้าประชุม" />
      </div>
    </UCPageHeader>

    <div class="flex gap-6">
      <aside
        v-if="agendaOpen"
        class="w-72 shrink-0 border-r border-[#E4E7ED] pr-4"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-bold">ระเบียบวาระ</h2>
          <UCIconButton
            icon="i-lucide-chevron-left"
            label="ซ่อนระเบียบวาระ"
            tone="light"
            class="size-8! bg-[#3a3a3a]"
            @click="agendaOpen = false"
          />
        </div>

        <ul class="space-y-1 text-sm">
          <li v-for="a in agendas" :key="a.id">
            <p class="px-3 py-2 font-bold">{{ a.title }}</p>
            <ul v-if="a.topics.length" class="ml-3 border-l border-[#AFAFAF]">
              <li v-for="t in a.topics" :key="t.id">
                <button
                  type="button"
                  class="block w-full truncate px-3 py-2 text-left"
                  :class="
                    t.id === activeTopicId
                      ? 'border-l-2 border-[#222] bg-[#f3f3f3] font-medium'
                      : 'text-neutral-500 hover:bg-black/5'
                  "
                  @click="activeTopicId = t.id"
                >
                  {{ t.title }}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </aside>

      <section class="min-w-0 flex-1 space-y-4">
        <div class="flex items-center gap-3">
          <UCIconButton
            v-if="!agendaOpen"
            icon="i-lucide-chevron-right"
            label="แสดงระเบียบวาระ"
            tone="light"
            class="size-8! bg-[#3a3a3a]"
            @click="agendaOpen = true"
          />
          <h2 class="text-lg font-bold">{{ activeAgenda?.title }}</h2>
        </div>

        <UCCard :title="activeTopic?.title">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-bold">{{ topicDetail.heading }}</h3>
              <UCButton
                type="edit-warning"
                icon="i-lucide-square-pen"
                label="แก้ไขมติ"
              />
            </div>

            <UCCard title="สาระสำคัญ / รายละเอียด" accordion>
              <div class="space-y-4 text-sm leading-6">
                <p v-for="(p, i) in topicDetail.paragraphs" :key="i">
                  {{ p }}
                </p>
              </div>
            </UCCard>

            <h3 class="text-lg font-bold">ไฟล์ที่เกี่ยวข้อง</h3>
            <div class="flex flex-wrap gap-3">
              <UCUploadFileCard
                v-for="(f, i) in topicDetail.files"
                :key="i"
                :href="f.href"
                :name="f.name"
                :size-label="f.sizeLabel"
                :file-type="f.type"
              />
            </div>

            <div class="space-y-2">
              <p class="text-sm">บันทึกมติที่ประชุม ของ{{ activeTopic?.title }}</p>
              <UCInput
                v-model="resolution"
                multiline
                :rows="3"
                placeholder="ที่ประชุมรับทราบ"
              />
              <div class="flex justify-end">
                <UCButton type="search" label="ส่งมติ" />
              </div>
            </div>
          </div>
        </UCCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// ponytail: mock data, route `id` is ignored (every id shows 6/2568); read route.params.id when report detail API exists
const meeting = {
  meetingNo: "6/2568",
  date: "28 กรกฎาคม 2568  13:00 - 15:40",
  committee: "คณะกรรมการดำเนินการ",
  place: "ห้องประชุมชั้น 5",
};

const agendas = [
  {
    id: "a1",
    title: "ระเบียบวาระที่ 1 เรื่องเสนอที่ประชุมทราบ",
    topics: [
      { id: "t1", title: "เรื่องที่ 1 เรื่องที่ประธานแจ้งให้ทราบ" },
      { id: "t2", title: "เรื่องที่ 2 รายงานผลการดำเนินงานทางก..." },
      { id: "t3", title: "เรื่องที่ 3 รายงานผลการปฏิบัติงานตามแ..." },
      { id: "t4", title: "เรื่องที่ 4 รายงานความก้าวหน้าโครงกา..." },
      { id: "t5", title: "เรื่องที่ 5 สรุปผลการดำเนินงานด้านทรัพ..." },
      { id: "t6", title: "เรื่องที่ 6 รายงานสถานะงบประมาณคงเห..." },
    ],
  },
  { id: "a2", title: "ระเบียบวาระที่ 2 เรื่องสืบเนื่อง", topics: [] },
  {
    id: "a3",
    title: "ระเบียบวาระที่ 3 เรื่องเสนอที่ประชุมพิจารณา",
    topics: [],
  },
];

const topicDetail = {
  heading: "เรื่องที่ประธานแจ้งให้ทราบ",
  paragraphs: [
    "ประธานได้แจ้งให้ที่ประชุมทราบเกี่ยวกับผลการดำเนินงานของสหกรณ์ออมทรัพย์ในรอบครึ่งปีแรกของปี พ.ศ. 2568 โดยภาพรวมสหกรณ์มีผลการดำเนินงานที่น่าพอใจ สินทรัพย์รวมของสหกรณ์ ณ วันที่ 30 มิถุนายน 2568 มีจำนวนทั้งสิ้น 12,500,000,000 บาท เพิ่มขึ้นจากสิ้นปี 2567 คิดเป็นอัตราการเติบโตร้อยละ 4.8 ซึ่งสูงกว่าเป้าหมายที่ตั้งไว้ที่ร้อยละ 4.0",
    "ในส่วนของเงินรับฝากจากสมาชิกนั้น มียอดรวมทั้งสิ้น 8,200,000,000 บาท เพิ่มขึ้นจากเดือนก่อนหน้าร้อยละ 3.2 โดยเงินฝากออมทรัพย์พิเศษยังคงเป็นประเภทที่ได้รับความนิยมสูงสุด คิดเป็นสัดส่วนร้อยละ 62 ของเงินฝากทั้งหมด",
    "สำหรับด้านสินเชื่อ ยอดสินเชื่อคงค้างมีจำนวน 9,800,000,000 บาท อัตราส่วนหนี้ที่ไม่ก่อให้เกิดรายได้หรือ NPL อยู่ที่ร้อยละ 1.85 ลดลงจากไตรมาสก่อนหน้าที่อยู่ที่ร้อยละ 2.10",
  ],
  files: [
    {
      name: "รายงานการประชุมที่ครั้งที่ 6/2568.pdf",
      href: "#",
      sizeLabel: "2 MB - 28/08/69 11:21",
      type: "pdf",
    },
    {
      name: "รายการบัญชี.xlsx",
      href: "#",
      sizeLabel: "2 MB - 28/08/2569 11:21",
      type: "xlsx",
    },
    {
      name: "รายการบัญชี.xlsx",
      href: "#",
      sizeLabel: "2 MB - 28/08/2569 11:21",
      type: "xlsx",
    },
    {
      name: "ลายเซ็นต์.pdf",
      href: "#",
      sizeLabel: "2 MB - 28/08/2569 11:21",
      type: "pdf",
    },
  ],
};

const breadcrumb = [
  { label: "รายงานการประชุม", to: "/reports" },
  { label: meeting.meetingNo },
];

const metaItems = [
  { label: "วันที่ประชุม", value: meeting.date },
  { label: "คณะ", value: meeting.committee },
  { label: "สถานที่", value: meeting.place },
];

const downloadItems = [
  { id: "pdf", name: "ดาวน์โหลดไฟล์ PDF" },
  { id: "excel", name: "ดาวน์โหลดไฟล์ Excel" },
];

const agendaOpen = ref(true);
const activeTopicId = ref("t1");
const resolution = ref("");

const activeAgenda = computed(() =>
  agendas.find((a) => a.topics.some((t) => t.id === activeTopicId.value)),
);
const activeTopic = computed(() =>
  activeAgenda.value?.topics.find((t) => t.id === activeTopicId.value),
);
</script>
