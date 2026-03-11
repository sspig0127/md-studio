/**
 * preview.js — Markdown 預覽渲染（marked.js + mermaid.js）
 */
const Preview = (() => {
  let _container = null;
  let _renderTimer = null;
  let _tooltip = null;
  let _tooltipTimer = null;

  function init(containerEl) {
    _container = containerEl;
    // Configure marked
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    // Configure mermaid
    const savedTheme = localStorage.getItem('md_theme') || 'purple';
    const mermaidTheme = savedTheme === 'light' ? 'default' : 'dark';
    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
    // Create global tooltip element
    _tooltip = document.createElement('div');
    _tooltip.id = 'mermaid-tooltip';
    _tooltip.style.cssText = [
      'position:fixed',
      'z-index:9999',
      'padding:6px 12px',
      'border-radius:6px',
      'font-size:13px',
      'line-height:1.5',
      'max-width:280px',
      'word-break:break-all',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 0.2s ease',
      'background:var(--color-surface)',
      'color:var(--color-text)',
      'border:1px solid var(--color-border)',
      'box-shadow:0 4px 16px rgba(0,0,0,0.3)',
    ].join(';');
    document.body.appendChild(_tooltip);
  }

  // Debounced render call
  function scheduleRender(markdown) {
    clearTimeout(_renderTimer);
    _renderTimer = setTimeout(() => render(markdown), 300);
  }

  async function render(markdown) {
    if (!_container) return;
    // Clear any pending tooltip timer from previous render
    clearTimeout(_tooltipTimer);
    if (_tooltip) _tooltip.style.opacity = '0';
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
        const svgEl = wrapper.querySelector('svg');
        if (svgEl) {
          // 1. Remove height constraint
          svgEl.removeAttribute('height');
          svgEl.style.height = 'auto';

          // 2. Remove clip-path so text is never clipped by shape boundary
          svgEl.querySelectorAll('[clip-path]').forEach(el => {
            el.removeAttribute('clip-path');
          });
        }
      } catch (e) {
        wrapper.innerHTML = `<div class="mermaid-error">Mermaid error: ${_escapeHtml(e.message || String(e))}</div>`;
      }

      // Insert into DOM first — getBoundingClientRect requires live DOM
      pre.replaceWith(wrapper);

      // 3. Expand shapes AFTER DOM insertion so measurements are accurate
      const svgEl = wrapper.querySelector('svg');
      if (svgEl) {
        requestAnimationFrame(() => {
          svgEl.querySelectorAll('.node').forEach(node => {
            const textEl  = node.querySelector('.label text, .nodeLabel');
            const shapeEl = node.querySelector('rect, polygon, circle, ellipse');
            if (!textEl || !shapeEl) return;
            try {
              const textBox  = textEl.getBoundingClientRect();
              const shapeBox = shapeEl.getBoundingClientRect();
              const padX = 16, padY = 8;
              if (textBox.width + padX * 2 > shapeBox.width) {
                const diff = (textBox.width + padX * 2 - shapeBox.width) / 2;
                const x = parseFloat(shapeEl.getAttribute('x') || '0');
                const w = parseFloat(shapeEl.getAttribute('width') || shapeBox.width);
                shapeEl.setAttribute('x', x - diff);
                shapeEl.setAttribute('width', w + diff * 2);
              }
              if (textBox.height + padY * 2 > shapeBox.height) {
                const diff = (textBox.height + padY * 2 - shapeBox.height) / 2;
                const y = parseFloat(shapeEl.getAttribute('y') || '0');
                const h = parseFloat(shapeEl.getAttribute('height') || shapeBox.height);
                shapeEl.setAttribute('y', y - diff);
                shapeEl.setAttribute('height', h + diff * 2);
              }
            } catch (_) {}
          });
        });
      }

      _addMermaidTooltips(wrapper);
    }
  }

  function _addMermaidTooltips(wrapperEl) {
    // Node labels + Edge labels
    const targets = [
      // Nodes: .node elements
      ...wrapperEl.querySelectorAll('.node'),
      // Edges: .edgeLabel g.label (Mermaid v10 uses foreignObject inside)
      ...wrapperEl.querySelectorAll('.edgeLabel'),
    ];

    targets.forEach(el => {
      // Extract text: try foreignObject span first (Mermaid v10), then SVG text
      const spanEl = el.querySelector('foreignObject span, span.edgeLabel');
      const textEl = spanEl || el.querySelector('.label text, .nodeLabel, text');
      if (!textEl) return;
      const label = textEl.textContent.trim();
      if (!label) return;

      el.style.cursor = 'default';

      el.addEventListener('mouseenter', (e) => {
        _tooltipTimer = setTimeout(() => {
          _tooltip.textContent = label;
          _tooltip.style.opacity = '1';
          _positionTooltip(e);
        }, 2500);
      });

      el.addEventListener('mousemove', (e) => {
        if (_tooltip.style.opacity === '1') _positionTooltip(e);
      });

      el.addEventListener('mouseleave', () => {
        clearTimeout(_tooltipTimer);
        _tooltip.style.opacity = '0';
      });
    });
  }

  function _positionTooltip(e) {
    const pad = 12;
    const tw = _tooltip.offsetWidth;
    const th = _tooltip.offsetHeight;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + tw > window.innerWidth  - pad) x = e.clientX - tw - pad;
    if (y + th > window.innerHeight - pad) y = e.clientY - th - pad;
    _tooltip.style.left = x + 'px';
    _tooltip.style.top  = y + 'px';
  }

  function _escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init, scheduleRender, render };
})();
