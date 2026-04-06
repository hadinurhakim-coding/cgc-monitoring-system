<script lang="ts">
  import type { AssessmentItem } from "../_lib/types.js";
  import { autoResize } from "../_lib/actions.js";
  import { untrack } from "svelte";

  let { 
    value = "", 
    q, 
    field, 
    placeholder = "", 
    onSave 
  }: { 
    value?: string | null | undefined; 
    q: AssessmentItem; 
    field: string; 
    placeholder?: string;
    onSave: (q: AssessmentItem, field: string, val: string) => Promise<void>;
  } = $props();

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const val = (e.currentTarget as HTMLTextAreaElement).value;
      await onSave(q, field, val);
    }
  }

  let localValue = $state("");
  
  $effect(() => {
    const parentVal = value ?? "";
    if (untrack(() => localValue) !== parentVal) {
      localValue = parentVal;
    }
  });
</script>

<textarea
  use:autoResize
  class="w-full h-full min-h-full bg-transparent border-0 p-3 text-[10px] focus:ring-0 focus:outline-none transition-all resize-none overflow-hidden block"
  {placeholder}
  bind:value={localValue}
  onkeydown={handleKeyDown}
  onblur={() => {
    if (localValue !== value) {
        onSave(q, field, localValue);
    }
  }}
></textarea>
