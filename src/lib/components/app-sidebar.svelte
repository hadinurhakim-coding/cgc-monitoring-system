<script lang="ts">
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
	import ClipboardCheckIcon from "@lucide/svelte/icons/clipboard-check";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import SidebarUserFooter from "$lib/components/sidebar-user-footer.svelte";
	import type { ComponentProps } from "svelte";

	const assessmentPath = "/assessment-acgs" as const;

	let {
		user,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		user?: { name: string; email: string; avatarUrl?: string | null };
	} = $props();
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Group>
			<Sidebar.GroupLabel class="flex items-center gap-2 px-1">
				<img src="/Logo_PLN.png" alt="PLN" class="h-5 w-auto" />
				<span>GCG Monitoring</span>
			</Sidebar.GroupLabel>
		</Sidebar.Group>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Menu</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={page.url.pathname === "/dashboard"}
							tooltipContent="Dashboard"
						>
							{#snippet child({ props })}
								<a href={resolve("/dashboard")} {...props}>
									<LayoutDashboardIcon />
									<span>Dashboard</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={page.url.pathname === assessmentPath}
							tooltipContent="ASSESSMENT ACGS"
						>
							{#snippet child({ props })}
								<a href={resolve(assessmentPath)} {...props}>
									<ClipboardCheckIcon />
									<span>ASSESSMENT ACGS</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<SidebarUserFooter {user} />
</Sidebar.Root>
