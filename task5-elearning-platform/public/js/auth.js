const API = 'http://localhost:5000/api';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

document.getElementById('showSignup').addEventListener('click', () => {
  loginForm.style.display = 'none';
  signupForm.style.display = '';
});

document.getElementById('showLogin').addEventListener('click', () => {
  signupForm.style.display = 'none';
  loginForm.style.display = '';
});

function redirectAfterLogin() {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  window.location.href = redirect || '/dashboard.html';
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const error = document.getElementById('loginError');
  if (!email || !password) {
    error.textContent = 'Please fill in all fields.';
    error.classList.add('show');
    return;
  }
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      error.textContent = data.error || 'Login failed.';
      error.classList.add('show');
      return;
    }
    window.sessionStorage.setItem('token', data.token);
    window.sessionStorage.setItem('userName', data.user.name);
    redirectAfterLogin();
  } catch {
    error.textContent = 'Something went wrong. Check your connection.';
    error.classList.add('show');
  }
});

document.getElementById('signupBtn').addEventListener('click', async () => {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const error = document.getElementById('signupError');
  if (!name || !email || !password) {
    error.textContent = 'Please fill in all fields.';
    error.classList.add('show');
    return;
  }
  if (password.length < 6) {
    error.textContent = 'Password must be at least 6 characters.';
    error.classList.add('show');
    return;
  }
  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      error.textContent = data.error || 'Signup failed.';
      error.classList.add('show');
      return;
    }
    window.sessionStorage.setItem('token', data.token);
    window.sessionStorage.setItem('userName', data.user.name);
    redirectAfterLogin();
  } catch {
    error.textContent = 'Something went wrong. Check your connection.';
    error.classList.add('show');
  }
});
