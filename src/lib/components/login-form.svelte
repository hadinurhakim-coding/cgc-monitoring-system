<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
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
		recentEmail = undefined,
		...restProps
	}: HTMLFormAttributes & { class?: string; form?: LoginFormState; recentEmail?: string } = $props();

	const id = $props.id();

	// State internal untuk mengatur tampilan UI PIN jika ada recentEmail
	let forcePinStep = $state(false);

	// Menentukan apakah saat ini sedang dalam mode input PIN
	const isPinStep = $derived(form?.step === "pin" || forcePinStep);

	let isSubmitting = $state(false);
	let pinValue = $state("");

	const handleSubmit: SubmitFunction = () => {
		isSubmitting = true;
		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	};

	const onPinInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		// Hanya izinkan angka
		target.value = target.value.replace(/[^0-9]/g, "");
		pinValue = target.value;
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

			{#if recentEmail && !form?.step}
				<div class="rounded-md border border-blue-200 bg-blue-50 p-4 text-center mt-2">
					<p class="text-sm text-blue-800 mb-2">
						Anda sudah meminta PIN untuk <strong>{recentEmail}</strong> dalam 1 jam terakhir.
					</p>
					<Button
						variant="outline"
						type="button"
						class="w-full bg-white hover:bg-blue-100 border-blue-200 text-blue-700"
						onclick={() => forcePinStep = true}
					>
						Saya sudah punya PIN
					</Button>
				</div>
			{/if}
		{:else}
			<input type="hidden" name="email" value={form?.email ?? recentEmail ?? ""} />

			<Field>
				<FieldLabel for="pin-{id}">PIN (8 Digit)</FieldLabel>
				<Input
					id="pin-{id}"
					name="pin"
					type="text"
					inputmode="numeric"
					placeholder="00000000"
					autocomplete="one-time-code"
					maxlength={8}
					required
					disabled={isSubmitting}
					class="text-center text-2xl tracking-[0.35em] font-semibold"
					bind:value={pinValue}
					oninput={onPinInput}
				/>
			</Field>
			<Field>
				<Button type="submit" class="w-full" disabled={isSubmitting}>
					{isSubmitting ? "Memverifikasi..." : "Verifikasi & Masuk"}
				</Button>
			</Field>
			<div class="flex flex-col gap-2 text-center text-sm">
				<button
					type="submit"
					formaction="?/sendPin"
					formnovalidate
					disabled={isSubmitting}
					class="text-primary hover:underline disabled:opacity-50"
				>
					Kirim ulang PIN
				</button>
				{#if forcePinStep}
					<button
						type="button"
						class="text-muted-foreground hover:underline"
						onclick={() => forcePinStep = false}
					>
						Gunakan email lain
					</button>
				{/if}
			</div>
		{/if}
	</FieldGroup>
</form>