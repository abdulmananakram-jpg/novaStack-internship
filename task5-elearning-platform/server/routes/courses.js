const { Router } = require('express');
const { readJSON } = require('../utils/fileDB');
const router = Router();

router.get('/', async (req, res) => {
  const courses = await readJSON('courses.json');
  let filtered = courses;
  if (req.query.category) {
    filtered = filtered.filter(c => c.category.toLowerCase() === req.query.category.toLowerCase());
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  res.json(filtered);
});

router.get('/:id', async (req, res) => {
  const courses = await readJSON('courses.json');
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

module.exports = router;
