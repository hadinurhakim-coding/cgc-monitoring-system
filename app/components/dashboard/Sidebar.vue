<!--
  Sidebar.vue
  Main sidebar component for the dashboard layout.
  Features:
  - Fixed sidebar (w-64) with mobile drawer behavior
  - Dashboard special item + collapsible groups
  - Active state tracking
  - Bottom "Need help?" block
-->
<template>
  <!-- Mobile Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="closeSidebar"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="
      fixed top-0 left-0 z-50
      h-screen flex flex-col
      bg-white dark:bg-gray-950
      border-r border-gray-200 dark:border-gray-800
      overflow-y-auto
      transition-all duration-300 ease-in-out
      gcg-scrollbar
    "
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isCollapsed ? 'w-20 px-2 py-6' : 'w-64 px-4 py-6',
    ]"
  >
    <!-- Header Sidebar -->
    <div class="flex items-center gap-3 py-5" :class="isCollapsed ? 'justify-center' : 'justify-between'">
      <div class="flex items-center gap-3 min-w-0" :class="isCollapsed ? 'justify-center' : ''">
        <div class="size-14 rounded-xl bg-transparent flex items-center justify-center shrink-0 p-0">
          <img
            src="/images/Logo_PLN.png"
            alt="Logo PLN"
            class="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div v-show="!isCollapsed" class="min-w-0">
          <div class="font-bold text-2xl leading-none text-gcg-primary dark:text-gcg-accent truncate">GCG</div>
          <div class="text-sm text-gray-500 dark:text-gray-400 leading-tight truncate">Monitoring System</div>
        </div>
      </div>

      <div v-show="!isCollapsed" class="flex items-center gap-2">
        <!-- Minimize button (desktop) -->
        <button
          type="button"
          class="hidden lg:flex items-center justify-center size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          @click="toggleCollapse"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Minimize sidebar'"
        >
          <UIcon :name="isCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'" class="size-5 text-gray-600 dark:text-gray-300" />
        </button>

        <!-- Close button (mobile) -->
        <button
          type="button"
          class="lg:hidden flex items-center justify-center size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          @click="closeSidebar"
          aria-label="Close sidebar"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>

    <!-- Minimize button (collapsed mode) -->
    <button
      v-show="isCollapsed"
      type="button"
      class="hidden lg:flex items-center justify-center size-10 rounded-lg mx-auto hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      @click="toggleCollapse"
      aria-label="Expand sidebar"
    >
      <UIcon name="i-lucide-chevron-right" class="size-5 text-gray-600 dark:text-gray-300" />
    </button>

    <!-- Main Menu -->
    <nav v-if="!isCollapsed" class="mt-6 space-y-2">
      <!-- Search (Sidebar) -->
      <div class="pb-2">
        <UInput
          v-model="searchQuery"
          placeholder="Cari..."
          icon="i-lucide-search"
          size="sm"
          class="w-full"
          aria-label="Search"
        />
      </div>

      <!-- Dashboard (special item) -->
      <NuxtLink
        :to="dashboardItem?.to || '/dashboard'"
        class="
          flex items-center gap-3
          rounded-lg py-3 px-4
          font-semibold text-base
          bg-gcg-primary hover:bg-gcg-primary-dark
          text-white
          transition-colors
        "
        @click="handleSelect(dashboardItem?.to || '/dashboard')"
      >
        <UIcon :name="dashboardItem?.icon || 'i-lucide-layout-dashboard'" class="size-5" />
        <span class="truncate">Dashboard</span>
      </NuxtLink>

      <!-- Groups + other items -->
      <ul class="space-y-1">
        <DashboardSidebarMenuItem
          v-for="item in menuItems"
          :key="item.label"
          :item="item"
          :active-item="activeItem"
          :expanded="expandedItems.has(item.label)"
          :is-child-active="hasActiveChild(item)"
          @toggle="toggleItem(item.label)"
          @select="handleSelect"
        />
      </ul>
    </nav>

    <!-- Collapsed Menu (icon-only) -->
    <nav v-else class="mt-6 flex flex-col items-center gap-2">
      <!-- Dashboard icon -->
      <UTooltip text="Dashboard" :popper="{ placement: 'right' }">
        <NuxtLink
          :to="dashboardItem?.to || '/dashboard'"
          class="flex items-center justify-center size-11 rounded-lg transition-colors"
          :class="
            isDashboardActive
              ? 'bg-gcg-light dark:bg-white/5 text-gcg-primary dark:text-gcg-accent'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          "
          @click="handleSelect(dashboardItem?.to || '/dashboard')"
        >
          <UIcon :name="dashboardItem?.icon || 'i-lucide-layout-dashboard'" class="size-6" />
        </NuxtLink>
      </UTooltip>

      <template v-for="item in menuItems" :key="item.label">
        <!-- Item with children: click to show submenu card -->
        <UDropdownMenu
          v-if="item.children && item.children.length"
          :items="toDropdownItems(item)"
          :popper="{ placement: 'right-start', offset: 16 }"
        >
          <UTooltip :text="item.label" :popper="{ placement: 'right' }">
            <button
              type="button"
              class="flex items-center justify-center size-11 rounded-lg transition-colors"
              :class="
                hasActiveChild(item)
                  ? 'bg-gcg-light dark:bg-white/5 text-gcg-primary dark:text-gcg-accent'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              "
            >
              <UIcon v-if="item.icon" :name="item.icon" class="size-6" />
              <span v-else class="text-sm font-bold">{{ item.label.charAt(0) }}</span>
            </button>
          </UTooltip>
        </UDropdownMenu>

        <!-- Item without children -->
        <UTooltip v-else :text="item.label" :popper="{ placement: 'right' }">
          <NuxtLink
            :to="item.to || '#'"
            class="flex items-center justify-center size-11 rounded-lg transition-colors"
            :class="
              activeItem === item.to
                ? 'bg-gcg-light dark:bg-white/5 text-gcg-primary dark:text-gcg-accent'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
            "
            @click="handleSelect(item.to)"
          >
            <UIcon v-if="item.icon" :name="item.icon" class="size-6" />
            <span v-else class="text-sm font-bold">{{ item.label.charAt(0) }}</span>
          </NuxtLink>
        </UTooltip>
      </template>
    </nav>

    <!-- Settings (bottom) -->
    <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
      <NuxtLink
        v-if="!isCollapsed"
        to="/dashboard/settings"
        class="flex items-center gap-3 rounded-lg py-2.5 px-4 text-sm transition-colors"
        :class="
          activeItem === '/dashboard/settings'
            ? 'bg-gcg-light dark:bg-white/5 text-gcg-primary dark:text-gcg-accent font-semibold'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        "
        @click="handleSelect('/dashboard/settings')"
      >
        <UIcon name="i-lucide-settings" class="size-5" />
        <span class="truncate">Settings</span>
      </NuxtLink>

      <UTooltip v-else text="Settings" :popper="{ placement: 'right' }">
        <NuxtLink
          to="/dashboard/settings"
          class="flex items-center justify-center size-11 rounded-lg mx-auto transition-colors"
          :class="
            activeItem === '/dashboard/settings'
              ? 'bg-gcg-light dark:bg-white/5 text-gcg-primary dark:text-gcg-accent'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
          "
          @click="handleSelect('/dashboard/settings')"
        >
          <UIcon name="i-lucide-settings" class="size-5" />
        </NuxtLink>
      </UTooltip>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { sidebarNavigation, type NavItem } from '~/utils/navigation'

const route = useRoute()

const { isOpen, isCollapsed, closeSidebar, setActiveItem, toggleCollapse, activeItem } = useSidebar()

const searchQuery = ref('')

const dashboardItem = computed(() => sidebarNavigation.find((item) => item.label === 'Dashboard'))
const menuItems = computed(() => sidebarNavigation.filter((item) => item.label !== 'Dashboard'))

const isDashboardActive = computed(() => {
  const to = dashboardItem.value?.to || '/dashboard'
  return route.path === to || route.path.startsWith(`${to}/`)
})

// Track which individual items (with children) are expanded
const expandedItems = ref<Set<string>>(new Set(['Kertas Kerja ACGS']))

function toggleItem(label: string) {
  if (expandedItems.value.has(label)) {
    expandedItems.value.delete(label)
  } else {
    expandedItems.value.add(label)
  }
}

function hasActiveChild(item: NavItem): boolean {
  if (!item.children) return false
  return item.children.some((child) => {
    if (!child.to) return false
    return route.path === child.to || route.path.startsWith(`${child.to}/`)
  })
}

function handleSelect(path: string | undefined) {
  if (path) {
    setActiveItem(path)
    // Close mobile sidebar after selection
    closeSidebar()
  }
}

function toDropdownItems(item: NavItem) {
  const children = item.children || []

  return [
    children.map((child) => ({
      label: child.label,
      icon: child.icon,
      to: child.to,
      click: () => {
        if (child.to) {
          handleSelect(child.to)
          navigateTo(child.to)
        }
      },
    })),
  ]
}

watchEffect(() => {
  setActiveItem(route.path)

  // Auto-expand group containing the active route
  const parent = sidebarNavigation.find((item) => item.children?.some((child) => child.to && (route.path === child.to || route.path.startsWith(`${child.to}/`))))
  if (parent?.label) expandedItems.value.add(parent.label)
})
</script>
