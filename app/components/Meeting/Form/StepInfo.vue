<template>
  <div
    class="grid w-full grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
  >
    <section
      class="flex w-full min-w-0 flex-col gap-5 rounded-xl border border-[#afafaf] bg-white p-5"
    >
      <h2 class="m-0 text-xl font-bold leading-tight text-[#222]">
        ข้อมูลการประชุม
      </h2>

      <div class="flex w-full flex-col gap-5">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UCFormField label="ชุด" name="meeting_set_id" required>
            <UCSelectInput
              v-model="form.meetingSetId"
              :items="setItems"
              :loading="loadingSets"
              placeholder="เลือกชุด"
            />
          </UCFormField>

          <UCFormField label="คณะ" name="meeting_committee_id" required>
            <UCSelectInput
              v-model="form.meetingCommitteeId"
              :items="committeeItems"
              :loading="loadingCommittees"
              placeholder="เลือกคณะ"
            />
          </UCFormField>
        </div>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <UCFormField label="ครั้งที่" name="meeting_no">
            <UCInput
              :model-value="meetingNoLabel"
              placeholder="เพิ่มอัตโนมัติ"
              disabled
            />
          </UCFormField>

          <UCFormField label="วันที่ประชุม" name="meeting_date" required>
            <UCInputDatePicker
              v-model="form.meetingDate"
              mode="date"
              placeholder="เลือกวันที่ประชุม"
            />
          </UCFormField>

          <UCFormField label="เวลาเริ่มต้น" name="start_time" required>
            <UCInputDatePicker
              v-model="form.startTime"
              mode="time"
              placeholder="เลือกเวลา"
            />
          </UCFormField>
        </div>

        <UCFormField label="สถานที่" name="location" required>
          <UCInput v-model="form.location" placeholder="กรอกสถานที่" />
        </UCFormField>
      </div>
    </section>

    <section
      class="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-[#afafaf] bg-white p-5"
    >
      <h2 class="m-0 text-xl font-bold leading-tight text-[#222]">
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
              <div class="w-full text-right text-sm font-normal text-[#222]">
                ผู้เข้าประชุม (ท่าน)
              </div>
              <div class="w-full text-right text-xl font-bold text-[#222]">
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
              <div class="w-full text-right text-sm font-normal text-[#222]">
                ผู้เข้าร่วมประชุม (ท่าน)
              </div>
              <div class="w-full text-right text-xl font-bold text-[#222]">
                {{ guests.length }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 min-w-0 w-full flex-col gap-4">
        <div class="flex min-w-0 w-full items-end overflow-x-auto" role="tablist">
          <button
            type="button"
            role="tab"
            class="h-10 shrink-0 cursor-pointer rounded-t-xl border-0 border-b border-[#afafaf] px-4 text-sm font-bold text-[#222]"
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
            class="h-10 shrink-0 cursor-pointer rounded-t-xl border-0 border-b border-[#afafaf] px-4 text-sm font-bold text-[#222]"
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

        <div class="meeting-form-table max-h-[420px] min-w-0 w-full overflow-auto">
          <UCDataTable
            :items="activeRows"
            :loading="loadingMembers"
            :show-pagination="false"
            :skeleton-rows="5"
            :skeleton-columns="3"
            :skeleton-column-variants="['line', 'text', 'text']"
          >
            <template #header>
              <tr>
                <th class="meeting-form-table__col-index">ลำดับ</th>
                <th class="is-left">ชื่อ - นามสกุล</th>
                <th class="is-left">
                  {{ attendeeTab === "members" ? "ตำแหน่ง" : "รายละเอียด" }}
                </th>
              </tr>
            </template>

            <template #body="{ items: rows }">
              <tr v-for="(row, index) in rows" :key="row.key">
                <td class="meeting-form-table__col-index">{{ index + 1 }}</td>
                <td class="is-left">{{ row.name }}</td>
                <td class="is-left">{{ row.detail }}</td>
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
  MeetingInfoForm,
  MeetingPerson,
} from "#shared/types/meeting";
import type { UCSelectItem } from "#shared/types/select";
import attendeeStarIcon from "~/assets/icon/meeting/attendee-star.svg";
import guestUsersIcon from "~/assets/icon/meeting/guest-users.svg";

const form = defineModel<MeetingInfoForm>("form", { required: true });

const props = withDefaults(
  defineProps<{
    meetingNoLabel: string;
    setItems: UCSelectItem[];
    committeeItems: UCSelectItem[];
    loadingSets?: boolean;
    loadingCommittees?: boolean;
    loadingMembers?: boolean;
    members: MeetingPerson[];
    guests: MeetingPerson[];
  }>(),
  {
    loadingSets: false,
    loadingCommittees: false,
    loadingMembers: false,
  },
);

const attendeeTab = ref<"members" | "guests">("members");

const activeRows = computed(() =>
  attendeeTab.value === "members" ? props.members : props.guests,
);
</script>
