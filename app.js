'use strict';

const STORAGE_KEY = 'vetCalculatorGlobalConcentrations_v1';
const DEFAULTS = {
  dex:{name:'Dexmedetomidine',value:0.5,unit:'mg/mL',group:'Pain & anesthesia'},
  midz:{name:'Midazolam',value:5,unit:'mg/mL',group:'Pain & anesthesia'},
  buto:{name:'Butorphanol',value:10,unit:'mg/mL',group:'Pain & anesthesia'},
  prop:{name:'Propofol',value:10,unit:'mg/mL',group:'Pain & anesthesia'},
  alf:{name:'Alfaxalone',value:10,unit:'mg/mL',group:'Pain & anesthesia'},
  ket:{name:'Ketamine',value:100,unit:'mg/mL',group:'Pain & anesthesia'},
  bup:{name:'Buprenorphine',value:0.5,unit:'mg/mL',group:'Pain & anesthesia'},
  meth:{name:'Methadone',value:10,unit:'mg/mL',group:'Pain & anesthesia'},
  hydro:{name:'Hydromorphone',value:2,unit:'mg/mL',group:'Pain & anesthesia'},
  mel:{name:'Meloxicam',value:5,unit:'mg/mL',group:'Pain & anesthesia'},
  robe:{name:'Robenacoxib',value:20,unit:'mg/mL',group:'Pain & anesthesia'},
  maro:{name:'Maropitant',value:10,unit:'mg/mL',group:'GI drugs'},
  onda:{name:'Ondansetron',value:2,unit:'mg/mL',group:'GI drugs'},
  meto:{name:'Metoclopramide',value:5,unit:'mg/mL',group:'GI drugs'},
  famo:{name:'Famotidine',value:10,unit:'mg/mL',group:'GI drugs'},
  epi:{name:'Epinephrine',value:1,unit:'mg/mL',group:'Emergency'},
  atropine:{name:'Atropine',value:0.54,unit:'mg/mL',group:'Emergency'},
  naloxone:{name:'Naloxone',value:0.4,unit:'mg/mL',group:'Emergency'},
  flumazenil:{name:'Flumazenil',value:0.1,unit:'mg/mL',group:'Emergency'},
  dextrose:{name:'Dextrose',value:500,unit:'mg/mL',group:'Emergency'},
  calcium:{name:'Calcium gluconate',value:100,unit:'mg/mL',group:'Emergency'},
  magnesium:{name:'Magnesium sulfate',value:500,unit:'mg/mL',group:'Emergency'},
  norepi:{name:'Norepinephrine',value:1,unit:'mg/mL',group:'Emergency'},
  vasopressin:{name:'Vasopressin',value:20,unit:'units/mL',group:'Emergency'}
};

let concentrations = loadConcentrations();
let painSpecies = 'dog';
let fluidSpecies = 'dog';

function loadConcentrations() {
  const result = {};
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { saved = {}; }
  for (const [key, item] of Object.entries(DEFAULTS)) {
    const savedValue = Number(saved[key]);
    result[key] = {...item, value: Number.isFinite(savedValue) && savedValue > 0 ? savedValue : item.value};
  }
  return result;
}
function byId(id) { return document.getElementById(id); }
function numberFrom(id) { const raw = byId(id).value.trim(); return raw === '' ? NaN : Number(raw); }
function validWeight(value) { return Number.isFinite(value) && value > 0; }
function fmt(value, digits=2) { return Number.isFinite(value) ? value.toFixed(digits) : '—'; }
function concentration(key) { return Number(concentrations[key]?.value); }
function safeVolume(mg, key) { const c = concentration(key); return Number.isFinite(c) && c > 0 ? mg / c : NaN; }
function setText(id, text) { byId(id).textContent = text; }
function rangeHTML(low, high, weight, key, doseUnit='mg/kg') {
  if (!validWeight(weight)) return 'Enter a valid weight.';
  const c = concentration(key);
  if (!Number.isFinite(c) || c <= 0) return 'Set a valid concentration in Settings.';
  const lowAmount = low * weight, highAmount = high * weight;
  return `<span class="result-line">Dose: ${fmt(lowAmount)}–${fmt(highAmount)} mg <span class="sub-result">(${doseUnit})</span></span><span class="result-line">Volume: ${fmt(safeVolume(lowAmount,key))}–${fmt(safeVolume(highAmount,key))} mL</span><span class="result-line sub-result">Using ${fmt(c,3)} ${concentrations[key].unit}</span>`;
}
function oneDoseHTML(mgPerKg, weight, key) {
  if (!validWeight(weight)) return 'Enter a valid weight.';
  const c = concentration(key);
  if (!Number.isFinite(c) || c <= 0) return 'Set a valid concentration in Settings.';
  const amount = mgPerKg * weight;
  return `<span class="result-line">Amount: ${fmt(amount)} mg</span><span class="result-line">Volume: ${fmt(amount/c)} mL</span><span class="result-line sub-result">Using ${fmt(c,3)} ${concentrations[key].unit}</span>`;
}
function drugCard(title, note, resultId) {
  return `<article class="drug-card"><h3>${title}</h3><div class="dose-note">${note}</div><div class="result-box" id="${resultId}" aria-live="polite">Enter a valid weight.</div></article>`;
}
function buildDrugCards() {
  byId('pain-sedatives').innerHTML = [
    drugCard('Dexmedetomidine','Dog 1–5 µg/kg · Cat 5–10 µg/kg','out-dex'),
    drugCard('Midazolam','0.1–0.3 mg/kg','out-midz'),
    drugCard('Butorphanol','0.2–0.4 mg/kg','out-buto')
  ].join('');
  byId('pain-anesthetics').innerHTML = [
    drugCard('Propofol','Dog 2–6 mg/kg · Cat 4–8 mg/kg','out-prop'),
    drugCard('Alfaxalone','Dog 1–3 mg/kg · Cat 2–5 mg/kg','out-alf'),
    drugCard('Ketamine — bolus','1–5 mg/kg','out-ket-bolus'),
    drugCard('Ketamine — CRI','0.1–0.6 mg/kg/hr · volume shown per dose amount','out-ket-cri')
  ].join('');
  byId('pain-analgesia').innerHTML = [
    drugCard('Buprenorphine','0.01–0.02 mg/kg','out-bup'),
    drugCard('Methadone','Dog 0.2–0.5 mg/kg · Cat 0.1–0.3 mg/kg','out-meth'),
    drugCard('Hydromorphone','Dog 0.05–0.1 mg/kg · Cat 0.025–0.05 mg/kg','out-hydro'),
    drugCard('Gabapentin (PO)','10–20 mg/kg · amount only; verify formulation','out-gaba'),
    drugCard('Carprofen','4 mg/kg/day maximum · dogs only; verify protocol','out-car'),
    drugCard('Meloxicam','0.1–0.2 mg/kg · verify species-specific protocol','out-mel'),
    drugCard('Robenacoxib','1–2 mg/kg · verify species and route','out-robe')
  ].join('');
  byId('gi-drugs').innerHTML = [
    drugCard('Maropitant','1 mg/kg','out-maro'),
    drugCard('Ondansetron','0.1–0.2 mg/kg','out-onda'),
    drugCard('Metoclopramide','0.2–0.4 mg/kg','out-meto'),
    drugCard('Famotidine','0.5–1 mg/kg','out-famo'),
    drugCard('Pantoprazole','1 mg/kg IV · verify product reconstitution','out-panto'),
    drugCard('Sucralfate (PO)','Dog 0.5–1 g · Cat 0.25 g; verify patient-specific plan','out-sucr')
  ].join('');
  byId('emergency-drug').innerHTML = Object.entries(concentrations)
    .filter(([,item]) => item.group === 'Emergency')
    .map(([key,item]) => `<option value="${key}">${item.name}</option>`).join('');
}
function updateSpeciesButtons() {
  byId('species-dog').classList.toggle('selected', painSpecies === 'dog');
  byId('species-cat').classList.toggle('selected', painSpecies === 'cat');
  byId('fluid-dog').classList.toggle('selected', fluidSpecies === 'dog');
  byId('fluid-cat').classList.toggle('selected', fluidSpecies === 'cat');
}
function calcPain() {
  const w = numberFrom('pain-weight');
  const ids = ['out-dex','out-midz','out-buto','out-prop','out-alf','out-ket-bolus','out-ket-cri','out-bup','out-meth','out-hydro','out-gaba','out-car','out-mel','out-robe'];
  if (!validWeight(w)) { ids.forEach(id => setText(id,'Enter a valid weight.')); return; }
  const dexLow = painSpecies === 'dog' ? 1 : 5, dexHigh = painSpecies === 'dog' ? 5 : 10;
  const dexC = concentration('dex');
  byId('out-dex').innerHTML = Number.isFinite(dexC) && dexC > 0
    ? `<span class="result-line">Dose: ${fmt(w*dexLow)}–${fmt(w*dexHigh)} µg</span><span class="result-line">Volume: ${fmt((w*dexLow/1000)/dexC)}–${fmt((w*dexHigh/1000)/dexC)} mL</span><span class="result-line sub-result">Using ${fmt(dexC,3)} ${concentrations.dex.unit}</span>`
    : 'Set a valid concentration in Settings.';
  byId('out-midz').innerHTML = rangeHTML(.1,.3,w,'midz');
  byId('out-buto').innerHTML = rangeHTML(.2,.4,w,'buto');
  byId('out-prop').innerHTML = rangeHTML(painSpecies==='dog'?2:4,painSpecies==='dog'?6:8,w,'prop');
  byId('out-alf').innerHTML = rangeHTML(painSpecies==='dog'?1:2,painSpecies==='dog'?3:5,w,'alf');
  byId('out-ket-bolus').innerHTML = rangeHTML(1,5,w,'ket');
  byId('out-ket-cri').innerHTML = rangeHTML(.1,.6,w,'ket') + '<span class="result-line sub-result">Dose range is per hour; confirm dilution and infusion setup separately.</span>';
  byId('out-bup').innerHTML = rangeHTML(.01,.02,w,'bup');
  byId('out-meth').innerHTML = rangeHTML(painSpecies==='dog'?.2:.1,painSpecies==='dog'?.5:.3,w,'meth');
  byId('out-hydro').innerHTML = rangeHTML(painSpecies==='dog'?.05:.025,painSpecies==='dog'?.1:.05,w,'hydro');
  byId('out-gaba').innerHTML = `<span class="result-line">Amount: ${fmt(w*10,0)}–${fmt(w*20,0)} mg PO</span><span class="result-line sub-result">No volume calculated; formulation-dependent.</span>`;
  byId('out-car').textContent = painSpecies==='dog' ? `${fmt(w*4,1)} mg/day maximum by the displayed calculation; verify label and protocol.` : 'Not for cats.';
  byId('out-mel').innerHTML = rangeHTML(.1,.2,w,'mel');
  byId('out-robe').innerHTML = rangeHTML(1,2,w,'robe');
}
function calcFluids() {
  const w=numberFrom('fluid-weight'), d=numberFrom('dehydration'), ongoing=numberFrom('ongoing-losses');
  const out=byId('fluid-result');
  if (!validWeight(w)) { out.textContent='Enter a valid weight to calculate.'; return; }
  if (!Number.isFinite(d) || d<0 || d>15 || !Number.isFinite(ongoing) || ongoing<0) { out.textContent='Check dehydration (0–15%) and ongoing losses (0 or greater).'; return; }
  const maintenance=(fluidSpecies==='dog'?50:45)*w;
  const deficit=w*1000*(d/100);
  const daily=maintenance+deficit+ongoing*24;
  out.innerHTML=`<span class="result-line">Maintenance estimate: ${fmt(maintenance,1)} mL/day</span><span class="result-line">Estimated deficit: ${fmt(deficit,1)} mL</span><span class="result-line">First-day total including ongoing losses: ${fmt(daily,1)} mL/day</span><span class="result-line">24-hour average: ${fmt(daily/24,1)} mL/hr</span>`;
}
function calcNutrition() {
  const w=numberFrom('nutrition-weight'), meals=numberFrom('meals-per-day'), mult=numberFrom('nutrition-status');
  const out=byId('nutrition-result');
  if (!validWeight(w) || !Number.isFinite(meals) || meals<1 || !Number.isFinite(mult)) { out.textContent='Enter a valid weight and at least one meal per day.'; return; }
  const rer=70*Math.pow(w,.75), daily=rer*mult;
  out.innerHTML=`<span class="result-line">RER: ${fmt(rer,0)} kcal/day</span><span class="result-line">Estimated daily target: ${fmt(daily,0)} kcal/day</span><span class="result-line">Per meal: ${fmt(daily/meals,0)} kcal</span>`;
}
function calcGI() {
  const w=numberFrom('gi-weight');
  const ids=['out-maro','out-onda','out-meto','out-famo','out-panto','out-sucr'];
  if (!validWeight(w)) { ids.forEach(id=>setText(id,'Enter a valid weight.')); return; }
  byId('out-maro').innerHTML=oneDoseHTML(1,w,'maro');
  byId('out-onda').innerHTML=rangeHTML(.1,.2,w,'onda');
  byId('out-meto').innerHTML=rangeHTML(.2,.4,w,'meto');
  byId('out-famo').innerHTML=rangeHTML(.5,1,w,'famo');
  byId('out-panto').innerHTML=`<span class="result-line">Calculated amount: ${fmt(w)} mg IV</span><span class="result-line sub-result">No volume calculated: reconstitution and final concentration depend on product instructions.</span>`;
  byId('out-sucr').textContent=painSpecies==='dog'?'Dog: 0.5–1 g PO; verify patient-specific plan.':'Cat: 0.25 g PO; verify patient-specific plan.';
}
function calcEmergency() {
  const w=numberFrom('emergency-weight'), dose=numberFrom('emergency-dose'), key=byId('emergency-drug').value;
  const c=concentration(key), item=concentrations[key];
  byId('emergency-concentration').textContent=`Concentration: ${Number.isFinite(c)&&c>0?fmt(c,3)+' '+item.unit:'INVALID — update in Settings'}`;
  const out=byId('emergency-result');
  if (!validWeight(w) || !Number.isFinite(dose) || dose<=0) { out.textContent='Enter a weight and verified dose.'; return; }
  if (!Number.isFinite(c)||c<=0) { out.textContent='Invalid concentration. Update Settings before calculating.'; return; }
  if (item.unit !== 'mg/mL') { out.textContent='This product uses non-mass concentration units. This calculator cannot safely calculate its volume.'; return; }
  const amount=dose*w;
  out.innerHTML=`<span class="result-line">Calculated amount: ${fmt(amount)} mg</span><span class="result-line">Calculated volume: ${fmt(amount/c)} mL</span><span class="result-line sub-result">${fmt(dose,4)} mg/kg × ${fmt(w,2)} kg ÷ ${fmt(c,3)} mg/mL</span>`;
}
function renderSettings() {
  const list=byId('settings-list'); list.innerHTML='';
  let lastGroup='';
  for (const [key,item] of Object.entries(concentrations)) {
    if (item.group!==lastGroup) {
      const heading=document.createElement('h3'); heading.className='settings-group-title'; heading.textContent=item.group; list.appendChild(heading); lastGroup=item.group;
    }
    const row=document.createElement('div'); row.className='settings-item';
    const title=document.createElement('strong'); title.textContent=item.name;
    const control=document.createElement('div'); control.className='setting-control';
    const field=document.createElement('div');
    const label=document.createElement('label'); label.htmlFor=`conc-${key}`; label.textContent=`Concentration (${item.unit})`;
    const input=document.createElement('input'); input.id=`conc-${key}`; input.dataset.concentrationKey=key; input.type='number'; input.min='0'; input.step='any'; input.inputMode='decimal'; input.value=String(item.value); input.setAttribute('aria-label',`${item.name} concentration in ${item.unit}`);
    field.append(label,input);
    const unit=document.createElement('span'); unit.className='unit-label'; unit.textContent=item.group;
    control.append(field,unit); row.append(title,control); list.appendChild(row);
  }
}
function saveSettings() {
  const inputs=[...document.querySelectorAll('[data-concentration-key]')];
  const candidate={}; const invalid=[];
  for (const input of inputs) {
    const key=input.dataset.concentrationKey, raw=input.value.trim(), value=raw===''?NaN:Number(raw);
    if (!Number.isFinite(value)||value<=0) { invalid.push(concentrations[key].name); input.setAttribute('aria-invalid','true'); }
    else { candidate[key]=value; input.removeAttribute('aria-invalid'); }
  }
  if (invalid.length) { byId('settings-message').textContent=`Correct these concentrations (must be greater than zero): ${invalid.join(', ')}.`; return; }
  for (const [key,value] of Object.entries(candidate)) concentrations[key].value=value;
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(Object.fromEntries(Object.entries(concentrations).map(([key,item])=>[key,item.value])))); byId('settings-message').textContent='Settings saved on this device. Calculations updated.'; }
  catch (_) { byId('settings-message').textContent='Settings updated for this session, but browser storage is unavailable; changes may not persist.'; }
  calcPain(); calcGI(); calcEmergency();
}
function restoreDefaults() {
  if (!window.confirm('Restore every medication concentration to its default value? Your saved concentration settings on this device will be replaced.')) return;
  concentrations=Object.fromEntries(Object.entries(DEFAULTS).map(([key,item])=>[key,{...item}]));
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* session still resets */ }
  renderSettings(); calcPain(); calcGI(); calcEmergency();
  byId('settings-message').textContent='Default values restored. Verify against actual product labels before use.';
}
function showTab(tabId) {
  document.querySelectorAll('.nav-button').forEach(button=>button.classList.toggle('active',button.dataset.tab===tabId));
  document.querySelectorAll('.tab').forEach(section=>section.classList.toggle('active',section.id===tabId));
  if (tabId==='emergency') calcEmergency();
}

// Navigation and controls
for (const button of document.querySelectorAll('.nav-button')) button.addEventListener('click',()=>showTab(button.dataset.tab));
byId('species-dog').addEventListener('click',()=>{painSpecies='dog';updateSpeciesButtons();calcPain();calcGI();});
byId('species-cat').addEventListener('click',()=>{painSpecies='cat';updateSpeciesButtons();calcPain();calcGI();});
byId('fluid-dog').addEventListener('click',()=>{fluidSpecies='dog';updateSpeciesButtons();calcFluids();});
byId('fluid-cat').addEventListener('click',()=>{fluidSpecies='cat';updateSpeciesButtons();calcFluids();});
byId('pain-weight').addEventListener('input',calcPain);
byId('fluid-weight').addEventListener('input',calcFluids); byId('dehydration').addEventListener('input',calcFluids); byId('ongoing-losses').addEventListener('input',calcFluids);
byId('nutrition-weight').addEventListener('input',calcNutrition); byId('nutrition-status').addEventListener('change',calcNutrition); byId('meals-per-day').addEventListener('input',calcNutrition);
byId('gi-weight').addEventListener('input',calcGI);
byId('emergency-weight').addEventListener('input',calcEmergency); byId('emergency-dose').addEventListener('input',calcEmergency); byId('emergency-drug').addEventListener('change',calcEmergency);
byId('save-settings').addEventListener('click',saveSettings); byId('restore-settings').addEventListener('click',restoreDefaults);

buildDrugCards(); renderSettings(); updateSpeciesButtons(); calcPain(); calcGI(); calcEmergency();
