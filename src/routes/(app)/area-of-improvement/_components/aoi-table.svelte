<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { toast } from "svelte-sonner";
  import { Calendar, Check, Cloud, LoaderCircle, CircleAlert, Pencil } from "@lucide/svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { extractEvidenceText, extractEvidenceFiles, reconstructEvidence } from "$lib/evidence-utils.js";
  import type { AoiItem, StatusRekomendasi } from "../_lib/types.js";
  import {
    saveAoiField,
    uploadAoiEvidence,
    deleteAoiEvidenceFile,
  } from "../_lib/aoi-api-client.js";
  import AoiStatusButtons from "./aoi-status-buttons.svelte";
  import AoiEvidenceCell from "./aoi-evidence-cell.svelte";

  interface Props {
    items: AoiItem[];
    currentYear: number;
    availableYears: number[];
    canWrite: boolean;
  }

  let {
    items,
    currentYear,
    availableYears,
    canWrite,
  }: Props = $props();

  let localItems = $state<AoiItem[]>([]);
  let globalSyncStatus = $state<"saved" | "saving" | "error">("saved");
  let stagedFiles = $state<Record<string, File>>({});
  let editDialogOpen = $state(false);
  let editingUid = $state<string | null>(null);
  let editFaktaTemuan = $state("");
  let editTindakLanjut = $state("");
  let editPic = $state("");

  $effect(() => {
    localItems = [...items];
  });

  function setSync(status: "saved" | "saving" | "error"): void {
    globalSyncStatus = status;
  }

  const editingItem = $derived(localItems.find((item) => item.uid === editingUid) ?? null);

  function openItemDialog(item: AoiItem): void {
    editingUid = item.uid;
    editFaktaTemuan = item.fakta_temuan;
    editTindakLanjut = item.tindak_lanjut_rekomendasi;
    editPic = item.pic;
    editDialogOpen = true;
  }

  async function handleSaveField(uid: string, field: string, value: string): Promise<boolean> {
    setSync("saving");
    try {
      await saveAoiField(uid, field, value);
      localItems = localItems.map((item) =>
        item.uid === uid ? { ...item, [field]: value } : item
      );
      setSync("saved");
      return true;
    } catch (err) {
      setSync("error");
      toast.error("Gagal menyimpan: " + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  }

  async function handleSaveStatus(uid: string, val: StatusRekomendasi): Promise<void> {
    await handleSaveField(uid, "status_rekomendasi", val);
  }

  async function handleSaveDialog(): Promise<void> {
    if (!editingItem) return;
    if (!canWrite) {
      editDialogOpen = false;
      return;
    }

    const changes = [
      { field: "fakta_temuan", value: editFaktaTemuan, previous: editingItem.fakta_temuan },
      {
        field: "tindak_lanjut_rekomendasi",
        value: editTindakLanjut,
        previous: editingItem.tindak_lanjut_rekomendasi,
      },
      { field: "pic", value: editPic, previous: editingItem.pic },
    ].filter((change) => change.value !== change.previous);

    let allSaved = true;
    for (const change of changes) {
      const saved = await handleSaveField(editingItem.uid, change.field, change.value);
      allSaved = allSaved && saved;
    }

    if (allSaved) {
      editDialogOpen = false;
      if (changes.length > 0) toast.success("Perubahan AOI berhasil disimpan");
    }
  }

  function previewText(value: string, fallback: string): string {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    return trimmed;
  }

  function statusPreviewClass(status: StatusRekomendasi): string {
    const classMap: Record<StatusRekomendasi, string> = {
      "Selesai ditindak-lanjuti": "border-emerald-300 bg-emerald-100 text-emerald-800",
      "On Progress": "border-blue-300 bg-blue-100 text-blue-800",
      "Tidak dapat ditindak-lanjuti 100%": "border-amber-300 bg-amber-100 text-amber-800",
      "Belum ditindak-lanjuti": "border-slate-300 bg-slate-100 text-slate-700",
    };
    return classMap[status];
  }

  async function handleFileUpload(item: AoiItem, file: File): Promise<void> {
    setSync("saving");
    try {
      const { path, fileName } = await uploadAoiEvidence(file, { year: currentYear, itemUid: item.uid });
      const existingFiles = extractEvidenceFiles(item.eviden);
      const existingText = extractEvidenceText(item.eviden);
      const combined = reconstructEvidence(existingText, [...existingFiles, { path, name: fileName }]);
      await saveAoiField(item.uid, "eviden", combined);
      localItems = localItems.map((i) => i.uid === item.uid ? { ...i, eviden: combined } : i);
      const { [item.uid]: _, ...rest } = stagedFiles;
      stagedFiles = rest;
      setSync("saved");
      toast.success("File berhasil diunggah");
    } catch (err) {
      setSync("error");
      toast.error("Gagal upload: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleRemoveFile(item: AoiItem, index: number): Promise<void> {
    if (!confirm("Apakah Anda yakin ingin menghapus file bukti ini?")) return;
    const files = extractEvidenceFiles(item.eviden);
    const text = extractEvidenceText(item.eviden);
    const fileToDelete = files[index];
    if (fileToDelete?.path) {
      setSync("saving");
      const { error } = await deleteAoiEvidenceFile(fileToDelete.path);
      if (error) {
        setSync("error");
        toast.error("Gagal hapus di cloud: " + error.message);
        return;
      }
    }
    files.splice(index, 1);
    const newValue = reconstructEvidence(text, files);
    await handleSaveField(item.uid, "eviden", newValue);
  }

  let selectedYear = $state("");
  let yearQuery = $state("");

  $effect(() => {
    selectedYear = String(currentYear);
  });

  $effect(() => {
    if (selectedYear && selectedYear !== String(currentYear)) {
      goto(resolve("/area-of-improvement") + `?year=${selectedYear}`, { keepFocus: true, noScroll: true });
    }
  });

  const years = $derived.by(() => {
    const nowYear = new Date().getFullYear();
    const fromDb = [...availableYears].sort((a, b) => b - a).map(String);
    const sliding = Array.from({ length: 18 }, (_, i) => String(nowYear + 1 - i));
    const merged = [...new Set([...fromDb, ...sliding])].sort((a, b) => parseInt(b) - parseInt(a));
    if (yearQuery && !merged.includes(yearQuery) && /^\d{4}$/.test(yearQuery)) merged.unshift(yearQuery);
    return merged.filter((y) => y.includes(yearQuery));
  });

  function longestLineLength(value: string): number {
    return value
      .split(/\r?\n/)
      .reduce((longest, line) => Math.max(longest, line.trim().length), 0);
  }

  function columnWidth(header: string, values: string[], minCh: number, maxCh: number): string {
    const longest = Math.max(longestLineLength(header), ...values.map(longestLineLength));
    const width = Math.min(Math.max(longest + 4, minCh), maxCh);
    return `${width}ch`;
  }

  const columnWidths = $derived.by(() => ({
    no: columnWidth("No", localItems.map((_, idx) => String(idx + 1)), 6, 8),
    aoiCode: columnWidth("No AOI", localItems.map((item) => item.aoi_code), 10, 18),
    areaOfImprovement: columnWidth(
      "Area of Improvement",
      localItems.map((item) => item.area_of_improvement),
      34,
      100
    ),
    faktaTemuan: columnWidth("Fakta Temuan", localItems.map((item) => item.fakta_temuan), 34, 100),
    rekomendasi: columnWidth("Rekomendasi", localItems.map((item) => item.rekomendasi), 34, 100),
    tindakLanjut: columnWidth(
      "Tindak Lanjut atas Rekomendasi",
      localItems.map((item) => item.tindak_lanjut_rekomendasi),
      34,
      100
    ),
    pic: columnWidth("Penanggung Jawab", localItems.map((item) => item.pic), 20, 44),
    status: columnWidth("Progress Tindak Lanjut", localItems.map((item) => item.status_rekomendasi), 28, 44),
    eviden: columnWidth("Eviden", localItems.map((item) => item.eviden), 28, 60),
  }));
</script>

<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
  <div class="flex items-center gap-2">
    <div class="mr-2 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-medium">
      {#if globalSyncStatus === "saved"}
        <Cloud size={14} class="text-emerald-500" />
        <span class="text-slate-600">Tersimpan</span>
      {:else if globalSyncStatus === "saving"}
        <LoaderCircle size={14} class="animate-spin text-primary" />
        <span class="text-primary">Menyimpan...</span>
      {:else}
        <CircleAlert size={14} class="text-red-500" />
        <span class="text-red-500">Gagal Sinkron</span>
      {/if}
    </div>
  </div>

  <div class="flex items-center gap-2">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-primary/20 bg-white px-3 text-sm font-medium text-foreground ring-offset-background transition-all hover:border-primary/40 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <Calendar size={16} class="text-primary" />
        Tahun: <span class="font-bold text-primary">{selectedYear}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-48 p-0" align="end">
        <div class="border-b p-2">
          <input
            type="text"
            placeholder="Cari tahun..."
            class="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
            bind:value={yearQuery}
          />
        </div>
        <div class="max-h-50 overflow-y-auto p-1">
          {#each years as y}
            <DropdownMenu.Item
              class="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs {selectedYear === y ? 'bg-primary/5 font-bold text-primary' : ''}"
              onSelect={() => { selectedYear = y; }}
            >
              <span>{y}</span>
              {#if selectedYear === y}<Check size={14} class="text-primary" />{/if}
            </DropdownMenu.Item>
          {/each}
          {#if years.length === 0}
            <div class="px-2 py-4 text-center text-[10px] italic text-muted-foreground">
              Tahun tidak valid
            </div>
          {/if}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
</div>

<div class="w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
  <div class="w-full overflow-x-auto">
    <table class="table-fixed border-collapse text-xs">
      <colgroup>
        <col style:width={columnWidths.no} />
        <col style:width={columnWidths.aoiCode} />
        <col style:width={columnWidths.areaOfImprovement} />
        <col style:width={columnWidths.faktaTemuan} />
        <col style:width={columnWidths.rekomendasi} />
        <col style:width={columnWidths.tindakLanjut} />
        <col style:width={columnWidths.pic} />
        <col style:width={columnWidths.status} />
        <col style:width={columnWidths.eviden} />
      </colgroup>
      <thead class="sticky top-0 z-20 bg-primary text-center font-bold text-white">
        <tr>
          <th class="border border-border p-3 align-middle uppercase">No</th>
          <th class="border border-border p-3 align-middle uppercase">No AOI</th>
          <th class="border border-border p-3 align-middle uppercase leading-tight">Area of Improvement</th>
          <th class="border border-border p-3 align-middle uppercase">Fakta Temuan</th>
          <th class="border border-border p-3 align-middle uppercase">Rekomendasi</th>
          <th class="border border-border p-3 align-middle uppercase leading-tight">Tindak Lanjut atas Rekomendasi</th>
          <th class="border border-border p-3 align-middle uppercase">Penanggung Jawab</th>
          <th class="border border-border p-3 align-middle uppercase leading-tight">Progress Tindak Lanjut</th>
          <th class="border border-border p-3 align-middle uppercase">Eviden</th>
        </tr>
      </thead>
      <tbody class="align-top">
        {#each localItems as item, idx (item.uid)}
          <tr class="transition-colors hover:bg-slate-50">
            <td class="border border-border p-2 text-center align-middle text-muted-foreground">{idx + 1}</td>

            <td class="border border-border px-2 py-1 align-middle">
              <button
                type="button"
                class="flex w-full items-center justify-center gap-1 rounded px-2 py-2 text-center font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >
                {item.aoi_code}
              </button>
            </td>

            <td class="h-1 border border-border p-0 align-top">
              <button
                type="button"
                class="block min-h-24 w-full whitespace-pre-wrap break-words p-3 text-left text-xs leading-relaxed text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >{item.area_of_improvement}</button>
            </td>

            <td class="h-1 border border-border p-0 align-top">
              <button
                type="button"
                class="block min-h-24 w-full whitespace-pre-wrap break-words p-3 text-left text-xs leading-relaxed text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >
                {#if item.fakta_temuan.trim()}
                  {item.fakta_temuan}
                {:else}
                  <span class="italic text-slate-400">Belum ada fakta temuan</span>
                {/if}
              </button>
            </td>

            <td class="h-1 border border-border p-0 align-top">
              <button
                type="button"
                class="block min-h-24 w-full whitespace-pre-wrap break-words p-3 text-left text-xs leading-relaxed text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >
                {#if item.rekomendasi.trim()}
                  {item.rekomendasi}
                {:else}
                  <span class="italic text-slate-400">Belum ada rekomendasi</span>
                {/if}
              </button>
            </td>

            <td class="h-1 border border-border p-0 align-top">
              <button
                type="button"
                class="block min-h-24 w-full whitespace-pre-wrap break-words p-3 text-left text-xs leading-relaxed text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >
                {#if item.tindak_lanjut_rekomendasi.trim()}
                  {item.tindak_lanjut_rekomendasi}
                {:else}
                  <span class="italic text-slate-400">Belum ada tindak lanjut</span>
                {/if}
              </button>
            </td>

            <td class="h-1 border border-border p-0 align-top">
              <button
                type="button"
                class="block min-h-24 w-full whitespace-pre-wrap break-words p-3 text-left text-xs leading-relaxed text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >
                {#if item.pic.trim()}
                  {item.pic}
                {:else}
                  <span class="italic text-slate-400">Belum ada PIC</span>
                {/if}
              </button>
            </td>

            <td class="h-1 border border-border p-0 align-top">
              <button
                type="button"
                class="block min-h-24 w-full p-3 text-left text-xs transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >
                <span class="block w-full border px-2 py-2 font-semibold leading-tight {statusPreviewClass(item.status_rekomendasi)}">
                  {item.status_rekomendasi}
                </span>
              </button>
            </td>

            <td class="h-1 border border-border p-0 align-top">
              <button
                type="button"
                class="block min-h-24 w-full whitespace-pre-wrap break-words p-3 text-left text-xs leading-relaxed text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onclick={() => openItemDialog(item)}
              >
                {previewText(extractEvidenceText(item.eviden), "Belum ada eviden")}
              </button>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="9" class="border border-border py-12 text-center text-sm italic text-muted-foreground">
              Belum ada data rekomendasi Assessment ACGS untuk tahun {currentYear}.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Dialog.Root bind:open={editDialogOpen}>
  <Dialog.Content class="max-h-screen overflow-y-auto sm:max-w-3xl">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-base font-bold text-slate-900">
        <Pencil size={18} class="text-primary" />
        Detail Area of Improvement
      </Dialog.Title>
      <Dialog.Description>
        {#if editingItem}
          {editingItem.aoi_code} - {editingItem.area_of_improvement}
        {:else}
          Pilih item AOI untuk melihat detail.
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if editingItem}
      <div class="grid gap-4">
        <div class="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <div class="text-xs font-semibold uppercase text-slate-500">Rekomendasi</div>
            <p class="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {previewText(editingItem.rekomendasi, "Belum ada rekomendasi")}
            </p>
          </div>
        </div>

        <div class="grid gap-2">
          <label for="aoi-fakta-temuan" class="text-xs font-semibold uppercase text-slate-600">Fakta Temuan</label>
          <textarea
            id="aoi-fakta-temuan"
            class="min-h-28 resize-y rounded-md border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
            bind:value={editFaktaTemuan}
            disabled={!canWrite}
          ></textarea>
        </div>

        <div class="grid gap-2">
          <label for="aoi-tindak-lanjut" class="text-xs font-semibold uppercase text-slate-600">
            Tindak Lanjut atas Rekomendasi
          </label>
          <textarea
            id="aoi-tindak-lanjut"
            class="min-h-28 resize-y rounded-md border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
            bind:value={editTindakLanjut}
            disabled={!canWrite}
          ></textarea>
        </div>

        <div class="grid gap-2">
          <label for="aoi-pic" class="text-xs font-semibold uppercase text-slate-600">Penanggung Jawab</label>
          <input
            id="aoi-pic"
            class="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-500"
            bind:value={editPic}
            disabled={!canWrite}
          />
        </div>

        <div class="grid gap-2">
          <div class="text-xs font-semibold uppercase text-slate-600">Progress Tindak Lanjut</div>
          <div class="rounded-md border border-slate-200 bg-white">
            <AoiStatusButtons
              status={editingItem.status_rekomendasi}
              disabled={!canWrite}
              onSave={(val) => handleSaveStatus(editingItem.uid, val)}
            />
          </div>
        </div>

        <div class="grid gap-2">
          <div class="text-xs font-semibold uppercase text-slate-600">Eviden</div>
          <div class="min-h-32 rounded-md border border-slate-200 bg-white">
            <AoiEvidenceCell
              item={editingItem}
              disabled={!canWrite}
              onSave={async (field, val) => {
                await handleSaveField(editingItem.uid, field, val);
              }}
              onUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
              onFileSelected={(it, file) => { stagedFiles = { ...stagedFiles, [it.uid]: file }; }}
              stagedFile={stagedFiles[editingItem.uid] ?? null}
              onUnstageFile={(it) => {
                const { [it.uid]: _, ...rest } = stagedFiles;
                stagedFiles = rest;
              }}
            />
          </div>
        </div>
      </div>

      <Dialog.Footer>
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onclick={() => { editDialogOpen = false; }}
        >
          Tutup
        </button>
        {#if canWrite}
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onclick={handleSaveDialog}
          >
            Simpan Perubahan
          </button>
        {/if}
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>
