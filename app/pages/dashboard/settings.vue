<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gcg-dark dark:text-white">
        Settings
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Kelola pengaturan akun dan preferensi sistem
      </p>
    </div>

    <!-- Empty State -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center justify-center text-center">
      <div class="size-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-settings" class="size-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-lg font-semibold text-gcg-dark dark:text-white mb-1">
        Halaman Settings
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Fitur pengaturan sedang dalam pengembangan. Nantikan update selanjutnya.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Settings',
})

useHead({
  title: 'Settings — GCG Monitoring System',
})
</script>
