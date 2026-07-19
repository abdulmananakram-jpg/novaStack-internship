import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API = '/api';

const lessons = [
  { title: 'Introduction & Setup', duration: '12:30', completed: true },
  { title: 'Core Concepts', duration: '18:45', completed: true },
  { title: 'Building Your First Project', duration: '25:10', completed: false },
  { title: 'Advanced Techniques', duration: '22:00', completed: false },
  { title: 'Best Practices & Optimization', duration: '15:20', completed: false },
  { title: 'Final Project & Deployment', duration: '30:00', completed: false },
];

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/courses/${id}`)
      .then((r) => r.json())
      .then((data) => setCourse(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading...</div>;
  if (!course) return (
    <div className="text-center py-20">
      <p className="text-gray-500 dark:text-gray-400 mb-4">Course not found.</p>
      <Link to="/" className="text-primary-500 hover:underline">Back to Home</Link>
    </div>
  );

  const completedCount = lessons.filter((l) => l.completed).length;
  const progress = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 inline-block">&larr; Back to Courses</Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-48 md:h-64 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center text-gray-500 mb-6">
            {course.image || 'Course Video Player'}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full">{course.level}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{course.duration}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{course.students} students enrolled</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 dark:text-white">{course.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2">By <span className="text-gray-700 dark:text-gray-200 font-medium">{course.instructor}</span></p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{course.description}</p>

            <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25">
              {course.price > 0 ? `Enroll for $${course.price}` : 'Enroll Free'}
            </button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:w-80 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-full mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
            {sidebarOpen ? 'Hide' : 'Show'} Lessons
          </button>

          <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Course Content</h3>
              <span className="text-xs text-gray-500">{completedCount}/{lessons.length} complete</span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-4">
              <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="space-y-1">
              {lessons.map((lesson, i) => (
                <button key={i} onClick={() => setActiveLesson(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors text-sm ${
                    activeLesson === i ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    lesson.completed ? 'bg-green-500 text-white' : activeLesson === i ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {lesson.completed ? <i className="fas fa-check text-xs"></i> : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{lesson.title}</div>
                    <div className="text-xs text-gray-500">{lesson.duration}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
