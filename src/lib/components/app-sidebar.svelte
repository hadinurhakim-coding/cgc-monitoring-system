<script lang="ts">
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
	import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
	import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
	import ListChecksIcon from "@lucide/svelte/icons/list-checks";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import ClipboardCheckIcon from "@lucide/svelte/icons/clipboard-check";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import SidebarUserFooter from "$lib/components/sidebar-user-footer.svelte";
	import type { ComponentProps } from "svelte";

	const subItems = [
		{
			title: "DATA PENCAPAIAN ACGS",
			path: "/dashboard#data-pencapaian-acgs" as const,
			hash: "#data-pencapaian-acgs",
			icon: TrendingUpIcon
		},
		{
			title: "DATA TREN PENCAPAIAN",
			path: "/dashboard#data-tren-pencapaian" as const,
			hash: "#data-tren-pencapaian",
			icon: BarChart3Icon
		},
		{
			title: "DATA DETAIL PENCAPAIAN ACGS",
			path: "/dashboard#data-detail-pencapaian-acgs" as const,
			hash: "#data-detail-pencapaian-acgs",
			icon: ListChecksIcon
		}
	] as const;
	const assessmentPath = "/assessment-acgs" as const;

	let dashboardOpen = $state(true);

	function subIsActive(hash: (typeof subItems)[number]["hash"]) {
		return page.url.pathname === "/dashboard" && page.url.hash === hash;
	}

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Group>
			<Sidebar.GroupLabel>GCG Monitoring</Sidebar.GroupLabel>
		</Sidebar.Group>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Menu</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton tooltipContent="Dashboard">
							{#snippet child({ props })}
								<button
									type="button"
									{...props}
									onclick={() => (dashboardOpen = !dashboardOpen)}
									aria-expanded={dashboardOpen}
								>
									<LayoutDashboardIcon />
									<span>Dashboard</span>
									<ChevronRightIcon
										class="ms-auto transition-transform duration-200 {dashboardOpen
											? 'rotate-90'
											: ''}"
									/>
								</button>
							{/snippet}
						</Sidebar.MenuButton>
						{#if dashboardOpen}
							<Sidebar.MenuSub>
								{#each subItems as sub (sub.hash)}
									<Sidebar.MenuSubItem>
										<Sidebar.MenuSubButton isActive={subIsActive(sub.hash)}>
											{#snippet child({ props })}
												<a href={resolve(sub.path)} {...props}>
													<sub.icon />
													<span>{sub.title}</span>
												</a>
											{/snippet}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						{/if}
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
	<SidebarUserFooter />
</Sidebar.Root>
