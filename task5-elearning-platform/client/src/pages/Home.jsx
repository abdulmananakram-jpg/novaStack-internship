import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API = '/api';

function SkeletonCard() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200 dark:bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const carouselRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetch(`${API}/courses`)
      .then((r) => r.json())
      .then((data) => setCourses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.level === filter;
    return matchSearch && matchFilter;
  });

  const featured = courses.slice(0, 5);

  useEffect(() => {
    if (!featured.length) return;
    const timer = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  return (
    <>
      <section className="py-20 md:py-28 text-center bg-gradient-to-b from-primary-500/5 to-transparent dark:from-primary-500/10">
        <div className="max-w-3xl mx-auto px-4">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block text-xs font-semibold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full mb-4">
            Start Learning Today
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white">
            Master <span className="text-primary-500">New Skills</span> with Expert-Led Courses
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Learn cutting-edge technologies from industry professionals. Build real projects and advance your career.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/signup" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white">Featured Courses</h2>
          <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
              {featured.map((course) => (
                <div key={course._id} className="min-w-full p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-1/3 h-40 md:h-48 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center text-gray-400 flex-shrink-0">
                    {course.image || 'Course Image'}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <span className="text-xs font-semibold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded">{course.level}</span>
                      <span className="text-xs text-gray-500">{course.duration}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{course.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{course.description.slice(0, 150)}...</p>
                    <Link to={`/courses/${course._id}`} className="text-primary-500 font-semibold hover:underline">View Course &rarr;</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 pb-4">
              {featured.map((_, i) => (
                <button key={i} onClick={() => setCarouselIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-primary-500 w-6' : 'bg-gray-300 dark:bg-gray-700'}`} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">All Courses</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-xl mx-auto">
          <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-primary-500 transition-colors" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-primary-500">
            <option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No courses match your criteria.</p>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((course) => (
                <motion.div key={course._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                  <Link to={`/courses/${course._id}`} className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5">
                    <div className="h-40 bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center text-gray-500 dark:text-gray-600 text-sm">
                      {course.image || 'Course Image'}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded">{course.level}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{course.duration}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{course.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{course.instructor}</span>
                        <span className="text-gray-500 dark:text-gray-400">{course.students} students</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </>
  );
}
