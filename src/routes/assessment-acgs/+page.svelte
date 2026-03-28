<script lang="ts">
	import FilterIcon from "@lucide/svelte/icons/filter";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import SearchIcon from "@lucide/svelte/icons/search";
	import PencilLineIcon from "@lucide/svelte/icons/pencil-line";
	import { goto } from "$app/navigation";
	import type { ActionData, PageData } from "./$types.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const currentYear = new Date().getFullYear();
	const yearsBack = 75;
	const baseYear = currentYear - yearsBack;
	const years = Array.from({ length: currentYear - baseYear + 1 }, (_, i) => currentYear - i);
	let selectedYear = $state(new Date().getFullYear());
	let yearFilterOpen = $state(false);
	let yearSearchQuery = $state("");
	let rowsPerPage = $state(25);
	let currentPage = $state(1);
	let editorOpen = $state(false);
	let editingQuestionCode = $state("");
	let editingQuestionEn = $state("");
	let editingQuestionId = $state("");
	let implementationDraft = $state("");
	let evidenceDraft = $state("");
	let recommendationDraft = $state("");
	let statusDraft = $state<"yes" | "no" | "na" | "">("");
	let existingEvidence = $state("");
	const rowsPerPageOptions = [10, 25, 50];

	const filteredYears = $derived.by(() => {
		const q = yearSearchQuery.trim();
		if (!q) return years;
		return years.filter((y) => String(y).includes(q));
	});

	const partRows = $derived(data.parts);
	const answersByCode = $derived(data.answersByCode ?? {});
	const flattenedQuestions = $derived.by(() => {
		const rows: Array<{
			partCode: string;
			partTitleEn: string;
			partTitleId: string;
			sectionCode: string;
			sectionTitleEn: string;
			sectionTitleId: string;
			questionCode: string;
			questionEn: string;
			questionId: string;
			answer: {
				implementation: string;
				evidence: string;
				status: "yes" | "no" | "na" | null;
				recommendation: string;
			};
		}> = [];

		for (const part of partRows) {
			for (const section of part.sections) {
				for (const question of section.questions) {
					const answer = answersByCode[question.code] ?? {
						implementation: "",
						evidence: "",
						status: null,
						recommendation: ""
					};
					rows.push({
						partCode: part.code,
						partTitleEn: part.title_en,
						partTitleId: part.title_id,
						sectionCode: section.code,
						sectionTitleEn: section.title_en,
						sectionTitleId: section.title_id,
						questionCode: question.code,
						questionEn: question.question_en,
						questionId: question.question_id,
						answer
					});
				}
			}
		}

		return rows;
	});
	const totalQuestions = $derived(flattenedQuestions.length);
	const totalPages = $derived(Math.max(1, Math.ceil(totalQuestions / rowsPerPage)));
	const pagedQuestions = $derived.by(() => {
		const start = (currentPage - 1) * rowsPerPage;
		return flattenedQuestions.slice(start, start + rowsPerPage);
	});
	const pagedPartRows = $derived.by(() => {
		const partMap = new Map<
			string,
			{
				code: string;
				title_en: string;
				title_id: string;
				sections: Array<{
					code: string;
					title_en: string;
					title_id: string;
					questions: Array<{
						code: string;
						question_en: string;
						question_id: string;
						answer: {
							implementation: string;
							evidence: string;
							status: "yes" | "no" | "na" | null;
							recommendation: string;
						};
					}>;
				}>;
			}
		>();

		for (const row of pagedQuestions) {
			const existingPart = partMap.get(row.partCode);
			const part =
				existingPart ??
				{
					code: row.partCode,
					title_en: row.partTitleEn,
					title_id: row.partTitleId,
					sections: []
				};
			if (!existingPart) partMap.set(row.partCode, part);

			let section = part.sections.find((s) => s.code === row.sectionCode);
			if (!section) {
				section = {
					code: row.sectionCode,
					title_en: row.sectionTitleEn,
					title_id: row.sectionTitleId,
					questions: []
				};
				part.sections.push(section);
			}

			section.questions.push({
				code: row.questionCode,
				question_en: row.questionEn,
				question_id: row.questionId,
				answer: row.answer
			});
		}

		return Array.from(partMap.values());
	});
	const pageStart = $derived(totalQuestions === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1);
	const pageEnd = $derived(Math.min(currentPage * rowsPerPage, totalQuestions));

	$effect(() => {
		selectedYear = data.selectedYear;
		currentPage = 1;
	});

	$effect(() => {
		if (!yearFilterOpen) yearSearchQuery = "";
	});

	$effect(() => {
		if (currentPage > totalPages) currentPage = totalPages;
	});

	async function selectYear(year: number) {
		selectedYear = year;
		await goto(`/assessment-acgs?year=${year}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	function prevPage() {
		currentPage = Math.max(1, currentPage - 1);
	}

	function nextPage() {
		currentPage = Math.min(totalPages, currentPage + 1);
	}

	function handleRowsPerPageChange(event: Event) {
		const value = Number((event.currentTarget as HTMLSelectElement).value);
		if (!Number.isFinite(value)) return;
		rowsPerPage = value;
		currentPage = 1;
	}

	function openEditor(question: {
		code: string;
		question_en: string;
		question_id: string;
		answer: {
			implementation: string;
			evidence: string;
			status: "yes" | "no" | "na" | null;
			recommendation: string;
		};
	}) {
		editingQuestionCode = question.code;
		editingQuestionEn = question.question_en;
		editingQuestionId = question.question_id;
		implementationDraft = question.answer.implementation;
		evidenceDraft = question.answer.evidence;
		existingEvidence = question.answer.evidence;
		recommendationDraft = question.answer.recommendation;
		statusDraft = question.answer.status ?? "";
		editorOpen = true;
	}

	function getStatusLabel(status: "yes" | "no" | "na" | null) {
		if (status === "yes") return "YES";
		if (status === "no") return "NO";
		if (status === "na") return "N/A";
		return "-";
	}
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
			<h1 class="text-lg font-semibold">ASSESSMENT ACGS</h1>
		</header>

		<main class="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<h2 class="max-w-5xl text-sm leading-6 font-semibold md:text-base">
					URAIAN HASIL ASSESSMENT ASEAN CORPORATE GOVERNANCE (ACGS) LEVEL 1 TAHUN BUKU
					{selectedYear}
				</h2>

				<DropdownMenu.Root bind:open={yearFilterOpen}>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button variant="outline" class="gap-2 rounded-lg" {...props}>
								<FilterIcon class="size-4" />
								<span>Tahun: {selectedYear}</span>
								<ChevronDownIcon class="size-4" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						align="end"
						class="flex w-52 max-h-72 flex-col overflow-hidden rounded-lg p-0"
					>
						<div class="bg-popover border-b p-2">
							<DropdownMenu.Label class="px-0 pb-2">Pilih Tahun</DropdownMenu.Label>
							<div class="relative">
								<SearchIcon
									class="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2"
								/>
								<Input
									type="search"
									class="h-9 rounded-lg ps-8"
									placeholder="Cari tahun…"
									bind:value={yearSearchQuery}
									autocomplete="off"
									onkeydown={(e) => e.stopPropagation()}
								/>
							</div>
						</div>
						<div class="max-h-52 min-h-0 flex-1 overflow-y-auto py-1">
							{#each filteredYears as year (year)}
								<DropdownMenu.Item
									class="cursor-pointer"
									onSelect={() => selectYear(year)}
								>
									{year}
								</DropdownMenu.Item>
							{:else}
								<div class="text-muted-foreground px-3 py-6 text-center text-sm">
									Tidak ada tahun yang cocok
								</div>
							{/each}
						</div>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<div class="overflow-x-auto rounded-md border">
				<table class="w-full min-w-[980px] border-collapse text-sm">
					<thead>
						<tr class="bg-[#012a66] text-white">
							<th class="border border-slate-900 p-3 text-center font-semibold">ITEM</th>
							<th class="border border-slate-900 p-3 text-center font-semibold">
								STANDAR TATA KELOLA PERUSAHAAN
							</th>
							<th class="border border-slate-900 p-3 text-center font-semibold">IMPLEMENTASI</th>
							<th class="border border-slate-900 p-3 text-center font-semibold">EVIDENCE</th>
							<th class="border border-slate-900 p-3 text-center font-semibold">
								STATUS YES OR NO
							</th>
							<th class="border border-slate-900 p-3 text-center font-semibold">REKOMENDASI</th>
						</tr>
					</thead>
					<tbody class="align-top">
						<tr>
							<td colspan="6" class="border border-slate-900 bg-white p-1.5 text-left font-semibold">
								LEVEL 1
							</td>
						</tr>
						{#if pagedPartRows.length}
							{#each pagedPartRows as part (part.code)}
								<tr>
									<td
										class="w-16 border border-slate-900 p-2 font-semibold text-[#0082ca] whitespace-pre-line"
									>
										PART {part.code}<br />BAGIAN {part.code}
									</td>
									<td class="border border-slate-900 p-2 leading-6">
										<div class="font-semibold text-black">{part.title_en}</div>
										<div class="mt-0.5 text-[#6d9cc5]">{part.title_id}</div>
									</td>
									<td class="border border-slate-900 p-2"></td>
									<td class="border border-slate-900 p-2"></td>
									<td class="border border-slate-900 p-2"></td>
									<td class="border border-slate-900 p-2"></td>
								</tr>

								{#each part.sections as section (section.code)}
									<tr>
										<td class="border border-slate-900 p-2 align-top font-semibold text-[#0082ca]">
											{section.code}
										</td>
										<td class="border border-slate-900 p-2 leading-6">
											<div class="font-semibold text-black">{section.title_en}</div>
											<div class="mt-0.5 text-[#6d9cc5]">{section.title_id}</div>
										</td>
										<td class="border border-slate-900 p-2"></td>
										<td class="border border-slate-900 p-2"></td>
										<td class="border border-slate-900 p-2"></td>
										<td class="border border-slate-900 p-2"></td>
									</tr>

									{#each section.questions as question (question.code)}
										<tr>
											<td class="border border-slate-900 p-2 font-semibold text-[#0082ca]">
												{question.code}
											</td>
											<td class="border border-slate-900 p-2 leading-6 align-top">
												<div class="text-black">{question.question_en}</div>
												<div class="mt-2 text-[#6d9cc5]">{question.question_id}</div>
											</td>
											<td class="border border-slate-900 p-1.5 align-top">
												<button
													type="button"
													class="hover:bg-muted/40 flex min-h-14 w-full items-start rounded px-2 py-1 text-left text-sm"
													onclick={() => openEditor(question)}
												>
													{question.answer.implementation || "-"}
												</button>
											</td>
											<td class="border border-slate-900 p-1.5 align-top">
												<button
													type="button"
													class="hover:bg-muted/40 flex min-h-14 w-full items-start rounded px-2 py-1 text-left text-sm break-all"
													onclick={() => openEditor(question)}
												>
													{question.answer.evidence || "-"}
												</button>
											</td>
											<td class="border border-slate-900 p-1.5 align-top">
												<button
													type="button"
													class="hover:bg-muted/40 flex min-h-14 w-full items-center rounded px-2 py-1 text-left text-sm font-medium"
													onclick={() => openEditor(question)}
												>
													{getStatusLabel(question.answer.status)}
												</button>
											</td>
											<td class="border border-slate-900 p-1.5 align-top">
												<button
													type="button"
													class="hover:bg-muted/40 flex min-h-14 w-full items-start rounded px-2 py-1 text-left text-sm"
													onclick={() => openEditor(question)}
												>
													{question.answer.recommendation || "-"}
												</button>
											</td>
										</tr>
									{/each}
								{/each}
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="border border-slate-900 p-6 text-center text-slate-600">
									Belum ada data pertanyaan ACGS.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
				<div class="text-muted-foreground text-sm">
					Menampilkan {pageStart}-{pageEnd} dari {totalQuestions} pertanyaan
				</div>
				<div class="flex items-center gap-2">
					<label for="rows-per-page" class="text-sm font-medium">Rows per page</label>
					<select
						id="rows-per-page"
						class="border-input bg-background h-9 rounded-md border px-2 text-sm"
						value={rowsPerPage}
						onchange={handleRowsPerPageChange}
					>
						{#each rowsPerPageOptions as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>
				<div class="flex items-center gap-2">
					<Button variant="outline" class="h-9" onclick={prevPage} disabled={currentPage <= 1}>
						Previous
					</Button>
					<span class="text-sm font-medium">Page {currentPage} / {totalPages}</span>
					<Button
						variant="outline"
						class="h-9"
						onclick={nextPage}
						disabled={currentPage >= totalPages}
					>
						Next
					</Button>
				</div>
			</div>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>

<Sheet.Root bind:open={editorOpen}>
	<Sheet.Content side="right" class="w-full sm:max-w-xl">
		<Sheet.Header>
			<Sheet.Title class="flex items-center gap-2">
				<PencilLineIcon class="size-4" />
				Input Penilaian {editingQuestionCode}
			</Sheet.Title>
			<Sheet.Description>
				<div class="text-black">{editingQuestionEn}</div>
				<div class="mt-1 text-[#6d9cc5]">{editingQuestionId}</div>
			</Sheet.Description>
		</Sheet.Header>

		<form method="POST" action="?/saveAnswer" enctype="multipart/form-data" class="space-y-4 px-6">
			<input type="hidden" name="year" value={selectedYear} />
			<input type="hidden" name="question_code" value={editingQuestionCode} />
			<input type="hidden" name="existing_evidence" value={existingEvidence} />

			<div class="space-y-1">
				<label for="implementation" class="text-sm font-medium">IMPLEMENTASI</label>
				<textarea
					id="implementation"
					name="implementation"
					class="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
					bind:value={implementationDraft}
				></textarea>
			</div>

			<div class="space-y-1">
				<label for="evidence_note" class="text-sm font-medium">EVIDENCE (catatan/link/path)</label>
				<textarea
					id="evidence_note"
					name="evidence_note"
					class="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
					bind:value={evidenceDraft}
				></textarea>
			</div>

			<div class="space-y-1">
				<label for="evidence_file" class="text-sm font-medium">Upload Evidence File (maks 15 MB)</label>
				<input
					id="evidence_file"
					name="evidence_file"
					type="file"
					accept=".pdf,.png,.jpg,.jpeg,.webp"
					class="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm"
				/>
				<p class="text-muted-foreground text-xs">
					File akan disimpan di bucket <strong>gcg-evidance</strong>.
				</p>
			</div>

			<div class="space-y-1">
				<label for="status" class="text-sm font-medium">STATUS YES OR NO</label>
				<select
					id="status"
					name="status"
					class="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm"
					bind:value={statusDraft}
				>
					<option value="">Pilih status</option>
					<option value="yes">YES</option>
					<option value="no">NO</option>
					<option value="na">N/A</option>
				</select>
			</div>

			<div class="space-y-1">
				<label for="recommendation" class="text-sm font-medium">REKOMENDASI</label>
				<textarea
					id="recommendation"
					name="recommendation"
					class="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
					bind:value={recommendationDraft}
				></textarea>
			</div>

			{#if form?.error}
				<p class="text-sm text-red-600">{form.error}</p>
			{/if}

			<Sheet.Footer class="px-0 pb-0">
				<div class="flex items-center justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (editorOpen = false)}>Batal</Button>
					<Button type="submit">Simpan</Button>
				</div>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
