# crosswordlabs-solutions

tool to show answers in crosswordlabs.com

## how it works

crosswordlabs actually just sends the entire answer key straight to your browser in the initial page html. if you open devtools and look at `window.grid`, every letter is just sitting there in plain text. 

this script adds two buttons to the puzzle toolbar:

1. **Show Solutions**: drops an svg text element underneath each cell's answer slot, styled in the exact same font, lowercase, and color as normal inputs, just slightly dimmed down. when toggled on, solution letters sit right below whatever you're typing as a guide.
2. **Solve Puzzle**: automatically writes all the answers straight into your input fields and triggers the game's grading check, completing the puzzle and saving it to local storage.

## usage

### 1. console
open devtools (`F12`) on any puzzle, paste [`overlay.js`](overlay.js) into the console, and hit enter.

### 2. bookmarklet
make a new bookmark and set the url to:

```javascript
javascript:(function(){const s=document.querySelector('.cx svg');if(!s||!window.grid)return alert('Crossword puzzle or grid not found!');if(!document.querySelector('#cw-ov-s')){const st=document.createElement('style');st.id='cw-ov-s';st.textContent='.cx-h{display:none;font-family:monospace;font-size:22px;fill:#000003;opacity:.32;pointer-events:none;user-select:none}.cx svg.sh .cx-h{display:inline}#cw-t-btn,#cw-s-btn{margin-left:8px;font-weight:600;color:#fff;border-radius:4px;padding:4px 12px;font-size:13px;cursor:pointer;transition:background-color .15s ease}#cw-t-btn{background:#2563eb;border:1px solid #1d4ed8}#cw-t-btn.act{background:#059669;border-color:#047857}#cw-s-btn{background:#10b981;border:1px solid #059669}#cw-s-btn:hover{background:#059669}';document.head.appendChild(st);window.grid.forEach((r,ri)=>r.forEach((c,ci)=>{if(c&&c.char){const g=document.querySelector('#cx-'+ri+'-'+ci);if(g&&!g.querySelector('.cx-h')){const b=g.querySelector('.cx-a');if(!b)return;const h=document.createElementNS('http://www.w3.org/2000/svg','text');h.setAttribute('x',b.getAttribute('x'));h.setAttribute('y',b.getAttribute('y'));h.setAttribute('dy',b.getAttribute('dy')||'.28em');h.setAttribute('text-anchor','middle');h.setAttribute('class','cx-h');h.textContent=c.char.toLowerCase();g.insertBefore(h,b);}}}));const m=document.querySelector('.view-menu');if(m&&!document.querySelector('#cw-t-btn')){const btn=document.createElement('button');btn.id='cw-t-btn';btn.textContent='Show Solutions';btn.onclick=()=>{const on=s.classList.toggle('sh');btn.textContent=on?'Hide Solutions':'Show Solutions';btn.classList.toggle('act',on);};m.appendChild(btn);const sBtn=document.createElement('button');sBtn.id='cw-s-btn';sBtn.textContent='Solve Puzzle';sBtn.onclick=()=>{window.grid.forEach((r,ri)=>r.forEach((c,ci)=>{if(c&&c.char){const tn=document.querySelector('#cx-'+ri+'-'+ci+' .cx-a');if(tn)tn.textContent=c.char.toLowerCase();}}));const gb=document.querySelector('#grade');if(gb)gb.click();};m.appendChild(sBtn);}}const on=s.classList.toggle('sh');const b=document.querySelector('#cw-t-btn');if(b){b.textContent=on?'Hide Solutions':'Show Solutions';b.classList.toggle('act',on);}})();
```

click it whenever you're on a puzzle to add both buttons to your toolbar.

### 3. userscript
install [`crosswordlabs-solutions.user.js`](crosswordlabs-solutions.user.js) in violentmonkey or tampermonkey if you want both buttons to load automatically on every puzzle.

## license

mit
