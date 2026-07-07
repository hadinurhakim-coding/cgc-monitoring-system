<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { toast } from "svelte-sonner";
  import { Calendar, Check } from "@lucide/svelte";
  import {
    deleteEncryptedPageCache,
    deleteEncryptedPageCacheByRoute,
    type PageCacheScope
  } from "$lib/client/encrypted-page-cache.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { AoiLevelGroup, MonitoringGrandTotal } from "../_lib/types.js";

  interface Props {
    levels: AoiLevelGroup[];
    grandTotal: MonitoringGrandTotal;
    currentYear: number;
    availableYears: number[];
    canWrite: boolean;
    cacheKey?: string;
    cacheScope?: PageCacheScope;
  }

  let { levels, grandTotal, currentYear, availableYears, canWrite, cacheKey, cacheScope }: Props = $props();

  // Keterangan lokal — keyed by partId
  let keteranganLocal = $state<Record<string, string>>({});

  $effect(() => {
    const init: Record<string, string> = {};
    for (const lv of levels) {
      for (const pt of lv.parts) {
        init[pt.partId] = pt.keterangan;
      }
    }
    keteranganLocal = init;
  });

  async function saveKeterangan(partId: string) {
    try {
      const res = await fetch("/monitoring-aoi/api/save-keterangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: currentYear, partId, keterangan: keteranganLocal[partId] ?? "" }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `HTTP ${res.status}`);
      }
      if (cacheKey) await deleteEncryptedPageCache(cacheKey);
      if (cacheScope) await deleteEncryptedPageCacheByRoute(cacheScope, "/monitoring-aoi");
    } catch (err) {
      toast.error("Gagal menyimpan keterangan: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  function levelDisplayName(label: string): string {
    const t = label.trim().toUpperCase();
    if (t.includes("BONUS")) return "LEVEL 2 — BONUS";
    if (t.includes("PENALTY") || t.includes("PENALTI")) return "LEVEL 2 — PENALTI";
    if (t.includes("LEVEL 1")) return "LEVEL 1";
    return label.trim();
  }

  // Year selector
  let selectedYear = $state("");
  let yearQuery = $state("");

  $effect(() => {
    selectedYear = String(currentYear);
  });

  $effect(() => {
    if (selectedYear && selectedYear !== String(currentYear)) {
      goto(resolve(`/monitoring-aoi`) + `?year=${selectedYear}`, { keepFocus: true, noScroll: true });
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
<div class="flex items-center justify-end gap-4 mb-4">
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
</div>

<!-- Table -->
<div class="overflow-x-auto w-full border border-border rounded-lg bg-white shadow-sm overflow-hidden">
  <table class="w-full min-w-175 border-collapse text-xs">
    <thead class="bg-primary text-white text-center font-bold sticky top-0 z-20">
      <tr>
        <th colspan="2" rowspan="2" class="border border-border px-3 py-2 align-middle uppercase w-64">
          Standar Tata Kelola Perusahaan
        </th>
        <th rowspan="2" class="border border-border px-2 py-2 align-middle uppercase leading-snug w-20">
          Jumlah<br/>AOI
        </th>
        <th colspan="4" class="border border-border px-2 py-1 uppercase">
          Tindak Lanjut <em class="normal-case">Area of Improvement</em> (AoI)
        </th>
        <th rowspan="2" class="border border-border px-3 py-2 align-middle uppercase w-36">
          Keterangan
        </th>
      </tr>
      <tr class="bg-primary text-white text-center">
        <th class="border border-border px-2 py-1 leading-snug font-semibold">Telah<br/>ditindaklanjuti<br/>100%</th>
        <th class="border border-border px-2 py-1 leading-snug font-semibold">On<br/>Progress</th>
        <th class="border border-border px-2 py-1 leading-snug font-semibold">Tidak dapat<br/>ditindaklanjuti<br/>100%</th>
        <th class="border border-border px-2 py-1 leading-snug font-semibold">Belum<br/>ditindaklanjuti</th>
      </tr>
    </thead>
    <tbody class="align-top">
      {#each levels as lv}
        <!-- Level header row -->
        <tr class="bg-[#e2e8f0]">
          <td colspan="8" class="border border-border p-2 font-bold text-slate-900 uppercase align-middle text-center">
            {levelDisplayName(lv.levelLabel)}
          </td>
        </tr>

        {#each lv.parts as pt}
          {#each pt.sections as sec, si}
            <tr class="hover:bg-slate-50 transition-colors">
              {#if si === 0}
                <!-- Part label — rowspan seluruh sections dalam part ini -->
                <td
                  rowspan={pt.sections.length}
                  class="border border-border p-2 font-bold text-center align-middle bg-white text-slate-900 uppercase w-16"
                >
                  {pt.partLabel}
                </td>
              {/if}

              <!-- Section label -->
              <td class="border border-border px-3 py-2 align-middle">
                <div class="font-bold text-slate-900">{sec.sectionId}</div>
                {#if sec.sectionLabel}
                  <div class="text-blue-700 text-[10px] mt-0.5 leading-snug">{sec.sectionLabel}</div>
                {/if}
              </td>

              <!-- Jumlah AOI -->
              <td class="border border-border px-2 py-2 text-center font-medium">
                {sec.jumlahAoi || ""}
              </td>

              <!-- 4 status counts -->
              <td class="border border-border px-2 py-2 text-center text-emerald-700 font-medium">
                {sec.statusCounts.selesai || ""}
              </td>
              <td class="border border-border px-2 py-2 text-center text-blue-700 font-medium">
                {sec.statusCounts.onProgress || ""}
              </td>
              <td class="border border-border px-2 py-2 text-center text-amber-700 font-medium">
                {sec.statusCounts.tidakDapat || ""}
              </td>
              <td class="border border-border px-2 py-2 text-center text-muted-foreground font-medium">
                {sec.statusCounts.belum || ""}
              </td>

              {#if si === 0}
                <!-- Keterangan — rowspan seluruh sections dalam part ini -->
                <td
                  rowspan={pt.sections.length}
                  class="border border-border p-1 align-top"
                >
                  {#if canWrite}
                    <textarea
                      class="w-full min-h-16 p-2 text-xs bg-transparent border border-border rounded focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                      placeholder="Keterangan..."
                      value={keteranganLocal[pt.partId] ?? ""}
                      oninput={(e) => {
                        keteranganLocal = { ...keteranganLocal, [pt.partId]: (e.currentTarget as HTMLTextAreaElement).value };
                      }}
                      onblur={() => saveKeterangan(pt.partId)}
                    ></textarea>
                  {:else}
                    <p class="p-2 text-xs text-slate-600 whitespace-pre-wrap">{keteranganLocal[pt.partId] || ""}</p>
                  {/if}
                </td>
              {/if}
            </tr>
          {/each}
        {/each}

        <!-- Level subtotal -->
        <tr class="bg-slate-50/50">
          <td colspan="2" class="border border-border px-3 py-1.5 font-bold text-right text-slate-900 uppercase">
            Total {levelDisplayName(lv.levelLabel)}
          </td>
          <td class="border border-border px-2 py-1.5 text-center font-bold">{lv.totalAoi || ""}</td>
          <td class="border border-border px-2 py-1.5 text-center font-bold text-emerald-700">{lv.statusCounts.selesai || ""}</td>
          <td class="border border-border px-2 py-1.5 text-center font-bold text-blue-700">{lv.statusCounts.onProgress || ""}</td>
          <td class="border border-border px-2 py-1.5 text-center font-bold text-amber-700">{lv.statusCounts.tidakDapat || ""}</td>
          <td class="border border-border px-2 py-1.5 text-center font-bold text-muted-foreground">{lv.statusCounts.belum || ""}</td>
          <td class="border border-border"></td>
        </tr>
      {/each}

      <!-- Grand Total -->
      <tr class="bg-primary text-white font-bold">
        <td colspan="2" class="border border-border px-3 py-2 text-right uppercase">Total</td>
        <td class="border border-border px-2 py-2 text-center">{grandTotal.jumlahAoi || ""}</td>
        <td class="border border-border px-2 py-2 text-center">{grandTotal.statusCounts.selesai || ""}</td>
        <td class="border border-border px-2 py-2 text-center">{grandTotal.statusCounts.onProgress || ""}</td>
        <td class="border border-border px-2 py-2 text-center">{grandTotal.statusCounts.tidakDapat || ""}</td>
        <td class="border border-border px-2 py-2 text-center">{grandTotal.statusCounts.belum || ""}</td>
        <td class="border border-border"></td>
      </tr>
    </tbody>
  </table>
</div>
