<script lang="ts">
	import { toastStore } from "$lib/stores/toast.js";

	function toneClass(type: "success" | "error" | "info") {
		if (type === "success") return "border-[var(--pln-cyan)] text-[var(--pln-dark-gray)]";
		if (type === "error") return "border-red-500 text-red-700";
		return "border-[var(--pln-light-cyan)] text-[var(--pln-dark-gray)]";
	}
</script>

<div class="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4">
	<div class="flex w-full max-w-md flex-col gap-2">
		{#each toastStore.items as toast (toast.id)}
			<div class="pointer-events-auto rounded-md border bg-white px-3 py-2 shadow-sm {toneClass(toast.type)}">
				<div class="flex items-start justify-between gap-2">
					<p class="text-sm">{toast.message}</p>
					<button
						type="button"
						class="text-xs opacity-70 hover:opacity-100"
						onclick={() => toastStore.remove(toast.id)}
					>
						Tutup
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
