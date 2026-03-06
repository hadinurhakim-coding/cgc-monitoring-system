<!--
  Dashboard Layout — /layouts/dashboard.vue
  Wraps all dashboard pages with Sidebar + Header.
  Responsive: sidebar drawer on mobile, fixed on desktop.
-->
<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <DashboardSidebar />

    <!-- Main Content Area -->
    <div
      class="flex flex-col flex-1 min-w-0 overflow-hidden"
      :class="isCollapsed ? 'lg:pl-20' : 'lg:pl-64'"
    >
      <!-- Header -->
      <DashboardHeader />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { isCollapsed } = useSidebar()

// Derive page title from route meta or path
const pageTitle = computed(() => {
  // Check route meta first
  if (route.meta?.title) return route.meta.title as string

  // Fallback: derive from path
  const segments = route.path.split('/').filter(Boolean)
  const last = segments[segments.length - 1] || 'Dashboard'
  return last
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})
</script>
