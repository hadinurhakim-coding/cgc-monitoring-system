<script lang="ts">
	import { resolve } from "$app/paths";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
	import LoginForm from "./_components/login-form.svelte";
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";

	const { form, data } = $props();

	let LottieComponent =
		$state<
			typeof import("@lottiefiles/dotlottie-svelte").DotLottieSvelte
		>();
	let lottieLoadStarted = $state(false);

	onMount(() => {
		const mq = window.matchMedia("(min-width: 1024px)");

		const tryLoadLottie = () => {
			if (!mq.matches || lottieLoadStarted) return;
			lottieLoadStarted = true;
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					void import("@lottiefiles/dotlottie-svelte").then((mod) => {
						LottieComponent = mod.DotLottieSvelte;
					});
				});
			});
		};

		tryLoadLottie();
		mq.addEventListener("change", tryLoadLottie);
		return () => mq.removeEventListener("change", tryLoadLottie);
	});
</script>

<div in:fade={{ duration: 600 }} class="grid h-screen w-full lg:grid-cols-2">
	<div in:fly={{ y: 30, duration: 800, delay: 150 }} class="flex flex-col gap-4 p-6 md:p-10 bg-[#fefcf7]">
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
				<LoginForm {form} recentEmail={data.recentEmail ?? undefined} />
			</div>
		</div>
	</div>
	<div in:fade={{ duration: 1000, delay: 350 }} class="bg-[#fefcf7] relative hidden lg:flex items-center justify-center overflow-hidden">
		<div
			class="absolute inset-0 h-full w-full [&>canvas]:h-full [&>canvas]:w-full [&>canvas]:object-contain"
		>
			{#if LottieComponent}
				<div class="h-full w-full">
					<LottieComponent
						src="/gcg-login-anim.json"
						loop
						autoplay
						backgroundColor="transparent"
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
