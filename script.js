// ─── Counter on hero ──────────────────────────────────────────
function animateCounter(el, target, decimals, duration = 1800) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = target * eased;
    el.textContent = v.toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals);
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll('[data-counter]').forEach(el => {
  const target = parseFloat(el.dataset.counter);
  const decimals = parseInt(el.dataset.decimals || '0');
  animateCounter(el, target, decimals);
});

// ─── Reveal on scroll ─────────────────────────────────────────
const revealTargets = document.querySelectorAll(
  '.section-title, .section-lede, .compare-card, .stat-block, .layer-card, .force-card, .chain-node, .upside, .reel-card, .printing-card, .factor-row'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// ─── Reel data ────────────────────────────────────────────────
const reelData = [
  { y: 2000, m2: 4.9,  inr: 44.9,  title: "The calm before",         tag: "BASELINE",       desc: "Fed balance sheet small. Oil at $30. India just beginning to rise.", color: "amber" },
  { y: 2001, m2: 5.4,  inr: 47.2,  title: "Dot-com bust and 9/11",   tag: "FIRST SHOCK",    desc: "Fed slashes rates. M2 jumps. Dollar liquidity expands.", color: "coral" },
  { y: 2003, m2: 6.0,  inr: 45.6,  title: "Iraq war begins",         tag: "OIL SURGE",      desc: "Military spending rises. Oil climbs past $40.", color: "coral" },
  { y: 2005, m2: 6.6,  inr: 44.1,  title: "Bull market boom",        tag: "INFLOW ERA",     desc: "Cheap money fuels global asset bubble. Capital floods India.", color: "teal" },
  { y: 2008, m2: 8.2,  inr: 48.4,  title: "Global financial crisis", tag: "BIG BANG",       desc: "Fed launches QE1. Trillions printed. Capital flees emerging markets.", color: "coral" },
  { y: 2010, m2: 8.8,  inr: 45.6,  title: "QE2 launched",            tag: "MORE PRINTING",  desc: "Fed buys $600B more bonds. Dollars flood the system again.", color: "blue" },
  { y: 2013, m2: 11.0, inr: 61.9,  title: "Taper tantrum",           tag: "RUPEE CRISIS",   desc: "Fed hints at ending QE. Rupee crashes 20% in months.", color: "coral" },
  { y: 2015, m2: 12.4, inr: 66.3,  title: "Strong dollar era",       tag: "DXY PEAK",       desc: "Fed ends QE. Dollar surges globally. EM currencies weaken.", color: "blue" },
  { y: 2018, m2: 14.4, inr: 70.1,  title: "Trade war and QT",        tag: "PRESSURE",       desc: "Tariffs and tightening. Oil rises to $80. Rupee crosses ₹70.", color: "amber" },
  { y: 2020, m2: 19.1, inr: 74.1,  title: "COVID money printer",     tag: "UNPRECEDENTED",  desc: "Fed prints $4T in months. Largest expansion in history.", color: "coral" },
  { y: 2022, m2: 21.9, inr: 82.8,  title: "Inflation breaks out",    tag: "PAYBACK TIME",   desc: "9% inflation. Fed hikes 525bps. Dollar surges. Rupee past ₹80.", color: "coral" },
  { y: 2023, m2: 20.8, inr: 83.2,  title: "QT continues",            tag: "TIGHT MONEY",    desc: "Rates highest in 22 years. Dollar stays strong.", color: "blue" },
  { y: 2024, m2: 21.5, inr: 84.5,  title: "Soft landing hopes",      tag: "STEADY GRIND",   desc: "Fed pauses. M2 starts growing again. Rupee depreciates slowly.", color: "amber" },
  { y: 2025, m2: 22.4, inr: 88.4,  title: "Growth slowdown",         tag: "OUTFLOW SIGNS",  desc: "FIIs pull out $15B. Rupee crosses ₹88.", color: "amber" },
  { y: 2026, m2: 22.7, inr: 95.96, title: "Iran–US conflict",        tag: "PERFECT STORM",  desc: "Brent at $105. Rupee at ₹95.96. Asia's weakest currency.", color: "coral" }
];

const reelColors = {
  amber: { bg: "#FAEEDA", border: "#BA7517", title: "#412402", text: "#854F0B", tagBg: "rgba(186,117,23,0.25)", tagText: "#412402" },
  coral: { bg: "#FAECE7", border: "#D85A30", title: "#4A1B0C", text: "#993C1D", tagBg: "rgba(216,90,48,0.22)",  tagText: "#4A1B0C" },
  teal:  { bg: "#E1F5EE", border: "#1D9E75", title: "#04342C", text: "#0F6E56", tagBg: "rgba(29,158,117,0.22)", tagText: "#04342C" },
  blue:  { bg: "#E6F1FB", border: "#378ADD", title: "#042C53", text: "#185FA5", tagBg: "rgba(55,138,221,0.22)", tagText: "#042C53" }
};

let reelIdx = 0;
let reelPlaying = false;
let reelTimer = null;

const canvas = document.getElementById('reelChart');
const ctx = canvas.getContext('2d');
const DPR = window.devicePixelRatio || 1;

function sizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * DPR;
  canvas.height = rect.height * DPR;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(DPR, DPR);
}
sizeCanvas();

function drawChart() {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  ctx.clearRect(0, 0, w, h);

  const padL = 14, padR = 14, padT = 22, padB = 28;
  const cw = w - padL - padR;
  const ch = h - padT - padB;
  const yMin = 2000, yMax = 2026;
  const m2Max = 24, inrMax = 100;

  // gridlines
  ctx.strokeStyle = 'rgba(26, 22, 20, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (ch / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + cw, y);
    ctx.stroke();
  }

  const m2Points = reelData.slice(0, reelIdx + 1);
  const inrPoints = reelData.slice(0, reelIdx + 1);

  // M2 area fill
  if (m2Points.length > 1) {
    ctx.fillStyle = 'rgba(55, 138, 221, 0.14)';
    ctx.beginPath();
    m2Points.forEach((p, i) => {
      const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
      const y = padT + ch - (p.m2 / m2Max) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    const lastX = padL + ((m2Points[m2Points.length - 1].y - yMin) / (yMax - yMin)) * cw;
    ctx.lineTo(lastX, padT + ch);
    ctx.lineTo(padL, padT + ch);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#378ADD';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    m2Points.forEach((p, i) => {
      const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
      const y = padT + ch - (p.m2 / m2Max) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // INR line
  if (inrPoints.length > 1) {
    ctx.strokeStyle = '#D85A30';
    ctx.lineWidth = 3;
    ctx.beginPath();
    inrPoints.forEach((p, i) => {
      const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
      const y = padT + ch - (p.inr / inrMax) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // markers on current point
  if (m2Points.length) {
    const p = m2Points[m2Points.length - 1];
    const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
    const y = padT + ch - (p.m2 / m2Max) * ch;
    ctx.fillStyle = '#378ADD';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  if (inrPoints.length) {
    const p = inrPoints[inrPoints.length - 1];
    const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
    const y = padT + ch - (p.inr / inrMax) * ch;
    ctx.fillStyle = '#D85A30';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // labels
  ctx.fillStyle = '#8A847A';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('US M2 (trillions $)', padL, h - 8);
  ctx.textAlign = 'right';
  ctx.fillText('USD / INR', w - padR, h - 8);
}

function updateReelUi() {
  const d = reelData[reelIdx];
  const prev = reelIdx > 0 ? reelData[reelIdx - 1] : null;
  const c = reelColors[d.color];

  document.getElementById('reelYear').textContent = d.y;
  document.getElementById('reelM2').textContent = '$' + d.m2.toFixed(1) + 'T';
  document.getElementById('reelInr').textContent = '₹' + d.inr.toFixed(2);

  if (prev) {
    const m2Pct = ((d.m2 - prev.m2) / prev.m2 * 100);
    const inrPct = ((d.inr - prev.inr) / prev.inr * 100);
    document.getElementById('reelM2Delta').textContent = (m2Pct >= 0 ? '+' : '') + m2Pct.toFixed(1) + '% vs ' + prev.y;
    document.getElementById('reelInrDelta').textContent = (inrPct >= 0 ? '+' : '') + inrPct.toFixed(1) + '% vs ' + prev.y;
  } else {
    document.getElementById('reelM2Delta').textContent = 'starting point';
    document.getElementById('reelInrDelta').textContent = 'starting point';
  }

  const event = document.getElementById('reelEvent');
  event.style.background = c.bg;
  event.style.borderLeftColor = c.border;

  const title = document.getElementById('reelTitle');
  title.textContent = d.title;
  title.style.color = c.title;

  const tag = document.getElementById('reelTag');
  tag.textContent = d.tag;
  tag.style.background = c.tagBg;
  tag.style.color = c.tagText;

  const desc = document.getElementById('reelDesc');
  desc.textContent = d.desc;
  desc.style.color = c.text;

  const pct = (reelIdx / (reelData.length - 1)) * 100;
  document.getElementById('reelProgress').style.width = pct + '%';

  drawChart();
}

function reelStep() {
  if (reelIdx < reelData.length - 1) {
    reelIdx++;
    updateReelUi();
  } else {
    reelPause();
  }
}

function setPlayLabel(label, icon) {
  document.getElementById('reelPlayLabel').textContent = label;
  const btn = document.getElementById('reelPlay');
  const svg = btn.querySelector('svg');
  if (icon === 'pause') {
    svg.innerHTML = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
  } else {
    svg.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function reelPlay() {
  reelPlaying = true;
  setPlayLabel('Pause', 'pause');
  const speed = parseInt(document.getElementById('reelSpeed').value);
  reelTimer = setInterval(reelStep, speed);
}

function reelPause() {
  reelPlaying = false;
  clearInterval(reelTimer);
  setPlayLabel(reelIdx >= reelData.length - 1 ? 'Replay' : 'Resume', 'play');
}

function reelReset() {
  reelPause();
  reelIdx = 0;
  updateReelUi();
  setPlayLabel('Start reel', 'play');
}

document.getElementById('reelPlay').addEventListener('click', () => {
  if (reelIdx >= reelData.length - 1 && !reelPlaying) {
    reelIdx = 0;
    updateReelUi();
    reelPlay();
    return;
  }
  if (reelPlaying) reelPause();
  else reelPlay();
});

document.getElementById('reelReset').addEventListener('click', reelReset);

document.getElementById('reelSpeed').addEventListener('change', function () {
  if (reelPlaying) {
    clearInterval(reelTimer);
    reelTimer = setInterval(reelStep, parseInt(this.value));
  }
});

window.addEventListener('resize', () => {
  sizeCanvas();
  drawChart();
});

updateReelUi();

// ─── Auto-play reel when it scrolls into view ─────────────────
const reelTrigger = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && reelIdx === 0 && !reelPlaying) {
      setTimeout(() => reelPlay(), 600);
      reelTrigger.unobserve(e.target);
    }
  });
}, { threshold: 0.45 });

reelTrigger.observe(document.querySelector('.reel-card'));

// ─── Smooth nav highlight ─────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-links a');
const sections = ['#puzzle', '#timeline', '#printing', '#system', '#forces', '#simulator', '#currencies', '#impact', '#references']
  .map(id => document.querySelector(id))
  .filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === id ? 'var(--ink)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// ─── Value simulator ───────────────────────────────────────────
const SIM_BASE = { oil: 105, dxy: 98.3, fii: -21, fed: 5.0, rbi: 0 };
const SIM_BASE_RATE = 95.96;
// Sensitivities: rupees per unit delta from baseline
const SIM_BETA = {
  oil: 0.05,    // ₹/bbl  → $10 = ₹0.50
  dxy: 0.25,    // ₹/point
  fii: -0.04,   // ₹/$B  (positive FII inflow strengthens rupee, so beta negative)
  fed: 1.20,    // ₹/percentage point
  rbi: -0.06    // ₹/$B sold (more defense = stronger rupee)
};

const SIM_PRESETS = {
  current: { oil: 105, dxy: 98.3, fii: -21, fed: 5.0,  rbi: 0,  label: "Current state (May 2026)" },
  best:    { oil: 75,  dxy: 92.0, fii: 15,  fed: 3.0,  rbi: 8,  label: "Best-case recovery" },
  hormuz:  { oil: 150, dxy: 103,  fii: -50, fed: 5.75, rbi: 25, label: "Hormuz closure" },
  covid:   { oil: 40,  dxy: 92.5, fii: -28, fed: 0.25, rbi: 12, label: "COVID-style shock" },
  taper:   { oil: 110, dxy: 85.0, fii: -35, fed: 2.25, rbi: 30, label: "2013 taper tantrum" }
};

function fmtSigned(n, decimals = 2, symbol = '₹') {
  const sign = n >= 0 ? '+' : '−';
  return sign + symbol + Math.abs(n).toFixed(decimals);
}

function fmtFii(b) {
  if (b >= 0) return '+' + b;
  return '−' + Math.abs(b);
}

function simContributions(v) {
  return {
    oil: (v.oil - SIM_BASE.oil) * SIM_BETA.oil,
    dxy: (v.dxy - SIM_BASE.dxy) * SIM_BETA.dxy,
    fii: (v.fii - SIM_BASE.fii) * SIM_BETA.fii,
    fed: (v.fed - SIM_BASE.fed) * SIM_BETA.fed,
    rbi: (v.rbi - SIM_BASE.rbi) * SIM_BETA.rbi
  };
}

function verdictFor(rate, total) {
  if (rate < 80) {
    return { state: 'better', label: 'STRENGTHENING',
      text: 'The rupee has rallied meaningfully below ₹80. Imports get cheaper, inflation eases, and the RBI can rebuild reserves rather than burn them.' };
  }
  if (rate < 92) {
    return { state: 'better', label: 'SOLID',
      text: 'Healthy territory. India\'s macro looks steady. FII flows would likely turn positive at these levels.' };
  }
  if (rate < 97) {
    return { state: 'neutral', label: 'AROUND CURRENT',
      text: 'Roughly where the rupee is today. The forces are in balance — neither pushing it sharply higher nor lower than ₹95–96.' };
  }
  if (rate < 102) {
    return { state: 'worse', label: 'UNDER PRESSURE',
      text: 'The rupee is weaker than today and pressing the psychological ₹100 mark. Expect RBI intervention to slow the slide.' };
  }
  if (rate < 110) {
    return { state: 'worse', label: 'WEAK',
      text: 'Past ₹100 in headlines and onto the front page. RBI defense will be aggressive. Inflation pressure builds quickly through fuel and imports.' };
  }
  if (rate < 120) {
    return { state: 'crisis', label: 'CRISIS',
      text: 'Severe stress. NRI bond raises, gold import restrictions, and emergency capital controls move onto the table. 2013-style measures likely.' };
  }
  return { state: 'crisis', label: 'BREAKING POINT',
    text: 'A 1991-style balance of payments situation. IMF conversations begin. Deep policy intervention becomes unavoidable.' };
}

const sim = {
  oil: document.getElementById('ctlOil'),
  dxy: document.getElementById('ctlDxy'),
  fii: document.getElementById('ctlFii'),
  fed: document.getElementById('ctlFed'),
  rbi: document.getElementById('ctlRbi')
};

function readSim() {
  return {
    oil: parseFloat(sim.oil.value),
    dxy: parseFloat(sim.dxy.value),
    fii: parseFloat(sim.fii.value),
    fed: parseFloat(sim.fed.value),
    rbi: parseFloat(sim.rbi.value)
  };
}

function updateSim() {
  const v = readSim();
  const c = simContributions(v);
  const total = c.oil + c.dxy + c.fii + c.fed + c.rbi;
  const rate = SIM_BASE_RATE + total;

  document.getElementById('valOil').textContent = v.oil.toFixed(0);
  document.getElementById('valDxy').textContent = v.dxy.toFixed(1);
  document.getElementById('valFii').textContent = fmtFii(v.fii);
  document.getElementById('valFed').textContent = v.fed.toFixed(2);
  document.getElementById('valRbi').textContent = v.rbi.toFixed(0);

  const setBd = (id, val) => {
    const el = document.getElementById(id);
    el.textContent = fmtSigned(val, 2);
    el.classList.toggle('up', val > 0.005);
    el.classList.toggle('down', val < -0.005);
  };
  setBd('bdOil', c.oil);
  setBd('bdDxy', c.dxy);
  setBd('bdFii', c.fii);
  setBd('bdFed', c.fed);
  setBd('bdRbi', c.rbi);
  setBd('bdTotal', total);

  const out = document.getElementById('simOut');
  out.textContent = '₹' + rate.toFixed(2);
  out.classList.remove('is-better', 'is-worse', 'is-crisis');
  if (rate < 90) out.classList.add('is-better');
  else if (rate > 110) out.classList.add('is-crisis');
  else if (rate > 98) out.classList.add('is-worse');

  const delta = document.getElementById('simDelta');
  if (Math.abs(total) < 0.005) {
    delta.textContent = 'no change from current ₹95.96';
  } else {
    const dir = total > 0 ? 'weaker than' : 'stronger than';
    delta.textContent = fmtSigned(total) + ' · ' + dir + ' current ₹95.96';
  }

  // Marker on meter — meter spans 65 to 125
  const meterMin = 65, meterMax = 125;
  const clamped = Math.max(meterMin, Math.min(meterMax, rate));
  const pct = ((clamped - meterMin) / (meterMax - meterMin)) * 100;
  document.getElementById('simMarker').style.left = pct + '%';

  const verdict = verdictFor(rate, total);
  const vEl = document.getElementById('simVerdict');
  vEl.classList.remove('is-better', 'is-crisis');
  if (verdict.state === 'better') vEl.classList.add('is-better');
  else if (verdict.state === 'crisis') vEl.classList.add('is-crisis');
  vEl.querySelector('.sim-verdict-label').textContent = 'VERDICT · ' + verdict.label;
  vEl.querySelector('.sim-verdict-text').textContent = verdict.text;

  // Highlight active preset if matches
  const presetKey = Object.keys(SIM_PRESETS).find(k => {
    const p = SIM_PRESETS[k];
    return Math.abs(p.oil - v.oil) < 0.5 && Math.abs(p.dxy - v.dxy) < 0.05
      && Math.abs(p.fii - v.fii) < 0.5 && Math.abs(p.fed - v.fed) < 0.05
      && Math.abs(p.rbi - v.rbi) < 0.5;
  });
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === presetKey);
  });
}

Object.values(sim).forEach(el => el.addEventListener('input', updateSim));

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = SIM_PRESETS[btn.dataset.preset];
    if (!p) return;
    sim.oil.value = p.oil;
    sim.dxy.value = p.dxy;
    sim.fii.value = p.fii;
    sim.fed.value = p.fed;
    sim.rbi.value = p.rbi;
    updateSim();
  });
});

updateSim();

// ─── Currency tool ─────────────────────────────────────────────
const CURRENCIES = {
  EUR: { name: "Euro", code: "EUR", flag: "🇪🇺", rate: "€0.94", ytd: -2.4, since: -4.0, cat: "Reserve currency", verdict: "Resilient",
    story: "The euro is structurally weaker than the dollar in 2026 — ECB rates sit below Fed rates and the eurozone imports more energy than the US. But because the euro is itself a reserve currency, it doesn't collapse the way emerging-market currencies do.",
    vsInr: "Both currencies are weaker against the dollar this year — but the euro's gentle slide reflects Europe's structural buffer as a reserve issuer. India has no such cushion." },
  JPY: { name: "Japanese yen", code: "JPY", flag: "🇯🇵", rate: "¥158.20", ytd: -8.5, since: -35.0, cat: "Reserve currency", verdict: "Weak",
    story: "The yen is in the worst stretch of its modern history. The Bank of Japan held rates at zero for too long, and even as it now tightens, the gap with US yields remains huge. Capital piles into dollar assets via the carry trade.",
    vsInr: "The yen has fallen even harder than the rupee year-to-date, despite Japan being one of the largest holders of dollar reserves. Reserve status alone isn't enough when the yield differential is extreme." },
  GBP: { name: "British pound", code: "GBP", flag: "🇬🇧", rate: "£0.81", ytd: -1.8, since: -22.0, cat: "Reserve currency", verdict: "Holding",
    story: "Sterling has been one of the better-performing major currencies in 2026. The Bank of England has kept rates close to the Fed's level, narrowing the yield gap that hurts other currencies.",
    vsInr: "The pound is holding up where the rupee is buckling — a reminder that rate parity with the Fed matters more than economic size." },
  CNY: { name: "Chinese yuan", code: "CNY", flag: "🇨🇳", rate: "¥7.32", ytd: -2.1, since: 11.0, cat: "Managed peg", verdict: "Controlled",
    story: "Beijing keeps the yuan in a tight band against the dollar through heavy intervention and capital controls. Movement is allowed only on the People's Bank of China's terms.",
    vsInr: "The yuan moves on policy, not markets. China can defend any level it chooses because of $3T in reserves and a closed capital account. India, with a more open capital account, cannot." },
  KRW: { name: "South Korean won", code: "KRW", flag: "🇰🇷", rate: "₩1,420", ytd: -4.5, since: -25.0, cat: "Asian EM", verdict: "Pressured",
    story: "The won has weakened sharply on tech-driven export volatility and political uncertainty. Bank of Korea has the same dollar-strength problem as the RBI, but with a more open capital account.",
    vsInr: "Korea and India are running similar playbooks — managed depreciation, occasional intervention, accepting some weakness to support exports." },
  IDR: { name: "Indonesian rupiah", code: "IDR", flag: "🇮🇩", rate: "Rp16,800", ytd: -3.8, since: -78.0, cat: "Asian EM", verdict: "Pressured",
    story: "Indonesia has been one of the larger Asian losers in 2026, with foreign investors pulling out of equities. Bank Indonesia has intervened aggressively in the spot market.",
    vsInr: "Indonesia is in a similar boat — commodity importer, capital-account opener, FII-sensitive. The rupiah and rupee tend to move together when the dollar strengthens." },
  TRY: { name: "Turkish lira", code: "TRY", flag: "🇹🇷", rate: "₺48.50", ytd: -22.0, since: -98.0, cat: "Frontier EM", verdict: "Crisis",
    story: "The lira has been in a multi-year free fall driven by unorthodox monetary policy and chronic inflation. Real rates have been deeply negative for years.",
    vsInr: "The lira's collapse shows what happens when central bank credibility breaks. India has been disciplined — repo rates well above inflation — which is why the rupee is at ₹95 instead of ₹400." },
  BRL: { name: "Brazilian real", code: "BRL", flag: "🇧🇷", rate: "R$6.30", ytd: -10.0, since: -71.0, cat: "Commodity EM", verdict: "Weak",
    story: "The real has weakened despite commodity exporter status. Fiscal concerns and dovish central bank signals have outweighed strong terms of trade.",
    vsInr: "Brazil shows that even commodity exporters get crushed by dollar strength and fiscal worries. India's stronger fiscal position is helping the rupee relative to peers." },
  ZAR: { name: "South African rand", code: "ZAR", flag: "🇿🇦", rate: "R20.10", ytd: -8.5, since: -67.0, cat: "Commodity EM", verdict: "Weak",
    story: "The rand is one of the most liquid emerging market currencies and trades as a proxy for global risk. When dollar strength hits, the rand falls fastest.",
    vsInr: "The rand falls and rises with global sentiment. India's larger domestic economy means the rupee is less of a risk barometer — but it gets hit by the same dollar wave." },
  ARS: { name: "Argentine peso", code: "ARS", flag: "🇦🇷", rate: "ARS$1,850", ytd: -38.0, since: -99.9, cat: "Frontier EM", verdict: "Crisis",
    story: "The peso is in a perpetual currency crisis driven by chronic fiscal deficits, hyperinflation, and political instability. Multiple parallel exchange rates exist.",
    vsInr: "Argentina is the cautionary tale. India's macro discipline — primary fiscal balance, inflation targeting, building reserves — is exactly the playbook that keeps the rupee from becoming the peso." },
  RUB: { name: "Russian ruble", code: "RUB", flag: "🇷🇺", rate: "₽103", ytd: -5.0, since: -73.0, cat: "Sanctioned", verdict: "Distorted",
    story: "The ruble price is shaped by sanctions, capital controls, oil revenue, and limited dollar liquidity. The market price doesn't reflect normal supply-demand.",
    vsInr: "The ruble doesn't trade in a normal market anymore. The rupee, despite pressure, remains fully convertible on the current account — a feature India is keen to preserve." },
  CAD: { name: "Canadian dollar", code: "CAD", flag: "🇨🇦", rate: "C$1.42", ytd: -2.8, since: -1.0, cat: "Commodity G10", verdict: "Steady",
    story: "The Canadian dollar has held up because Canada's economy is closely linked to the US, and energy exports benefit from oil strength.",
    vsInr: "Canada has the rare advantage of being a major oil exporter — exactly the opposite of India. The CAD strengthens with oil. The rupee weakens." },
  AUD: { name: "Australian dollar", code: "AUD", flag: "🇦🇺", rate: "A$1.55", ytd: -3.5, since: -19.0, cat: "Commodity G10", verdict: "Soft",
    story: "The Aussie has weakened on China-growth concerns and a wider rate differential with the Fed. Iron ore prices have softened.",
    vsInr: "Australia is a commodity exporter to China and a Fed-rate taker. It's caught between the same forces hitting India, just with a different commodity profile." },
  CHF: { name: "Swiss franc", code: "CHF", flag: "🇨🇭", rate: "CHF 0.91", ytd: 0.5, since: 47.0, cat: "Safe haven", verdict: "Strong",
    story: "The franc is the world's purest safe haven. When global risk rises, capital piles into Swiss francs and Swiss government bonds. The SNB even runs negative rates to slow appreciation.",
    vsInr: "The franc and the rupee are at opposite poles. The franc benefits from risk-off. The rupee gets crushed by it. This is the asymmetry of being a reserve issuer versus an importer." },
  MXN: { name: "Mexican peso", code: "MXN", flag: "🇲🇽", rate: "$20.50", ytd: -5.8, since: -45.0, cat: "Commodity EM", verdict: "Soft",
    story: "The peso was a star performer of the 2020s carry trade but has weakened in 2026 on political reform concerns and a narrower Banxico-Fed spread.",
    vsInr: "Mexico is geographically and commercially next to the US — usually a stabilizer. Even that hasn't been enough in 2026, showing how dominant the dollar story has been." }
};

function buildScoreboard() {
  const rows = Object.values(CURRENCIES)
    .map(c => ({ ...c }))
    .sort((a, b) => b.ytd - a.ytd);

  const target = document.getElementById('ccyScoreboard');
  if (!target) return;
  target.innerHTML = '';
  rows.forEach(c => {
    const row = document.createElement('div');
    row.className = 'ccy-row';
    row.dataset.code = c.code;
    const ytdClass = c.ytd >= 0 ? 'pos' : 'neg';
    const ytdStr = (c.ytd >= 0 ? '+' : '−') + Math.abs(c.ytd).toFixed(1) + '%';
    row.innerHTML = `
      <span class="ccy-row-flag">${c.flag}</span>
      <span class="ccy-row-name">${c.name}</span>
      <span class="ccy-row-pct ${ytdClass}">${ytdStr}</span>
    `;
    row.addEventListener('click', () => {
      const dd = document.getElementById('ccyPick');
      dd.value = c.code;
      renderCcy(c.code);
    });
    target.appendChild(row);
  });
}

function renderCcy(code) {
  const c = CURRENCIES[code];
  if (!c) return;
  document.getElementById('ccyFlag').textContent = c.flag;
  document.getElementById('ccyName').textContent = c.name;
  document.getElementById('ccyCode').textContent = c.code + ' · vs USD';
  document.getElementById('ccyRate').textContent = c.rate;

  const fmtPct = (n) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1) + '%';
  document.getElementById('ccyYtd').textContent = fmtPct(c.ytd);
  document.getElementById('ccySince').textContent = fmtPct(c.since);
  document.getElementById('ccyCat').textContent = c.cat;
  document.getElementById('ccyVerdict').textContent = c.verdict;
  document.getElementById('ccyStory').textContent = c.story;
  document.getElementById('ccyVsInr').textContent = c.vsInr;

  document.querySelectorAll('.ccy-row').forEach(r => {
    r.classList.toggle('is-selected', r.dataset.code === code);
  });
}

const ccyPick = document.getElementById('ccyPick');
if (ccyPick) {
  ccyPick.addEventListener('change', () => renderCcy(ccyPick.value));
  buildScoreboard();
  renderCcy(ccyPick.value);
}

// ─── Internationalization (EN / HI) ────────────────────────────
const I18N = {
  en: {
    'nav.puzzle': 'Puzzle',
    'nav.timeline': 'Timeline',
    'nav.printing': 'USD Printing',
    'nav.system': 'The System',
    'nav.forces': 'Forces',
    'nav.simulator': 'Simulator',
    'nav.currencies': 'Currencies',
    'nav.impact': 'Impact',
    'nav.data': 'Data',
    'hero.date': 'MAY 14, 2026',
    'hero.sub': 'All-time low against the dollar',
    'hero.puzzleLabel': 'THE PUZZLE',
    'hero.puzzle': 'The US has been printing dollars for decades.<br>So why is the rupee falling, not the dollar?',
    'hero.cta': 'Read the story',
    'puzzle.label': 'THE INTUITION FAILS',
    'puzzle.title': 'More dollars in the world should mean a cheaper dollar.',
    'puzzle.lede': "For any normal currency, that's exactly what happens. But the dollar isn't normal. It's the world's plumbing — and when the world gets anxious, every importing country needs more dollars, faster than the Fed can print them.",
    'timeline.label': '26 YEARS, TWO LINES',
    'timeline.title': 'The US printed. The rupee fell. They moved together — not apart.',
    'printing.label': 'HOW USD PRINTING WORKS',
    'printing.title': 'When the Fed "prints," it doesn\'t run physical presses.',
    'printing.lede': 'The dollar supply expands through the banking system — and the way it expands determines whether the rupee gets a boost or a beating.',
    'system.label': 'THE SYSTEM',
    'system.title': 'The puzzle resolves in three layers.',
    'forces.label': 'THE FOUR FORCES',
    'forces.title': 'Every dollar-demand stream is firing at once.',
    'forces.lede': 'No single factor explains the slide. Four forces are stacking on top of each other in 2026 — and the rupee has nowhere to hide.',
    'sim.label': 'VALUE SIMULATOR',
    'sim.title': 'Move the sliders. Watch the rupee respond.',
    'sim.lede': 'A simplified linear model of the five major forces — oil, dollar strength, capital flows, Fed policy, and RBI defense. Adjust any input and the projected USD/INR updates instantly.',
    'ccy.label': 'CROSS-CURRENCY IMPACT',
    'ccy.title': "India isn't alone. The dollar is moving everyone.",
    'ccy.lede': "Pick any currency below to see how it's responding to the same forces hitting the rupee — and why some are holding up while others are buckling.",
    'impact.label': 'THE IMPACT CHAIN',
    'impact.title': 'How rupee weakness reaches your wallet.',
    'impact.lede': 'A weaker rupee triggers three first-order effects — and each one cascades into something the household, the firm, or the central bank feels directly.',
    'ref.label': 'REFERENCES & DATA',
    'ref.title': 'The numbers, and where they come from.',
    'ref.lede': 'Every figure cited on this page, with its source and the date it was last verified. The data is a snapshot in time — exchange rates and yields move every minute.',
    'math.label': 'BASIC MATH',
    'math.title': 'See the formula behind the projection.',
    'math.lede': "Each slider has a coefficient. Subtract today's baseline. Multiply. Add them up. That's the model — no hidden steps.",
    'math.formula': 'Projected ₹/$ = ₹95.96 + Σ ( coefficient × (current value − baseline) )',
    'math.amount': 'Convert an amount',
    'math.amountHelp': 'See what $1,000 costs today versus at the simulated rate.',
    'math.usd': 'Dollars (USD)',
    'math.inrToday': "At today's ₹95.96",
    'math.inrSim': 'At simulated rate',
    'math.diff': 'Difference',
    'math.cheaper': 'cheaper',
    'math.costlier': 'costlier',
    'math.flat': 'same as today',
  },
  hi: {
    'nav.puzzle': 'पहेली',
    'nav.timeline': 'समयरेखा',
    'nav.printing': 'डॉलर छपाई',
    'nav.system': 'व्यवस्था',
    'nav.forces': 'बल',
    'nav.simulator': 'सिम्युलेटर',
    'nav.currencies': 'मुद्राएँ',
    'nav.impact': 'प्रभाव',
    'nav.data': 'डेटा',
    'hero.date': '14 मई, 2026',
    'hero.sub': 'डॉलर के मुकाबले अब तक का सबसे कम स्तर',
    'hero.puzzleLabel': 'पहेली',
    'hero.puzzle': 'अमेरिका दशकों से डॉलर छाप रहा है।<br>तो रुपया क्यों गिर रहा है, डॉलर क्यों नहीं?',
    'hero.cta': 'कहानी पढ़ें',
    'puzzle.label': 'अनुमान विफल',
    'puzzle.title': 'दुनिया में अधिक डॉलर का अर्थ है सस्ता डॉलर — होना चाहिए।',
    'puzzle.lede': 'किसी भी सामान्य मुद्रा के साथ यही होता है। लेकिन डॉलर सामान्य नहीं है। यह दुनिया की पाइपलाइन है — और जब दुनिया घबराती है, हर आयातक देश को ज़्यादा डॉलर चाहिए, फेड के छापने की रफ़्तार से भी तेज़।',
    'timeline.label': '26 वर्ष, दो रेखाएँ',
    'timeline.title': 'अमेरिका ने छापा। रुपया गिरा। वे साथ-साथ चले — अलग नहीं।',
    'printing.label': 'डॉलर छपाई कैसे काम करती है',
    'printing.title': 'जब फेड "छापता" है, तो असली प्रिंटिंग प्रेस नहीं चलती।',
    'printing.lede': 'डॉलर की आपूर्ति बैंकिंग सिस्टम के ज़रिए बढ़ती है — और जिस तरह यह बढ़ती है वही तय करती है कि रुपये को राहत मिलेगी या मार।',
    'system.label': 'व्यवस्था',
    'system.title': 'पहेली तीन परतों में सुलझती है।',
    'forces.label': 'चार बल',
    'forces.title': 'हर डॉलर-माँग की धारा एक साथ चल रही है।',
    'forces.lede': 'कोई एक कारण इस गिरावट को नहीं समझाता। 2026 में चार बल एक-दूसरे के ऊपर ढेर हो रहे हैं — और रुपये के पास छिपने की जगह नहीं है।',
    'sim.label': 'मान सिम्युलेटर',
    'sim.title': 'स्लाइडर सरकाओ। देखो रुपया कैसे जवाब देता है।',
    'sim.lede': 'पाँच मुख्य बलों का एक सरलीकृत रेखीय मॉडल — तेल, डॉलर की मज़बूती, पूँजी प्रवाह, फेड नीति, और RBI रक्षा। कोई भी इनपुट बदलें, अनुमानित USD/INR तुरंत अद्यतन होगा।',
    'ccy.label': 'अंतर-मुद्रा प्रभाव',
    'ccy.title': 'भारत अकेला नहीं है। डॉलर सबको हिला रहा है।',
    'ccy.lede': 'नीचे से कोई भी मुद्रा चुनें यह देखने के लिए कि वह उन्हीं बलों पर कैसे प्रतिक्रिया कर रही है जो रुपये को प्रभावित कर रहे हैं — और कुछ क्यों टिकी हुई हैं जबकि अन्य गिर रही हैं।',
    'impact.label': 'प्रभाव श्रृंखला',
    'impact.title': 'रुपये की कमज़ोरी आपकी जेब तक कैसे पहुँचती है।',
    'impact.lede': 'कमज़ोर रुपया तीन प्राथमिक प्रभाव पैदा करता है — और हर एक घर, फर्म, या केंद्रीय बैंक तक झरने की तरह पहुँचता है।',
    'ref.label': 'संदर्भ और डेटा',
    'ref.title': 'आँकड़े, और वे कहाँ से आते हैं।',
    'ref.lede': 'इस पृष्ठ पर उद्धृत हर आँकड़ा, उसके स्रोत और अंतिम सत्यापन की तारीख के साथ।',
    'math.label': 'बुनियादी गणित',
    'math.title': 'अनुमान के पीछे का सूत्र देखें।',
    'math.lede': 'हर स्लाइडर का एक गुणांक है। आज का आधार घटाओ। गुणा करो। जोड़ो। यही मॉडल है — कोई छुपा कदम नहीं।',
    'math.formula': 'अनुमानित ₹/$ = ₹95.96 + Σ ( गुणांक × (वर्तमान मान − आधार) )',
    'math.amount': 'राशि बदलें',
    'math.amountHelp': 'देखें $1,000 आज और सिम्युलेटेड दर पर कितने रुपये का।',
    'math.usd': 'डॉलर (USD)',
    'math.inrToday': 'आज की ₹95.96 पर',
    'math.inrSim': 'सिम्युलेटेड दर पर',
    'math.diff': 'अंतर',
    'math.cheaper': 'सस्ता',
    'math.costlier': 'महँगा',
    'math.flat': 'आज के बराबर',
  },
};

let currentLang = 'en';

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = I18N[lang][key];
    if (val === undefined) return;
    if (el.dataset.i18nHtml) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    const active = b.dataset.lang === lang;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  if (document.getElementById('mathAmount')) updateMath();
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

// ─── Basic Math widget ─────────────────────────────────────────
function updateMath() {
  const amtEl = document.getElementById('mathAmount');
  if (!amtEl) return;
  const usd = parseFloat(amtEl.value) || 0;
  const todayRate = 95.96;
  const simRate = parseFloat(document.getElementById('simOut').textContent.replace(/[^\d.]/g, '')) || todayRate;

  const inrToday = usd * todayRate;
  const inrSim = usd * simRate;
  const diff = inrSim - inrToday;

  const fmtINR = (v) => '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  document.getElementById('mathTodayVal').textContent = fmtINR(inrToday);
  document.getElementById('mathSimVal').textContent = fmtINR(inrSim);

  const diffEl = document.getElementById('mathDiff');
  const diffLabel = document.getElementById('mathDiffLabel');
  if (Math.abs(diff) < 0.01) {
    diffEl.textContent = fmtINR(0);
    diffEl.className = 'math-cell-val';
    diffLabel.textContent = t('math.flat');
  } else if (diff > 0) {
    diffEl.textContent = '+' + fmtINR(diff);
    diffEl.className = 'math-cell-val math-up';
    diffLabel.textContent = t('math.costlier');
  } else {
    diffEl.textContent = '−' + fmtINR(Math.abs(diff));
    diffEl.className = 'math-cell-val math-down';
    diffLabel.textContent = t('math.cheaper');
  }

  // Plug current slider values into a readable formula
  const v = readSim();
  const c = simContributions(v);
  const fEl = document.getElementById('mathFormulaLive');
  if (fEl) {
    const fmt = (n) => (n >= 0 ? '+' : '−') + '₹' + Math.abs(n).toFixed(2);
    fEl.innerHTML =
      '₹95.96 ' +
      '<span class="formula-token">' + fmt(c.oil) + '</span> oil ' +
      '<span class="formula-token">' + fmt(c.dxy) + '</span> dxy ' +
      '<span class="formula-token">' + fmt(c.fii) + '</span> fii ' +
      '<span class="formula-token">' + fmt(c.fed) + '</span> fed ' +
      '<span class="formula-token">' + fmt(c.rbi) + '</span> rbi ' +
      '= <strong>₹' + (95.96 + c.oil + c.dxy + c.fii + c.fed + c.rbi).toFixed(2) + '</strong>';
  }
}

const mathAmt = document.getElementById('mathAmount');
if (mathAmt) {
  mathAmt.addEventListener('input', updateMath);
  // re-run whenever sim updates
  const origUpdateSim = updateSim;
  window.updateSim = function () {
    origUpdateSim();
    updateMath();
  };
  Object.values(sim).forEach(el => el.addEventListener('input', updateMath));
  document.querySelectorAll('.preset-btn').forEach(btn => btn.addEventListener('click', () => setTimeout(updateMath, 0)));
  updateMath();
}

// Apply default language on load
applyLang('en');
