<!--
  AdventureBanner.vue
  Left-side banner for the register page.
  Consistent UI with login banner — same layout, different copy.
-->
<template>
  <section
    class="relative flex flex-col justify-between h-full p-8 md:p-12 overflow-hidden rounded-2xl md:rounded-3xl"
    aria-label="Welcome banner"
  >
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img
        src="/images/ocean-bg.jpg"
        alt=""
        class="w-full h-full object-cover"
        aria-hidden="true"
      />
      <!-- Dark overlay for text readability -->
      <div class="absolute inset-0 bg-linear-to-b from-gcg-primary/70 via-gcg-primary/40 to-gcg-primary/80" />
    </div>

    <!-- Logo -->
    <div class="relative z-10">
      <img
        src="/images/Logo_PLN.png"
        alt="Logo PLN"
        class="h-8 md:h-10 w-auto object-contain"
        loading="eager"
        decoding="async"
      />
    </div>

    <!-- Main Text Content -->
    <div class="relative z-10 mt-auto">
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
        START YOUR<br />
        JOURNEY<br />
        TODAY!
      </h1>
      <p class="text-white/80 text-sm md:text-base max-w-md leading-relaxed mb-2">
        Create your account to unlock exclusive deals, plan your dream escapes,
        and discover new destinations. Mountains, beaches, or city lights await you.
      </p>
      <p class="text-white font-medium text-sm md:text-base">
        Adventure begins with one step.
      </p>
    </div>
  </section>
</template>
