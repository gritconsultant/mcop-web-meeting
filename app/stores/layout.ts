import { defineStore } from 'pinia'

export const useLayoutStore = defineStore(
  'meeting-layout',
  () => {
    const isSidebarOpen = ref(true)

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
    }

    const setSidebar = (open: boolean) => {
      isSidebarOpen.value = open
    }

    return {
      isSidebarOpen,
      toggleSidebar,
      setSidebar,
    }
  },
  {
    persist: {
      pick: ['isSidebarOpen'],
    },
  },
)
