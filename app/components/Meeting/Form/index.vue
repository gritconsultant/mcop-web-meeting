<template>
  <div class="meeting-form-page">
    <div class="meeting-form-page__card">
      <UCBreadcrumb :items="breadcrumbs" />

      <div class="meeting-form-page__title">
        <h1>{{ pageTitle }}</h1>
        <UCSkeleton
          v-if="!isCreate && loading"
          variant="badge"
          width="200px"
          height="28px"
          rounded="full"
        />
        <MeetingStatusBadge
          v-else-if="!isCreate"
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

        <div v-else class="m-0 min-w-0">
        <MeetingFormStepInfo
          v-if="step === 0"
          v-model:form="infoForm"
          v-model:guests="guests"
          :meeting-no-label="meetingNoLabel"
          :set-items="setItems"
          :committee-items="committeeItems"
          :loading-sets="loadingSets"
          :loading-committees="loadingCommittees"
          :loading-members="loadingMembers"
          :editable="canEdit"
          :postpone-hint="canPostpone"
          :members="members"
          :errors="infoErrors"
        />

        <fieldset
          v-else
          :disabled="!canEdit"
          class="m-0 min-w-0 border-0 p-0"
        >
          <MeetingFormStepInvite
            v-if="step === 1"
            v-model:form="inviteForm"
            v-model:recipients="recipients"
            :errors="inviteErrors"
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
        </fieldset>
        </div>
      </div>

      <div class="meeting-form-page__footer">
        <UCButton
          type="outline"
          label="ย้อนกลับ"
          :disabled="footerBusy"
          @click="onBack"
        />
        <div class="meeting-form-page__footer-actions">
          <UCButton
            v-if="canEdit && showDraftButton"
            type="add"
            label="บันทึกฉบับร่าง"
            :disabled="footerBusy"
            @click="onSaveDraft"
          />
          <UCButton
            type="primary"
            :label="primaryLabel"
            :disabled="footerBusy"
            @click="onNext"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
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
import type { Query } from "#shared/types/query";
import type { UCSelectItem } from "#shared/types/select";
import service from "~/service";

const props = defineProps<{
  mode: "create" | "edit";
  meetingId?: string;
}>();

const queryMaster = reactive<Query>({
  from: 0,
  size: 99,
  sort_by: "",
  order_by: "",
});

const employeeDisplayName = (emp: any) =>
  [emp?.prefix_name_th ?? "", emp?.first_name_th ?? "", emp?.last_name_th ?? ""]
    .filter(Boolean)
    .join(" ");

const buildStartAt = (date?: string, time?: string) => {
  const d = date?.trim()?.slice(0, 10) ?? "";
  if (!d) return "";
  const t = (time?.trim() || "00:00").slice(0, 5);  
  return `${d}T${t}:00`;
};

const agendaLabel = (a: any) => {
  const no = a?.agenda_no ?? "";
  if (a?.agenda_type === "other") {
    return `ระเบียบวาระที่ ${no} ${a?.agenda_title || "เรื่องอื่น ๆ"}`;
  }
  return `ระเบียบวาระที่ ${no} ${a?.agenda_type_name || ""}`.trim();
};

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

const loading = ref(true);
const saving = ref(false);
const step = ref(0);
const status = ref<MeetingStatus>("draft");
const statusName = ref(MEETING_STATUS_LABEL.draft);
const meetingNo = ref<number | null>(null);
const meetingYear = ref("");
const activeMeetingId = ref(props.meetingId ?? "");

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

const isCreate = computed(
  () => props.mode === "create" && !activeMeetingId.value,
);

const canEdit = computed(
  () =>
    isCreate.value || status.value === "draft" || status.value === "waiting",
);

const canPostpone = computed(
  () => !isCreate.value && status.value === "waiting",
);

const breadcrumbs = computed(() => [
  { label: "ระเบียบการประชุม", to: "/meetings" },
  {
    label: isCreate.value
      ? "เพิ่มวาระการประชุม"
      : canEdit.value
        ? "แก้ไขวาระการประชุม"
        : "ดูวาระการประชุม",
  },
]);

const pageTitle = computed(() =>
  isCreate.value
    ? "เพิ่มวาระการประชุม"
    : canEdit.value
      ? "วาระการประชุม"
      : "ดูวาระการประชุม",
);

const showDraftButton = computed(() => step.value < FORM_STEPS.length - 1);

const footerBusy = computed(
  () =>
    loading.value ||
    saving.value ||
    loadingSets.value ||
    loadingCommittees.value ||
    loadingMembers.value,
);

const meetingNoLabel = computed(() => {
  if (meetingNo.value == null) return "";
  return meetingYear.value
    ? `${meetingNo.value}/${meetingYear.value}`
    : String(meetingNo.value);
});

const primaryLabel = computed(() => {
  if (!canEdit.value && step.value === FORM_STEPS.length - 1) return "ปิด";
  if (step.value === FORM_STEPS.length - 1) {
    return isCreate.value ? "บันทึก" : "ยืนยัน";
  }
  return "ถัดไป";
});

const formSnapshot = () =>
  JSON.stringify({
    info: infoForm.value,
    invite: inviteForm.value,
    guests: guests.value,
    recipients: recipients.value,
    agendas: agendas.value,
  });

const savedSnapshot = ref("");

const isDirty = computed(
  () =>
    canEdit.value &&
    savedSnapshot.value !== "" &&
    formSnapshot() !== savedSnapshot.value,
);

const markClean = () => {
  savedSnapshot.value = formSnapshot();
};

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isDirty.value) return;
  event.preventDefault();
  event.returnValue = "";
};

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
  (Array.isArray(rows) ? rows : []).flatMap((e: any) => {
    const value = String(e?.id ?? "").trim();
    if (!value) return [];
    const year = String(e?.year ?? "").trim();
    const setNo = e?.set_number ?? "";
    const label = year
      ? `ชุดที่ ${setNo} (01/10/${year} - 30/09/${Number(year) + 1 || year})`
      : `ชุดที่ ${setNo}`;
    return [{ value, label }];
  });

const toCommitteeItems = (rows: Committee[]): UCSelectItem[] =>
  (Array.isArray(rows) ? rows : []).flatMap((e: any) => {
    const value = String(e?.id ?? "").trim();
    const label = String(e?.name ?? "").trim();
    if (!value || !label) return [];
    return [{ value, label }];
  });

const ensureOption = (
  items: typeof setItems,
  value: string,
  label: string,
) => {
  if (!value || !label) return;
  if (items.value.some((item) => item.value === value)) return;
  items.value = [{ value, label }, ...items.value];
};

const syncRecipientsFromMembers = (preferSelectedIds?: Set<string>) => {
  recipients.value = members.value.map((m) => ({
    key: m.key,
    id: m.id ?? "",
    name: m.name ?? "",
    position: m.detail ?? "",
    channels: "Email, SMS, LINE",
    selected: preferSelectedIds
      ? !!m.id && preferSelectedIds.has(m.id)
      : true,
  }));
};

const mapMeetingMembers = (rows: any[]): MeetingPerson[] =>
  (Array.isArray(rows) ? rows : []).map((e: any) => {
    const emp = e?.employee;
    const name = employeeDisplayName(emp);
    const id = e?.employee_id || emp?.id || undefined;
    return {
      key: id || createDraftKey(),
      id,
      name: name || "-",
      detail: e?.position?.name?.trim?.() || "-",
    };
  });

const fetchSets = async () => {
  loadingSets.value = true;
  try {
    const resp = await service.meeting.getCommitteeSets({
      from: queryMaster.from,
      size: queryMaster.size,
    });
    const { data, code } = resp as any;
    if (code == "200") {
      setItems.value = toSetItems(Array.isArray(data) ? data : []);
    } else {
      setItems.value = [];
    }
  } catch (err: any) {
    setItems.value = [];
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
  try {
    const resp = await service.meeting.getCommittees({
      from: queryMaster.from,
      size: queryMaster.size,
    });
    const { data, code } = resp as any;
    if (code == "200") {
      committeeItems.value = toCommitteeItems(Array.isArray(data) ? data : []);
    } else {
      committeeItems.value = [];
    }
  } catch (err: any) {
    committeeItems.value = [];
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

const mapRosterMembers = (rows: any[]): MeetingPerson[] =>
  (Array.isArray(rows) ? rows : []).map((row: any) => {
    const emp = row?.employee;
    const id = row?.employee_id || emp?.id || "";
    return {
      key: id || createDraftKey(),
      id: id || undefined,
      name: employeeDisplayName(emp) || "-",
      detail: row?.current_position?.position?.name?.trim?.() || "-",
    };
  });

const fetchRosterMembers = async () => {
  const committeeId = infoForm.value.meetingCommitteeId;
  const setId = infoForm.value.meetingSetId;
  if (!committeeId || !setId) {
    members.value = [];
    syncRecipientsFromMembers();
    return;
  }

  loadingMembers.value = true;
  try {
    const rows: any[] = [];
    let total = 0;
    do {
      const resp = await service.meeting.getCommitteeMembers({
        meeting_committee_id: committeeId,
        meeting_set_id: setId,
        from: rows.length,
        size: queryMaster.size,
      });
      const { data, code, paginate } = resp as any;
      if (code != "200") break;
      const page = Array.isArray(data) ? data : [];
      rows.push(...page);
      total = paginate?.total ?? rows.length;
      if (!page.length) break;
    } while (rows.length < total);

    members.value = mapRosterMembers(rows);
    syncRecipientsFromMembers();
  } catch (err: any) {
    members.value = [];
    syncRecipientsFromMembers();
    showAlert({
      type: "warning",
      title: "ดึงรายชื่อคณะกรรมการไม่สำเร็จ",
      text: err?.message || "",
      isToast: true,
    });
  } finally {
    loadingMembers.value = false;
  }
};

const fetchMembers = async () => {
  if (!activeMeetingId.value) {
    await fetchRosterMembers();
    return;
  }

  loadingMembers.value = true;
  try {
    const resp = await service.meeting.getMeetingMembers(activeMeetingId.value);
    const { data, code } = resp as any;
    if (code == "200") {
      const rows = Array.isArray(data) ? data : [];
      members.value = mapMeetingMembers(rows);
      const invited = new Set(
        rows
          .filter((e: any) => e?.is_invited)
          .map((e: any) => e?.employee_id)
          .filter(Boolean),
      );
      syncRecipientsFromMembers(invited.size ? invited : undefined);
      return;
    }
    members.value = [];
    syncRecipientsFromMembers();
  } catch (err: any) {
    members.value = [];
    syncRecipientsFromMembers();
    showAlert({
      type: "warning",
      title: (err && "ดึงข้อมูลผู้เข้าประชุมไม่สำเร็จ") || "",
      text: err?.message || "",
      isToast: true,
    });
  } finally {
    loadingMembers.value = false;
  }
};

const applyCreateDefaults = () => {
  status.value = "draft";
  statusName.value = MEETING_STATUS_LABEL.draft;
  meetingNo.value = null;
  meetingYear.value = "";
  infoForm.value = {
    meetingSetId: "",
    meetingCommitteeId: "",
    meetingDate: undefined,
    startTime: undefined,
    location: "",
  };
  inviteForm.value = {
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
  };
  guests.value = [];
  agendas.value = [];
  members.value = [];
  syncRecipientsFromMembers();
};

const applyMeetingData = (data: any) => {
  const statusRaw = (data?.status ?? "draft") as MeetingStatus;
  status.value = statusRaw;
  statusName.value =
    data?.status_name?.trim?.() ||
    MEETING_STATUS_LABEL[statusRaw] ||
    MEETING_STATUS_LABEL.draft;
  meetingNo.value = data?.meeting_no ?? null;
  meetingYear.value = data?.meeting_set?.year?.trim?.() || "";

  const start = data?.start_at ?? "";
  const setId = data?.meeting_set_id || data?.meeting_set?.id || "";
  const committeeId =
    data?.meeting_committee_id || data?.meeting_committee?.id || "";
  infoForm.value = {
    meetingSetId: setId,
    meetingCommitteeId: committeeId,
    meetingDate: start ? start.slice(0, 10) : undefined,
    startTime: start.length >= 16 ? start.slice(11, 16) : undefined,
    location: data?.location ?? "",
  };
  ensureOption(
    setItems,
    setId,
    toSetItems(data?.meeting_set ? [data.meeting_set] : [])[0]?.label ?? "",
  );
  ensureOption(
    committeeItems,
    committeeId,
    data?.meeting_committee?.name?.trim?.() || "",
  );

  const inv = data?.invitation;
  if (inv) {
    inviteForm.value = {
      remind7Days: inv?.is_remind_7_days ?? true,
      remind2Days: inv?.is_remind_2_days ?? true,
      isEmail: inv?.is_email ?? true,
      isSms: inv?.is_sms ?? true,
      isLine: inv?.is_line ?? true,
      meetingUrl: inv?.meeting_url ?? "",
      emailSubject: inv?.email_subject ?? "",
      emailBody: inv?.email_body ?? "",
      smsMessage: inv?.sms_message ?? "",
      lineMessage: inv?.line_message ?? "",
      files: (Array.isArray(inv?.files) ? inv.files : []).map((f: any) => ({
        id: f?.file_id || f?.id || "",
        url: f?.url ?? "",
        file_names: f?.file_names ?? "",
        convert_size: f?.convert_size ?? "",
        file_types: f?.file_types ?? "",
      })),
    };
  }

  guests.value = (Array.isArray(data?.guests) ? data.guests : []).map(
    (g: any) => ({
      key: g?.id || createDraftKey(),
      id: g?.id || undefined,
      name: g?.full_name ?? "",
      detail: g?.detail?.trim?.() || "-",
    }),
  );

  const apiAgendas = Array.isArray(data?.agendas) ? data.agendas : [];
  agendas.value = apiAgendas.map((a: any) => ({
    key: a?.id || createDraftKey(),
    id: a?.id || undefined,
    label: agendaLabel(a),
    agendaType: a?.agenda_type ?? "",
    topics: (Array.isArray(a?.topics) ? a.topics : []).map((t: any) => ({
      key: t?.id || createDraftKey(),
      id: t?.id || undefined,
      title: t?.title ?? "",
      detail: t?.detail ?? "",
      files: (Array.isArray(t?.files) ? t.files : []).map((f: any) => ({
        id: f?.file_id || f?.id || "",
        url: f?.url ?? "",
        file_names: f?.file_names ?? "",
        convert_size: f?.convert_size ?? "",
        file_types: f?.file_types ?? "",
      })),
    })),
  }));
};

const fetchMeeting = async () => {
  if (!activeMeetingId.value) {
    applyCreateDefaults();
    return;
  }

  try {
    const resp = await service.meeting.getMeeting(activeMeetingId.value);
    const { data, code } = resp as any;
    if (code != "200" || !data) {
      applyCreateDefaults();
      showAlert({
        type: "warning",
        title: "ดึงข้อมูลการประชุมไม่สำเร็จ",
        isToast: true,
      });
      return;
    }
    applyMeetingData(data);
  } catch (err: any) {
    applyCreateDefaults();
    showAlert({
      type: "warning",
      title: (err && "ดึงข้อมูลการประชุมไม่สำเร็จ") || "",
      text: err?.message || "",
      isToast: true,
    });
  }
};

const buildPayload = (isDraft: boolean) => {
  const startAt = buildStartAt(
    infoForm.value.meetingDate,
    infoForm.value.startTime,
  );

  const payload: Record<string, unknown> = {
    meeting_committee_id: infoForm.value.meetingCommitteeId,
    meeting_set_id: infoForm.value.meetingSetId,
    start_at: startAt,
    location: infoForm.value.location.trim(),
    is_draft: isDraft,
  };

  payload.guests = guests.value
    .filter((g) => g.name?.trim())
    .map((g) => {
      const row: Record<string, unknown> = {
        full_name: g.name.trim(),
        detail: g.detail?.trim() && g.detail !== "-" ? g.detail.trim() : null,
      };
      if (g.id) row.id = g.id;
      return row;
    });

  const employeeIds = recipients.value
    .filter((r) => r.selected && r.id)
    .map((r) => r.id);

  payload.invitation = {
    is_email: inviteForm.value.isEmail,
    is_sms: inviteForm.value.isSms,
    is_line: inviteForm.value.isLine,
    is_remind_7_days: inviteForm.value.remind7Days,
    is_remind_2_days: inviteForm.value.remind2Days,
    meeting_url: meetingUrlForPayload(inviteForm.value.meetingUrl),
    email_subject: inviteForm.value.isEmail
      ? inviteForm.value.emailSubject?.trim() || null
      : null,
    email_body: inviteForm.value.isEmail
      ? inviteForm.value.emailBody?.trim() || null
      : null,
    sms_message: inviteForm.value.isSms
      ? inviteForm.value.smsMessage?.trim() || null
      : null,
    line_message: inviteForm.value.isLine
      ? inviteForm.value.lineMessage?.trim() || null
      : null,
    employee_ids: employeeIds,
    files: inviteForm.value.files.map((f) => f.id).filter(Boolean),
  };

  payload.agendas = agendas.value.map((a, agendaIndex) => {
    const agenda: Record<string, unknown> = {
      agenda_no: agendaIndex + 1,
      agenda_type: a.agendaType || "other",
      agenda_title:
        a.agendaType === "other"
          ? a.label?.replace(/^ระเบียบวาระที่\s*\d+\s*/, "").trim() ||
            "เรื่องอื่น ๆ"
          : null,
      topics: a.topics.map((t, topicIndex) => {
        const topic: Record<string, unknown> = {
          topic_no: topicIndex + 1,
          title: t.title?.trim() || `เรื่องที่ ${topicIndex + 1}`,
          detail: t.detail || "",
          files: t.files.map((f) => f.id).filter(Boolean),
        };
        if (t.id) topic.id = t.id;
        return topic;
      }),
    };
    if (a.id) agenda.id = a.id;
    return agenda;
  });

  return payload;
};

const stepTried = ref([false, false, false, false]);

const markStepTried = (index: number) => {
  if (stepTried.value[index]) return;
  const next = [...stepTried.value];
  next[index] = true;
  stepTried.value = next;
};

const meetingUrlError = (value: string) => {
  const url = value.trim();
  if (!url) return "";
  if (/\s/.test(url) || url.includes("://")) {
    return "กรอกลิงก์ต่อจาก https:// เช่น meet.example.com";
  }
  return "";
};

const meetingUrlForPayload = (value: string) => {
  const url = value.trim();
  if (!url) return null;
  return url.includes("://") ? url : `https://${url}`;
};

const collectInfoErrors = () => {
  const errors: Record<string, string> = {};
  if (!infoForm.value.meetingSetId) errors.meeting_set_id = "กรุณาเลือกชุด";
  if (!infoForm.value.meetingCommitteeId) {
    errors.meeting_committee_id = "กรุณาเลือกคณะ";
  }
  if (!infoForm.value.meetingDate) errors.meeting_date = "กรุณาเลือกวันที่ประชุม";
  if (!infoForm.value.startTime) errors.start_time = "กรุณาเลือกเวลาเริ่มต้น";
  if (!infoForm.value.location.trim()) errors.location = "กรุณากรอกสถานที่";
  return errors;
};

const collectInviteErrors = () => {
  const errors: Record<string, string> = {};
  const inv = inviteForm.value;
  if (!inv.remind7Days && !inv.remind2Days) {
    errors.remind = "กรุณาเลือกกำหนดส่งอย่างน้อย 1 รอบ";
  }
  if (!inv.isEmail && !inv.isSms && !inv.isLine) {
    errors.channels = "กรุณาเลือกช่องทางเชิญอย่างน้อย 1 ช่องทาง";
  }
  const urlError = meetingUrlError(inv.meetingUrl);
  if (urlError) errors.meeting_url = urlError;
  if (inv.isEmail && !inv.emailSubject.trim()) {
    errors.email_subject = "กรุณากรอกหัวข้ออีเมล";
  }
  if (inv.isEmail && !inv.emailBody.trim()) {
    errors.email_body = "กรุณากรอกเนื้อหาอีเมล";
  }
  if (inv.isSms && !inv.smsMessage.trim()) {
    errors.sms_message = "กรุณากรอกข้อความ SMS";
  }
  if (inv.isLine && !inv.lineMessage.trim()) {
    errors.line_message = "กรุณากรอกข้อความ LINE";
  }
  if (!recipients.value.some((row) => row.selected)) {
    errors.recipients = "กรุณาเลือกผู้รับคำเชิญอย่างน้อย 1 คน";
  }
  return errors;
};

const infoErrors = computed(() =>
  stepTried.value[0] ? collectInfoErrors() : {},
);
const inviteErrors = computed(() =>
  stepTried.value[1] ? collectInviteErrors() : {},
);

const plainText = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim();

const agendaError = () => {
  if (!agendas.value.length) return "ต้องมีอย่างน้อย 1 ระเบียบวาระ";
  if (agendas.value.some((agenda) => !agenda.topics.length)) {
    return "แต่ละระเบียบวาระต้องมีอย่างน้อย 1 เรื่อง";
  }
  if (
    agendas.value.some((agenda) =>
      agenda.topics.some((topic) => !topic.title.trim()),
    )
  ) {
    return "กรุณากรอกชื่อเรื่องให้ครบ";
  }
  if (
    agendas.value.some((agenda) =>
      agenda.topics.some((topic) => !plainText(topic.detail || "")),
    )
  ) {
    return "กรุณากรอกรายละเอียดเรื่องให้ครบ";
  }
  return "";
};

const validateBeforeSave = (isDraft: boolean) => {
  markStepTried(0);
  const infoMessage = Object.values(collectInfoErrors())[0];
  if (infoMessage) return infoMessage;
  if (isDraft) return "";

  markStepTried(1);
  const inviteMessage = Object.values(collectInviteErrors())[0];
  if (inviteMessage) return inviteMessage;
  return agendaError();
};

const persistMeeting = async (isDraft: boolean) => {
  const error = validateBeforeSave(isDraft);
  if (error) {
    if (Object.keys(collectInfoErrors()).length) step.value = 0;
    else if (!isDraft && Object.keys(collectInviteErrors()).length) step.value = 1;
    else if (!isDraft && agendaError()) step.value = 2;
    await showAlert({ type: "warning", title: error, isToast: true });
    return false;
  }

  saving.value = true;
  try {
    const payload = buildPayload(isDraft);
    const resp = activeMeetingId.value
      ? await service.meeting.updateMeeting(activeMeetingId.value, payload)
      : await service.meeting.createMeeting(payload);
    const { data, code, message } = resp as any;
    if (code != "200") {
      await showAlert({
        type: "warning",
        title: message || "บันทึกไม่สำเร็จ",
        isToast: true,
      });
      return false;
    }

    const newId = data?.id || activeMeetingId.value;
    if (newId && newId !== activeMeetingId.value) {
      activeMeetingId.value = newId;
      await navigateTo(`/meetings/${newId}`, { replace: true });
    }
    if (data?.meeting_no != null) meetingNo.value = data.meeting_no;
    if (data?.status) {
      status.value = data.status;
      statusName.value =
        MEETING_STATUS_LABEL[data.status as MeetingStatus] || statusName.value;
    }
    markClean();
    return true;
  } catch (err: any) {
    await showAlert({
      type: "warning",
      title: (err && "บันทึกไม่สำเร็จ") || "",
      text: err?.message || "",
      isToast: true,
    });
    return false;
  } finally {
    saving.value = false;
  }
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
  if (footerBusy.value) return;

  if (!canEdit.value) {
    if (step.value >= FORM_STEPS.length - 1) {
      navigateTo("/meetings");
      return;
    }
    step.value += 1;
    return;
  }

  if (step.value >= FORM_STEPS.length - 1) {
    const ok = await confirmAction(
      status.value === "draft"
        ? "ยืนยันการบันทึกวาระการประชุมหรือไม่"
        : "ยืนยันการบันทึกการแก้ไขหรือไม่",
    );
    if (!ok) return;
    const saved = await persistMeeting(false);
    if (!saved) return;
    await showSaveSuccess();
    navigateTo("/meetings");
    return;
  }

  if (step.value === 0) {
    markStepTried(0);
    if (Object.keys(collectInfoErrors()).length) return;
  }

  if (step.value === 1) {
    markStepTried(1);
    if (Object.keys(collectInviteErrors()).length) return;
  }

  if (step.value === 2) {
    const message = agendaError();
    if (message) {
      await showAlert({ type: "warning", title: message, isToast: true });
      return;
    }
  }

  step.value += 1;
};

const onSaveDraft = async () => {
  if (footerBusy.value) return;
  const ok = await confirmAction("ยืนยันการบันทึกฉบับร่างหรือไม่");
  if (!ok) return;
  const saved = await persistMeeting(true);
  if (!saved) return;
  await showSaveSuccess();
  navigateTo("/meetings");
};

watch(
  () =>
    [infoForm.value.meetingCommitteeId, infoForm.value.meetingSetId] as const,
  async () => {
    if (loading.value || activeMeetingId.value) return;
    await fetchMembers();
  },
);

onBeforeRouteLeave(async () => {
  if (!isDirty.value) return true;
  return showAlertConfirm({
    type: "warning",
    title: "ยังไม่บันทึก",
    text: "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่",
    confirmButtonText: "ออกจากหน้านี้",
    cancelButtonText: "อยู่ต่อ",
  }) as Promise<boolean>;
});

onMounted(async () => {
  window.addEventListener("beforeunload", onBeforeUnload);
  loading.value = true;
  activeMeetingId.value = props.meetingId ?? "";
  await Promise.all([fetchCommittees(), fetchSets()]);
  await fetchMeeting();
  await fetchMembers();
  loading.value = false;
  markClean();
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
});
</script>
