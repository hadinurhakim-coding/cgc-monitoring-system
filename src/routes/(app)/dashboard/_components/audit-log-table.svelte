<script lang="ts">
	import { ChevronDown, Search, X } from "@lucide/svelte";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { cn } from "$lib/utils.js";

	type AuditActivityRow = {
		id: number;
		created_at: string;
		user_id: string;
		user_email: string;
		division_id: string | null;
		assessment_uid: string;
		year: number;
		item_id: string | null;
		field: string;
		old_value: string | null;
		new_value: string | null;
	};

	type RealtimeStatus = "connecting" | "live" | "error" | "unavailable";

	type Props = {
		rows: AuditActivityRow[];
		selectedYear: number;
		search?: string;
		limitedByDivision?: boolean;
		realtimeStatus?: RealtimeStatus;
	};

	const fieldLabels: Record<string, string> = {
		implementation: "Implementasi",
		evidence: "Bukti pendukung",
		status: "Status penilaian",
		recommendation: "Rekomendasi",
		fakta_temuan: "Fakta temuan",
		tindak_lanjut_rekomendasi: "Tindak lanjut rekomendasi",
		pic: "Penanggung jawab (PIC)",
		target_waktu_penyelesaian: "Target penyelesaian",
		keterangan: "Keterangan"
	};

	let {
		rows,
		selectedYear,
		search = "",
		limitedByDivision = false,
		realtimeStatus = "unavailable"
	}: Props = $props();

	let fieldFilter = $state("all");
	let expandedLogId = $state<number | null>(null);

	const fieldOptions = $derived.by(() => {
		const fields = [...new Set(rows.map((row) => row.field).filter(Boolean))];
		return fields.sort((left, right) => fieldLabel(left).localeCompare(fieldLabel(right), "id-ID"));
	});

	const filteredRows = $derived.by(() => {
		const normalizedSearch = normalizeSearch(search);
		return rows.filter((row) => {
			if (fieldFilter !== "all" && row.field !== fieldFilter) return false;
			if (!normalizedSearch) return true;

			return normalizeSearch([
				row.user_email,
				row.user_id,
				row.item_id ?? "",
				row.assessment_uid,
				row.field,
				fieldLabel(row.field),
				row.old_value ?? "",
				row.new_value ?? "",
				String(row.year),
				String(row.id)
			].join(" ")).includes(normalizedSearch);
		});
	});

	const clearSearchHref = $derived(`?year=${encodeURIComponent(String(selectedYear))}`);

	function normalizeSearch(value: string): string {
		return value.trim().toLocaleLowerCase("id-ID");
	}

	function fieldLabel(field: string): string {
		return fieldLabels[field] ?? field.replaceAll("_", " ");
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

	function shortId(value: string): string {
		if (!value) return "Tidak tersedia";
		return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
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
					Jejak perubahan data tahun {selectedYear}, diurutkan dari kejadian terbaru.
					{#if limitedByDivision} Data dibatasi ke divisi Anda.{/if}
				</Card.Description>
			</div>

			<p class="text-muted-foreground text-xs" aria-live="polite">
				{filteredRows.length} aktivitas ditampilkan
			</p>
		</div>

		<form method="GET" class="flex flex-col gap-2 md:flex-row md:items-end">
			<input type="hidden" name="year" value={selectedYear} />
			<div class="min-w-0 flex-1">
				<label for="audit-search" class="mb-1.5 block text-xs font-medium">Cari jejak audit</label>
				<div class="relative">
					<Search class="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
					<Input
						id="audit-search"
						name="q"
						value={search}
						class="pl-9"
						placeholder="Email, kode item, atribut, atau nilai perubahan"
						autocomplete="off"
					/>
				</div>
			</div>

			<div class="w-full md:w-64">
				<label for="audit-field-filter" class="mb-1.5 block text-xs font-medium">
					Jenis perubahan
				</label>
				<select
					id="audit-field-filter"
					class="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-4xl border px-3 text-sm outline-none focus-visible:ring-3"
					bind:value={fieldFilter}
				>
					<option value="all">Semua atribut</option>
					{#each fieldOptions as field (field)}
						<option value={field}>{fieldLabel(field)}</option>
					{/each}
				</select>
			</div>

			<div class="flex gap-2">
				<Button type="submit" class="flex-1 md:flex-none">
					<Search />
					Cari
				</Button>
				{#if search}
					<Button href={clearSearchHref} variant="outline" aria-label="Hapus pencarian audit">
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
				<table class="w-full min-w-280 border-collapse text-sm">
				<caption class="sr-only">
					Daftar perubahan data assessment tahun {selectedYear}, termasuk waktu, pelaku, objek,
					atribut, nilai sebelum, dan nilai sesudah perubahan.
				</caption>
				<thead>
					<tr class="bg-muted/50 text-left">
						<th scope="col" class="border-b px-4 py-3 font-semibold">Waktu kejadian</th>
						<th scope="col" class="border-b px-4 py-3 font-semibold">Pelaku perubahan</th>
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
									<span class="block max-w-64 truncate font-medium" title={row.user_email || "Email tidak tersedia"}>
										{row.user_email || "Email tidak tersedia"}
									</span>
									<span class="text-muted-foreground block font-mono text-xs" title={row.user_id}>
										ID {shortId(row.user_id)}
									</span>
								</td>
								<td class="border-b px-4 py-3">
									<span class="block font-medium">Item {row.item_id || "tanpa kode"}</span>
									<span class="text-muted-foreground block text-xs">Assessment {row.year}</span>
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
											(row.new_value == null || row.new_value.trim() === "") && "text-muted-foreground italic font-normal"
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
									<td colspan="7" class="border-b px-4 py-4">
										<div class="grid gap-4 lg:grid-cols-3">
											<div class="space-y-2 text-xs">
												<p class="font-semibold">Referensi audit</p>
												<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
													<dt class="text-muted-foreground">ID log</dt>
													<dd class="font-mono">{row.id}</dd>
													<dt class="text-muted-foreground">ID assessment</dt>
													<dd class="break-all font-mono">{row.assessment_uid || "-"}</dd>
													<dt class="text-muted-foreground">ID divisi</dt>
													<dd class="break-all font-mono">{row.division_id || "-"}</dd>
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
					{search || fieldFilter !== "all"
						? "Tidak ada aktivitas yang sesuai dengan filter."
						: `Belum ada perubahan data untuk tahun ${selectedYear}.`}
				</p>
				<p class="text-muted-foreground mt-1 text-sm">
					{search || fieldFilter !== "all"
						? "Ubah kata kunci atau pilih semua atribut untuk melihat hasil lain."
						: "Aktivitas baru akan muncul otomatis setelah perubahan tersimpan."}
				</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
