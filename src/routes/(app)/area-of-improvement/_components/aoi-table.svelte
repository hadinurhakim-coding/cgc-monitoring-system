<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { toast } from "svelte-sonner";
  import { Trash2, Calendar, Check, Cloud, LoaderCircle, CircleAlert } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { AoiItem, StatusRekomendasi } from "../_lib/types.js";
  import { saveAoiField, addAoiItem, deleteAoiItem } from "../_lib/aoi-api-client.js";
  import { buildStandarOptions, type StandarOption } from "../_lib/aoi-standar-options.js";
  import AoiStatusButtons from "./aoi-status-buttons.svelte";
  import AoiStandarSelect from "./aoi-standar-select.svelte";
  import AoiEvidenceCell from "./aoi-evidence-cell.svelte";

  interface Props {
    items: AoiItem[];
    currentYear: number;
    availableYears: number[];
    canWrite: boolean;
  }

  let { items, currentYear, availableYears, canWrite }: Props = $props();

  let localItems = $state<AoiItem[]>([]);
  let globalSyncStatus = $state<"saved" | "saving" | "error">("saved");
  let isAdding = $state(false);

  $effect(() => {
    localItems = [...items];
  });

  function setSync(status: "saved" | "saving" | "error") {
    globalSyncStatus = status;
    if (status === "saved") {
      setTimeout(() => { globalSyncStatus = "saved"; }, 1500);
    }
  }

  async function handleSaveField(uid: string, field: string, value: string) {
    setSync("saving");
    try {
      await saveAoiField(uid, field, value);
      localItems = localItems.map((item) =>
        item.uid === uid ? { ...item, [field]: value } : item
      );
      setSync("saved");
    } catch (err) {
      setSync("error");
      toast.error("Gagal menyimpan: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleSaveStatus(uid: string, val: StatusRekomendasi) {
    await handleSaveField(uid, "status_rekomendasi", val);
  }

  async function handleSelectStandar(uid: string, opt: StandarOption) {
    setSync("saving");
    try {
      await saveAoiField(uid, "section_id", opt.value);
      await saveAoiField(uid, "standar_label", opt.standarLabel);
      await saveAoiField(uid, "part_id", opt.part);
      await saveAoiField(uid, "level_label", opt.level);
      localItems = localItems.map((item) =>
        item.uid === uid
          ? { ...item, section_id: opt.value, standar_label: opt.standarLabel, part_id: opt.part, level_label: opt.level }
          : item
      );
      setSync("saved");
    } catch (err) {
      setSync("error");
      toast.error("Gagal menyimpan standar: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleAdd() {
    const standarOptions = buildStandarOptions();
    const first = standarOptions[0];
    if (!first) return;
    isAdding = true;
    try {
      const newItem = await addAoiItem(currentYear, first);
      localItems = [...localItems, newItem];
      toast.success("AOI baru ditambahkan");
    } catch (err) {
      toast.error("Gagal menambah AOI: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      isAdding = false;
    }
  }

  async function handleDelete(uid: string) {
    if (!confirm("Yakin ingin menghapus AOI ini?")) return;
    try {
      await deleteAoiItem(uid);
      localItems = localItems.filter((item) => item.uid !== uid);
      toast.success("AOI berhasil dihapus");
    } catch (err) {
      toast.error("Gagal menghapus: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  // Year selector state
  let selectedYear = $state("");
  let yearQuery = $state("");

  $effect(() => {
    selectedYear = String(currentYear);
  });

  $effect(() => {
    if (selectedYear && selectedYear !== String(currentYear)) {
      goto(resolve(`/area-of-improvement`) + `?year=${selectedYear}`, { keepFocus: true, noScroll: true });
    }
  });

  const years = $derived.by(() => {
    const nowYear = new Date().getFullYear();
    const fromDb = [...availableYears].sort((a, b) => b - a).map(String);
    const sliding = Array.from({ length: 10 }, (_, i) => String(nowYear + 1 - i));
    const merged = [...new Set([...fromDb, ...sliding])].sort((a, b) => parseInt(b) - parseInt(a));
    if (yearQuery && !merged.includes(yearQuery) && /^\d{4}$/.test(yearQuery)) merged.unshift(yearQuery);
    return merged.filter((y) => y.includes(yearQuery));
  });
</script>

<!-- Toolbar -->
<div class="flex flex-col md:flex-row items-center justify-between gap-4">
  <div class="flex items-center gap-2">
    <!-- Sync status -->
    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-medium">
      {#if globalSyncStatus === "saved"}
        <Cloud size={14} class="text-emerald-500" />
        <span class="text-slate-600">Tersimpan</span>
      {:else if globalSyncStatus === "saving"}
        <LoaderCircle size={14} class="text-primary animate-spin" />
        <span class="text-primary">Menyimpan...</span>
      {:else}
        <CircleAlert size={14} class="text-red-500" />
        <span class="text-red-500">Gagal Sinkron</span>
      {/if}
    </div>
  </div>

  <div class="flex items-center gap-2">
    <!-- Year dropdown -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md bg-white border border-primary/20 hover:border-primary/40 hover:bg-slate-50 transition-all font-medium text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Calendar size={16} class="text-primary" />
        Tahun: <span class="text-primary font-bold">{selectedYear}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="w-48 p-0" align="end">
        <div class="p-2 border-b">
          <input
            type="text"
            placeholder="Cari tahun..."
            class="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-primary outline-none"
            bind:value={yearQuery}
          />
        </div>
        <div class="max-h-48 overflow-y-auto p-1">
          {#each years as y}
            <DropdownMenu.Item
              class="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer rounded-md text-xs {selectedYear === y ? 'bg-primary/5 text-primary font-bold' : ''}"
              onSelect={() => { selectedYear = y; }}
            >
              <span>{y}</span>
              {#if selectedYear === y}<Check size={14} class="text-primary" />{/if}
            </DropdownMenu.Item>
          {/each}
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

    {#if canWrite}
      <Button
        size="sm"
        class="gap-2"
        disabled={isAdding}
        onclick={handleAdd}
      >
        {isAdding ? "Menambah..." : "+ Tambah AOI"}
      </Button>
    {/if}
  </div>
</div>

<!-- Table -->
<div class="overflow-x-auto w-full border border-border rounded-lg bg-white shadow-sm overflow-hidden">
  <table class="w-full border-collapse text-xs">
    <thead class="bg-primary text-white text-center font-bold sticky top-0 z-20">
      <tr>
        <th class="border border-border w-10 p-3 align-middle uppercase">No</th>
        <th class="border border-border w-56 p-3 align-middle uppercase leading-tight">Standar Tata Kelola<br/>Perusahaan</th>
        <th class="border border-border p-3 align-middle uppercase">Fakta Temuan</th>
        <th class="border border-border p-3 align-middle uppercase">Rekomendasi</th>
        <th class="border border-border w-28 p-3 align-middle uppercase">PIC</th>
        <th class="border border-border w-44 p-3 align-middle uppercase leading-tight">Status<br/>Rekomendasi</th>
        <th class="border border-border w-48 p-3 align-middle uppercase">Eviden</th>
        {#if canWrite}
          <th class="border border-border w-10 p-3 align-middle"></th>
        {/if}
      </tr>
    </thead>
    <tbody class="align-top">
      {#each localItems as item, idx (item.uid)}
        <tr class="hover:bg-slate-50 transition-colors">
          <!-- No -->
          <td class="border border-border p-2 text-center text-muted-foreground">{idx + 1}</td>

          <!-- Standar -->
          <td class="border border-border px-2 py-1">
            <AoiStandarSelect
              sectionId={item.section_id}
              disabled={!canWrite}
              onSelect={(opt) => handleSelectStandar(item.uid, opt)}
            />
          </td>

          <!-- Fakta Temuan -->
          <td class="border border-border p-0 align-top h-1">
            <textarea
              class="w-full h-full min-h-20 p-3 text-xs bg-transparent border-0 focus:ring-0 focus:outline-none resize-none"
              placeholder="Fakta temuan..."
              value={item.fakta_temuan}
              disabled={!canWrite}
              onblur={(e) => {
                const val = (e.currentTarget as HTMLTextAreaElement).value;
                if (val !== item.fakta_temuan) handleSaveField(item.uid, "fakta_temuan", val);
              }}
            ></textarea>
          </td>

          <!-- Rekomendasi -->
          <td class="border border-border p-0 align-top h-1">
            <textarea
              class="w-full h-full min-h-20 p-3 text-xs bg-transparent border-0 focus:ring-0 focus:outline-none resize-none"
              placeholder="Rekomendasi..."
              value={item.rekomendasi}
              disabled={!canWrite}
              onblur={(e) => {
                const val = (e.currentTarget as HTMLTextAreaElement).value;
                if (val !== item.rekomendasi) handleSaveField(item.uid, "rekomendasi", val);
              }}
            ></textarea>
          </td>

          <!-- PIC -->
          <td class="border border-border p-0 align-top h-1">
            <textarea
              class="w-full h-full min-h-20 p-3 text-xs bg-transparent border-0 focus:ring-0 focus:outline-none resize-none"
              placeholder="PIC..."
              value={item.pic}
              disabled={!canWrite}
              onblur={(e) => {
                const val = (e.currentTarget as HTMLTextAreaElement).value;
                if (val !== item.pic) handleSaveField(item.uid, "pic", val);
              }}
            ></textarea>
          </td>

          <!-- Status -->
          <td class="border border-border p-0 align-middle h-1">
            <AoiStatusButtons
              status={item.status_rekomendasi}
              disabled={!canWrite}
              onSave={(val) => handleSaveStatus(item.uid, val)}
            />
          </td>

          <!-- Eviden -->
          <td class="border border-border p-0 align-top h-1">
            <AoiEvidenceCell
              {item}
              disabled={!canWrite}
              onSave={(field, val) => handleSaveField(item.uid, field, val)}
            />
          </td>

          <!-- Hapus -->
          {#if canWrite}
            <td class="border border-border p-2 text-center align-middle">
              <button
                type="button"
                class="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Hapus AOI"
                onclick={() => handleDelete(item.uid)}
              >
                <Trash2 size={14} />
              </button>
            </td>
          {/if}
        </tr>
      {:else}
        <tr>
          <td colspan={canWrite ? 8 : 7} class="border border-border py-12 text-center text-muted-foreground text-sm">
            Belum ada data AOI untuk tahun {currentYear}.
            {#if canWrite}
              Klik "+ Tambah AOI" untuk mulai.
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
