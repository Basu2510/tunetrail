const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

router.get('/', async (req, res, next) => {
  try {
    const totalCount   = await Entry.countDocuments();
    const songCount    = await Entry.countDocuments({ type: 'song' });
    const albumCount   = await Entry.countDocuments({ type: 'album' });

    const genreAgg = await Entry.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const recentEntries = await Entry.find().sort({ addedAt: -1 }).limit(6);

    const topRated = await Entry.find({ rating: { $ne: null } })
      .sort({ rating: -1, addedAt: -1 })
      .limit(4);

    res.render('index', {
      title: 'TuneTrail — Your Music Journal',
      stats: { totalCount, songCount, albumCount },
      genreAgg,
      recentEntries,
      topRated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
