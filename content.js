if (!window.__tsp_initialized) {
  window.__tsp_initialized = true;

  const HIGHLIGHT_CLASS = '__tsp_hl';
  const CURRENT_CLASS = '__tsp_cur';
  const CONTAINER_ID = '__tsp_container';

  let highlights = [];
  let currentIndex = -1;
  let container = null;
  let searchInput = null;
  let matchCountEl = null;
  let options = { caseSensitive: false, wholeWord: false, useRegex: false };

  // ── Styles ──────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('__tsp_styles')) return;
    const style = document.createElement('style');
    style.id = '__tsp_styles';
    style.textContent = `
      .${HIGHLIGHT_CLASS} {
        background-color: rgba(255, 213, 0, 0.4) !important;
        color: inherit !important;
        border-radius: 2px;
        box-shadow: 0 0 0 1px rgba(255, 213, 0, 0.6);
      }
      .${CURRENT_CLASS} {
        background-color: rgba(255, 150, 50, 0.7) !important;
        box-shadow: 0 0 0 2px rgba(255, 150, 50, 0.9);
      }
      #${CONTAINER_ID} {
        position: fixed;
        top: 8px;
        right: 16px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        background: #252526;
        border: 1px solid #454545;
        border-radius: 6px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: #cccccc;
        width: 340px;
      }
      #${CONTAINER_ID}.hidden { display: none !important; }
      #${CONTAINER_ID} * { box-sizing: border-box; }

      #${CONTAINER_ID} .tsp-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      #${CONTAINER_ID} .tsp-input-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        background: #3c3c3c;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 0 8px;
      }
      #${CONTAINER_ID} .tsp-input-wrap:focus-within {
        border-color: #007acc;
      }

      #${CONTAINER_ID} input.tsp-input {
        flex: 1;
        background: transparent;
        border: none;
        color: #cccccc;
        font-size: 13px;
        padding: 5px 0;
        outline: none;
        font-family: inherit;
        min-width: 0;
      }
      #${CONTAINER_ID} input.tsp-input::placeholder { color: #888; }

      #${CONTAINER_ID} .tsp-count {
        font-size: 11px;
        color: #888;
        white-space: nowrap;
        margin-left: 6px;
      }
      #${CONTAINER_ID} .tsp-count.no-match { color: #f48771; }

      #${CONTAINER_ID} button.tsp-opt {
        background: transparent;
        border: 1px solid transparent;
        color: #888;
        font-size: 12px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        padding: 3px 7px;
        border-radius: 3px;
        cursor: pointer;
        line-height: 1;
      }
      #${CONTAINER_ID} button.tsp-opt:hover { background: #3c3c3c; color: #ccc; }
      #${CONTAINER_ID} button.tsp-opt.active { background: #264f78; border-color: #007acc; color: #fff; }

      #${CONTAINER_ID} button.tsp-nav {
        background: #3c3c3c;
        border: 1px solid #555;
        color: #cccccc;
        font-size: 13px;
        padding: 3px 8px;
        border-radius: 3px;
        cursor: pointer;
        line-height: 1;
      }
      #${CONTAINER_ID} button.tsp-nav:hover { background: #505050; }

      #${CONTAINER_ID} button.tsp-close {
        background: transparent;
        border: none;
        color: #888;
        font-size: 16px;
        padding: 2px 6px;
        cursor: pointer;
        line-height: 1;
        border-radius: 3px;
      }
      #${CONTAINER_ID} button.tsp-close:hover { background: #5a1d1d; color: #f48771; }
    `;
    document.head.appendChild(style);
  }

  // ── UI ──────────────────────────────────────────────────────
  function createUI() {
    if (document.getElementById(CONTAINER_ID)) {
      container = document.getElementById(CONTAINER_ID);
      searchInput = container.querySelector('.tsp-input');
      matchCountEl = container.querySelector('.tsp-count');
      return;
    }

    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.classList.add('hidden');

    container.innerHTML = `
      <div class="tsp-row">
        <div class="tsp-input-wrap">
          <input type="text" class="tsp-input" placeholder="Search..." spellcheck="false" autocomplete="off">
          <span class="tsp-count"></span>
        </div>
        <button class="tsp-nav" data-action="prev" title="Previous (Shift+Enter)">&#9650;</button>
        <button class="tsp-nav" data-action="next" title="Next (Enter)">&#9660;</button>
        <button class="tsp-close" data-action="close" title="Close (Esc)">&times;</button>
      </div>
      <div class="tsp-row">
        <button class="tsp-opt" data-opt="caseSensitive" title="Match Case (Alt+C)">Aa</button>
        <button class="tsp-opt" data-opt="wholeWord" title="Whole Word (Alt+W)"><span style="text-decoration:underline;text-underline-offset:2px">ab</span></button>
        <button class="tsp-opt" data-opt="useRegex" title="Regex (Alt+R)">.*</button>
      </div>
    `;

    document.documentElement.appendChild(container);

    searchInput = container.querySelector('.tsp-input');
    matchCountEl = container.querySelector('.tsp-count');

    // Input handler with debounce
    let debounce = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => performSearch(), 150);
    });

    // Keyboard on input
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        hideUI();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        navigateTo(currentIndex - 1);
        updateCount();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        navigateTo(currentIndex + 1);
        updateCount();
      }
    });

    // Stop all keyboard events from reaching the page
    container.addEventListener('keydown', (e) => e.stopPropagation());
    container.addEventListener('keyup', (e) => e.stopPropagation());
    container.addEventListener('keypress', (e) => e.stopPropagation());

    // Button clicks
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const action = btn.dataset.action;
      const opt = btn.dataset.opt;

      if (action === 'next') {
        navigateTo(currentIndex + 1);
        updateCount();
      } else if (action === 'prev') {
        navigateTo(currentIndex - 1);
        updateCount();
      } else if (action === 'close') {
        hideUI();
      } else if (opt) {
        options[opt] = !options[opt];
        btn.classList.toggle('active', options[opt]);
        performSearch();
      }
    });

    // Alt shortcuts when search bar is focused
    container.addEventListener('keydown', (e) => {
      if (e.altKey) {
        let opt = null;
        if (e.key === 'c') opt = 'caseSensitive';
        else if (e.key === 'w') opt = 'wholeWord';
        else if (e.key === 'r') opt = 'useRegex';
        if (opt) {
          e.preventDefault();
          options[opt] = !options[opt];
          const btn = container.querySelector(`[data-opt="${opt}"]`);
          if (btn) btn.classList.toggle('active', options[opt]);
          performSearch();
        }
      }
    });
  }

  function showUI() {
    injectStyles();
    createUI();
    container.classList.remove('hidden');
    searchInput.focus();
    searchInput.select();
  }

  function hideUI() {
    if (container) container.classList.add('hidden');
    clearHighlights();
  }

  function toggleUI() {
    injectStyles();
    createUI();
    if (container.classList.contains('hidden')) {
      showUI();
    } else {
      hideUI();
    }
  }

  // ── Search logic ───────────────────────────────────────────
  function clearHighlights() {
    for (const el of highlights) {
      const parent = el.parentNode;
      if (parent) {
        const text = document.createTextNode(el.textContent);
        parent.replaceChild(text, el);
        parent.normalize();
      }
    }
    highlights = [];
    currentIndex = -1;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildRegex(query) {
    let pattern = options.useRegex ? query : escapeRegex(query);
    if (options.wholeWord) pattern = `\\b${pattern}\\b`;
    const flags = options.caseSensitive ? 'g' : 'gi';
    try { return new RegExp(pattern, flags); }
    catch { return null; }
  }

  function getTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA')
          return NodeFilter.FILTER_REJECT;
        if (p.closest('#' + CONTAINER_ID)) return NodeFilter.FILTER_REJECT;
        if (p.classList && p.classList.contains(HIGHLIGHT_CLASS)) return NodeFilter.FILTER_REJECT;
        if (node.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function performSearch() {
    clearHighlights();
    const query = searchInput ? searchInput.value : '';
    if (!query) { updateCount(); return; }

    const regex = buildRegex(query);
    if (!regex) { updateCount(); return; }

    const textNodes = getTextNodes();

    for (const node of textNodes) {
      const text = node.textContent;
      const matches = [];
      let m;
      regex.lastIndex = 0;
      while ((m = regex.exec(text)) !== null) {
        matches.push({ index: m.index, len: m[0].length, text: m[0] });
        if (m[0].length === 0) regex.lastIndex++;
      }
      if (matches.length === 0) continue;

      const frag = document.createDocumentFragment();
      let last = 0;
      for (const mt of matches) {
        if (mt.index > last) frag.appendChild(document.createTextNode(text.slice(last, mt.index)));
        const span = document.createElement('span');
        span.className = HIGHLIGHT_CLASS;
        span.textContent = mt.text;
        frag.appendChild(span);
        highlights.push(span);
        last = mt.index + mt.len;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    }

    if (highlights.length > 0) {
      currentIndex = 0;
      highlights[0].classList.add(CURRENT_CLASS);
      highlights[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateCount();
  }

  function navigateTo(index) {
    if (highlights.length === 0) return;
    if (currentIndex >= 0 && currentIndex < highlights.length)
      highlights[currentIndex].classList.remove(CURRENT_CLASS);
    if (index < 0) index = highlights.length - 1;
    if (index >= highlights.length) index = 0;
    currentIndex = index;
    highlights[currentIndex].classList.add(CURRENT_CLASS);
    highlights[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function updateCount() {
    if (!matchCountEl) return;
    const query = searchInput ? searchInput.value : '';
    if (!query) {
      matchCountEl.textContent = '';
      matchCountEl.classList.remove('no-match');
    } else if (highlights.length === 0) {
      matchCountEl.textContent = 'No results';
      matchCountEl.classList.add('no-match');
    } else {
      matchCountEl.textContent = `${currentIndex + 1} of ${highlights.length}`;
      matchCountEl.classList.remove('no-match');
    }
  }

  // ── Message listener (icon click / Cmd+Shift+F from background) ──
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'toggle') {
      toggleUI();
      sendResponse({ ok: true });
    }
    return true;
  });
}
