/**
 * Svelte action to auto-resize a textarea based on its content.
 * Forces it to stretch 100% of parent in a table cell.
 */
export function autoResize(node: HTMLTextAreaElement) {
  function update() {
    node.style.minHeight = "0px";
    node.style.height = "0px";
    const contentHeight = node.scrollHeight;
    node.style.height = "100%";
    node.style.minHeight = contentHeight + "px";
  }
  
  node.addEventListener("input", update);
  // Initial resize
  setTimeout(update, 0);
  
  return {
    destroy() {
      node.removeEventListener("input", update);
    },
    update() {
      // Re-trigger if content changes externally
      update();
    }
  };
}

const SCROLL_KEY = "acgs-assessment:scroll-y";

/**
 * Simpan posisi scroll window ke sessionStorage.
 */
export function saveScrollPosition() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
}

/**
 * Lacak posisi scroll secara berkala (debounce) agar posisi terakhir selalu tersimpan,
 * bahkan jika browser ditutup paksa atau me-refresh tanpa event beforeunload.
 */
export function initScrollTracking() {
  if (typeof window === "undefined") return () => {};
  
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const handleScroll = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      saveScrollPosition();
    }, 300); // Debounce 300ms untuk performa optimal
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener("scroll", handleScroll);
    clearTimeout(timeoutId);
  };
}

/**
 * Pulihkan posisi scroll dari sessionStorage setelah halaman dimuat.
 * Menggunakan retry karena konten tabel mungkin belum selesai di-render
 * saat fungsi ini pertama kali dipanggil — dokumen masih pendek.
 */
export function restoreScrollPosition() {
  if (typeof window === "undefined") return;
  const saved = sessionStorage.getItem(SCROLL_KEY);
  if (saved === null) return;

  sessionStorage.removeItem(SCROLL_KEY);
  const targetY = parseInt(saved, 10);
  if (Number.isNaN(targetY) || targetY <= 0) return;

  let attempts = 0;
  const maxAttempts = 20; // 20 × 100ms = max 2 detik menunggu

  function tryScroll() {
    attempts++;
    window.scrollTo({ top: targetY, behavior: "instant" });

    // Cek apakah scroll berhasil mencapai posisi target
    const reached = Math.abs(window.scrollY - targetY) < 5;
    if (!reached && attempts < maxAttempts) {
      setTimeout(tryScroll, 100);
    }
  }

  requestAnimationFrame(tryScroll);
}
