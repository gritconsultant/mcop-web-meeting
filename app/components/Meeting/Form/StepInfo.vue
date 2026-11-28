<template>
  <div
    class="grid w-full grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
  >
    <section
      class="flex w-full min-w-0 flex-col gap-5 rounded-xl border border-[#afafaf] bg-white p-5"
    >
      <h2 class="m-0 text-xl font-bold leading-tight text-[#1A1E24]">
        ข้อมูลการประชุม
      </h2>

      <div class="flex w-full flex-col gap-5">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UCFormField
            label="ชุด"
            name="meeting_set_id"
            required
            :error="errors.meeting_set_id"
          >
            <UCSelectInput
              :model-value="form.meetingSetId || undefined"
              :items="setItems"
              :loading="loadingSets"
              :disabled="!editable"
              clearable
              placeholder="เลือกชุด"
              @update:model-value="form.meetingSetId = $event || ''"
            />
          </UCFormField>

          <UCFormField
            label="คณะ"
            name="meeting_committee_id"
            required
            :error="errors.meeting_committee_id"
          >
            <UCSelectInput
              :model-value="form.meetingCommitteeId || undefined"
              :items="committeeItems"
              :loading="loadingCommittees"
              :disabled="!editable"
              clearable
              placeholder="เลือกคณะ"
              @update:model-value="form.meetingCommitteeId = $event || ''"
            />
          </UCFormField>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <UCFormField label="ครั้งที่" name="meeting_no">
            <UCInput :model-value="meetingNoLabel" placeholder="" disabled />
            <!--placeholder="เพิ่มอัตโนมัติ" -->
          </UCFormField>

          <UCFormField
            label="วันที่ประชุม"
            name="meeting_date"
            required
            :error="errors.meeting_date"
          >
            <UCInputDatePicker
              v-model="form.meetingDate"
              mode="date"
              placeholder="เลือกวันที่ประชุม"
              :disabled="!editable"
            />
            <p v-if="postponeHint" class="m-0 mt-1 text-xs text-[#7c7c7c]">
              เปลี่ยนวันที่หรือเวลาแล้วบันทึก เพื่อเลื่อนวันประชุม
            </p>
          </UCFormField>

          <UCFormField
            label="เวลาเริ่มต้น"
            name="start_time"
            required
            :error="errors.start_time"
          >
            <UCInputDatePicker
              v-model="form.startTime"
              mode="time"
              placeholder="เลือกเวลา"
              :disabled="!editable"
            />
          </UCFormField>
        </div>

        <UCFormField
          label="สถานที่"
          name="location"
          required
          :error="errors.location"
        >
          <UCInput
            v-model="form.location"
            placeholder="กรอกสถานที่"
            :disabled="!editable"
          />
        </UCFormField>
      </div>
    </section>

    <section
      class="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-[#afafaf] bg-white p-5"
    >
      <h2 class="m-0 text-xl font-bold leading-tight text-[#1A1E24]">
        ผู้เข้าประชุมตั้งต้น
      </h2>

      <div class="flex w-full flex-wrap items-end gap-4">
        <div class="grid w-full max-w-[70%] min-w-[280px] grid-cols-2 gap-4">
          <div
            class="flex min-w-0 items-center gap-3 rounded-xl border border-[#afafaf] bg-white px-5 py-3"
          >
            <div
              class="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e6d1d1]"
              aria-hidden="true"
            >
              <img
                :src="attendeeStarIcon"
                alt=""
                class="block size-8"
                width="32"
                height="32"
              />
            </div>
            <div class="flex min-w-0 flex-1 flex-col items-end gap-1.5">
              <div class="w-full text-right text-sm font-normal text-[#1A1E24]">
                ผู้เข้าประชุม (ท่าน)
              </div>
              <div class="w-full text-right text-xl font-bold text-[#1A1E24]">
                {{ members.length }}
              </div>
            </div>
          </div>

          <div
            class="flex min-w-0 items-center gap-3 rounded-xl border border-[#afafaf] bg-white px-5 py-3"
          >
            <div
              class="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e6d1d1]"
              aria-hidden="true"
            >
              <img
                :src="guestUsersIcon"
                alt=""
                class="block size-8"
                width="32"
                height="32"
              />
            </div>
            <div class="flex min-w-0 flex-1 flex-col items-end gap-1.5">
              <div class="w-full text-right text-sm font-normal text-[#1A1E24]">
                ผู้เข้าร่วมประชุม (ท่าน)
              </div>
              <div class="w-full text-right text-xl font-bold text-[#1A1E24]">
                {{ guests.length }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 min-w-0 w-full flex-col gap-4">
        <div
          class="flex min-w-0 w-full items-end overflow-x-auto"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            class="h-10 shrink-0 cursor-pointer rounded-t-xl border-0 border-b border-[#afafaf] px-4 text-sm font-bold text-[#1A1E24]"
            :class="
              attendeeTab === 'members'
                ? 'border-b-[#444] bg-[#444] text-white'
                : 'bg-transparent'
            "
            @click="attendeeTab = 'members'"
          >
            ผู้เข้าประชุม
          </button>
          <button
            type="button"
            role="tab"
            class="h-10 shrink-0 cursor-pointer rounded-t-xl border-0 border-b border-[#afafaf] px-4 text-sm font-bold text-[#1A1E24]"
            :class="
              attendeeTab === 'guests'
                ? 'border-b-[#444] bg-[#444] text-white'
                : 'bg-transparent'
            "
            @click="attendeeTab = 'guests'"
          >
            ผู้เข้าร่วมประชุม
          </button>
          <div
            class="h-10 min-w-4 flex-1 border-b border-[#afafaf]"
            aria-hidden="true"
          />
        </div>

        <div
          v-if="attendeeTab === 'guests' && editable"
          class="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <UCFormField label="ชื่อ - นามสกุล" name="guest_name">
            <UCInput
              v-model="guestName"
              placeholder="กรอกชื่อผู้เข้าร่วมประชุม"
              @keyup.enter="addGuest"
            />
          </UCFormField>
          <UCFormField label="รายละเอียด" name="guest_detail">
            <UCInput
              v-model="guestDetail"
              placeholder="กรอกรายละเอียด"
              @keyup.enter="addGuest"
            />
          </UCFormField>
          <UCButton type="add" label="เพิ่ม" @click="addGuest" />
        </div>

        <div
          class="meeting-form-table max-h-[420px] min-w-0 w-full overflow-auto"
        >
          <UCDataTable
            :items="activeRows"
            :loading="loadingMembers"
            :show-pagination="false"
            :skeleton-rows="5"
            :skeleton-columns="attendeeTab === 'guests' && editable ? 4 : 3"
            :skeleton-column-variants="['line', 'text', 'text']"
          >
            <template #header>
              <tr>
                <th class="meeting-form-table__col-index">ลำดับ</th>
                <th class="is-left">ชื่อ - นามสกุล</th>
                <th class="is-left">
                  {{ attendeeTab === "members" ? "ตำแหน่ง" : "รายละเอียด" }}
                </th>
                <th v-if="attendeeTab === 'guests' && editable" class="w-16" />
              </tr>
            </template>

            <template #body="{ items: rows }">
              <tr v-for="(row, index) in rows" :key="row.key">
                <td class="meeting-form-table__col-index">{{ index + 1 }}</td>
                <template v-if="attendeeTab === 'guests' && editable">
                  <td class="is-left">
                    <UCInput
                      :model-value="row.name"
                      placeholder="ชื่อ - นามสกุล"
                      @update:model-value="updateGuest(row.key, 'name', $event)"
                    />
                  </td>
                  <td class="is-left">
                    <UCInput
                      :model-value="row.detail === '-' ? '' : row.detail"
                      placeholder="รายละเอียด"
                      @update:model-value="
                        updateGuest(row.key, 'detail', $event)
                      "
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      class="cursor-pointer border-0 bg-transparent text-sm font-bold text-[#b42318]"
                      @click="removeGuest(row.key)"
                    >
                      ลบ
                    </button>
                  </td>
                </template>
                <template v-else>
                  <td class="is-left">{{ row.name }}</td>
                  <td class="is-left">{{ row.detail }}</td>
                </template>
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
import type { MeetingInfoForm, MeetingPerson } from "#shared/types/meeting";
import type { UCSelectItem } from "#shared/types/select";
import { createDraftKey } from "~/utils/ui/generate";
import attendeeStarIcon from "~/assets/icon/meeting/attendee-star.svg";
import guestUsersIcon from "~/assets/icon/meeting/guest-users.svg";

const form = defineModel<MeetingInfoForm>("form", { required: true });
const guests = defineModel<MeetingPerson[]>("guests", { required: true });

const props = withDefaults(
  defineProps<{
    meetingNoLabel: string;
    setItems: UCSelectItem[];
    committeeItems: UCSelectItem[];
    loadingSets?: boolean;
    loadingCommittees?: boolean;
    loadingMembers?: boolean;
    editable?: boolean;
    postponeHint?: boolean;
    members: MeetingPerson[];
    errors?: {
      meeting_set_id?: string;
      meeting_committee_id?: string;
      meeting_date?: string;
      start_time?: string;
      location?: string;
    };
  }>(),
  {
    loadingSets: false,
    loadingCommittees: false,
    loadingMembers: false,
    editable: true,
    postponeHint: false,
    errors: () => ({}),
  },
);

const errors = computed(() => props.errors);

const attendeeTab = ref<"members" | "guests">("members");
const guestName = ref("");
const guestDetail = ref("");

const activeRows = computed(() =>
  attendeeTab.value === "members" ? props.members : guests.value,
);

const addGuest = () => {
  const name = guestName.value.trim();
  if (!name) {
    showAlert({
      type: "warning",
      title: "กรุณากรอกชื่อผู้เข้าร่วมประชุม",
      isToast: true,
    });
    return;
  }

  guests.value = [
    ...guests.value,
    {
      key: createDraftKey(),
      name,
      detail: guestDetail.value.trim() || "-",
    },
  ];
  guestName.value = "";
  guestDetail.value = "";
};

const updateGuest = (
  key: string,
  field: "name" | "detail",
  value: string | undefined,
) => {
  guests.value = guests.value.map((guest) =>
    guest.key === key ? { ...guest, [field]: value ?? "" } : guest,
  );
};

const removeGuest = (key: string) => {
  guests.value = guests.value.filter((guest) => guest.key !== key);
};
</script>
