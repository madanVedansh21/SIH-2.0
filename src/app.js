const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');
const authRoutes = require('./routes/auth');
const transformerRoutes = require('./routes/transformers');
const testRoutes = require('./routes/tests');
const alertRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');
const { errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

mongoose.connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error', err));

app.use('/auth', authRoutes);
app.use('/transformers', transformerRoutes);
app.use('/tests', testRoutes);
app.use('/alerts', alertRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Transformer Diagnostics API' }));

app.use(errorHandler);

module.exports = app;
