<script lang="ts">
  import type { AssessmentItem } from "../_lib/types.js";
  import { Plus, X } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { extractEvidenceText, extractEvidenceFiles, reconstructEvidence, parseEvidenceTextSegments } from "$lib/evidence-utils.js";
  import { norm } from "../_lib/acgs-question-utils.js";

  let { 
    q, 
    onSave,
    onUpload,
    onRemoveFile,
    onFileSelected,
    stagedFile = null as File | null,
    onUnstageFile
  }: { 
    q: AssessmentItem; 
    onSave: (q: AssessmentItem, field: string, val: string) => Promise<void>;
    onUpload: (q: AssessmentItem, file: File) => Promise<void>;
    onRemoveFile: (q: AssessmentItem, fileIndex: number) => Promise<void>;
    onFileSelected: (q: AssessmentItem, file: File) => void;
    stagedFile?: File | null;
    onUnstageFile: (q: AssessmentItem) => void;
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
    return {
      destroy() {
        node.removeEventListener("input", update);
      },
    };
  }

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const val = (e.currentTarget as HTMLTextAreaElement).value;
      const existingFiles = extractEvidenceFiles(q.evidence);
      const combined = reconstructEvidence(val, existingFiles);
      await onSave(q, "evidence", combined);
      isEditing = false;
    }
  }
</script>

<div class="flex flex-col h-full">
  <!-- Textarea + Upload Button -->
  <div class="relative flex-1">
    {#if isEditing}
      <!-- Edit Mode: Textarea -->
      <textarea
        use:autoResize
        spellcheck="false"
        class="w-full h-full min-h-full bg-transparent border-0 p-3 pr-10 text-[10px] focus:ring-0 focus:outline-none transition-all resize-none overflow-hidden block"
        placeholder="Bukti — Ctrl+Enter atau ⌘+Enter untuk simpan"
        value={extractEvidenceText(q.evidence)}
        oninput={(e) => {
          const files = extractEvidenceFiles(q.evidence);
          q.evidence = reconstructEvidence(e.currentTarget.value, files);
        }}
        onkeydown={handleKeyDown}
        onblur={(e) => {
            const val = (e.currentTarget as HTMLTextAreaElement).value;
            const existingText = extractEvidenceText(q.evidence);
            if (val !== existingText) {
               const files = extractEvidenceFiles(q.evidence);
               const combined = reconstructEvidence(val, files);
               onSave(q, "evidence", combined);
            }
            isEditing = false;
        }}
      ></textarea>
    {:else}
      <!-- Preview Mode: Render URL sebagai link -->
      <div
        class="w-full min-h-15 p-3 pr-10 text-[10px] leading-relaxed cursor-text text-slate-700 whitespace-pre-wrap break-all"
        role="textbox"
        tabindex="0"
        aria-label="Evidence — klik untuk mengedit"
        onclick={() => isEditing = true}
        onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") isEditing = true; }}
      >
        {#if extractEvidenceText(q.evidence)}
          {#each parseEvidenceTextSegments(extractEvidenceText(q.evidence)) as seg}
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

    <!-- Hidden File Input -->
    <input
      type="file"
      accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
      class="hidden"
      bind:this={fileInput}
      onchange={(e) => {
          const target = (e.target as HTMLInputElement);
          if (target.files?.[0]) {
              onFileSelected(q, target.files[0]);
          }
          target.value = "";
      }}
    />

    <!-- Rounded Plus Button bottom right -->
    <button
      type="button"
      class="absolute bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
      title="Unggah Dokumen"
      onclick={() => fileInput.click()}
    >
      <Plus size={16} strokeWidth={3} />
    </button>
  </div>

  <!-- Attached Files Badges -->
  {#each extractEvidenceFiles(q.evidence) as file, fi}
    <div class="inline-flex items-center gap-0.5 mx-3 {fi === 0 ? 'mt-1' : ''} mb-1">
      <a
        href="/assessment-acgs/api/download?path={encodeURIComponent(file.path)}"
        target="_blank"
        class="inline-flex items-center gap-1 text-[9px] text-blue-600 font-medium hover:underline bg-blue-50 px-2 py-0.5 rounded-l border border-blue-100"
      >
        📎 {file.name}
      </a>
      <button
        type="button"
        class="inline-flex items-center justify-center h-full px-1 py-0.5 rounded-r border border-l-0 border-blue-100 bg-blue-50 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
        title="Hapus file"
        onclick={() => onRemoveFile(q, fi)}
      >
        <X size={10} />
      </button>
    </div>
  {/each}

  <!-- Staged File Info -->
  {#if stagedFile}
    <div class="mx-3 mb-2 p-2 rounded bg-amber-50 border border-amber-200 flex flex-col gap-2">
      <div class="flex items-center justify-between text-[9px] font-bold text-amber-800">
        <div class="truncate max-w-25">📎 {stagedFile.name}</div>
        <button
          type="button"
          class="text-rose-500 hover:text-rose-700"
          onclick={() => onUnstageFile(q)}
        >
          <X size={12} />
        </button>
      </div>
      <Button
        size="sm"
        class="h-6 text-[9px] bg-amber-600 hover:bg-amber-700 text-white w-full"
        onclick={() => onUpload(q, stagedFile!)}
      >
        Upload File
      </Button>
    </div>
  {/if}
</div>
