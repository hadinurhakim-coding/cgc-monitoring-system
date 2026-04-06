<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "./_components/app-sidebar.svelte";
	import type { LayoutData } from "./$types.js";

	let { data, children }: { data: LayoutData; children: import("svelte").Snippet } = $props();

	const sidebarUser = $derived({
		name: data.authUser?.email?.split("@")[0] || "Pengguna",
		email: data.authUser?.email || "",
		avatarUrl: null as string | null
	});
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 80); --header-height: calc(var(--spacing) * 14);"
>
	<AppSidebar variant="inset" user={sidebarUser} />
	<Sidebar.Inset>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
