<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import UserPlusIcon from "@lucide/svelte/icons/user-plus";
	import Building2Icon from "@lucide/svelte/icons/building-2";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
	import SearchIcon from "@lucide/svelte/icons/search";
	import BanIcon from "@lucide/svelte/icons/ban";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Field, FieldLabel, FieldGroup, FieldDescription } from "$lib/components/ui/field/index.js";
	import type { ActionData, PageData } from "./$types.js";

	type AccountUser = PageData["users"][number];
	type Division = PageData["divisions"][number];
	type UserRole = "admin" | "bpo" | "viewer";
	type AccountActionData = ActionData & {
		error?: string;
		success?: string;
		intent?: string;
		values?: Record<string, string>;
	};

	let { data, form }: { data: PageData; form: AccountActionData | null } = $props();

	const roleOptions: { value: UserRole; label: string; description: string }[] = [
		{ value: "admin", label: "Admin", description: "Kelola akun dan semua data." },
		{ value: "bpo", label: "BPO", description: "Isi dan ubah assessment/AOI." },
		{ value: "viewer", label: "Viewer", description: "Akses baca saja." }
	];

	let activeTab = $state<"users" | "divisions">("users");
	let userQuery = $state("");
	let divisionQuery = $state("");
	let createUserOpen = $state(false);
	let editUserOpen = $state(false);
	let createDivisionOpen = $state(false);
	let editDivisionOpen = $state(false);
	let selectedUser = $state<AccountUser | null>(null);
	let selectedDivision = $state<Division | null>(null);
	let pendingIntent = $state<string | null>(null);

	const canManageUsers = $derived(data.canManageUsers);
	const activeUsersCount = $derived(data.users.filter((user) => user.isActive).length);
	const inactiveUsersCount = $derived(data.users.length - activeUsersCount);

	const filteredUsers = $derived.by(() => {
		const query = userQuery.trim().toLowerCase();
		if (!query) return data.users;
		return data.users.filter((user) =>
			[
				user.email,
				user.fullName,
				user.role,
				user.divisionName ?? "",
				user.isActive ? "aktif" : "nonaktif"
			]
				.join(" ")
				.toLowerCase()
				.includes(query)
		);
	});

	const filteredDivisions = $derived.by(() => {
		const query = divisionQuery.trim().toLowerCase();
		if (!query) return data.divisions;
		return data.divisions.filter((division) => division.name.toLowerCase().includes(query));
	});

	const enhancedSubmit: SubmitFunction = ({ formData }) => {
		pendingIntent = String(formData.get("intent") ?? "submit");
		return async ({ update }) => {
			await update();
			pendingIntent = null;
		};
	};

	$effect(() => {
		if (!form?.success) return;
		createUserOpen = false;
		editUserOpen = false;
		createDivisionOpen = false;
		editDivisionOpen = false;
		selectedUser = null;
		selectedDivision = null;
	});

	function openEditUser(user: AccountUser): void {
		selectedUser = user;
		editUserOpen = true;
	}

	function openEditDivision(division: Division): void {
		selectedDivision = division;
		editDivisionOpen = true;
	}

	function roleLabel(role: string): string {
		return roleOptions.find((option) => option.value === role)?.label ?? role;
	}

	function roleBadgeClass(role: string): string {
		if (role === "admin") return "border-primary/30 bg-primary/10 text-primary";
		if (role === "bpo") return "border-sky-200 bg-sky-50 text-sky-700";
		return "border-muted bg-muted text-muted-foreground";
	}

	function formatDate(value: string | null): string {
		if (!value) return "-";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return date.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	}
</script>

<header
	class="bg-background sticky top-0 z-20 flex h-(--header-height) items-center gap-3 border-b px-4 md:px-6"
>
	<Sidebar.Trigger class="-ms-1" />
	<Separator orientation="vertical" class="data-[orientation=vertical]:h-5" />
	<h1 class="text-lg font-semibold">Account</h1>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
	{#if data.loadError}
		<div
			class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
			role="alert"
		>
			{data.loadError}
		</div>
	{/if}

	{#if form?.error}
		<div
			class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
			role="alert"
		>
			{form.error}
		</div>
	{:else if form?.success}
		<div
			class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
			role="status"
		>
			{form.success}
		</div>
	{/if}

	<section class="grid gap-4 lg:grid-cols-3">
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>Profil Saya</Card.Title>
				<Card.Description>Informasi akun yang sedang digunakan.</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if data.profile}
					<div class="grid gap-3 text-sm md:grid-cols-2">
						<div>
							<p class="text-muted-foreground">Email</p>
							<p class="font-medium">{data.profile.email}</p>
						</div>
						<div>
							<p class="text-muted-foreground">Nama</p>
							<p class="font-medium">{data.profile.fullName || "-"}</p>
						</div>
						<div>
							<p class="text-muted-foreground">Role</p>
							<p class="font-medium">{roleLabel(data.profile.role)}</p>
						</div>
						<div>
							<p class="text-muted-foreground">Divisi</p>
							<p class="font-medium">{data.profile.divisionName ?? "-"}</p>
						</div>
					</div>
				{:else}
					<p class="text-muted-foreground text-sm">Profil tidak ditemukan.</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Status Akses</Card.Title>
				<Card.Description>Ringkasan pengguna aplikasi.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-3 gap-3 text-center">
					<div class="rounded-md border p-3">
						<p class="text-2xl font-semibold">{data.users.length}</p>
						<p class="text-muted-foreground text-xs">Total</p>
					</div>
					<div class="rounded-md border p-3">
						<p class="text-2xl font-semibold text-emerald-700">{activeUsersCount}</p>
						<p class="text-muted-foreground text-xs">Aktif</p>
					</div>
					<div class="rounded-md border p-3">
						<p class="text-2xl font-semibold text-destructive">{inactiveUsersCount}</p>
						<p class="text-muted-foreground text-xs">Nonaktif</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	{#if !canManageUsers}
		<Card.Root>
			<Card.Header>
				<Card.Title>Management Akun</Card.Title>
				<Card.Description>Hanya admin yang dapat mengelola pengguna dan divisi.</Card.Description>
			</Card.Header>
		</Card.Root>
	{:else}
		<section class="flex flex-col gap-4">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div class="inline-flex rounded-md border bg-muted/30 p-1">
					<button
						type="button"
						class="h-9 rounded-md px-4 text-sm font-medium transition-colors {activeTab === 'users'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (activeTab = "users")}
					>
						Pengguna
					</button>
					<button
						type="button"
						class="h-9 rounded-md px-4 text-sm font-medium transition-colors {activeTab === 'divisions'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (activeTab = "divisions")}
					>
						Divisi
					</button>
				</div>

				{#if activeTab === "users"}
					<Dialog.Root bind:open={createUserOpen}>
						<Dialog.Trigger>
							{#snippet child({ props })}
								<Button {...props}>
									<UserPlusIcon />
									Tambah Pengguna
								</Button>
							{/snippet}
						</Dialog.Trigger>
						<Dialog.Content class="sm:max-w-lg">
							<Dialog.Header>
								<Dialog.Title>Tambah Pengguna</Dialog.Title>
								<Dialog.Description>
									Akun dibuat langsung aktif. Pengguna login memakai PIN email.
								</Dialog.Description>
							</Dialog.Header>
							<form method="POST" action="?/createUser" class="space-y-4" use:enhance={enhancedSubmit}>
								<input type="hidden" name="intent" value="createUser" />
								{@render UserFields({ divisions: data.divisions, roles: roleOptions })}
								<Dialog.Footer>
									<Button type="submit" disabled={pendingIntent === "createUser"}>
										{#if pendingIntent === "createUser"}<LoaderCircleIcon class="animate-spin" />{/if}
										Buat akun
									</Button>
								</Dialog.Footer>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				{:else}
					<Dialog.Root bind:open={createDivisionOpen}>
						<Dialog.Trigger>
							{#snippet child({ props })}
								<Button {...props}>
									<Building2Icon />
									Tambah Divisi
								</Button>
							{/snippet}
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>Tambah Divisi</Dialog.Title>
								<Dialog.Description>Divisi baru akan tersedia di form pengguna.</Dialog.Description>
							</Dialog.Header>
							<form
								method="POST"
								action="?/createDivision"
								class="space-y-4"
								use:enhance={enhancedSubmit}
							>
								<input type="hidden" name="intent" value="createDivision" />
								<Field>
									<FieldLabel for="division-name">Nama divisi</FieldLabel>
									<Input id="division-name" name="name" required placeholder="Nama divisi" />
								</Field>
								<Dialog.Footer>
									<Button type="submit" disabled={pendingIntent === "createDivision"}>
										{#if pendingIntent === "createDivision"}<LoaderCircleIcon class="animate-spin" />{/if}
										Buat divisi
									</Button>
								</Dialog.Footer>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				{/if}
			</div>

			{#if activeTab === "users"}
				<Card.Root>
					<Card.Header>
						<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
							<div>
								<Card.Title>Daftar Pengguna</Card.Title>
								<Card.Description>Kelola role, divisi, dan status akses.</Card.Description>
							</div>
							<div class="relative w-full md:w-80">
								<SearchIcon class="text-muted-foreground absolute top-2.5 left-3 size-4" />
								<Input
									class="pl-9"
									placeholder="Cari pengguna..."
									bind:value={userQuery}
									aria-label="Cari pengguna"
								/>
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="overflow-x-auto">
							<table class="w-full border-collapse text-sm">
								<thead>
									<tr class="bg-muted/40 text-left">
										<th class="border-b p-3">Pengguna</th>
										<th class="border-b p-3">Role</th>
										<th class="border-b p-3">Divisi</th>
										<th class="border-b p-3">Status</th>
										<th class="border-b p-3">Dibuat</th>
										<th class="border-b p-3 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody>
									{#if filteredUsers.length}
										{#each filteredUsers as user (user.id)}
											<tr class="hover:bg-muted/20">
												<td class="border-b p-3">
													<p class="font-medium">{user.fullName || user.email.split("@")[0]}</p>
													<p class="text-muted-foreground text-xs">{user.email}</p>
												</td>
												<td class="border-b p-3">
													<span class="inline-flex rounded-md border px-2 py-1 text-xs font-medium {roleBadgeClass(user.role)}">
														{roleLabel(user.role)}
													</span>
												</td>
												<td class="border-b p-3">{user.divisionName ?? "-"}</td>
												<td class="border-b p-3">
													<span
														class="inline-flex rounded-md border px-2 py-1 text-xs font-medium {user.isActive
															? 'border-emerald-200 bg-emerald-50 text-emerald-700'
															: 'border-destructive/30 bg-destructive/10 text-destructive'}"
													>
														{user.isActive ? "Aktif" : "Nonaktif"}
													</span>
												</td>
												<td class="border-b p-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
												<td class="border-b p-3">
													<div class="flex justify-end gap-2">
														<Button variant="outline" size="sm" onclick={() => openEditUser(user)}>
															<PencilIcon />
															Edit
														</Button>
														<form method="POST" action="?/deactivateUser" use:enhance={enhancedSubmit}>
															<input type="hidden" name="intent" value="deactivateUser" />
															<input type="hidden" name="userId" value={user.id} />
															<Button
																type="submit"
																variant="destructive"
																size="sm"
																disabled={!user.isActive || user.id === data.profile?.id || pendingIntent === "deactivateUser"}
															>
																<BanIcon />
																Nonaktifkan
															</Button>
														</form>
													</div>
												</td>
											</tr>
										{/each}
									{:else}
										<tr>
											<td colspan="6" class="p-8 text-center text-muted-foreground">
												Tidak ada pengguna yang cocok.
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root>
					<Card.Header>
						<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
							<div>
								<Card.Title>Master Divisi</Card.Title>
								<Card.Description>Divisi dipakai untuk scope user BPO dan Viewer.</Card.Description>
							</div>
							<div class="relative w-full md:w-80">
								<SearchIcon class="text-muted-foreground absolute top-2.5 left-3 size-4" />
								<Input
									class="pl-9"
									placeholder="Cari divisi..."
									bind:value={divisionQuery}
									aria-label="Cari divisi"
								/>
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="overflow-x-auto">
							<table class="w-full border-collapse text-sm">
								<thead>
									<tr class="bg-muted/40 text-left">
										<th class="border-b p-3">Nama Divisi</th>
										<th class="border-b p-3 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody>
									{#if filteredDivisions.length}
										{#each filteredDivisions as division (division.id)}
											<tr class="hover:bg-muted/20">
												<td class="border-b p-3 font-medium">{division.name}</td>
												<td class="border-b p-3">
													<div class="flex justify-end">
														<Button variant="outline" size="sm" onclick={() => openEditDivision(division)}>
															<PencilIcon />
															Edit
														</Button>
													</div>
												</td>
											</tr>
										{/each}
									{:else}
										<tr>
											<td colspan="2" class="p-8 text-center text-muted-foreground">
												Tidak ada divisi yang cocok.
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</section>
	{/if}
</main>

<Dialog.Root bind:open={editUserOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Edit Pengguna</Dialog.Title>
			<Dialog.Description>Perbarui role, divisi, nama, dan status akses.</Dialog.Description>
		</Dialog.Header>
		{#if selectedUser}
			<form method="POST" action="?/updateUser" class="space-y-4" use:enhance={enhancedSubmit}>
				<input type="hidden" name="intent" value="updateUser" />
				<input type="hidden" name="userId" value={selectedUser.id} />
				<Field>
					<FieldLabel>Email</FieldLabel>
					<Input value={selectedUser.email} disabled />
					<FieldDescription>Email tidak diubah dari halaman ini.</FieldDescription>
				</Field>
				{@render UserFields({
					divisions: data.divisions,
					roles: roleOptions,
					user: selectedUser,
					showActiveToggle: selectedUser.id !== data.profile?.id
				})}
				<Dialog.Footer>
					<Button type="submit" disabled={pendingIntent === "updateUser"}>
						{#if pendingIntent === "updateUser"}<LoaderCircleIcon class="animate-spin" />{/if}
						Simpan perubahan
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editDivisionOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Divisi</Dialog.Title>
			<Dialog.Description>Perubahan nama akan tampil di data pengguna.</Dialog.Description>
		</Dialog.Header>
		{#if selectedDivision}
			<form method="POST" action="?/updateDivision" class="space-y-4" use:enhance={enhancedSubmit}>
				<input type="hidden" name="intent" value="updateDivision" />
				<input type="hidden" name="divisionId" value={selectedDivision.id} />
				<Field>
					<FieldLabel for="edit-division-name">Nama divisi</FieldLabel>
					<Input id="edit-division-name" name="name" required value={selectedDivision.name} />
				</Field>
				<Dialog.Footer>
					<Button type="submit" disabled={pendingIntent === "updateDivision"}>
						{#if pendingIntent === "updateDivision"}<LoaderCircleIcon class="animate-spin" />{/if}
						Simpan divisi
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

{#snippet UserFields({
	divisions,
	roles,
	user = null,
	showActiveToggle = false
}: {
	divisions: Division[];
	roles: { value: UserRole; label: string; description: string }[];
	user?: AccountUser | null;
	showActiveToggle?: boolean;
})}
	<FieldGroup>
		<Field>
			<FieldLabel for={user ? `full-name-${user.id}` : "full-name-new"}>Nama lengkap</FieldLabel>
			<Input
				id={user ? `full-name-${user.id}` : "full-name-new"}
				name="fullName"
				value={user?.fullName ?? ""}
				placeholder="Nama lengkap"
			/>
		</Field>

		{#if !user}
			<Field>
				<FieldLabel for="new-email">Email</FieldLabel>
				<Input
					id="new-email"
					name="email"
					type="email"
					required
					placeholder="user@company.com"
					autocomplete="email"
				/>
			</Field>
		{/if}

		<div class="grid gap-4 md:grid-cols-2">
			<Field>
				<FieldLabel for={user ? `role-${user.id}` : "role-new"}>Role</FieldLabel>
				<select
					id={user ? `role-${user.id}` : "role-new"}
					name="role"
					required
					class="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-4xl border px-3 text-sm outline-none focus-visible:ring-3"
				>
					{#each roles as role}
						<option value={role.value} selected={(user?.role ?? "bpo") === role.value}>
							{role.label}
						</option>
					{/each}
				</select>
			</Field>

			<Field>
				<FieldLabel for={user ? `division-${user.id}` : "division-new"}>Divisi</FieldLabel>
				<select
					id={user ? `division-${user.id}` : "division-new"}
					name="divisionId"
					class="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-4xl border px-3 text-sm outline-none focus-visible:ring-3"
				>
					<option value="" selected={!user?.divisionId}>Tanpa divisi</option>
					{#each divisions as division}
						<option value={division.id} selected={user?.divisionId === division.id}>
							{division.name}
						</option>
					{/each}
				</select>
			</Field>
		</div>

		{#if showActiveToggle && user}
			<label class="flex items-center gap-3 rounded-md border p-3 text-sm">
				<input type="checkbox" name="isActive" checked={user.isActive} class="size-4" />
				<span>
					<span class="block font-medium">Akun aktif</span>
					<span class="text-muted-foreground text-xs">User nonaktif tidak dapat login.</span>
				</span>
			</label>
		{:else if user?.id === data.profile?.id}
			<input type="hidden" name="isActive" value="on" />
			<div class="flex items-start gap-3 rounded-md border bg-muted/30 p-3 text-sm">
				<ShieldCheckIcon class="text-primary mt-0.5 size-4" />
				<p class="text-muted-foreground">
					Akun Anda sendiri selalu dipertahankan aktif dari form ini.
				</p>
			</div>
		{/if}
	</FieldGroup>
{/snippet}
