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
	} | null;

	let {
		class: className,
		form = undefined,
		...restProps
	}: HTMLFormAttributes & { class?: string; form?: LoginFormState } = $props();

	const id = $props.id();
</script>

<form method="POST" class={cn("flex flex-col gap-6", className)} {...restProps}>
	<FieldGroup>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Login to your account</h1>
			<p class="text-muted-foreground text-sm text-balance">
				Enter your email and we'll send you a magic link to sign in
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
			<Button type="submit" class="w-full">Send Magic Link</Button>
		</Field>
	</FieldGroup>
</form>
