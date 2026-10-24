export async function writeClipboard(text, { navigator, document } = globalThis) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch { /* Use selection-based copying when Clipboard API is unavailable. */ }
  const active = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
  const field = document.createElement('textarea');
  field.value = text;
  field.className = 'clipboard-fallback';
  field.setAttribute('readonly', '');
  // A modal dialog makes elements outside it inert.
  (document.querySelector('dialog[open]') || document.body).append(field);
  try {
    field.focus();
    field.select();
    if (!document.execCommand('copy')) throw Error('复制失败，请手动选择复制');
  } finally {
    field.remove();
    active?.focus({ preventScroll: true });
    if (selection) { selection.removeAllRanges(); ranges.forEach(range => selection.addRange(range)); }
  }
}
