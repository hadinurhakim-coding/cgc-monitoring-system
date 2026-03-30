<script lang="ts">
	import {
		FieldGroup,
		Field,
		FieldLabel,
	} from "$lib/components/ui/field/index.js";
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
</script>

<form
	method="POST"
	action={isPinStep ? "?/verifyPin" : "?/sendPin"}
	class={cn("flex flex-col gap-6", className)}
	{...restProps}
>
	<FieldGroup>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">
				{isPinStep ? "Masukkan PIN" : "Login to your account"}
			</h1>
			<p class="text-muted-foreground text-sm text-balance">
				{isPinStep
					? "Masukkan 6 digit kode yang telah kami kirimkan ke email Anda."
					: "Enter your email and we'll send you a secure PIN to sign in."}
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
					placeholder="you@example.com"
					autocomplete="email"
					required
				/>
			</Field>
			<Field>
				<Button type="submit" class="w-full">Send PIN</Button>
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
				<FieldLabel for="pin-{id}">PIN (6 Digit)</FieldLabel>
				<Input
					id="pin-{id}"
					name="pin"
					type="text"
					inputmode="numeric"
					pattern="[0-9]{6}"
					placeholder="123456"
					autocomplete="one-time-code"
					maxlength={6}
					required
					class="text-center text-lg tracking-[0.5em] font-semibold"
				/>
			</Field>
			<Field>
				<Button type="submit" class="w-full">Verify & Login</Button>
			</Field>
			<div class="flex flex-col gap-2 text-center text-sm">
				<button
					type="submit"
					formaction="?/sendPin"
					formnovalidate
					class="text-primary hover:underline"
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
