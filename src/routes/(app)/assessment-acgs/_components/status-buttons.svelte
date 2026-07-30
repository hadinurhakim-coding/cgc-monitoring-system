<script lang="ts">
  import type { AssessmentItem } from "../_lib/types.js";
  import { norm } from "../_lib/acgs-question-utils.js";

  let { 
    q, 
    onSave 
  }: { 
    q: AssessmentItem; 
    onSave: (q: AssessmentItem, field: string, val: string) => Promise<void>;
  } = $props();

  function statusMatches(
    q: AssessmentItem,
    expected: "YES" | "NO" | "NA",
  ): boolean {
    const st = String(q.status ?? "")
      .trim()
      .toUpperCase();
    if (expected === "YES") return st === "YES" || st === "Y";
    if (expected === "NO") return st === "NO" || st === "N";
    return st === "NA";
  }

  async function toggleStatus(status: "YES" | "NO" | "NA"): Promise<void> {
    await onSave(q, "status", statusMatches(q, status) ? "" : status);
  }
</script>

<div class="flex flex-col h-full items-stretch divide-y divide-border">
  <button
    type="button"
    class="flex-1 min-h-8 w-full rounded-none text-[9px] font-bold transition-colors duration-75 active:scale-[0.98] {statusMatches(
      q,
      'YES',
    )
      ? 'bg-emerald-500 text-white shadow-sm'
      : 'bg-transparent text-slate-400 hover:bg-slate-100'}"
    aria-pressed={statusMatches(q, "YES")}
    title={statusMatches(q, "YES") ? "Klik lagi untuk menghapus pilihan YES" : "Pilih YES"}
    onclick={() => toggleStatus("YES")}
  >
    YES
  </button>
  <button
    type="button"
    class="flex-1 min-h-8 w-full rounded-none text-[9px] font-bold transition-colors duration-75 active:scale-[0.98] {statusMatches(
      q,
      'NO',
    )
      ? 'bg-rose-500 text-white shadow-sm'
      : 'bg-transparent text-slate-400 hover:bg-slate-100'}"
    aria-pressed={statusMatches(q, "NO")}
    title={statusMatches(q, "NO") ? "Klik lagi untuk menghapus pilihan NO" : "Pilih NO"}
    onclick={() => toggleStatus("NO")}
  >
    NO
  </button>
  <button
    type="button"
    class="flex-1 min-h-8 w-full rounded-none text-[9px] font-bold transition-colors duration-75 active:scale-[0.98] {statusMatches(
      q,
      'NA',
    )
      ? 'bg-slate-400 text-white shadow-sm'
      : 'bg-transparent text-slate-400 hover:bg-slate-100'}"
    aria-pressed={statusMatches(q, "NA")}
    title={statusMatches(q, "NA") ? "Klik lagi untuk menghapus pilihan NA" : "Pilih NA"}
    onclick={() => toggleStatus("NA")}
  >
    NA
  </button>
</div>
