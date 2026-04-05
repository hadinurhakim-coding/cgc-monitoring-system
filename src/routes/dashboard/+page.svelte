<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import { resolve } from "$app/paths";
	import type { PageData } from "./$types.js";

	let { data }: { data: PageData } = $props();
	const sidebarUser = $derived({
		name: data.authUser?.email?.split("@")[0] || "Pengguna",
		email: data.authUser?.email || "user@example.com",
		avatarUrl: null
	});
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 80); --header-height: calc(var(--spacing) * 14);"
>
	<AppSidebar variant="inset" user={sidebarUser} />
	<Sidebar.Inset>
		<header
			class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
		>
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
			<h1 class="text-lg font-semibold">Dashboard</h1>
		</header>

		<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Ringkasan</Card.Title>
					<Card.Description>
						Gunakan Assessment ACGS untuk mengisi dan memantau indikator tata kelola.
					</Card.Description>
				</Card.Header>
				<Card.Content class="text-sm text-muted-foreground">
					<p>
						<a
							href={resolve("/assessment-acgs")}
							class="text-primary font-medium underline underline-offset-4"
							>Buka Assessment ACGS</a
						>
					</p>
				</Card.Content>
			</Card.Root>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
