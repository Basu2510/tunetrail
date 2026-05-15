require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tunetrail';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const indexRouter    = require('./routes/index');
const searchRouter   = require('./routes/search');
const journalRouter  = require('./routes/journal');

app.use('/', indexRouter);
app.use('/search', searchRouter);
app.use('/journal', journalRouter);

app.use((req, res) => {
  res.status(404).render('404', { title: '404 — TuneTrail' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error — TuneTrail', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🎵 TuneTrail running at http://localhost:${PORT}`);
});

module.exports = app;
