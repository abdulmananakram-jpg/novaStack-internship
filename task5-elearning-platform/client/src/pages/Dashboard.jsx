import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API = '/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', instructor: '', duration: '', level: 'Beginner', price: 0 });
  const [editing, setEditing] = useState(null);

  function fetchCourses() {
    fetch(`${API}/courses`)
      .then((r) => r.json())
      .then(setCourses);
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
    await fetch(`${API}/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCourses();
  }

  function handleEdit(course) {
    setForm({ title: course.title, description: course.description, instructor: course.instructor, duration: course.duration, level: course.level, price: course.price });
    setEditing(course._id);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-400 mb-8">Welcome back, {user?.name}!</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Course' : 'Add New Course'}</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input name="title" placeholder="Course Title" value={form.title} onChange={handleChange} required className="col-span-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary-500" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required rows={3} className="col-span-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary-500 resize-none" />
          <input name="instructor" placeholder="Instructor" value={form.instructor} onChange={handleChange} required className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary-500" />
          <input name="duration" placeholder="e.g. 8 weeks" value={form.duration} onChange={handleChange} required className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary-500" />
          <select name="level" value={form.level} onChange={handleChange} className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary-500">
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
          <input name="price" type="number" placeholder="Price (0 = free)" value={form.price} onChange={handleChange} className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary-500" />
          <div className="col-span-full flex gap-3">
            <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">{editing ? 'Update' : 'Add Course'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ title: '', description: '', instructor: '', duration: '', level: 'Beginner', price: 0 }); }} className="text-gray-400 hover:text-gray-200 text-sm">Cancel</button>}
          </div>
        </form>
      </div>

      <h2 className="text-xl font-bold mb-4">All Courses ({courses.length})</h2>
      <div className="space-y-3">
        {courses.map((c) => (
          <div key={c._id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex-1 min-w-0">
              <Link to={`/courses/${c._id}`} className="font-semibold hover:text-primary-500 transition-colors">{c.title}</Link>
              <p className="text-sm text-gray-500 truncate">{c.description}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{c.level}</span>
              <button onClick={() => handleEdit(c)} className="text-sm text-gray-400 hover:text-primary-500 transition-colors">Edit</button>
              <button onClick={() => handleDelete(c._id)} className="text-sm text-red-400 hover:text-red-300 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
