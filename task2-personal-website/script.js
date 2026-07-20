const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.navbar a[href^="#"]');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced) {
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('#heroBadge', { opacity: 0, y: 30, duration: 0.6 })
    .from('#heroTitle', { opacity: 0, y: 50, duration: 0.8 }, '-=0.3')
    .from('#heroSubtitle', { opacity: 0, y: 30, duration: 0.6 }, '-=0.5')
    .from('#heroTagline', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
    .from('#heroStats', { opacity: 0, y: 30, duration: 0.6 }, '-=0.2')
    .from('#heroActions', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3');

  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      }
    );
  });
}

if (!prefersReduced) {
  gsap.utils.toArray('.stat-num').forEach((stat) => {
    const target = parseInt(stat.dataset.target);
    ScrollTrigger.create({
      trigger: stat, start: 'top 85%',
      onEnter: () => {
        gsap.to(stat, { innerHTML: target, duration: 2, snap: { innerHTML: 1 }, ease: 'power2.out' });
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
  mobileMenu?.classList.toggle('open');
});

document.querySelectorAll('#mobileMenu a').forEach((a) => {
  a.addEventListener('click', () => {
    mobileMenu?.classList.remove('open');
  });
});

themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  themeToggle.classList.toggle('swap-active');
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
const track = document.getElementById('testimonialTrack');
const dots = document.getElementById('carouselDots');
const cards = track?.querySelectorAll(':scope > div');

if (cards?.length && dots) {
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
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const msgError = document.getElementById('msgError');

  msgInput?.addEventListener('input', () => {
    if (charCount) charCount.textContent = msgInput.value.length;
  });

  function validateField(input, errorEl) {
    if (!input.value.trim()) {
      errorEl.textContent = 'This field is required.';
      errorEl.classList.remove('hidden');
      input.classList.add('input-error');
      return false;
    }
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      errorEl.textContent = 'Please enter a valid email.';
      errorEl.classList.remove('hidden');
      input.classList.add('input-error');
      return false;
    }
    errorEl.classList.add('hidden');
    input.classList.remove('input-error');
    return true;
  }

  [nameInput, emailInput, msgInput].forEach((el) => {
    if (!el) return;
    const err = el.id === 'name' ? nameError : el.id === 'email' ? emailError : msgError;
    el.addEventListener('blur', () => validateField(el, err));
    el.addEventListener('input', () => {
      if (el.classList.contains('input-error')) validateField(el, err);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = [
      validateField(nameInput, nameError),
      validateField(emailInput, emailError),
      validateField(msgInput, msgError),
    ].every(Boolean);
    if (!valid) return;

    form.innerHTML = `
      <div class="text-center py-10 animate-[fadeIn_0.4s_ease]">
        <div class="size-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-5 text-2xl text-white">
          <i class="fas fa-check"></i>
        </div>
        <h3 class="font-outfit text-2xl font-bold mb-2 text-base-content">Message Sent!</h3>
        <p class="text-sm text-base-content/60">Thank you! I'll get back to you within 24 hours.</p>
      </div>
    `;
  });
}
