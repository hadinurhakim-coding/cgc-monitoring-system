<script lang="ts">
	import { ChevronDown, Search, X } from "@lucide/svelte";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { cn } from "$lib/utils.js";

	type AuditActivityRow = {
		id: number;
		created_at: string;
		actor_user_id: string | null;
		actor_email: string;
		actor_role: string | null;
		division_id: string | null;
		page_path: string;
		action: string;
		entity_type: string;
		entity_id: string;
		entity_label: string | null;
		year: number;
		field: string;
		old_value: string | null;
		new_value: string | null;
		metadata: Record<string, unknown>;
	};

	type RealtimeStatus = "connecting" | "live" | "error" | "unavailable";

	type Props = {
		rows: AuditActivityRow[];
		selectedYear: number;
		search?: string;
		sourceFilter?: string;
		fieldFilter?: string;
		limitedByDivision?: boolean;
		realtimeStatus?: RealtimeStatus;
	};

	const sourceOptions = [
		{ value: "/assessment-acgs", label: "Assessment ACGS" },
		{ value: "/area-of-improvement", label: "Area of Improvement" },
		{ value: "/monitoring-aoi", label: "Monitoring AOI" }
	];

	const fieldOptions = [
		"implementation",
		"evidence",
		"status",
		"recommendation",
		"fakta_temuan",
		"tindak_lanjut_rekomendasi",
		"pic",
		"target_waktu_penyelesaian",
		"status_rekomendasi",
		"eviden",
		"keterangan"
	];

	const fieldLabels: Record<string, string> = {
		implementation: "Implementasi",
		evidence: "Bukti pendukung assessment",
		status: "Status assessment",
		recommendation: "Rekomendasi assessment",
		fakta_temuan: "Fakta temuan",
		tindak_lanjut_rekomendasi: "Tindak lanjut rekomendasi",
		pic: "Penanggung jawab (PIC)",
		target_waktu_penyelesaian: "Target waktu penyelesaian",
		status_rekomendasi: "Status rekomendasi AOI",
		eviden: "Eviden tindak lanjut",
		keterangan: "Keterangan monitoring"
	};

	let {
		rows,
		selectedYear,
		search = "",
		sourceFilter = "all",
		fieldFilter = "all",
		limitedByDivision = false,
		realtimeStatus = "unavailable"
	}: Props = $props();

	let expandedLogId = $state<number | null>(null);

	const filteredRows = $derived.by(() => {
		const normalizedSearch = normalizeSearch(search);
		return rows.filter((row) => {
			if (sourceFilter !== "all" && row.page_path !== sourceFilter) return false;
			if (fieldFilter !== "all" && row.field !== fieldFilter) return false;
			if (!normalizedSearch) return true;

			return normalizeSearch([
				row.actor_email,
				row.actor_user_id ?? "",
				row.actor_role ?? "",
				row.page_path,
				pageLabel(row.page_path),
				row.action,
				actionLabel(row.action),
				row.entity_type,
				entityTypeLabel(row.entity_type),
				row.entity_id,
				row.entity_label ?? "",
				row.field,
				fieldLabel(row.field),
				row.old_value ?? "",
				row.new_value ?? "",
				String(row.year),
				String(row.id)
			].join(" ")).includes(normalizedSearch);
		}).slice(0, 20);
	});

	const clearSearchHref = $derived(`?year=${encodeURIComponent(String(selectedYear))}`);
	const hasActiveFilter = $derived(search !== "" || sourceFilter !== "all" || fieldFilter !== "all");

	function normalizeSearch(value: string): string {
		return value.trim().toLocaleLowerCase("id-ID");
	}

	function fieldLabel(field: string): string {
		return fieldLabels[field] ?? field.replaceAll("_", " ");
	}

	function pageLabel(path: string): string {
		return sourceOptions.find((option) => option.value === path)?.label ?? path;
	}

	function actionLabel(action: string): string {
		if (action === "create") return "Data dibuat";
		if (action === "delete") return "Data dihapus";
		return "Data diperbarui";
	}

	function entityTypeLabel(entityType: string): string {
		if (entityType === "assessment_answer") return "Jawaban assessment";
		if (entityType === "aoi_followup") return "Tindak lanjut AOI";
		if (entityType === "aoi_monitoring") return "Monitoring AOI";
		return entityType.replaceAll("_", " ");
	}

	function actionClass(action: string): string {
		if (action === "create") return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
		if (action === "delete") return "border-destructive/30 bg-destructive/10 text-destructive";
		return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300";
	}

	function formatDate(value: string): string {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value || "Waktu tidak tersedia";
		return date.toLocaleDateString("id-ID", {
			timeZone: "Asia/Jakarta",
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	}

	function formatTime(value: string): string {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "";
		return `${date.toLocaleTimeString("id-ID", {
			timeZone: "Asia/Jakarta",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false
		})} WIB`;
	}

	function fullTimestamp(value: string): string {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? value : date.toISOString();
	}

	function valueSummary(value: string | null): string {
		if (value == null || value.trim() === "") return "Kosong";
		if (value === "YES") return "YES — Ya";
		if (value === "NO") return "NO — Tidak";
		if (value === "NA") return "NA — Tidak berlaku";
		return value;
	}

	function shortId(value: string | null): string {
		if (!value) return "Tidak tersedia";
		return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
	}

	function changeOrigin(metadata: Record<string, unknown>): string {
		return metadata.change_origin === "status_rule"
			? "Aturan status otomatis"
			: "Perubahan pengguna";
	}

	function toggleDetails(logId: number): void {
		expandedLogId = expandedLogId === logId ? null : logId;
	}

	function realtimeLabel(status: RealtimeStatus): string {
		if (status === "live") return "Realtime aktif";
		if (status === "connecting") return "Menghubungkan realtime";
		if (status === "error") return "Realtime bermasalah";
		return "Realtime tidak tersedia";
	}
</script>

<Card.Root class="min-w-0">
	<Card.Header class="gap-4 border-b">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
			<div class="space-y-1.5">
				<div class="flex flex-wrap items-center gap-2">
					<Card.Title>Aktivitas Terbaru (Audit Log)</Card.Title>
					<span
						class={cn(
							"inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium",
							realtimeStatus === "live" && "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
							realtimeStatus === "connecting" && "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
							realtimeStatus === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
							realtimeStatus === "unavailable" && "border-border bg-muted text-muted-foreground"
						)}
						role="status"
					>
						<span
							class={cn(
								"size-1.5 rounded-full",
								realtimeStatus === "live" && "bg-emerald-500 motion-safe:animate-pulse",
								realtimeStatus === "connecting" && "bg-amber-500",
								realtimeStatus === "error" && "bg-destructive",
								realtimeStatus === "unavailable" && "bg-muted-foreground"
							)}
						></span>
						{realtimeLabel(realtimeStatus)}
					</span>
				</div>
				<Card.Description>
					Jejak perubahan pengguna pada Assessment ACGS, Area of Improvement, dan Monitoring AOI
					tahun {selectedYear}.{#if limitedByDivision} Data dibatasi ke divisi Anda.{/if}
				</Card.Description>
			</div>

			<p class="text-muted-foreground text-xs" aria-live="polite">
				{filteredRows.length} aktivitas ditampilkan
			</p>
		</div>

		<form method="GET" class="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_14rem_16rem_auto] xl:items-end">
			<input type="hidden" name="year" value={selectedYear} />
			<div class="min-w-0">
				<label for="audit-search" class="mb-1.5 block text-xs font-medium">Cari jejak audit</label>
				<div class="relative">
					<Search class="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
					<Input
						id="audit-search"
						name="q"
						value={search}
						class="pl-9"
						placeholder="Pelaku, objek, atribut, atau nilai"
						autocomplete="off"
					/>
				</div>
			</div>

			<div>
				<label for="audit-source-filter" class="mb-1.5 block text-xs font-medium">Halaman sumber</label>
				<select
					id="audit-source-filter"
					name="source"
					class="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-4xl border px-3 text-sm outline-none focus-visible:ring-3"
				>
					<option value="all" selected={sourceFilter === "all"}>Semua halaman</option>
					{#each sourceOptions as option (option.value)}
						<option value={option.value} selected={sourceFilter === option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="audit-field-filter" class="mb-1.5 block text-xs font-medium">Atribut yang diubah</label>
				<select
					id="audit-field-filter"
					name="field"
					class="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-4xl border px-3 text-sm outline-none focus-visible:ring-3"
				>
					<option value="all" selected={fieldFilter === "all"}>Semua atribut</option>
					{#each fieldOptions as field (field)}
						<option value={field} selected={fieldFilter === field}>{fieldLabel(field)}</option>
					{/each}
				</select>
			</div>

			<div class="flex gap-2 md:col-span-2 xl:col-span-1">
				<Button type="submit" class="flex-1 xl:flex-none">
					<Search />
					Terapkan
				</Button>
				{#if hasActiveFilter}
					<Button href={clearSearchHref} variant="outline" aria-label="Hapus filter audit">
						<X />
						Hapus
					</Button>
				{/if}
			</div>
		</form>
	</Card.Header>

	<Card.Content class="px-0">
		{#if filteredRows.length}
			<div class="max-w-full min-w-0 overflow-x-auto">
				<table class="w-full min-w-360 border-collapse text-sm">
					<caption class="sr-only">
						Jejak perubahan data tahun {selectedYear}, meliputi waktu, halaman sumber, pelaku,
						jenis aksi, objek, atribut, nilai sebelum, dan nilai setelah perubahan.
					</caption>
					<thead>
						<tr class="bg-muted/50 text-left">
							<th scope="col" class="border-b px-4 py-3 font-semibold">Waktu kejadian</th>
							<th scope="col" class="border-b px-4 py-3 font-semibold">Halaman sumber</th>
							<th scope="col" class="border-b px-4 py-3 font-semibold">Pelaku perubahan</th>
							<th scope="col" class="border-b px-4 py-3 font-semibold">Jenis aksi</th>
							<th scope="col" class="border-b px-4 py-3 font-semibold">Objek yang diaudit</th>
							<th scope="col" class="border-b px-4 py-3 font-semibold">Atribut yang diubah</th>
							<th scope="col" class="border-b px-4 py-3 font-semibold">Sebelum perubahan</th>
							<th scope="col" class="border-b px-4 py-3 font-semibold">Setelah perubahan</th>
							<th scope="col" class="border-b px-4 py-3 text-right font-semibold">Rincian</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredRows as row (row.id)}
							<tr class="hover:bg-muted/30 align-top transition-colors">
								<td class="border-b px-4 py-3 whitespace-nowrap">
									<time datetime={row.created_at} title={fullTimestamp(row.created_at)}>
										<span class="block font-medium">{formatDate(row.created_at)}</span>
										<span class="text-muted-foreground block text-xs">{formatTime(row.created_at)}</span>
									</time>
								</td>
								<td class="border-b px-4 py-3">
									<span class="bg-secondary text-secondary-foreground inline-flex rounded-md px-2 py-1 text-xs font-medium">
										{pageLabel(row.page_path)}
									</span>
									<span class="text-muted-foreground mt-1 block font-mono text-xs">{row.page_path}</span>
								</td>
								<td class="border-b px-4 py-3">
									<span class="block max-w-64 truncate font-medium" title={row.actor_email || "Email tidak tersedia"}>
										{row.actor_email || "Email tidak tersedia"}
									</span>
									<span class="text-muted-foreground block text-xs">Role: {row.actor_role || "tidak tersedia"}</span>
									<span class="text-muted-foreground block font-mono text-xs">ID {shortId(row.actor_user_id)}</span>
								</td>
								<td class="border-b px-4 py-3">
									<span class={cn("inline-flex rounded-full border px-2 py-1 text-xs font-medium", actionClass(row.action))}>
										{actionLabel(row.action)}
									</span>
								</td>
								<td class="border-b px-4 py-3">
									<span class="block font-medium">{row.entity_label || "Objek tanpa label"}</span>
									<span class="text-muted-foreground block text-xs">{entityTypeLabel(row.entity_type)} · Tahun {row.year}</span>
								</td>
								<td class="border-b px-4 py-3">
									<span class="bg-primary/10 text-primary inline-flex rounded-md px-2 py-1 text-xs font-medium">
										{fieldLabel(row.field)}
									</span>
								</td>
								<td class="border-b px-4 py-3">
									<p
										class={cn(
											"line-clamp-2 max-w-72 whitespace-pre-wrap break-words",
											(row.old_value == null || row.old_value.trim() === "") && "text-muted-foreground italic"
										)}
										title={valueSummary(row.old_value)}
									>
										{valueSummary(row.old_value)}
									</p>
								</td>
								<td class="border-b px-4 py-3">
									<p
										class={cn(
											"line-clamp-2 max-w-72 whitespace-pre-wrap break-words font-medium",
											(row.new_value == null || row.new_value.trim() === "") && "text-muted-foreground font-normal italic"
										)}
										title={valueSummary(row.new_value)}
									>
										{valueSummary(row.new_value)}
									</p>
								</td>
								<td class="border-b px-4 py-3 text-right">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => toggleDetails(row.id)}
										aria-expanded={expandedLogId === row.id}
										aria-controls={`audit-detail-${row.id}`}
									>
										Detail
										<ChevronDown class={cn("transition-transform", expandedLogId === row.id && "rotate-180")} />
									</Button>
								</td>
							</tr>

							{#if expandedLogId === row.id}
								<tr id={`audit-detail-${row.id}`} class="bg-muted/20">
									<td colspan="9" class="border-b px-4 py-4">
										<div class="grid gap-4 lg:grid-cols-3">
											<div class="space-y-2 text-xs">
												<p class="font-semibold">Referensi audit</p>
												<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
													<dt class="text-muted-foreground">ID log</dt>
													<dd class="font-mono">{row.id}</dd>
													<dt class="text-muted-foreground">ID objek</dt>
													<dd class="break-all font-mono">{row.entity_id || "-"}</dd>
													<dt class="text-muted-foreground">ID divisi</dt>
													<dd class="break-all font-mono">{row.division_id || "-"}</dd>
													<dt class="text-muted-foreground">Asal perubahan</dt>
													<dd>{changeOrigin(row.metadata)}</dd>
												</dl>
											</div>
											<div class="min-w-0 space-y-2">
												<p class="text-xs font-semibold">Nilai lengkap sebelum perubahan</p>
												<pre class="max-h-48 overflow-auto rounded-md border bg-background p-3 font-sans text-xs whitespace-pre-wrap break-words">{valueSummary(row.old_value)}</pre>
											</div>
											<div class="min-w-0 space-y-2">
												<p class="text-xs font-semibold">Nilai lengkap setelah perubahan</p>
												<pre class="max-h-48 overflow-auto rounded-md border bg-background p-3 font-sans text-xs whitespace-pre-wrap break-words">{valueSummary(row.new_value)}</pre>
											</div>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="px-6 py-12 text-center">
				<p class="font-medium">
					{hasActiveFilter
						? "Tidak ada aktivitas yang sesuai dengan filter."
						: `Belum ada perubahan data untuk tahun ${selectedYear}.`}
				</p>
				<p class="text-muted-foreground mt-1 text-sm">
					{hasActiveFilter
						? "Ubah kata kunci atau filter untuk melihat hasil lain."
						: "Aktivitas baru akan muncul otomatis setelah perubahan tersimpan."}
				</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
