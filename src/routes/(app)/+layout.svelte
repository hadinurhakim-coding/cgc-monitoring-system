<script lang="ts">
	import { navigating } from "$app/state";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "./_components/app-sidebar.svelte";
	import type { LayoutData } from "./$types.js";

	let { data, children }: { data: LayoutData; children: import("svelte").Snippet } = $props();

	const sidebarUser = $derived({
		name: data.authUser?.email?.split("@")[0] || "Pengguna",
		email: data.authUser?.email || "",
		avatarUrl: null as string | null
	});

	let barWidth = $state(0);
	let barVisible = $state(false);
	let completeTimer: ReturnType<typeof setTimeout> | undefined;
	let growTimer: ReturnType<typeof setTimeout> | undefined;

	// navigating dari $app/state adalah reactive object (bukan store), akses langsung .to/.from
	$effect(() => {
		if (navigating.to !== null) {
			clearTimeout(completeTimer);
			clearTimeout(growTimer);
			barVisible = true;
			barWidth = 15;
			growTimer = setTimeout(() => { barWidth = 60; }, 80);
			growTimer = setTimeout(() => { barWidth = 80; }, 1200);
		} else if (barVisible) {
			clearTimeout(growTimer);
			barWidth = 100;
			completeTimer = setTimeout(() => {
				barVisible = false;
				barWidth = 0;
			}, 300);
		}
	});
</script>

{#if barVisible}
	<div
		class="fixed top-0 left-0 z-[9999] h-[3px] bg-accent transition-all ease-out pointer-events-none"
		style="width: {barWidth}%; transition-duration: {barWidth === 100 ? '200ms' : '600ms'};"
	></div>
{/if}

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 80); --header-height: calc(var(--spacing) * 14);"
>
	<AppSidebar variant="inset" user={sidebarUser} />
	<Sidebar.Inset>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
