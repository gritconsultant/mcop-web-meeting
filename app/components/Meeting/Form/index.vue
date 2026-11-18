<template>
  <div class="meeting-form-page">
    <div class="meeting-form-page__card">
      <UCBreadcrumb :items="breadcrumbs" />

      <div class="meeting-form-page__title">
        <h1>{{ pageTitle }}</h1>
        <MeetingStatusBadge
          v-if="!isCreate"
          :status="status"
          :status-name="statusName"
        />
      </div>

      <MeetingFormStepper
        :steps="FORM_STEPS"
        :current="step"
        @select="onSelectStep"
      />

      <div class="meeting-form-page__body">
        <UCSkeletonPageForm v-if="loading" />

        <MeetingFormStepInfo
          v-else-if="step === 0"
          v-model:form="infoForm"
          :meeting-no-label="meetingNoLabel"
          :set-items="setItems"
          :committee-items="committeeItems"
          :loading-sets="loadingSets"
          :loading-committees="loadingCommittees"
          :loading-members="loadingMembers"
          :members="members"
          :guests="guests"
        />

        <MeetingFormStepInvite
          v-else-if="step === 1"
          v-model:form="inviteForm"
          v-model:recipients="recipients"
        />

        <MeetingFormStepAgenda
          v-else-if="step === 2"
          v-model:agendas="agendas"
        />

        <MeetingFormStepReview
          v-else
          :info="reviewInfo"
          :invite="reviewInvite"
          :agendas="agendas"
        />
      </div>

      <div class="meeting-form-page__footer">
        <UCButton type="outline" label="ย้อนกลับ" @click="onBack" />
        <div class="meeting-form-page__footer-actions">
          <UCButton
            v-if="showDraftButton"
            type="add"
            label="บันทึกฉบับร่าง"
            @click="onSaveDraft"
          />
          <UCButton type="primary" :label="primaryLabel" @click="onNext" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type {
  Committee,
  CommitteeSet,
  MeetingAgendaDraft,
  MeetingFormStep,
  MeetingInfoForm,
  MeetingInviteForm,
  MeetingInviteRecipient,
  MeetingPerson,
  MeetingStatus,
} from "#shared/types/meeting";
import { MEETING_STATUS_LABEL } from "#shared/types/meeting";
import type { UCSelectItem } from "#shared/types/select";
import service from "~/service";

const props = defineProps<{
  mode: "create" | "edit";
  meetingId?: string;
}>();

const FORM_STEPS: MeetingFormStep[] = [
  {
    key: "info",
    label: "ข้อมูลการประชุมและผู้เข้าประชุม",
    lines: ["ข้อมูลการประชุม", "และผู้เข้าประชุม"],
  },
  { key: "invite", label: "เชิญประชุม" },
  { key: "agenda", label: "ระเบียบวาระ" },
  { key: "review", label: "ตรวจสอบข้อมูล" },
];

const MOCK_SETS: CommitteeSet[] = [
  {
    id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    set_number: 47,
    year: "2568",
    created_at: "2025-11-25T09:00:00",
    updated_at: "2025-11-25T09:00:00",
  },
];

const MOCK_COMMITTEES: Committee[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "คณะกรรมการดำเนินการ",
    description: null,
    created_at: "2025-11-25T09:00:00",
    updated_at: "2025-11-25T09:00:00",
  },
  {
    id: "987fcdeb-51a2-43d7-9012-345678901234",
    name: "คณะกรรมการเงินกู้",
    description: null,
    created_at: "2025-11-25T09:30:00",
    updated_at: "2025-11-25T09:30:00",
  },
];

const MOCK_MEMBERS: MeetingPerson[] = [
  { id: "m1", name: "พล.ต.อ. สมชาย รัตนภักดี", detail: "ประธานกรรมการ" },
  { id: "m2", name: "พ.ต.อ. วิวัฒน์ ไวยวัฒน์", detail: "รองประธานกรรมการ" },
  { id: "m3", name: "พ.ต.อ. สุรศักดิ์ มั่นคง", detail: "กรรมการ" },
  { id: "m4", name: "พ.ต.ท. ประสิทธิ์ พัฒนกิจ", detail: "กรรมการ" },
  { id: "m5", name: "พ.ต.ท. อนุชา ใจดี", detail: "กรรมการ" },
  { id: "m6", name: "ร.ต.อ. กิตติศักดิ์ แสงทอง", detail: "กรรมการ" },
  { id: "m7", name: "ร.ต.ท. ณัฐวุฒิ สุขใจ", detail: "กรรมการ" },
  { id: "m8", name: "ร.ต.ท. ศิริพร วงศ์สว่าง", detail: "กรรมการ" },
  { id: "m9", name: "ด.ต. วรพล อุดมสุข", detail: "กรรมการ" },
  { id: "m10", name: "ด.ต. อภิชาติ เจริญสุข", detail: "กรรมการ" },
  { id: "m11", name: "จ.ส.ต. สมหมาย มีสุข", detail: "กรรมการ" },
  { id: "m12", name: "ส.ต.ท. ปิยะนุช ตั้งใจ", detail: "กรรมการ" },
  { id: "m13", name: "ส.ต.ท. ธนาวุฒิ ก้าวหน้า", detail: "กรรมการ" },
  { id: "m14", name: "ส.ต.ต. วิไลวรรณ รักดี", detail: "กรรมการ" },
  { id: "m15", name: "ส.ต.ต. ชัยวัฒน์ อดทน", detail: "กรรมการ" },
];

const MOCK_GUESTS: MeetingPerson[] = [
  { id: "g1", name: "กฤตวิทย์ ชายสำอางค์", detail: "ตัวแทนจากบริษัทกฤตธยา" },
];

const MOCK_AGENDA_DETAIL = `<p>ประธานได้แจ้งให้ที่ประชุมทราบเกี่ยวกับผลการดำเนินงานของสหกรณ์ออมทรัพย์ในรอบครึ่งปีแรกของปี พ.ศ. 2568 โดยภาพรวมสหกรณ์มีผลการดำเนินงานที่น่าพอใจ สินทรัพย์รวมของสหกรณ์ ณ วันที่ 30 มิถุนายน 2568 มีจำนวนทั้งสิ้น 12,500,000,000 บาท เพิ่มขึ้นจากสิ้นปี 2567 คิดเป็นอัตราการเติบโตร้อยละ 4.8 ซึ่งสูงกว่าเป้าหมายที่ตั้งไว้ที่ร้อยละ 4.0 สะท้อนให้เห็นถึงความเชื่อมั่นของสมาชิกที่มีต่อสหกรณ์อย่างต่อเนื่อง</p>
<p>ในส่วนของเงินรับฝากจากสมาชิกนั้น มียอดรวมทั้งสิ้น 8,200,000,000 บาท เพิ่มขึ้นจากเดือนก่อนหน้าร้อยละ 3.2 โดยเงินฝากออมทรัพย์พิเศษยังคงเป็นประเภทที่ได้รับความนิยมสูงสุด คิดเป็นสัดส่วนร้อยละ 62 ของเงินฝากทั้งหมด รองลงมาคือเงินฝากประจำร้อยละ 28 และเงินฝากออมทรัพย์ร้อยละ 10 ตามลำดับ ทั้งนี้สหกรณ์ได้ปรับอัตราดอกเบี้ยเงินฝากให้สอดคล้องกับสภาวะตลาดเงินในปัจจุบัน เพื่อรักษาความสามารถในการแข่งขันและดึงดูดเงินฝากจากสมาชิก</p>
<p>สำหรับด้านสินเชื่อ ยอดสินเชื่อคงค้างมีจำนวน 9,800,000,000 บาท อัตราส่วนหนี้ที่ไม่ก่อให้เกิดรายได้หรือ NPL อยู่ที่ร้อยละ 1.85 ลดลงจากไตรมาสก่อนหน้าที่อยู่ที่ร้อยละ 2.10 แสดงให้เห็นว่ามาตรการติดตามหนี้และการปรับโครงสร้างหนี้ให้แก่สมาชิกที่ประสบปัญหาทางการเงินนั้นมีประสิทธิภาพ คณะกรรมการเห็นชอบให้ปรับลดอัตราดอกเบี้ยเงินกู้ลงร้อยละ 0.25 มีผลตั้งแต่วันที่ 1 กรกฎาคม 2568 เป็นต้นไป เพื่อบรรเทาภาระให้แก่สมาชิกผู้กู้ยืม</p>
<p>กำไรสุทธิสะสมในช่วง 6 เดือนแรกของปีมีจำนวน 450,000,000 บาท คิดเป็นร้อยละ 52 ของเป้าหมายทั้งปี คาดการณ์ว่าเมื่อสิ้นปีจะสามารถจ่ายเงินปันผลในอัตราร้อยละ 6.00 ต่อปี และเงินเฉลี่ยคืนสำหรับสมาชิกกู้ยืมในอัตราร้อยละ 12.50 ของดอกเบี้ยที่ชำระ ซึ่งเป็นอัตราที่ใกล้เคียงกับปีก่อน นอกจากนี้สหกรณ์ยังมีแผนลงทุนในพันธบัตรรัฐบาลเพิ่มเติมอีก 500,000,000 บาท อายุ 5 ปี อัตราดอกเบี้ยร้อยละ 2.85 เพื่อกระจายความเสี่ยงและสร้างผลตอบแทนที่มั่นคงให้แก่สหกรณ์ในระยะยาว</p>`;

const MOCK_AGENDAS: MeetingAgendaDraft[] = [
  {
    id: "agenda-1",
    label: "ระเบียบวาระที่ 1 เรื่องเสนอที่ประชุมทราบ",
    agendaType: "informed",
    topics: [
      {
        id: "topic-1",
        title: "เรื่องที่ประธานแจ้งให้ทราบ",
        detail: MOCK_AGENDA_DETAIL,
        files: [],
      },
      {
        id: "topic-1b",
        title:
          "รายงานผลการดำเนินงานทางการเงิน ประจำเดือนกรกฎาคม 2568",
        detail: "",
        files: [],
      },
    ],
  },
  {
    id: "agenda-2",
    label: "ระเบียบวาระที่ 2 เรื่องสืบเนื่อง",
    agendaType: "follow_up",
    topics: [
      {
        id: "topic-2",
        title: "ติดตามมติครั้งก่อน",
        detail: "",
        files: [],
      },
    ],
  },
  {
    id: "agenda-3",
    label: "ระเบียบวาระที่ 3 เรื่องเสนอที่ประชุมพิจารณา",
    agendaType: "consider",
    topics: [
      {
        id: "topic-3",
        title: "พิจารณางบประมาณ",
        detail: "",
        files: [],
      },
    ],
  },
];

const loading = ref(true);
const step = ref(0);
const status = ref<MeetingStatus>("draft");
const statusName = ref(MEETING_STATUS_LABEL.draft);
const meetingNo = ref<number | null>(null);
const meetingYear = ref("2568");

const infoForm = ref<MeetingInfoForm>({
  meetingSetId: "",
  meetingCommitteeId: "",
  meetingDate: undefined,
  startTime: undefined,
  location: "",
});

const inviteForm = ref<MeetingInviteForm>({
  remind7Days: true,
  remind2Days: true,
  isEmail: true,
  isSms: true,
  isLine: true,
  meetingUrl: "",
  emailSubject: "",
  emailBody: "",
  smsMessage: "",
  lineMessage: "",
  files: [],
});

const setItems = ref<UCSelectItem[]>([]);
const committeeItems = ref<UCSelectItem[]>([]);
const loadingSets = ref(false);
const loadingCommittees = ref(false);
const loadingMembers = ref(false);
const members = ref<MeetingPerson[]>([]);
const guests = ref<MeetingPerson[]>([]);
const recipients = ref<MeetingInviteRecipient[]>([]);
const agendas = ref<MeetingAgendaDraft[]>([]);

const isCreate = computed(() => props.mode === "create");

const breadcrumbs = computed(() => [
  { label: "ระเบียบการประชุม", to: "/meetings" },
  {
    label: isCreate.value ? "เพิ่มวาระการประชุม" : "ฉบับร่าง",
  },
]);

const pageTitle = computed(() =>
  isCreate.value ? "เพิ่มวาระการประชุม" : "วาระการประชุม",
);

const showDraftButton = computed(() => step.value === 2);

const meetingNoLabel = computed(() => {
  if (meetingNo.value == null) return "";
  return `${meetingNo.value}/${meetingYear.value}`;
});

const primaryLabel = computed(() => {
  if (step.value === FORM_STEPS.length - 1) {
    return isCreate.value ? "บันทึก" : "ยืนยัน";
  }
  return "ถัดไป";
});

const reviewInfo = computed(() => ({
  setLabel:
    setItems.value.find((i) => i.value === infoForm.value.meetingSetId)
      ?.label ?? "",
  committeeLabel:
    committeeItems.value.find(
      (i) => i.value === infoForm.value.meetingCommitteeId,
    )?.label ?? "",
  meetingNoLabel: meetingNoLabel.value,
  meetingDate: infoForm.value.meetingDate ?? "",
  startTime: infoForm.value.startTime ?? "",
  location: infoForm.value.location,
}));

const reviewInvite = computed(() => ({
  remind7Days: inviteForm.value.remind7Days,
  remind2Days: inviteForm.value.remind2Days,
  isEmail: inviteForm.value.isEmail,
  isSms: inviteForm.value.isSms,
  isLine: inviteForm.value.isLine,
  meetingUrl: inviteForm.value.meetingUrl,
  selectedCount: recipients.value.filter((r) => r.selected).length,
  totalCount: recipients.value.length,
}));

const toSetItems = (rows: CommitteeSet[]): UCSelectItem[] =>
  (Array.isArray(rows) ? rows : []).map((e: any) => ({
    value: e?.id ?? "",
    label: `ชุดที่ ${e?.set_number ?? ""} (01/10/${e?.year ?? ""} - 30/09/${Number(e?.year) + 1 || e?.year || ""})`,
  }));

const toCommitteeItems = (rows: Committee[]): UCSelectItem[] =>
  (Array.isArray(rows) ? rows : []).map((e: any) => ({
    value: e?.id ?? "",
    label: e?.name ?? "",
  }));

const syncRecipientsFromMembers = () => {
  recipients.value = members.value.map((m) => ({
    id: m.id ?? "",
    name: m.name ?? "",
    position: m.detail ?? "",
    channels: "Email, SMS, LINE",
    selected: true,
  }));
};

const fetchSets = async () => {
  loadingSets.value = true;
  // TODO: เปิดยิงจริงทีหลัง (กัน 401)
  setItems.value = toSetItems(MOCK_SETS);
  loadingSets.value = false;
  return;

  try {
    const resp = await service.meeting.getCommitteeSets({
      from: 0,
      size: 50,
      sort_by: "set_number",
      order_by: "desc",
    });
    const { data, code } = resp as any;
    if (code == "200") {
      const rows = Array.isArray(data) ? data : [];
      setItems.value = toSetItems(rows.length ? rows : MOCK_SETS);
    } else {
      setItems.value = toSetItems(MOCK_SETS);
    }
  } catch (err: any) {
    setItems.value = toSetItems(MOCK_SETS);
    showAlert({
      type: "warning",
      title: (err && "ดึงข้อมูลชุดไม่สำเร็จ") || "",
      text: err?.message || "",
      isToast: true,
    });
  } finally {
    loadingSets.value = false;
  }
};

const fetchCommittees = async () => {
  loadingCommittees.value = true;
  // TODO: เปิดยิงจริงทีหลัง (กัน 401)
  committeeItems.value = toCommitteeItems(MOCK_COMMITTEES);
  loadingCommittees.value = false;
  return;

  try {
    const resp = await service.meeting.getCommittees({
      from: 0,
      size: 50,
      sort_by: "name",
      order_by: "asc",
    });
    const { data, code } = resp as any;
    if (code == "200") {
      const rows = Array.isArray(data) ? data : [];
      committeeItems.value = toCommitteeItems(
        rows.length ? rows : MOCK_COMMITTEES,
      );
    } else {
      committeeItems.value = toCommitteeItems(MOCK_COMMITTEES);
    }
  } catch (err: any) {
    committeeItems.value = toCommitteeItems(MOCK_COMMITTEES);
    showAlert({
      type: "warning",
      title: (err && "ดึงข้อมูลคณะไม่สำเร็จ") || "",
      text: err?.message || "",
      isToast: true,
    });
  } finally {
    loadingCommittees.value = false;
  }
};

const fetchMembers = async (id?: string) => {
  loadingMembers.value = true;

  members.value = [...MOCK_MEMBERS];
  loadingMembers.value = false;
  syncRecipientsFromMembers();

  // try {
  //   if (!id) {
  //     members.value = [...MOCK_MEMBERS];
  //     return;
  //   }
  //   const resp = await service.meeting.getMeetingMembers(id);
  //   const { data, code } = resp as any;
  //   if (code == "200") {
  //     const rows = Array.isArray(data) ? data : [];
  //     if (!rows.length) {
  //       members.value = [...MOCK_MEMBERS];
  //       return;
  //     }
  //     members.value = rows.map((e: any, index: number) => {
  //       const emp = e?.employee;
  //       const name = [
  //         emp?.prefix_name_th ?? "",
  //         emp?.first_name_th ?? "",
  //         emp?.last_name_th ?? "",
  //       ]
  //         .filter(Boolean)
  //         .join(" ");
  //       return {
  //         id: e?.employee_id || `member-${index}`,
  //         name: name || "-",
  //         detail: e?.position?.name?.trim?.() || "-",
  //       };
  //     });
  //   } else {
  //     members.value = [...MOCK_MEMBERS];
  //   }
  // } catch (err: any) {
  //   members.value = [...MOCK_MEMBERS];
  //   showAlert({
  //     type: "warning",
  //     title: (err && "ดึงข้อมูลผู้เข้าประชุมไม่สำเร็จ") || "",
  //     text: err?.message || "",
  //     isToast: true,
  //   });
  // } finally {
  //   loadingMembers.value = false;
  //   syncRecipientsFromMembers();
  // }
};

const applyCreateDefaults = () => {
  status.value = "draft";
  statusName.value = MEETING_STATUS_LABEL.draft;
  meetingNo.value = null;
  infoForm.value = {
    meetingSetId: setItems.value[0]?.value ?? MOCK_SETS[0]!.id,
    meetingCommitteeId:
      committeeItems.value[0]?.value ?? MOCK_COMMITTEES[0]!.id,
    meetingDate: undefined,
    startTime: undefined,
    location: "",
  };
  inviteForm.value.emailSubject = "";
  inviteForm.value.emailBody = "";
  inviteForm.value.smsMessage = "";
  inviteForm.value.lineMessage = "";
  guests.value = [];
  agendas.value = [];
  members.value = [...MOCK_MEMBERS];
  syncRecipientsFromMembers();
};

const applyEditMock = () => {
  status.value = "draft";
  statusName.value = MEETING_STATUS_LABEL.draft;
  meetingNo.value = 7;
  meetingYear.value = "2568";
  infoForm.value = {
    meetingSetId: MOCK_SETS[0]!.id,
    meetingCommitteeId: MOCK_COMMITTEES[0]!.id,
    meetingDate: "2025-08-26",
    startTime: "13:30",
    location: "ห้องประชุมชั้น 5 อาคารสำนักงาน",
  };
  inviteForm.value = {
    ...inviteForm.value,
    emailSubject: "หนังสือเชิญประชุมคณะกรรมการดำเนินการ ครั้งที่ 7/2568",
    emailBody:
      "เรียน คณะกรรมการดำเนินการ ทุกท่าน\n\nขอเชิญเข้าร่วมประชุมคณะกรรมการดำเนินการ ครั้งที่ 7/2568",
    smsMessage: "ขอเชิญประชุม กก.ดำเนินการ วันที่ 26 ส.ค. 68 เวลา 13.30 น.",
    lineMessage: "ขอเชิญประชุมคณะกรรมการดำเนินการ ครั้งที่ 7/2568",
  };
  guests.value = [];
  agendas.value = structuredClone(MOCK_AGENDAS);
  members.value = [...MOCK_MEMBERS];
  syncRecipientsFromMembers();
};

const fetchMeeting = async () => {
  if (isCreate.value || !props.meetingId) {
    applyCreateDefaults();
    return;
  }

  applyEditMock();

  // try {
  //   const resp = await service.meeting.getMeeting(props.meetingId);
  //   const { data, code } = resp as any;
  //   if (code != "200" || !data) {
  //     applyEditMock();
  //     return;
  //   }

  //   status.value = data?.status ?? "draft";
  //   statusName.value =
  //     data?.status_name?.trim?.() || MEETING_STATUS_LABEL[status.value];
  //   meetingNo.value = data?.meeting_no ?? null;
  //   meetingYear.value = data?.meeting_set?.year || "2568";

  //   const start = data?.start_at ?? "";
  //   infoForm.value = {
  //     meetingSetId: data?.meeting_set_id || MOCK_SETS[0]!.id,
  //     meetingCommitteeId: data?.meeting_committee_id || MOCK_COMMITTEES[0]!.id,
  //     meetingDate: start ? start.slice(0, 10) : undefined,
  //     startTime: start.length >= 16 ? start.slice(11, 16) : undefined,
  //     location: data?.location ?? "",
  //   };

  //   const inv = data?.invitation;
  //   if (inv) {
  //     inviteForm.value = {
  //       remind7Days: inv?.is_remind_7_days ?? true,
  //       remind2Days: inv?.is_remind_2_days ?? true,
  //       isEmail: inv?.is_email ?? true,
  //       isSms: inv?.is_sms ?? true,
  //       isLine: inv?.is_line ?? true,
  //       meetingUrl: inv?.meeting_url ?? "",
  //       emailSubject: inv?.email_subject ?? "",
  //       emailBody: inv?.email_body ?? "",
  //       smsMessage: inv?.sms_message ?? "",
  //       lineMessage: inv?.line_message ?? "",
  //       files: (Array.isArray(inv?.files) ? inv.files : []).map((f: any) => ({
  //         id: f?.id ?? "",
  //         url: f?.url ?? "",
  //         file_names: f?.file_names ?? "",
  //         convert_size: f?.convert_size ?? "",
  //       })),
  //     };
  //   }

  //   guests.value = (Array.isArray(data?.guests) ? data.guests : []).map(
  //     (g: any) => ({
  //       id: g?.id ?? "",
  //       name: g?.full_name ?? "",
  //       detail: g?.detail?.trim?.() || "-",
  //     }),
  //   );
  //   if (!guests.value.length) guests.value = [...MOCK_GUESTS];

  //   const apiAgendas = Array.isArray(data?.agendas) ? data.agendas : [];
  //   agendas.value = apiAgendas.length
  //     ? apiAgendas.map((a: any) => ({
  //         id: a?.id ?? "",
  //         label:
  //           a?.agenda_type === "other"
  //             ? `วาระที่ ${a?.agenda_no ?? ""} ${a?.agenda_title || "เรื่องอื่น ๆ"}`
  //             : `วาระที่ ${a?.agenda_no ?? ""} ${a?.agenda_type_name || ""}`,
  //         agendaType: a?.agenda_type ?? "",
  //         topics: (Array.isArray(a?.topics) ? a.topics : []).map((t: any) => ({
  //           id: t?.id ?? "",
  //           title: t?.title ?? "",
  //           detail: t?.detail?.replace?.(/<[^>]+>/g, "") || "",
  //           files: (Array.isArray(t?.files) ? t.files : []).map((f: any) => ({
  //             id: f?.id ?? "",
  //             url: f?.url ?? "",
  //             file_names: f?.file_names ?? "",
  //             convert_size: f?.convert_size ?? "",
  //           })),
  //         })),
  //       }))
  //     : structuredClone(MOCK_AGENDAS);
  // } catch (err: any) {
  //   applyEditMock();
  //   showAlert({
  //     type: "warning",
  //     title: (err && "ดึงข้อมูลการประชุมไม่สำเร็จ") || "",
  //     text: err?.message || "",
  //     isToast: true,
  //   });
  // }
};

const onSelectStep = (index: number) => {
  if (index <= step.value) step.value = index;
};

const onBack = () => {
  if (step.value === 0) {
    navigateTo("/meetings");
    return;
  }
  step.value -= 1;
};

const onNext = async () => {
  if (step.value >= FORM_STEPS.length - 1) {
    const ok = await confirmAction(
      isCreate.value
        ? "ยืนยันการบันทึกวาระการประชุมหรือไม่"
        : "ยืนยันการบันทึกการแก้ไขหรือไม่",
    );
    if (!ok) return;
    await showSaveSuccess();
    navigateTo("/meetings");
    return;
  }

  if (step.value === 2 && !agendas.value.length) {
    await showAlert({
      type: "warning",
      title: "ต้องมีอย่างน้อย 1 ระเบียบวาระ",
      isToast: true,
    });
    return;
  }

  step.value += 1;
};

const onSaveDraft = async () => {
  const ok = await confirmAction("ยืนยันการบันทึกฉบับร่างหรือไม่");
  if (!ok) return;
  await showSaveSuccess();
  navigateTo("/meetings");
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchSets(), fetchCommittees()]);
  await fetchMeeting();
  await fetchMembers(props.meetingId);
  loading.value = false;
});
</script>
