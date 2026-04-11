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
    onclick={() => onSave(q, "status", "YES")}
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
    onclick={() => onSave(q, "status", "NO")}
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
    onclick={() => onSave(q, "status", "NA")}
  >
    NA
  </button>
</div>
