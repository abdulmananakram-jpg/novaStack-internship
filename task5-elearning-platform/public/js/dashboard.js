const API = 'http://localhost:5000/api';
const list = document.getElementById('enrolledList');
const toast = document.getElementById('toast');

function getToken() { return window.sessionStorage.getItem('token'); }

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function checkAuth() {
  if (!getToken()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  window.sessionStorage.removeItem('token');
  window.sessionStorage.removeItem('userName');
  window.location.href = '/';
});

async function loadEnrollments() {
  if (!checkAuth()) return;
  try {
    const res = await fetch(`${API}/enrollments/me`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open"></i>
          <h2>No courses yet</h2>
          <p>Browse our catalog and enroll in your first course.</p>
          <a href="/" class="btn btn-primary"><i class="fas fa-compass"></i> Browse Courses</a>
        </div>
      `;
      return;
    }
    list.innerHTML = '';
    data.forEach(e => {
      if (!e.course) return;
      const div = document.createElement('div');
      div.className = 'enrolled-card';
      div.innerHTML = `
        <h3>${e.course.title}</h3>
        <div class="instructor"><i class="fas fa-user"></i> ${e.course.instructor}</div>
        <div class="progress-bar"><div class="fill" style="width:${e.progress}%"></div></div>
        <div class="progress-actions">
          <span class="progress-text">${e.progress}% complete</span>
          <button class="btn btn-outline btn-sm mark-btn" data-id="${e.id}" data-increment="${e.course.lessons ? Math.round(100 / e.course.lessons.length) : 10}">
            <i class="fas fa-check"></i> Mark Lesson Complete
          </button>
        </div>
      `;
      list.appendChild(div);
    });

    document.querySelectorAll('.mark-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const enrollmentId = btn.dataset.id;
        const increment = parseInt(btn.dataset.increment);
        const card = btn.closest('.enrolled-card');
        const fill = card.querySelector('.fill');
        const text = card.querySelector('.progress-text');
        const current = parseInt(fill.style.width) || 0;
        const newProgress = Math.min(current + increment, 100);

        try {
          const res = await fetch(`${API}/enrollments/${enrollmentId}/progress`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ progress: newProgress })
          });
          if (!res.ok) throw new Error();
          fill.style.width = newProgress + '%';
          text.textContent = newProgress + '% complete';
          if (newProgress >= 100) showToast('🎉 Course completed!');
        } catch {
          showToast('Failed to update progress.');
        }
      });
    });
  } catch {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px">Failed to load enrollments.</p>';
  }
}

loadEnrollments();
