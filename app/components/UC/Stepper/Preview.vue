<template>
  <nav aria-label="ตัวอย่างลำดับการอนุมัติ" class="overflow-x-auto py-1">
    <ol class="flex items-start">
      <li
        v-for="(name, index) in steps"
        :key="index"
        class="relative flex w-24 flex-col items-center gap-2"
      >
        <!-- เส้นเชื่อมระหว่าง step -->
        <div
          v-if="index < steps.length - 1"
          class="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-5 h-px bg-[#AFAFAF]"
        />

        <!-- วงกลมเลขลำดับ -->
        <div class="relative z-10 flex w-full items-center justify-center">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.7px] border-[#AFAFAF] bg-[#F6F6F6] text-xl font-bold text-[#AFAFAF]"
          >
            {{ index + 1 }}
          </div>
        </div>

        <!-- ชื่อตำแหน่ง -->
        <span
          class="max-w-24 text-center text-sm font-normal leading-5 text-[#7C7C7C]"
        >
          {{ name }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  // คำที่จะแสดง //
  steps: string[];
}>();
</script>
