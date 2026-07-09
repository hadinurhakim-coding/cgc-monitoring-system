<script lang="ts">
  import FileText from "@lucide/svelte/icons/file-text";

  interface Props {
    itemCode: string;
    standardEn: string;
    standardId: string;
  }

  let { itemCode, standardEn, standardId }: Props = $props();

  const previewTitle = $derived(itemCode.trim() || "No Item");
  const englishText = $derived(standardEn.trim());
  const indonesianText = $derived(standardId.trim());
</script>

<div class="group relative inline-flex justify-center">
  <button
    type="button"
    class="rounded-md px-2 py-1 text-[10px] font-bold leading-snug text-blue-700 underline-offset-4 transition hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:text-[11px]"
    aria-label="Lihat preview item {previewTitle}"
  >
    {previewTitle}
  </button>

  <div
    class="pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden w-80 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950/95 p-3 text-left text-white shadow-2xl shadow-slate-950/30 backdrop-blur group-focus-within:block group-hover:block md:w-96"
  >
    <div class="text-sm font-semibold leading-snug text-white">No Item {previewTitle}</div>
    <div class="mt-2 space-y-1.5">
      {#if englishText}
        <p class="line-clamp-3 text-xs leading-relaxed text-slate-200">{englishText}</p>
      {/if}
      {#if indonesianText}
        <p class="line-clamp-3 text-xs leading-relaxed text-slate-400">{indonesianText}</p>
      {/if}
    </div>
    <div class="mt-3 flex items-center gap-2 border-t border-white/10 pt-2 text-xs text-slate-400">
      <FileText size={15} />
      <span>STANDAR TATA KELOLA PERUSAHAAN</span>
    </div>
  </div>
</div>
