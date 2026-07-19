import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const linkClass = (path, current) =>
  `text-sm font-medium transition-colors duration-200 ${
    current === path ? 'text-primary-500' : 'dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Nova<span className="text-primary-500">Learn</span>
        </Link>

        <div className="flex items-center gap-4">
          <button onClick={() => setDark(!dark)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-lg" aria-label="Toggle theme">
            {dark ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </button>

          <button className="md:hidden text-gray-500 dark:text-gray-400" onClick={() => setOpen(!open)} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {(open || true) && (
            <ul className={`md:flex items-center gap-8 ${open ? 'flex flex-col absolute top-16 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-6 gap-4 shadow-lg' : 'hidden md:flex'}`}>
              <li><Link to="/" className={linkClass('/', location.pathname)} onClick={() => setOpen(false)}>Home</Link></li>
              {user ? (
                <>
                  <li><Link to="/dashboard" className={linkClass('/dashboard', location.pathname)} onClick={() => setOpen(false)}>Dashboard</Link></li>
                  <li>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-3 hidden md:inline">{user.name}</span>
                    <button onClick={() => { logout(); setOpen(false); }} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className={linkClass('/login', location.pathname)} onClick={() => setOpen(false)}>Login</Link></li>
                  <li><Link to="/signup" className="text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors" onClick={() => setOpen(false)}>Sign Up</Link></li>
                </>
              )}
            </ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
