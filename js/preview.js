/**
 * preview.js — Markdown 預覽渲染（marked.js + mermaid.js）
 */
const Preview = (() => {
  let _container = null;
  let _renderTimer = null;

  function init(containerEl) {
    _container = containerEl;
    // Configure marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    // Configure mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }

  // Debounced render call
  function scheduleRender(markdown) {
    clearTimeout(_renderTimer);
    _renderTimer = setTimeout(() => render(markdown), 300);
  }

  async function render(markdown) {
    if (!_container) return;
    if (!markdown || markdown.trim() === '') {
      _container.innerHTML = '';
      return;
    }

    // Step 1: Convert markdown to HTML (marked)
    const rawHtml = marked.parse(markdown);

    // Step 2: Inject HTML
    _container.innerHTML = rawHtml;

    // Step 3: Find all <code class="language-mermaid"> blocks and render them
    await _renderMermaid();
  }

  async function _renderMermaid() {
    const codeBlocks = _container.querySelectorAll('code.language-mermaid');
    if (codeBlocks.length === 0) return;

    for (const code of codeBlocks) {
      const pre = code.parentElement;
      const source = code.textContent;
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-wrapper';

      try {
        const id = 'mermaid-' + Math.random().toString(36).slice(2, 9);
        const { svg } = await mermaid.render(id, source);
        wrapper.innerHTML = svg;
      } catch (e) {
        wrapper.innerHTML = `<div class="mermaid-error">Mermaid error: ${_escapeHtml(e.message || String(e))}</div>`;
      }

      pre.replaceWith(wrapper);
    }
  }

  function _escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init, scheduleRender, render };
})();
