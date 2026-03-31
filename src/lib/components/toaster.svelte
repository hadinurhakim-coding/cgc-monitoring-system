<script lang="ts">
	import { toastStore } from "$lib/stores/toast.svelte.js";
	import { fly, fade } from "svelte/transition";
</script>

<div
	class="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center justify-end px-4 pb-6 sm:right-6 sm:items-end sm:px-0"
>
	<div class="flex w-full max-w-[356px] flex-col gap-3">
		{#each toastStore.items as toast (toast.id)}
			<div
				in:fly={{ y: 20, duration: 300 }}
				out:fade={{ duration: 200 }}
				class="pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-xl border bg-white p-4 shadow-xl ring-1 ring-black/5"
			>
				<div class="mt-0.5 shrink-0">
					<img
						src="/Logo_PLN.png"
						alt="PLN Logo"
						class="size-6 object-contain {toast.type === 'error'
							? 'grayscale opacity-80'
							: ''}"
					/>
				</div>
				<div class="flex flex-1 flex-col gap-1 pr-4">
					<p
						class="text-sm font-semibold tracking-tight {toast.type ===
						'error'
							? 'text-red-600'
							: 'text-slate-900'}"
					>
						{toast.type === "success"
							? "Berhasil"
							: toast.type === "error"
								? "Gagal"
								: "Informasi"}
					</p>
					<p class="text-[0.825rem] leading-snug text-slate-500">
						{toast.message}
					</p>
				</div>
				<button
					type="button"
					class="absolute right-3 top-3 flex size-6 items-center justify-center rounded-md text-slate-400 opacity-70 transition-colors hover:bg-slate-100 hover:text-slate-900 hover:opacity-100"
					onclick={() => toastStore.remove(toast.id)}
					aria-label="Tutup notifikasi"
				>
					<svg
						class="size-3.5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		{/each}
	</div>
</div>
