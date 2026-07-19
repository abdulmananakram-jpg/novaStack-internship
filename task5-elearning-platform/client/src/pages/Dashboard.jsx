import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API = '/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', instructor: '', duration: '', level: 'Beginner', price: 0 });
  const [editing, setEditing] = useState(null);

  function fetchCourses() {
    fetch(`${API}/courses`).then((r) => r.json()).then(setCourses);
  }

  useEffect(() => { fetchCourses(); }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `${API}/courses/${editing}` : `${API}/courses`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', description: '', instructor: '', duration: '', level: 'Beginner', price: 0 });
      setEditing(null);
      fetchCourses();
    }
  }

  async function handleDelete(id) {
    const token = localStorage.getItem('token');
    await fetch(`${API}/courses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCourses();
  }

  function handleEdit(course) {
    setForm({
      title: course.title, description: course.description,
      instructor: course.instructor, duration: course.duration,
      level: course.level, price: course.price,
    });
    setEditing(course._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-bold text-primary-500">{courses.length}</span>
            <span className="text-gray-500 dark:text-gray-400">Courses</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-primary-500">{totalStudents}</span>
            <span className="text-gray-500 dark:text-gray-400">Students</span>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-10 shadow-sm">
        <h2 className="text-lg font-bold mb-5 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-500 rounded-full inline-block"></span>
          {editing ? 'Edit Course' : 'Add New Course'}
        </h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input name="title" placeholder="Course Title" value={form.title} onChange={handleChange} required
            className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required rows={3}
            className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none" />
          <input name="instructor" placeholder="Instructor" value={form.instructor} onChange={handleChange} required
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
          <input name="duration" placeholder="e.g. 8 weeks" value={form.duration} onChange={handleChange} required
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
          <select name="level" value={form.level} onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20">
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
          <input name="price" type="number" placeholder="Price (0 = free)" value={form.price} onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25">
              {editing ? 'Update Course' : 'Add Course'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm({ title: '', description: '', instructor: '', duration: '', level: 'Beginner', price: 0 }); }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium px-4">
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Courses <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({courses.length})</span></h2>
      </div>

      <AnimatePresence>
        <div className="space-y-3">
          {courses.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">No courses yet. Add your first course above.</p>
          )}
          {courses.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-primary-500/30 transition-all">
              <div className="flex-1 min-w-0">
                <Link to={`/courses/${c._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors">
                  {c.title}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{c.description}</p>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <span className="text-xs font-medium text-primary-500 bg-primary-500/10 px-3 py-1.5 rounded-lg">{c.level}</span>
                <button onClick={() => handleEdit(c)}
                  className="text-sm text-gray-400 hover:text-primary-500 transition-colors p-1">
                  <i className="fas fa-pen"></i>
                </button>
                <button onClick={() => handleDelete(c._id)}
                  className="text-sm text-red-400 hover:text-red-500 transition-colors p-1">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
