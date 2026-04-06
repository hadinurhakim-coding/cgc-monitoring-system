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
