const API = 'http://localhost:5000/api';
const detail = document.getElementById('courseDetail');
const toast = document.getElementById('toast');

function getToken() { return window.sessionStorage.getItem('token'); }

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function updateNav() {
  const token = getToken();
  document.getElementById('loginLink').style.display = token ? 'none' : '';
  const dashLink = document.getElementById('dashboardLink');
  if (dashLink) dashLink.style.display = token ? '' : 'none';
}

async function loadCourse() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { detail.innerHTML = '<p>No course ID provided.</p>'; return; }

  try {
    const res = await fetch(`${API}/courses/${id}`);
    const c = await res.json();
    detail.innerHTML = `
      <span class="category-badge">${c.category}</span>
      <h1>${c.title}</h1>
      <div class="meta-row">
        <span><i class="fas fa-user"></i> ${c.instructor}</span>
        <span><i class="fas fa-book"></i> ${c.lessons.length} lessons</span>
        <span><i class="fas fa-tag"></i> ${c.price}</span>
      </div>
      <p class="description-full">${c.description}</p>
      <h3 style="margin-bottom:12px">Course Content</h3>
      <ul class="lesson-list">
        ${c.lessons.map((l, i) => `
          <li><span>${i + 1}. ${l.title}</span><span class="duration">${l.duration}</span></li>
        `).join('')}
      </ul>
      <button class="btn btn-primary" id="enrollBtn"><i class="fas fa-graduation-cap"></i> Enroll Now</button>
    `;

    document.getElementById('enrollBtn').addEventListener('click', async () => {
      const token = getToken();
      if (!token) {
        window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return;
      }
      try {
        const res = await fetch(`${API}/enrollments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ courseId: id })
        });
        if (res.status === 409) {
          showToast('Already enrolled! Go to Dashboard to continue.');
          return;
        }
        if (!res.ok) throw new Error();
        showToast('Enrolled successfully! 🎉');
        document.getElementById('enrollBtn').innerHTML = '<i class="fas fa-arrow-right"></i> Go to Dashboard';
        document.getElementById('enrollBtn').onclick = () => window.location.href = '/dashboard.html';
      } catch {
        showToast('Failed to enroll. Try again.');
      }
    });
  } catch {
    detail.innerHTML = '<p>Failed to load course details.</p>';
  }
}

updateNav();
loadCourse();
