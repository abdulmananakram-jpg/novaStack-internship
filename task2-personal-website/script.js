const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-badge', { opacity: 0, y: 30, duration: 0.6 })
    .from('.hero-title', { opacity: 0, y: 50, duration: 0.8 }, '-=0.3')
    .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.6 }, '-=0.5')
    .from('.hero-tagline', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
    .from('.hero-stats', { opacity: 0, y: 30, duration: 0.6 }, '-=0.2')
    .from('.hero-actions', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3');

  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      opacity: 0, y: 50, duration: 0.9, ease: 'power3.out',
    });
  });
}

if (!prefersReduced) {
  gsap.utils.toArray('.stat-num').forEach((stat) => {
    const target = parseInt(stat.dataset.target);
    ScrollTrigger.create({
      trigger: stat, start: 'top 85%',
      onEnter: () => {
        gsap.to(stat, { innerHTML: target, duration: 2.5, snap: { innerHTML: 1 }, ease: 'power2.out' });
      },
    });
  });
}

if (!prefersReduced) {
  gsap.utils.toArray('.bar-fill').forEach((bar) => {
    ScrollTrigger.create({
      trigger: bar, start: 'top 85%',
      onEnter: () => { bar.style.width = bar.dataset.width + '%'; },
    });
  });
}

if (!prefersReduced) {
  gsap.utils.toArray('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      card.style.transform =
        `perspective(1000px) rotateX(${(y - cy) / 20}deg) rotateY(${(cx - x) / 20}deg) translateY(-8px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  backToTop.classList.toggle('visible', window.scrollY > 400);
  let current = '';
  sections.forEach((section) => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navAnchors.forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navAnchors.forEach((a) => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

if (!prefersReduced) {
  document.addEventListener('mousemove', (e) => {
    const follower = document.getElementById('cursorFollower');
    if (follower) {
      follower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  });
}

let carouselIndex = 0;
const track = document.querySelector('.testimonial-track');
const dots = document.getElementById('carouselDots');
const cards = document.querySelectorAll('.testimonial-card');

if (cards.length && dots) {
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.addEventListener('click', () => goToSlide(i));
    dots.appendChild(dot);
  });
  dots.children[0]?.classList.add('active');

  setInterval(() => {
    carouselIndex = (carouselIndex + 1) % cards.length;
    goToSlide(carouselIndex);
  }, 4000);
}

function goToSlide(index) {
  carouselIndex = index;
  if (track) track.style.transform = `translateX(-${index * 100}%)`;
  if (dots) {
    [...dots.children].forEach((d, i) => d.classList.toggle('active', i === index));
  }
}

const form = document.getElementById('contactForm');
if (form) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const msgInput = document.getElementById('msg');
  const charCount = document.getElementById('charCount');

  msgInput?.addEventListener('input', () => {
    if (charCount) charCount.textContent = msgInput.value.length;
    if (msgInput.value.length > 500) msgInput.value = msgInput.value.slice(0, 500);
  });

  function validateField(input) {
    const group = input.closest('.form-floating');
    const err = group.querySelector('.error-msg');
    if (!input.value.trim()) {
      group.classList.add('error');
      err.textContent = 'This field is required.';
      return false;
    }
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      group.classList.add('error');
      err.textContent = 'Please enter a valid email.';
      return false;
    }
    group.classList.remove('error');
    err.textContent = '';
    return true;
  }

  [nameInput, emailInput, msgInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.closest('.form-floating')?.classList.contains('error')) validateField(el);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = [nameInput, emailInput, msgInput].every((el) => el && validateField(el));
    if (!valid) return;

    form.innerHTML = `
      <div class="success-message" style="text-align:center;padding:40px 0;animation:fadeIn 0.4s ease;">
        <div class="success-icon" style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px;color:white;">
          <i class="fas fa-check"></i>
        </div>
        <h3 style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;margin-bottom:8px;">Message Sent!</h3>
        <p style="color:var(--text-secondary);font-size:14px;">Thank you! I'll get back to you within 24 hours.</p>
      </div>
    `;
  });
}
