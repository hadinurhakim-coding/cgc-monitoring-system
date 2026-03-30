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
		...restProps
	}: HTMLFormAttributes & { class?: string; form?: LoginFormState } = $props();

	const id = $props.id();

	// Menentukan apakah saat ini sedang dalam mode input PIN
	const isPinStep = $derived(form?.step === "pin");
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
		{:else}
			<input type="hidden" name="email" value={form?.email ?? ""} />

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
			<div class="text-center text-sm">
				<button
					type="submit"
					formaction="?/sendPin"
					formnovalidate
					class="text-primary hover:underline"
				>
					Kirim ulang PIN
				</button>
			</div>
		{/if}
	</FieldGroup>
</form>
