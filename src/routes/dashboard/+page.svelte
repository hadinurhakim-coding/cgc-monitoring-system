<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 80); --header-height: calc(var(--spacing) * 14);"
>
	<AppSidebar variant="inset" />
	<Sidebar.Inset>
		<header
			class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
		>
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
			<h1 class="text-lg font-semibold">Dashboard</h1>
		</header>

		<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
			<Card.Root id="data-pencapaian-acgs">
				<Card.Header>
					<Card.Title>DATA PENCAPAIAN ACGS</Card.Title>
					<Card.Description>Mockup ringkasan capaian utama ACGS.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="bg-muted/40 h-48 rounded-lg border border-dashed"></div>
				</Card.Content>
			</Card.Root>

			<Card.Root id="data-tren-pencapaian">
				<Card.Header>
					<Card.Title>DATA TREN PENCAPAIAN</Card.Title>
					<Card.Description>Mockup area chart / tren performa dari waktu ke waktu.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="bg-muted/40 h-48 rounded-lg border border-dashed"></div>
				</Card.Content>
			</Card.Root>

			<Card.Root id="data-detail-pencapaian-acgs">
				<Card.Header>
					<Card.Title>DATA DETAIL PENCAPAIAN ACGS</Card.Title>
					<Card.Description>Mockup detail data per indikator.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="bg-muted/40 h-64 rounded-lg border border-dashed"></div>
				</Card.Content>
			</Card.Root>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
