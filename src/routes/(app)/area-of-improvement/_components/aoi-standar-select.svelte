<script lang="ts">
  import { buildStandarOptions, type StandarOption } from "../_lib/aoi-standar-options.js";

  let {
    sectionId,
    onSelect,
    disabled = false,
  }: {
    sectionId: string;
    onSelect: (opt: StandarOption) => Promise<void>;
    disabled?: boolean;
  } = $props();

  const options = buildStandarOptions();

  async function handleChange(e: Event) {
    const val = (e.currentTarget as HTMLSelectElement).value;
    const opt = options.find((o) => o.value === val);
    if (opt) await onSelect(opt);
  }
</script>

<select
  class="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
  value={sectionId}
  {disabled}
  onchange={handleChange}
>
  <option value="" disabled>— Pilih Standar —</option>
  {#each options as opt}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>
