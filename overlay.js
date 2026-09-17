/**
 * CrosswordLabs Solution Overlay
 * 
 * Non-destructively injects a toggleable solution overlay onto CrosswordLabs puzzle grids.
 * Decoupled from CrosswordLabs' native validation loop (`gradeAll()`).
 * 
 * The solution letters are placed in the DOM beneath the user's input (.cx-a) in the exact same
 * font, lowercase, and color (#000003), slightly dimmed down as a subtle guide.
 */

(function setupSolutionOverlay() {
  const svg = document.querySelector('.cx svg');
  if (!svg || !window.grid) {
    console.warn('[CrosswordLabs Overlay] Grid data or SVG not found. Make sure you are on a puzzle page (/view/*).');
    return;
  }

  // Prevent duplicate initialization
  if (document.querySelector('#crosswordlabs-overlay-style')) {
    console.info('[CrosswordLabs Overlay] Overlay is already initialized.');
    return;
  }

  // 1. Inject overlay styling rules
  const style = document.createElement('style');
  style.id = 'crosswordlabs-overlay-style';
  style.textContent = `
    /* Solution overlay text elements (same font, lowercase, and color as answer, slightly dimmed) */
    .cx-hint {
      display: none;
      font-family: monospace;
      font-size: 22px;
      fill: #000003;
      opacity: 0.32;
      pointer-events: none;
      user-select: none;
    }

    /* When solution mode is ON: reveal solutions underneath user inputs */
    .cx svg.show-hints .cx-hint {
      display: inline;
    }

    /* Toolbar toggle button */
    #toggle-overlay-btn {
      margin-left: 8px;
      font-weight: 600;
      background-color: #2563eb;
      color: #ffffff;
      border: 1px solid #1d4ed8;
      border-radius: 4px;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    #toggle-overlay-btn:hover {
      background-color: #1d4ed8;
    }

    /* Active badge styling when solutions are visible */
    #toggle-overlay-btn.active {
      background-color: #059669;
      border-color: #047857;
      color: #ffffff;
    }

    #toggle-overlay-btn.active:hover {
      background-color: #047857;
    }
  `;
  document.head.appendChild(style);

  // 2. Iterate through window.grid and insert hint text nodes underneath .cx-a
  let hintsCount = 0;
  window.grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell && cell.char) {
        const group = document.querySelector(`#cx-${r}-${c}`);
        if (group && !group.querySelector('.cx-hint')) {
          const base = group.querySelector('.cx-a');
          if (!base) return;

          const hint = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          hint.setAttribute('x', base.getAttribute('x'));
          hint.setAttribute('y', base.getAttribute('y'));
          hint.setAttribute('dy', base.getAttribute('dy') || '.28em');
          hint.setAttribute('text-anchor', 'middle');
          hint.setAttribute('class', 'cx-hint');
          hint.setAttribute('aria-hidden', 'true');
          hint.textContent = cell.char.toLowerCase();

          // Insert before .cx-a so the user's typed character renders on top
          group.insertBefore(hint, base);
          hintsCount++;
        }
      }
    });
  });

  // 3. Attach toggle control to the puzzle toolbar
  const menu = document.querySelector('.view-menu');
  if (menu && !document.querySelector('#toggle-overlay-btn')) {
    const btn = document.createElement('button');
    btn.id = 'toggle-overlay-btn';
    btn.type = 'button';
    btn.textContent = 'Show Solutions';
    btn.setAttribute('aria-pressed', 'false');

    btn.addEventListener('click', () => {
      const isShowing = svg.classList.toggle('show-hints');
      btn.textContent = isShowing ? 'Hide Solutions' : 'Show Solutions';
      btn.classList.toggle('active', isShowing);
      btn.setAttribute('aria-pressed', isShowing.toString());
    });

    menu.appendChild(btn);
  }

  console.info(`[CrosswordLabs Overlay] Initialized with ${hintsCount} cell overlays. Ready.`);
})();
