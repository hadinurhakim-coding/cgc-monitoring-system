<script lang="ts">
	import { resolve } from "$app/paths";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import UserRoundIcon from "@lucide/svelte/icons/user-round";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	type UserInfo = {
		name: string;
		email: string;
		avatarUrl?: string | null;
	};

	let {
		user = {
			name: "Pengguna",
			email: "user@example.com",
			avatarUrl: null
		} satisfies UserInfo
	}: { user?: UserInfo } = $props();

	const initials = $derived(
		user.name
			.split(/\s+/)
			.map((p) => p[0])
			.join("")
			.slice(0, 2)
			.toUpperCase() || "?"
	);
</script>

<Sidebar.Footer>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<div
				class="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-sidebar-accent/50"
			>
				<Avatar.Root class="size-8 shrink-0">
					{#if user.avatarUrl}
						<Avatar.Image src={user.avatarUrl} alt={user.name} />
					{/if}
					<Avatar.Fallback class="text-xs font-medium">{initials}</Avatar.Fallback>
				</Avatar.Root>
				<div
					class="grid min-w-0 flex-1 gap-0.5 text-start leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden"
				>
					<span class="truncate font-semibold">{user.name}</span>
					<span class="text-muted-foreground truncate text-xs">{user.email}</span>
				</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								variant="ghost"
								size="icon"
								class="size-8 shrink-0"
								{...props}
								aria-label="Menu akun"
							>
								<EllipsisVerticalIcon class="size-4" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="min-w-52 rounded-xl p-2" side="top" align="end" sideOffset={8}>
						<div class="flex flex-col gap-1">
							<DropdownMenu.Item class="cursor-pointer rounded-lg px-3 py-2.5">
								{#snippet child({ props })}
									<a href={resolve("/account")} class="flex w-full items-center gap-2" {...props}>
										<UserRoundIcon class="size-4" />
										<span>Account</span>
									</a>
								{/snippet}
							</DropdownMenu.Item>
							<DropdownMenu.Item variant="destructive" class="cursor-pointer rounded-lg px-3 py-2.5">
								{#snippet child({ props })}
									<form method="POST" action="/logout" class="w-full">
										<button type="submit" class="flex w-full items-center gap-2" {...props}>
											<LogOutIcon class="size-4" />
											<span>Logout</span>
										</button>
									</form>
								{/snippet}
							</DropdownMenu.Item>
						</div>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Footer>
