/**
 * CrosswordLabs Solution Overlay & Autofill
 * 
 * Non-destructively adds two tools to the CrosswordLabs puzzle toolbar:
 * 1. "Show Solutions" - Toggles a dimmed lowercase solution watermark directly underneath user inputs.
 * 2. "Solve Puzzle" - Automatically populates the puzzle with the answers, triggers native grading,
 *    persists the solved state, and plays the victory celebration animation immediately.
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

    /* Shared toolbar button styles - perfectly sized to match CrosswordLabs buttons */
    #toggle-overlay-btn,
    #solve-puzzle-btn {
      margin: 0 3px !important;
      font-size: 18px !important;
      padding: 5px 12px !important;
      border-radius: 5px !important;
      font-weight: normal !important;
      line-height: normal !important;
      font-family: inherit !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      vertical-align: middle !important;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    /* Show/Hide Solutions button */
    #toggle-overlay-btn {
      background: #2563eb !important;
      color: #ffffff !important;
      border: 1px solid #1d4ed8 !important;
    }

    #toggle-overlay-btn:hover {
      background: #1d4ed8 !important;
    }

    #toggle-overlay-btn.active {
      background: #059669 !important;
      border-color: #047857 !important;
      color: #ffffff !important;
    }

    #toggle-overlay-btn.active:hover {
      background: #047857 !important;
    }

    /* Solve Puzzle button */
    #solve-puzzle-btn {
      background: #10b981 !important;
      color: #ffffff !important;
      border: 1px solid #059669 !important;
    }

    #solve-puzzle-btn:hover {
      background: #059669 !important;
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
        // Step 1: Fill all cells with lowercase answers
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

        // Step 2: Trigger CrosswordLabs' native gradeAll routine
        const clues = document.querySelectorAll('#across li, #down li');
        if (window.$ && clues.length >= 2) {
          window.$(clues[0]).trigger('click');
          window.$(clues[1]).trigger('click');
        } else if (clues.length >= 2) {
          clues[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
          clues[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        } else {
          const cellGroups = document.querySelectorAll('.cx svg g');
          if (cellGroups.length >= 2) {
            if (window.$) {
              window.$(cellGroups[0]).trigger('click');
              window.$(cellGroups[cellGroups.length - 1]).trigger('click');
            } else {
              cellGroups[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
              cellGroups[cellGroups.length - 1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          }
        }

        // Step 3: Guaranteed celebration fallback check
        setTimeout(() => {
          const starImg = document.querySelector('img[src*="star.svg"]');
          if (!starImg) {
            document.querySelectorAll('.cx svg g').forEach(g => g.classList.add('correct'));
            document.querySelectorAll('#across li, #down li').forEach(li => li.classList.add('correct'));

            const starUrl = (typeof window.STAR_URL !== 'undefined' && window.STAR_URL) 
              ? window.STAR_URL 
              : '/static/1745514585/img/star.svg';

            const star = document.createElement('img');
            star.setAttribute('src', starUrl + '?t=' + (+new Date()));
            star.style.cssText = 'position:fixed;top:0;left:0;bottom:0;right:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
            star.onload = function() { setTimeout(() => star.remove(), 3000); };
            star.onerror = function() { star.remove(); };
            document.body.appendChild(star);
          }
        }, 60);
      });

      menu.appendChild(solveBtn);
    }
  }

  console.info(`[CrosswordLabs Tools] Initialized with ${hintsCount} cell overlays and toolbar buttons.`);
})();
