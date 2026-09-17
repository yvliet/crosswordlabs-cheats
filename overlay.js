/**
 * CrosswordLabs Solution Overlay & Autofill
 * 
 * Non-destructively adds two tools to the CrosswordLabs puzzle toolbar:
 * 1. "Show Solutions" - Toggles a dimmed lowercase solution watermark directly underneath user inputs.
 * 2. "Solve Puzzle" - Automatically populates the puzzle with the answers and triggers native grading.
 */

(function setupCrosswordTools() {
  const svg = document.querySelector('.cx svg');
  if (!svg || !window.grid) {
    console.warn('[CrosswordLabs Tools] Grid data or SVG not found. Make sure you are on a puzzle page (/view/*).');
    return;
  }

  // Prevent duplicate initialization
  if (document.querySelector('#crosswordlabs-tools-style')) {
    console.info('[CrosswordLabs Tools] Tools are already initialized.');
    return;
  }

  // 1. Inject styling rules
  const style = document.createElement('style');
  style.id = 'crosswordlabs-tools-style';
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

    /* Shared toolbar button styles */
    #toggle-overlay-btn,
    #solve-puzzle-btn {
      margin-left: 8px;
      font-weight: 600;
      border-radius: 4px;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    /* Show/Hide Solutions button */
    #toggle-overlay-btn {
      background-color: #2563eb;
      color: #ffffff;
      border: 1px solid #1d4ed8;
    }

    #toggle-overlay-btn:hover {
      background-color: #1d4ed8;
    }

    #toggle-overlay-btn.active {
      background-color: #059669;
      border-color: #047857;
      color: #ffffff;
    }

    #toggle-overlay-btn.active:hover {
      background-color: #047857;
    }

    /* Solve Puzzle button */
    #solve-puzzle-btn {
      background-color: #10b981;
      color: #ffffff;
      border: 1px solid #059669;
    }

    #solve-puzzle-btn:hover {
      background-color: #059669;
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

  // 3. Attach buttons to the puzzle toolbar
  const menu = document.querySelector('.view-menu');
  if (menu) {
    // Toggle Overlay Button
    if (!document.querySelector('#toggle-overlay-btn')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'toggle-overlay-btn';
      toggleBtn.type = 'button';
      toggleBtn.textContent = 'Show Solutions';
      toggleBtn.setAttribute('aria-pressed', 'false');

      toggleBtn.addEventListener('click', () => {
        const isShowing = svg.classList.toggle('show-hints');
        toggleBtn.textContent = isShowing ? 'Hide Solutions' : 'Show Solutions';
        toggleBtn.classList.toggle('active', isShowing);
        toggleBtn.setAttribute('aria-pressed', isShowing.toString());
      });

      menu.appendChild(toggleBtn);
    }

    // Solve Puzzle Button
    if (!document.querySelector('#solve-puzzle-btn')) {
      const solveBtn = document.createElement('button');
      solveBtn.id = 'solve-puzzle-btn';
      solveBtn.type = 'button';
      solveBtn.textContent = 'Solve Puzzle';

      solveBtn.addEventListener('click', () => {
        window.grid.forEach((row, r) => {
          row.forEach((cell, c) => {
            if (cell && cell.char) {
              const textNode = document.querySelector(`#cx-${r}-${c} .cx-a`);
              if (textNode) {
                textNode.textContent = cell.char.toLowerCase();
              }
            }
          });
        });

        // Trigger CrosswordLabs native grading loop
        const gradeBtn = document.querySelector('#grade');
        if (gradeBtn) {
          gradeBtn.click();
        }
      });

      menu.appendChild(solveBtn);
    }
  }

  console.info(`[CrosswordLabs Tools] Initialized with ${hintsCount} cell overlays and Solve button.`);
})();
