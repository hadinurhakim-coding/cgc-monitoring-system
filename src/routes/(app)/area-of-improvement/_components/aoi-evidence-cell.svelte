<script lang="ts">
  import { Plus, X } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { extractEvidenceText, extractEvidenceFiles, reconstructEvidence, parseEvidenceTextSegments } from "$lib/evidence-utils.js";
  import type { AoiItem } from "../_lib/types.js";

  let {
    item,
    onSave,
    onUpload,
    onRemoveFile,
    onFileSelected,
    stagedFile = null as File | null,
    onUnstageFile,
    disabled = false,
  }: {
    item: AoiItem;
    onSave: (field: string, val: string) => Promise<void>;
    onUpload: (item: AoiItem, file: File) => Promise<void>;
    onRemoveFile: (item: AoiItem, fileIndex: number) => Promise<void>;
    onFileSelected: (item: AoiItem, file: File) => void;
    stagedFile?: File | null;
    onUnstageFile: (item: AoiItem) => void;
    disabled?: boolean;
  } = $props();

  let fileInput: HTMLInputElement;
  let isEditing = $state(false);

  function autoResize(node: HTMLTextAreaElement) {
    function update() {
      node.style.minHeight = "0px";
      node.style.height = "0px";
      const contentHeight = node.scrollHeight;
      node.style.height = "100%";
      node.style.minHeight = contentHeight + "px";
    }
    node.addEventListener("input", update);
    setTimeout(update, 0);
    return { destroy() { node.removeEventListener("input", update); } };
  }

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const val = (e.currentTarget as HTMLTextAreaElement).value;
      const files = extractEvidenceFiles(item.eviden);
      await onSave("eviden", reconstructEvidence(val, files));
      isEditing = false;
    }
  }
</script>

<div class="flex flex-col h-full">
  <div class="relative flex-1">
    {#if isEditing}
      <textarea
        use:autoResize
        spellcheck="false"
        class="w-full h-full min-h-full bg-transparent border-0 p-3 pr-10 text-[10px] focus:ring-0 focus:outline-none transition-all resize-none overflow-hidden block"
        placeholder="Bukti — Ctrl+Enter atau ⌘+Enter untuk simpan"
        value={extractEvidenceText(item.eviden)}
        oninput={(e) => {
          const files = extractEvidenceFiles(item.eviden);
          item.eviden = reconstructEvidence(e.currentTarget.value, files);
        }}
        onkeydown={handleKeyDown}
        onblur={(e) => {
          const val = (e.currentTarget as HTMLTextAreaElement).value;
          const existingText = extractEvidenceText(item.eviden);
          if (val !== existingText) {
            const files = extractEvidenceFiles(item.eviden);
            onSave("eviden", reconstructEvidence(val, files));
          }
          isEditing = false;
        }}
      ></textarea>
    {:else}
      <div
        class="w-full min-h-15 p-3 pr-10 text-[10px] leading-relaxed cursor-text text-slate-700 whitespace-pre-wrap break-all"
        role="textbox"
        tabindex="0"
        aria-label="Eviden — klik untuk mengedit"
        onclick={() => { if (!disabled) isEditing = true; }}
        onkeydown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) isEditing = true; }}
      >
        {#if extractEvidenceText(item.eviden)}
          {#each parseEvidenceTextSegments(extractEvidenceText(item.eviden)) as seg}
            {#if seg.type === "url"}
              <a
                href={seg.value}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline hover:text-blue-800 font-medium break-all"
                onclick={(e) => e.stopPropagation()}
              >{seg.value}</a>
            {:else}
              {seg.value}
            {/if}
          {/each}
        {:else}
          <span class="text-slate-400 italic">Bukti — klik untuk mengedit</span>
        {/if}
      </div>
    {/if}

    <input
      type="file"
      class="hidden"
      bind:this={fileInput}
      onchange={(e) => {
        const f = (e.target as HTMLInputElement).files?.[0];
        if (f) onFileSelected(item, f);
      }}
    />

    {#if !disabled}
      <button
        type="button"
        class="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Unggah Dokumen"
        onclick={() => fileInput.click()}
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    {/if}
  </div>

  {#each extractEvidenceFiles(item.eviden) as file, fi}
    <div class="inline-flex items-center gap-0.5 mx-3 {fi === 0 ? 'mt-1' : ''} mb-1">
      <a
        href="/area-of-improvement/api/download?path={encodeURIComponent(file.path)}"
        target="_blank"
        class="inline-flex items-center gap-1 text-[9px] text-blue-600 font-medium hover:underline bg-blue-50 px-2 py-0.5 rounded-l border border-blue-100"
      >
        📎 {file.name}
      </a>
      {#if !disabled}
        <button
          type="button"
          class="inline-flex items-center justify-center h-full px-1 py-0.5 rounded-r border border-l-0 border-blue-100 bg-blue-50 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          title="Hapus file"
          onclick={() => onRemoveFile(item, fi)}
        ><X size={10} /></button>
      {/if}
    </div>
  {/each}

  {#if stagedFile}
    <div class="mx-3 mb-2 p-2 rounded bg-amber-50 border border-amber-200 flex flex-col gap-2">
      <div class="flex items-center justify-between text-[9px] font-bold text-amber-800">
        <div class="truncate max-w-25">📎 {stagedFile.name}</div>
        <button
          type="button"
          class="text-rose-500 hover:text-rose-700"
          onclick={() => onUnstageFile(item)}
        >
          <X size={12} />
        </button>
      </div>
      <Button
        size="sm"
        class="h-6 text-[9px] bg-amber-600 hover:bg-amber-700 text-white w-full"
        onclick={() => onUpload(item, stagedFile!)}
      >
        Upload File
      </Button>
    </div>
  {/if}
</div>
