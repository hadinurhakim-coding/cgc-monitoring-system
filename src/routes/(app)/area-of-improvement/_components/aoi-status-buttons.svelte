<script lang="ts">
  import { STATUS_REKOMENDASI_OPTIONS, type StatusRekomendasi } from "../_lib/types.js";

  let {
    status,
    onSave,
    disabled = false,
  }: {
    status: StatusRekomendasi;
    onSave: (val: StatusRekomendasi) => Promise<void>;
    disabled?: boolean;
  } = $props();

  const colorMap: Record<StatusRekomendasi, string> = {
    "Telah ditindaklanjuti 100%":        "bg-emerald-500 text-white",
    "On Progress":                         "bg-blue-500 text-white",
    "Tidak dapat ditindaklanjuti 100%":   "bg-amber-500 text-white",
    "Belum ditindaklanjuti":              "bg-slate-300 text-slate-700",
  };

  const inactiveMap: Record<StatusRekomendasi, string> = {
    "Telah ditindaklanjuti 100%":        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    "On Progress":                         "bg-blue-50 text-blue-700 hover:bg-blue-100",
    "Tidak dapat ditindaklanjuti 100%":   "bg-amber-50 text-amber-700 hover:bg-amber-100",
    "Belum ditindaklanjuti":              "bg-slate-50 text-slate-500 hover:bg-slate-100",
  };

  async function select(val: StatusRekomendasi) {
    if (disabled || val === status) return;
    await onSave(val);
  }
</script>

<div class="flex flex-col gap-1 p-1">
  {#each STATUS_REKOMENDASI_OPTIONS as opt}
    <button
      type="button"
      class="text-left text-xs px-2 py-1 rounded transition-colors cursor-pointer {status === opt ? colorMap[opt] + ' font-semibold ring-1 ring-inset ring-black/10' : inactiveMap[opt]}"
      {disabled}
      onclick={() => select(opt)}
    >
      {opt}
    </button>
  {/each}
</div>
