require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const coursesRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');
const enrollmentsRoutes = require('./routes/enrollments');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/courses', coursesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/enrollments', enrollmentsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
