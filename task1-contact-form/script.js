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
    validate: (val) => val.trim().length >= 2 ? '' : 'Name must be at least 2 characters.',
  },
  email: {
    element: document.getElementById('email'),
    validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'Please enter a valid email.',
  },
  subject: {
    element: document.getElementById('subject'),
    validate: (val) => val.trim().length >= 3 ? '' : 'Subject must be at least 3 characters.',
  },
  message: {
    element: document.getElementById('message'),
    validate: (val) => val.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
  },
};

function showError(field, message) {
  const group = field.element.closest('.form-floating');
  group.classList.add('error');
  group.querySelector('.error-msg').textContent = message;
}

function clearError(field) {
  const group = field.element.closest('.form-floating');
  group.classList.remove('error');
  group.querySelector('.error-msg').textContent = '';
}

function validateField(name) {
  const field = fields[name];
  const err = field.validate(field.element.value);
  if (err) { showError(field, err); return false; }
  clearError(field);
  return true;
}

Object.values(fields).forEach((field) => {
  field.element.addEventListener('blur', () => {
    const name = Object.keys(fields).find((k) => fields[k] === field);
    validateField(name);
  });
  field.element.addEventListener('input', () => {
    if (field.element.closest('.form-floating').classList.contains('error')) {
      const name = Object.keys(fields).find((k) => fields[k] === field);
      validateField(name);
    }
  });
});

const messageField = fields.message.element;
messageField.addEventListener('input', () => {
  charCount.textContent = messageField.value.length;
  if (messageField.value.length > 1000) messageField.value = messageField.value.slice(0, 1000);
});

function showToast(message) {
  toastMsg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function fireConfetti() {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 8 + 4,
    h: Math.random() * 6 + 2,
    color: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)],
    vx: (Math.random() - 0.5) * 3,
    vy: Math.random() * 3 + 2,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
  }));

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 120) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let valid = true;
  Object.keys(fields).forEach((name) => { if (!validateField(name)) valid = false; });
  if (!valid) return;

  submitBtn.disabled = true;
  btnText.hidden = true;
  btnLoader.hidden = false;

  await new Promise((r) => setTimeout(r, 1200));

  form.reset();
  Object.keys(fields).forEach((n) => clearError(fields[n]));
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

window.addEventListener('resize', () => {
  if (canvas.width !== window.innerWidth) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
