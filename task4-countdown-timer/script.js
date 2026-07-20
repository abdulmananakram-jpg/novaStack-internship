const themeToggle = document.getElementById('themeToggle');
const setupCard = document.getElementById('setupCard');
const countdownCard = document.getElementById('countdownCard');
const timesUp = document.getElementById('timesUp');
const datetimeInput = document.getElementById('datetimeInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const timesUpReset = document.getElementById('timesUpReset');
const targetDisplay = document.getElementById('targetDisplay');
const canvas = document.getElementById('confettiCanvas');

let targetDate = null;
let intervalId = null;
let currentPreset = 'custom';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentPreset = btn.dataset.preset;

    const now = new Date();
    let target;

    switch (currentPreset) {
      case 'newyear':
        target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
        break;
      case 'birthday':
        target = new Date(now.getFullYear(), now.getMonth() + 1, 15, 0, 0, 0);
        break;
      case 'launch':
        target = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        datetimeInput.focus();
        return;
    }

    datetimeInput.value = target.toISOString().slice(0, 16);
  });
});

function flipValue(innerEl, value) {
  const padded = String(value).padStart(2, '0');
  const front = innerEl.querySelector('.flip-front');
  const back = innerEl.querySelector('.flip-back');
  if (front.textContent === padded) return;

  if (!innerEl.classList.contains('flip')) {
    back.textContent = padded;
    innerEl.classList.add('flip');
  } else {
    front.textContent = padded;
    innerEl.classList.remove('flip');
    back.textContent = padded;
  }
}

function updateRing(ringEl, value, max) {
  const circumference = 326.7;
  const offset = circumference - (value / max) * circumference;
  ringEl.style.strokeDashoffset = offset;
}

function updateDisplay() {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    countdownCard.hidden = true;
    timesUp.hidden = false;
    fireConfetti();
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  flipValue(document.getElementById('flipDays'), days);
  flipValue(document.getElementById('flipHours'), hours);
  flipValue(document.getElementById('flipMins'), mins);
  flipValue(document.getElementById('flipSecs'), secs);

  const totalTarget = Math.floor((targetDate - new Date(targetDate.getFullYear(), 0, 0)) / 1000);
  const totalNow = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000);

  const yearSecs = Math.floor((new Date(now.getFullYear() + 1, 0, 0) - new Date(now.getFullYear(), 0, 0)) / 1000);
  const elapsed = totalNow - totalTarget;
  const remaining = totalSec;

  const dayMax = 365;
  updateRing(document.getElementById('ringDays'), days, dayMax);
  updateRing(document.getElementById('ringHours'), hours, 24);
  updateRing(document.getElementById('ringMins'), mins, 60);
  updateRing(document.getElementById('ringSecs'), secs, 60);
}

function startCountdown(dateStr) {
  targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) { alert('Please select a valid date and time.'); return; }

  targetDisplay.innerHTML = `<i class="fas fa-hourglass-half"></i> Countdown to <strong>${targetDate.toLocaleString()}</strong>`;
  setupCard.hidden = true;
  timesUp.hidden = true;
  countdownCard.hidden = false;

  if (intervalId) clearInterval(intervalId);
  updateDisplay();

  const rings = ['ringDays', 'ringHours', 'ringMins', 'ringSecs'];
  rings.forEach((id) => {
    document.getElementById(id).style.strokeDashoffset = '0';
  });

  intervalId = setInterval(updateDisplay, 1000);
}

function resetAll() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  countdownCard.hidden = true;
  timesUp.hidden = true;
  setupCard.hidden = false;
  datetimeInput.value = '';
  document.documentElement.setAttribute('data-theme', 'dark');
  document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));

  document.querySelectorAll('.flip-inner').forEach((el) => {
    el.classList.remove('flip');
    el.querySelector('.flip-front').textContent = '00';
    el.querySelector('.flip-back').textContent = '00';
  });

  const rings = ['ringDays', 'ringHours', 'ringMins', 'ringSecs'];
  rings.forEach((id) => {
    document.getElementById(id).style.strokeDashoffset = '326.7';
  });
}

function fireConfetti() {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#2c7da0', '#0b3a53', '#a9d6e5', '#eaf4f4', '#3b82f6', '#8b5cf6'];
  const particles = Array.from({ length: 200 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 10 + 4,
    h: Math.random() * 7 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 12,
  }));

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.vy += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, 1 - frame / 150);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 150) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

startBtn.addEventListener('click', () => startCountdown(datetimeInput.value));
resetBtn.addEventListener('click', resetAll);
timesUpReset.addEventListener('click', resetAll);

datetimeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startCountdown(datetimeInput.value);
});
