<template>
  <div class="flex max-w-[1100px] flex-col gap-5">
    <section class="flex flex-col gap-3">
      <h2 class="m-0 text-xl font-bold leading-tight text-[#1A1E24]">
        กำหนดส่งอัตโนมัติ
      </h2>
      <div class="flex flex-wrap gap-x-6 gap-y-4">
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-[#1A1E24]">
          <UCheckbox v-model="form.remind7Days" />
          <span>รอบที่ 1 : ก่อนวันประชุม 7 วัน</span>
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-[#1A1E24]">
          <UCheckbox v-model="form.remind2Days" />
          <span>รอบที่ 2 : ก่อนวันประชุม 2 วัน</span>
        </label>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="m-0 text-xl font-bold leading-tight text-[#1A1E24]">
        ช่องทางการส่ง
      </h2>
      <div class="flex flex-wrap gap-x-6 gap-y-4">
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-[#1A1E24]">
          <UCheckbox v-model="form.isEmail" />
          <span>อีเมล</span>
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-[#1A1E24]">
          <UCheckbox v-model="form.isSms" />
          <span>SMS</span>
        </label>
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-[#1A1E24]">
          <UCheckbox v-model="form.isLine" />
          <span>LINE</span>
        </label>
      </div>

      <UCFormField
        label="URL สำหรับการประชุม"
        name="meeting_url"
        class="mt-4"
      >
        <UCInput
          v-model="form.meetingUrl"
          leading-text="https://"
          leading-text-width="5.5rem"
          placeholder="แนบลิงก์สำหรับการประชุม"
        />
      </UCFormField>

      <div class="mt-4">
        <UCUpload
          title="ไฟล์ที่เกี่ยวข้อง"
          :currently-files="form.files"
          multiple
        />
      </div>
    </section>

    <section v-if="form.isEmail" class="flex w-full flex-col">
      <button
        type="button"
        class="flex h-[45px] w-full cursor-pointer items-center gap-3 rounded-t-xl border border-[#afafaf] bg-[#f9f9f9] px-4 text-left text-base font-bold text-[#1A1E24]"
        @click="togglePanel('email')"
      >
        <span class="min-w-0 flex-1">อีเมล</span>
        <span
          class="inline-flex h-7 items-center whitespace-nowrap rounded-full bg-[#d5feef] px-2.5 py-1 text-xs font-bold text-[#008e6d]"
        >
          พร้อมส่ง · {{ selectedCount }}/{{ recipients.length }} ราย มีอีเมล
        </span>
        <UIcon
          :name="
            panelOpen.email ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
          "
          class="size-5 shrink-0"
        />
      </button>
      <div
        v-show="panelOpen.email"
        class="rounded-b-xl border border-t-0 border-[#afafaf] bg-white p-5"
      >
        <UCFormField label="หัวข้อ" name="email_subject" required>
          <UCInput v-model="form.emailSubject" placeholder="กรอกหัวข้ออีเมล" />
        </UCFormField>
        <UCFormField label="เนื้อหา" name="email_body" class="mt-3" required>
          <UCInput
            v-model="form.emailBody"
            multiline
            :rows="5"
            placeholder="กรอกเนื้อหาอีเมล"
          />
        </UCFormField>
      </div>
    </section>

    <section v-if="form.isSms" class="flex w-full flex-col">
      <button
        type="button"
        class="flex h-[45px] w-full cursor-pointer items-center gap-3 rounded-t-xl border border-[#afafaf] bg-[#f9f9f9] px-4 text-left text-base font-bold text-[#1A1E24]"
        @click="togglePanel('sms')"
      >
        <span class="min-w-0 flex-1">SMS</span>
        <span
          class="inline-flex h-7 items-center whitespace-nowrap rounded-full bg-[#d5feef] px-2.5 py-1 text-xs font-bold text-[#008e6d]"
        >
          พร้อมส่ง · {{ selectedCount }}/{{ recipients.length }} ราย มีเบอร์โทร
        </span>
        <UIcon
          :name="
            panelOpen.sms ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
          "
          class="size-5 shrink-0"
        />
      </button>
      <div
        v-show="panelOpen.sms"
        class="rounded-b-xl border border-t-0 border-[#afafaf] bg-white p-5"
      >
        <UCFormField label="ข้อความ" name="sms_message" required>
          <UCInput
            v-model="form.smsMessage"
            multiline
            :rows="3"
            placeholder="กรอกข้อความ SMS"
          />
        </UCFormField>
      </div>
    </section>

    <section v-if="form.isLine" class="flex w-full flex-col">
      <button
        type="button"
        class="flex h-[45px] w-full cursor-pointer items-center gap-3 rounded-t-xl border border-[#afafaf] bg-[#f9f9f9] px-4 text-left text-base font-bold text-[#1A1E24]"
        @click="togglePanel('line')"
      >
        <span class="min-w-0 flex-1">LINE</span>
        <span
          class="inline-flex h-7 items-center whitespace-nowrap rounded-full bg-[#d5feef] px-2.5 py-1 text-xs font-bold text-[#008e6d]"
        >
          พร้อมส่ง · {{ selectedCount }}/{{ recipients.length }} ราย ผูก LINE
          ไว้แล้ว
        </span>
        <UIcon
          :name="
            panelOpen.line ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
          "
          class="size-5 shrink-0"
        />
      </button>
      <div
        v-show="panelOpen.line"
        class="rounded-b-xl border border-t-0 border-[#afafaf] bg-white p-5"
      >
        <UCFormField label="ข้อความ" name="line_message" required>
          <UCInput
            v-model="form.lineMessage"
            multiline
            :rows="3"
            placeholder="กรอกข้อความ LINE"
          />
        </UCFormField>
      </div>
    </section>

    <section class="flex w-full flex-col">
      <div
        class="flex h-[45px] w-full cursor-default items-center gap-3 rounded-t-xl border border-[#afafaf] bg-[#f9f9f9] px-4 text-left text-base font-bold text-[#1A1E24]"
      >
        <span class="min-w-0 flex-1">ผู้รับคำเชิญ</span>
        <span
          class="inline-flex h-7 items-center whitespace-nowrap rounded-full bg-[#e8f1ff] px-2.5 py-1 text-xs font-bold text-[#0066da]"
        >
          เลือกแล้ว {{ selectedCount }}/{{ recipients.length }} ท่าน
        </span>
      </div>
      <div class="rounded-b-xl border border-t-0 border-[#afafaf] bg-white p-5">
        <div class="meeting-form-table w-full overflow-auto">
          <UCDataTable
            :items="recipients"
            :show-pagination="false"
            :skeleton-rows="5"
            :skeleton-columns="5"
            :skeleton-column-variants="['line', 'line', 'text', 'text', 'text']"
          >
            <template #header>
              <tr>
                <th class="w-14">
                  <UCheckbox
                    :model-value="allSelected"
                    @update:model-value="toggleAll"
                  />
                </th>
                <th class="w-20 min-w-20 max-w-20">ลำดับ</th>
                <th class="is-left">ชื่อ - นามสกุล</th>
                <th class="is-left">ตำแหน่ง</th>
                <th class="is-left">ช่องทางที่ได้รับข้อมูลติดต่อ</th>
              </tr>
            </template>

            <template #body="{ items: rows }">
              <tr v-for="(row, index) in rows" :key="row.key">
                <td>
                  <UCheckbox v-model="row.selected" />
                </td>
                <td class="w-20 min-w-20 max-w-20">{{ index + 1 }}</td>
                <td class="is-left">{{ row.name }}</td>
                <td class="is-left">{{ row.position }}</td>
                <td class="is-left">{{ row.channels }}</td>
              </tr>
            </template>
          </UCDataTable>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  MeetingInviteForm,
  MeetingInviteRecipient,
} from "#shared/types/meeting";

const form = defineModel<MeetingInviteForm>("form", { required: true });
const recipients = defineModel<MeetingInviteRecipient[]>("recipients", {
  required: true,
});

type InvitePanelKey = "email" | "sms" | "line";

const panelOpen = ref<Record<InvitePanelKey, boolean>>({
  email: true,
  sms: true,
  line: true,
});

const togglePanel = (key: InvitePanelKey) => {
  panelOpen.value[key] = !panelOpen.value[key];
};

const selectedCount = computed(
  () => recipients.value.filter((r) => r.selected).length,
);

const allSelected = computed(
  () =>
    recipients.value.length > 0 &&
    recipients.value.every((r) => r.selected),
);

const toggleAll = (value: boolean | "indeterminate") => {
  const selected = value === true;
  recipients.value = recipients.value.map((row) => ({
    ...row,
    selected,
  }));
};
</script>
