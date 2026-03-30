<script lang="ts">
	import { resolve } from "$app/paths";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
	import LoginForm from "$lib/components/login-form.svelte";

	const { data, form } = $props();
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href={resolve("/")} class="flex items-center gap-2 font-medium">
				<div
					class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
				>
					<ShieldCheckIcon class="size-4" />
				</div>
				GCG Monitoring
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<LoginForm form={form} recentEmail={data.recentEmail} />
			</div>
		</div>
	</div>
	<div class="bg-muted relative hidden lg:block">
		<img
			src="/gcg-login-image-optimized.jpg"
			alt="GCG Monitoring System"
			loading="lazy"
			decoding="async"
			fetchpriority="low"
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
