<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();

	onMount(() => {
		const timer = setTimeout(() => {
			void goto(data.nextPath, { replaceState: true });
		}, 1500);

		return () => clearTimeout(timer);
	});
</script>

<main
	class="from-primary/15 to-primary-foreground flex min-h-svh items-center justify-center bg-linear-to-b"
>
	<div class="flex flex-col items-center gap-4 text-center">
		<div class="border-primary/30 relative size-20 rounded-full border-2">
			<div
				class="bg-primary absolute inset-2 animate-pulse rounded-full"
			></div>
			<div
				class="border-primary absolute inset-0 animate-spin rounded-full border-t-2 border-r-2"
			></div>
		</div>
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-wide">
				GCG Monitoring System
			</h1>
			<p class="text-muted-foreground text-sm">Menyiapkan dashboard...</p>
		</div>
	</div>
</main>
