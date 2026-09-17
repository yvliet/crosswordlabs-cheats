// ==UserScript==
// @name         CrosswordLabs Solution Overlay & Autofill
// @namespace    https://github.com/yvliet/crosswordlabs-solutions
// @version      1.3.2
// @description  Adds a solution watermark overlay and an instant 1-click solve & victory button to CrosswordLabs puzzles with matched button dimensions.
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
          // 1. Write lowercase answers to all cells
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

          // 2. Trigger native grading loop
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

          // 3. Fallback celebration check
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
