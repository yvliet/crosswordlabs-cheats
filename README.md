# crosswordlabs-solutions

tool to show answers in crosswordlabs.com

## how it works

crosswordlabs actually just sends the entire answer key straight to your browser in the initial page html. if you open devtools and look at `window.grid`, every letter is just sitting there in plain text. 

this script adds two buttons to the puzzle toolbar, styled and aligned to match the rest of the site's navbar:

1. **Show Solutions**: drops an svg text element underneath each cell's answer slot, styled in the exact same font, lowercase, and color as normal inputs, just slightly dimmed down. when toggled on, solution letters sit right below whatever you're typing as a guide.
2. **Solve Puzzle**: automatically writes all the answers straight into your input fields and triggers the game's grading check, completing the puzzle and saving it to local storage.

## usage

### 1. console
open devtools (`F12`) on any puzzle, paste [`overlay.js`](overlay.js) into the console, and hit enter.

### 2. bookmarklet
make a new bookmark and set the url to:

```javascript
javascript:(function(){const s=document.querySelector('.cx svg');if(!s||!window.grid)return alert('Crossword puzzle or grid not found!');if(!document.querySelector('#cw-ov-s')){const st=document.createElement('style');st.id='cw-ov-s';st.textContent='.cx-h{display:none;font-family:monospace;font-size:22px;fill:#000003;opacity:.32;pointer-events:none;user-select:none}.cx svg.sh .cx-h{display:inline}#cw-t-btn,#cw-s-btn{margin:0 3px!important;font-size:18px!important;padding:5px 12px!important;border-radius:5px!important;font-weight:normal!important;line-height:normal!important;font-family:inherit!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;vertical-align:middle!important;color:#fff!important;transition:background-color .15s ease}#cw-t-btn{background:#2563eb!important;border:1px solid #1d4ed8!important}#cw-t-btn.act{background:#059669!important;border-color:#047857!important}#cw-s-btn{background:#10b981!important;border:1px solid #059669!important}#cw-s-btn:hover{background:#059669!important}';document.head.appendChild(st);window.grid.forEach((r,ri)=>r.forEach((c,ci)=>{if(c&&c.char){const g=document.querySelector('#cx-'+ri+'-'+ci);if(g&&!g.querySelector('.cx-h')){const b=g.querySelector('.cx-a');if(!b)return;const h=document.createElementNS('http://www.w3.org/2000/svg','text');h.setAttribute('x',b.getAttribute('x'));h.setAttribute('y',b.getAttribute('y'));h.setAttribute('dy',b.getAttribute('dy')||'.28em');h.setAttribute('text-anchor','middle');h.setAttribute('class','cx-h');h.textContent=c.char.toLowerCase();g.insertBefore(h,b);}}}));const m=document.querySelector('.view-menu');if(m&&!document.querySelector('#cw-t-btn')){const btn=document.createElement('button');btn.id='cw-t-btn';btn.textContent='Show Solutions';btn.onclick=()=>{const on=s.classList.toggle('sh');btn.textContent=on?'Hide Solutions':'Show Solutions';btn.classList.toggle('act',on);};m.appendChild(btn);const sBtn=document.createElement('button');sBtn.id='cw-s-btn';sBtn.textContent='Solve Puzzle';sBtn.onclick=()=>{window.grid.forEach((r,ri)=>r.forEach((c,ci)=>{if(c&&c.char){const tn=document.querySelector('#cx-'+ri+'-'+ci+' .cx-a');if(tn)tn.textContent=c.char.toLowerCase();}}));const cl=$('#across li, #down li');if(cl.length>=2){$(cl[0]).trigger('click');$(cl[1]).trigger('click');}else{$('.cx g:first').trigger('click');$('.cx g:last').trigger('click');}};m.appendChild(sBtn);}}const on=s.classList.toggle('sh');const b=document.querySelector('#cw-t-btn');if(b){b.textContent=on?'Hide Solutions':'Show Solutions';b.classList.toggle('act',on);}})();
```

click it whenever you're on a puzzle to add both buttons to your toolbar.

### 3. userscript
install [`crosswordlabs-solutions.user.js`](crosswordlabs-solutions.user.js) in violentmonkey or tampermonkey if you want both buttons to load automatically on every puzzle.

## license

mit
