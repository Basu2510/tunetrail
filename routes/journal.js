const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// GET /journal — show all entries with filters
router.get('/', async (req, res, next) => {
  try {
    const { type, mood, rating, sort } = req.query;
    let filter = {};
    if (type)   filter.type = type;
    if (mood)   filter.mood = mood;
    if (rating) filter.rating = parseInt(rating);

    let sortOption = { addedAt: -1 };
    if (sort === 'title')   sortOption = { title: 1 };
    if (sort === 'artist')  sortOption = { artist: 1 };
    if (sort === 'rating')  sortOption = { rating: -1, addedAt: -1 };
    if (sort === 'oldest')  sortOption = { addedAt: 1 };

    const entries = await Entry.find(filter).sort(sortOption);

    res.render('journal', {
      title: 'My Journal — TuneTrail',
      entries,
      filters: { type: type || '', mood: mood || '', rating: rating || '', sort: sort || '' }
    });
  } catch (err) {
    next(err);
  }
});

// POST /journal/add — save a song or album
router.post('/add', async (req, res, next) => {
  try {
    const {
      type, title, artist, artwork, genre, releaseYear,
      trackId, albumName, previewUrl, durationMs,
      albumId, trackCount,
      redirectTo
    } = req.body;

    // Check for duplicate
    let existing = null;
    if (type === 'song' && trackId) {
      existing = await Entry.findOne({ trackId, type: 'song' });
    } else if (type === 'album' && albumId) {
      existing = await Entry.findOne({ albumId, type: 'album' });
    }

    if (!existing) {
      await Entry.create({
        type, title, artist, artwork, genre, releaseYear,
        trackId:    trackId || '',
        albumName:  albumName || '',
        previewUrl: previewUrl || '',
        durationMs: durationMs ? parseInt(durationMs) : 0,
        albumId:    albumId || '',
        trackCount: trackCount ? parseInt(trackCount) : 0
      });
    }

    // Redirect back to where they came from
    const dest = redirectTo || '/journal';
    res.redirect(dest + '?added=true');
  } catch (err) {
    next(err);
  }
});

// GET /journal/edit/:id — edit form
router.get('/edit/:id', async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).render('404', { title: 'Not Found' });
    res.render('edit', {
      title: `Edit — ${entry.title} — TuneTrail`,
      entry
    });
  } catch (err) {
    next(err);
  }
});

// POST /journal/edit/:id — save edits
router.post('/edit/:id', async (req, res, next) => {
  try {
    const { mood, rating, notes, listenedOn } = req.body;
    await Entry.findByIdAndUpdate(req.params.id, {
      mood:       mood || '',
      rating:     rating ? parseInt(rating) : null,
      notes:      notes || '',
      listenedOn: listenedOn ? new Date(listenedOn) : Date.now()
    });
    res.redirect('/journal');
  } catch (err) {
    next(err);
  }
});

// POST /journal/delete/:id — remove entry
router.post('/delete/:id', async (req, res, next) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    res.redirect('/journal');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
