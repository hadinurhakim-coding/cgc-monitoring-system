<script lang="ts">
  import type { AssessmentItem } from "../_lib/types.js";
  import { autoResize } from "../_lib/actions.js";
  import { untrack } from "svelte";

  let { 
    value = "", 
    q, 
    field, 
    placeholder = "", 
    disabled = false,
    onSave 
  }: { 
    value?: string | null | undefined; 
    q: AssessmentItem; 
    field: string; 
    placeholder?: string;
    disabled?: boolean;
    onSave: (q: AssessmentItem, field: string, val: string) => Promise<void>;
  } = $props();

  const AUTOSAVE_DEBOUNCE_MS = 900;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let isSaving = $state(false);

  async function commit(nextValue: string): Promise<void> {
    if (disabled || nextValue === (value ?? "")) return;
    isSaving = true;
    try {
      await onSave(q, field, nextValue);
    } finally {
      isSaving = false;
    }
  }

  function queueAutosave(): void {
    if (disabled) return;
    if (saveTimer !== undefined) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      commit(localValue).catch(() => {});
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (saveTimer !== undefined) clearTimeout(saveTimer);
      const val = (e.currentTarget as HTMLTextAreaElement).value;
      await commit(val);
    }
  }

  let localValue = $state("");
  
  $effect(() => {
    const parentVal = value ?? "";
    if (untrack(() => localValue) !== parentVal) {
      localValue = parentVal;
    }
  });

  $effect(() => {
    return () => {
      if (saveTimer !== undefined) clearTimeout(saveTimer);
    };
  });
</script>

<textarea
  use:autoResize
  spellcheck="false"
  class="w-full h-full min-h-full border-0 p-3 text-[10px] focus:ring-0 focus:outline-none transition-all resize-none overflow-hidden block {disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-transparent'} {isSaving ? 'opacity-80' : ''}"
  {placeholder}
  {disabled}
  bind:value={localValue}
  oninput={queueAutosave}
  onkeydown={handleKeyDown}
  onblur={() => {
    if (saveTimer !== undefined) clearTimeout(saveTimer);
    commit(localValue).catch(() => {});
  }}
></textarea>
