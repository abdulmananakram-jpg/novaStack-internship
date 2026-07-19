const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const successMsg = document.getElementById('successMessage');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMessage');
const themeToggle = document.getElementById('themeToggle');
const canvas = document.getElementById('confettiCanvas');
const charCount = document.getElementById('charCount');

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

const fields = {
  fullName: {
    element: document.getElementById('fullName'),
    validate: (v) => v.trim().length >= 2 ? '' : 'Name must be at least 2 characters.',
  },
  email: {
    element: document.getElementById('email'),
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email.',
  },
  subject: {
    element: document.getElementById('subject'),
    validate: (v) => v.trim().length >= 3 ? '' : 'Subject must be at least 3 characters.',
  },
  message: {
    element: document.getElementById('message'),
    validate: (v) => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
  },
};

function toggleError(name, show, msg) {
  const group = fields[name].element.closest('.form-group');
  group.classList.toggle('error', show);
  group.querySelector('.error-msg').textContent = msg || '';
}

function validateField(name) {
  const err = fields[name].validate(fields[name].element.value);
  toggleError(name, !!err, err);
  return !err;
}

Object.keys(fields).forEach((name) => {
  const el = fields[name].element;
  el.addEventListener('blur', () => validateField(name));
  el.addEventListener('input', () => {
    if (el.closest('.form-group').classList.contains('error')) validateField(name);
  });
});

fields.message.element.addEventListener('input', () => {
  charCount.textContent = fields.message.element.value.length;
  if (fields.message.element.value.length > 1000) fields.message.element.value = fields.message.element.value.slice(0, 1000);
});

function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function fireConfetti() {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  const p = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 8 + 4,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 3,
    rot: Math.random() * 360,
    rs: (Math.random() - 0.5) * 12,
  }));
  let f = 0;
  function anim() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    p.forEach((pt) => {
      pt.x += pt.vx; pt.y += pt.vy; pt.rot += pt.rs;
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate((pt.rot * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, 1 - f / 120);
      ctx.fillStyle = pt.color;
      ctx.fillRect(-pt.w / 2, -pt.h / 2, pt.w, pt.h);
      ctx.restore();
    });
    if (++f < 120) requestAnimationFrame(anim);
  }
  anim();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let valid = Object.keys(fields).every(validateField);
  if (!valid) return;

  submitBtn.disabled = true;
  btnText.hidden = true;
  btnLoader.hidden = false;

  await new Promise((r) => setTimeout(r, 1200));

  Object.keys(fields).forEach((n) => toggleError(n, false));
  form.reset();
  charCount.textContent = '0';
  form.hidden = true;
  successMsg.hidden = false;
  submitBtn.disabled = false;
  btnText.hidden = false;
  btnLoader.hidden = true;

  fireConfetti();
  showToast('Message sent successfully!');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  successMsg.hidden = true;
  form.hidden = false;
});
