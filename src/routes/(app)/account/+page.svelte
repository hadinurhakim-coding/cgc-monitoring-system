<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { resolve } from "$app/paths";
</script>

<header
	class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
>
	<Sidebar.Trigger class="-ms-1" />
	<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
	<h1 class="text-lg font-semibold">Account</h1>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
	<p class="text-muted-foreground text-sm">Halaman pengaturan akun.</p>
	<p>
		<a href={resolve("/dashboard")} class="text-primary text-sm underline underline-offset-4"
			>Kembali ke Dashboard</a
		>
	</p>
</main>
