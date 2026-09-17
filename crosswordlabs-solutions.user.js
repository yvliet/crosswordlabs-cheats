// ==UserScript==
// @name         CrosswordLabs Solution Overlay & Autofill
// @namespace    https://github.com/yvliet/crosswordlabs-solutions
// @version      1.3.0
// @description  Adds a solution watermark overlay and a 1-click solve button to CrosswordLabs puzzles.
// @author       yvliet
// @match        https://crosswordlabs.com/view/*
// @match        https://crosswordlabs.com/embed/*
// @icon         https://crosswordlabs.com/static/1745514585/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  'use strict';

  function init() {
    const svg = document.querySelector('.cx svg');
    if (!svg || !window.grid) {
      setTimeout(init, 300);
      return;
    }

    if (document.querySelector('#crosswordlabs-tools-style')) return;

    // Inject styling
    const style = document.createElement('style');
    style.id = 'crosswordlabs-tools-style';
    style.textContent = `
      .cx-hint {
        display: none;
        font-family: monospace;
        font-size: 22px;
        fill: #000003;
        opacity: 0.32;
        pointer-events: none;
        user-select: none;
      }
      .cx svg.show-hints .cx-hint {
        display: inline;
      }
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

    // Insert SVG hint elements underneath .cx-a
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

            // Insert before .cx-a so user character renders on top
            group.insertBefore(hint, base);
          }
        }
      });
    });

    // Add buttons to toolbar
    const menu = document.querySelector('.view-menu');
    if (menu) {
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

          const gradeBtn = document.querySelector('#grade');
          if (gradeBtn) {
            gradeBtn.click();
          }
        });

        menu.appendChild(solveBtn);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
