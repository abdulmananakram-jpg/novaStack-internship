const { Router } = require('express');
const authMiddleware = require('../middleware/auth');
const { readJSON, writeJSON } = require('../utils/fileDB');
const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId is required' });
  const enrollments = await readJSON('enrollments.json');
  const exists = enrollments.find(e => e.userId === req.userId && e.courseId === courseId);
  if (exists) return res.status(409).json({ error: 'Already enrolled' });
  const enrollment = { id: String(Date.now()), userId: req.userId, courseId, progress: 0, enrolledAt: new Date().toISOString() };
  enrollments.push(enrollment);
  await writeJSON('enrollments.json', enrollments);
  res.status(201).json(enrollment);
});

router.get('/me', authMiddleware, async (req, res) => {
  const enrollments = await readJSON('enrollments.json');
  const courses = await readJSON('courses.json');
  const userEnrollments = enrollments.filter(e => e.userId === req.userId);
  const enriched = userEnrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    return { ...e, course: course || null };
  });
  res.json(enriched);
});

router.patch('/:id/progress', authMiddleware, async (req, res) => {
  const enrollments = await readJSON('enrollments.json');
  const idx = enrollments.findIndex(e => e.id === req.params.id && e.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Enrollment not found' });
  const { progress } = req.body;
  if (progress === undefined || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'progress must be between 0 and 100' });
  }
  enrollments[idx].progress = progress;
  await writeJSON('enrollments.json', enrollments);
  res.json(enrollments[idx]);
});

module.exports = router;
