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
const sections = ['#puzzle', '#timeline', '#system', '#forces', '#impact', '#printing']
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
