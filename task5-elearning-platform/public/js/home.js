const API = 'http://localhost:5000/api';
const grid = document.getElementById('courseGrid');
const skeleton = document.getElementById('skeletonGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const chips = document.getElementById('categoryChips');

function getToken() { return window.sessionStorage.getItem('token'); }

function updateNav() {
  const token = getToken();
  document.getElementById('loginLink').style.display = token ? 'none' : '';
  const dashLink = document.getElementById('dashboardLink');
  if (dashLink) dashLink.style.display = token ? '' : 'none';
}

async function fetchCourses(params = '') {
  skeleton.style.display = '';
  grid.innerHTML = '';
  try {
    const res = await fetch(`${API}/courses${params}`);
    const data = await res.json();
    skeleton.style.display = 'none';
    if (data.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px">No courses found.</p>';
      return;
    }
    data.forEach(c => {
      const lessons = c.lessons ? c.lessons.length : 0;
      const card = document.createElement('a');
      card.href = `/course.html?id=${c.id}`;
      card.className = 'course-card';
      card.innerHTML = `
        <div class="category-badge">${c.category}</div>
        <h3>${c.title}</h3>
        <div class="instructor"><i class="fas fa-user"></i> ${c.instructor}</div>
        <div class="description">${c.description}</div>
        <div class="meta">
          <span class="price">${c.price}</span>
          <span class="lessons-count">${lessons} lessons</span>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch {
    skeleton.style.display = 'none';
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px">Failed to load courses. Make sure the server is running.</p>';
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API}/courses`);
    const data = await res.json();
    const cats = [...new Set(data.map(c => c.category))];
    const allChip = document.createElement('button');
    allChip.className = 'chip active';
    allChip.textContent = 'All';
    allChip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      allChip.classList.add('active');
      fetchCourses('');
    });
    chips.appendChild(allChip);
    cats.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = cat;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        fetchCourses(`?category=${encodeURIComponent(cat)}`);
      });
      chips.appendChild(chip);
    });
  } catch {}
}

searchBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (q) fetchCourses(`?search=${encodeURIComponent(q)}`);
});
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchBtn.click();
});

updateNav();
loadCategories();
fetchCourses();
