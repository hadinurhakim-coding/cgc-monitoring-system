<script lang="ts">
  import { Plus, X } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { extractEvidenceText, extractEvidenceFiles, reconstructEvidence, parseEvidenceTextSegments } from "../../assessment-acgs/_lib/evidence-utils.js";
  import type { AoiItem } from "../_lib/types.js";
  import { uploadAoiEvidence } from "../_lib/aoi-api-client.js";

  let {
    item,
    onSave,
    disabled = false,
  }: {
    item: AoiItem;
    onSave: (field: string, val: string) => Promise<void>;
    disabled?: boolean;
  } = $props();

  let fileInput: HTMLInputElement;
  let isEditing = $state(false);
  let isUploading = $state(false);
  let stagedFile = $state<File | null>(null);

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

  async function handleBlur(e: FocusEvent) {
    const val = (e.currentTarget as HTMLTextAreaElement).value;
    const existingText = extractEvidenceText(item.eviden);
    if (val !== existingText) {
      const files = extractEvidenceFiles(item.eviden);
      await onSave("eviden", reconstructEvidence(val, files));
    }
    isEditing = false;
  }

  async function handleUpload() {
    if (!stagedFile || isUploading) return;
    isUploading = true;
    try {
      const { path, fileName } = await uploadAoiEvidence(stagedFile, { year: item.year, itemUid: item.uid });
      const existingFiles = extractEvidenceFiles(item.eviden);
      const existingText = extractEvidenceText(item.eviden);
      const newFiles = [...existingFiles, { path, name: fileName }];
      const combined = reconstructEvidence(existingText, newFiles);
      await onSave("eviden", combined);
      stagedFile = null;
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      isUploading = false;
    }
  }

  async function removeFile(fi: number) {
    const files = extractEvidenceFiles(item.eviden);
    const text = extractEvidenceText(item.eviden);
    files.splice(fi, 1);
    await onSave("eviden", reconstructEvidence(text, files));
  }
</script>

<div class="flex flex-col h-full">
  <div class="relative flex-1">
    {#if isEditing}
      <textarea
        use:autoResize
        spellcheck="false"
        class="w-full h-full min-h-full bg-transparent border-0 p-3 pr-10 text-xs focus:ring-0 focus:outline-none resize-none overflow-hidden block"
        placeholder="Bukti — Ctrl+Enter untuk simpan"
        value={extractEvidenceText(item.eviden)}
        onblur={handleBlur}
        {disabled}
      ></textarea>
    {:else}
      <div
        class="w-full min-h-16 p-3 pr-10 text-xs leading-relaxed cursor-text text-slate-700 whitespace-pre-wrap break-all"
        role="textbox"
        tabindex="0"
        aria-label="Eviden — klik untuk mengedit"
        onclick={() => { if (!disabled) isEditing = true; }}
        onkeydown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) isEditing = true; }}
      >
        {#if extractEvidenceText(item.eviden)}
          {#each parseEvidenceTextSegments(extractEvidenceText(item.eviden)) as seg}
            {#if seg.type === "url"}
              <a href={seg.value} target="_blank" rel="noopener noreferrer"
                class="text-blue-600 hover:underline font-medium break-all"
                onclick={(e) => e.stopPropagation()}>{seg.value}</a>
            {:else}
              {seg.value}
            {/if}
          {/each}
        {:else}
          <span class="text-slate-400 italic">Eviden — klik untuk mengedit</span>
        {/if}
      </div>
    {/if}

    <input
      type="file"
      class="hidden"
      bind:this={fileInput}
      onchange={(e) => {
        const f = (e.target as HTMLInputElement).files?.[0];
        if (f) stagedFile = f;
      }}
    />

    {#if !disabled}
      <button
        type="button"
        class="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
        title="Unggah Dokumen"
        onclick={() => fileInput.click()}
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    {/if}
  </div>

  {#each extractEvidenceFiles(item.eviden) as file, fi}
    <div class="inline-flex items-center gap-0.5 mx-3 mb-1">
      <a
        href="/area-of-improvement/api/download?path={encodeURIComponent(file.path)}"
        target="_blank"
        class="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline bg-blue-50 px-2 py-0.5 rounded-l border border-blue-100"
      >
        📎 {file.name}
      </a>
      {#if !disabled}
        <button
          type="button"
          class="inline-flex items-center justify-center h-full px-1 py-0.5 rounded-r border border-l-0 border-blue-100 bg-blue-50 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          title="Hapus file"
          onclick={() => removeFile(fi)}
        ><X size={10} /></button>
      {/if}
    </div>
  {/each}

  {#if stagedFile}
    <div class="mx-3 mb-2 p-2 rounded bg-amber-50 border border-amber-200 flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs font-bold text-amber-800">
        <span class="truncate max-w-28">📎 {stagedFile.name}</span>
        <button type="button" class="text-rose-500 hover:text-rose-700 cursor-pointer" onclick={() => stagedFile = null}>
          <X size={12} />
        </button>
      </div>
      <Button
        size="sm"
        class="h-6 text-xs bg-amber-600 hover:bg-amber-700 text-white w-full"
        disabled={isUploading}
        onclick={handleUpload}
      >
        {isUploading ? "Mengunggah..." : "Upload File"}
      </Button>
    </div>
  {/if}
</div>
