<script lang="ts">
	import { enhance, type SubmitFunction } from "$app/forms";
	import { FieldGroup, Field, FieldLabel } from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLFormAttributes } from "svelte/elements";

	type LoginFormState = {
		error?: string;
		success?: string;
		email?: string;
		step?: "email" | "pin";
	} | null;

	let {
		class: className,
		form = undefined,
		...restProps
	}: HTMLFormAttributes & { class?: string; form?: LoginFormState } = $props();

	const id = $props.id();

	// State untuk loading UI
	let isSubmitting = $state(false);

	// Deteksi secara reaktif apakah pengguna sudah di tahap PIN
	const isPinStep = $derived(form?.step === "pin");

	// Fungsi enhance untuk menangani loading state dan update komponen
	const handleSubmit: SubmitFunction = () => {
		isSubmitting = true;
		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	};
</script>

<form
	method="POST"
	action={isPinStep ? "?/verifyPin" : "?/sendPin"}
	class={cn("flex flex-col gap-6", className)}
	use:enhance={handleSubmit}
	{...restProps}
>
	<FieldGroup>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">{isPinStep ? "Masukkan PIN" : "Login ke akun Anda"}</h1>
			<p class="text-muted-foreground text-sm text-balance">
				{isPinStep
					? "Masukkan 8 digit kode PIN yang telah kami kirimkan ke email Anda."
					: "Masukkan email Anda dan kami akan mengirimkan PIN aman untuk masuk."}
			</p>
		</div>

		{#if form?.error}
			<p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
				{form.error}
			</p>
		{:else if form?.success}
			<p class="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
				{form.success}
			</p>
		{/if}

		{#if !isPinStep}
			<Field>
				<FieldLabel for="email-{id}">Email</FieldLabel>
				<Input
					id="email-{id}"
					name="email"
					type="email"
					value={form?.email ?? ""}
					placeholder="anda@email.com"
					autocomplete="email"
					required
					disabled={isSubmitting}
				/>
			</Field>
			<Field>
				<Button type="submit" class="w-full" disabled={isSubmitting}>
					{isSubmitting ? "Mengirim PIN..." : "Kirim PIN"}
				</Button>
			</Field>
		{:else}
			<input type="hidden" name="email" value={form?.email ?? ""} />

			<Field>
				<FieldLabel for="pin-{id}">PIN (8 Digit)</FieldLabel>
				<Input
					id="pin-{id}"
					name="pin"
					type="text"
					inputmode="numeric"
					pattern="[0-9]{8}"
					placeholder="00000000"
					autocomplete="one-time-code"
					maxlength={8}
					required
					disabled={isSubmitting}
					class="text-center text-2xl tracking-[0.35em] font-semibold"
				/>
			</Field>
			<Field>
				<Button type="submit" class="w-full" disabled={isSubmitting}>
					{isSubmitting ? "Memverifikasi..." : "Verifikasi & Masuk"}
				</Button>
			</Field>
			
			<div class="text-center text-sm">
				<button
					type="submit"
					formaction="?/sendPin"
					formnovalidate
					disabled={isSubmitting}
					class="text-primary hover:underline disabled:opacity-50"
				>
					Kirim ulang PIN
				</button>
			</div>
		{/if}
	</FieldGroup>
</form>