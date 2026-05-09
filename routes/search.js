const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Entry = require('../models/Entry');

const ITUNES_BASE     = 'https://itunes.apple.com/search';
const MUSICBRAINZ_BASE = 'https://musicbrainz.org/ws/2';

// Helper: format ms duration to m:ss
function formatDuration(ms) {
  if (!ms) return '';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Helper: get high-res artwork from iTunes (replace 100x100 with 600x600)
function bigArtwork(url) {
  if (!url) return '';
  return url.replace('100x100bb', '600x600bb');
}

// GET /search — search form + results
router.get('/', async (req, res, next) => {
  try {
    const { q, kind } = req.query;
    let songs = [];
    let albums = [];
    let mbArtistInfo = null;
    let error = null;

    if (q) {
      const mediaType = (!kind || kind === 'song') ? 'music' : 'music';
      const entity    = (!kind || kind === 'song') ? 'song' : 'album';

      // iTunes Search API call
      const itunesUrl = `${ITUNES_BASE}?term=${encodeURIComponent(q)}&media=music&entity=${entity}&limit=20`;
      const itunesRes = await fetch(itunesUrl, {
        headers: { 'User-Agent': 'TuneTrail/1.0' }
      });
      const itunesData = await itunesRes.json();

      if (!kind || kind === 'song') {
        songs = (itunesData.results || []).map(r => ({
          trackId:     String(r.trackId || ''),
          title:       r.trackName || '',
          artist:      r.artistName || '',
          album:       r.collectionName || '',
          artwork:     bigArtwork(r.artworkUrl100),
          genre:       r.primaryGenreName || 'Unknown',
          releaseYear: r.releaseDate ? r.releaseDate.substring(0, 4) : '',
          previewUrl:  r.previewUrl || '',
          durationMs:  r.trackTimeMillis || 0,
          duration:    formatDuration(r.trackTimeMillis)
        }));
      } else {
        albums = (itunesData.results || [])
          .filter(r => r.wrapperType === 'collection')
          .map(r => ({
            albumId:     String(r.collectionId || ''),
            title:       r.collectionName || '',
            artist:      r.artistName || '',
            artwork:     bigArtwork(r.artworkUrl100),
            genre:       r.primaryGenreName || 'Unknown',
            releaseYear: r.releaseDate ? r.releaseDate.substring(0, 4) : '',
            trackCount:  r.trackCount || 0
          }));
      }

      // MusicBrainz API — fetch artist info for the first result
      // This satisfies using multiple APIs
      try {
        const firstArtist = songs[0]?.artist || albums[0]?.artist || '';
        if (firstArtist) {
          const mbUrl = `${MUSICBRAINZ_BASE}/artist?query=artist:${encodeURIComponent(firstArtist)}&limit=1&fmt=json`;
          const mbRes = await fetch(mbUrl, {
            headers: {
              'User-Agent': 'TuneTrail/1.0 (tunetrail@example.com)'
            }
          });
          const mbData = await mbRes.json();
          if (mbData.artists && mbData.artists.length > 0) {
            const a = mbData.artists[0];
            mbArtistInfo = {
              name:       a.name,
              type:       a.type || '',
              country:    a.country || '',
              area:       a['begin-area']?.name || a.area?.name || '',
              tags:       (a.tags || []).slice(0, 5).map(t => t.name),
              score:      a.score,
              formed:     a['life-span']?.begin || '',
              disambiguation: a.disambiguation || ''
            };
          }
        }
      } catch (mbErr) {
        // MusicBrainz is optional — don't crash if it fails
        console.warn('MusicBrainz fetch failed:', mbErr.message);
      }

      if (songs.length === 0 && albums.length === 0) {
        error = `No results found for "${q}". Try a different search term.`;
      }
    }

    // Get saved IDs for "Already in journal" badges
    const savedEntries = await Entry.find({}, 'trackId albumId type').lean();
    const savedTrackIds = new Set(savedEntries.filter(e => e.type === 'song').map(e => e.trackId));
    const savedAlbumIds = new Set(savedEntries.filter(e => e.type === 'album').map(e => e.albumId));

    res.render('search', {
      title: 'Search Music — TuneTrail',
      q: q || '',
      kind: kind || 'song',
      songs,
      albums,
      mbArtistInfo,
      error,
      savedTrackIds,
      savedAlbumIds
    });
  } catch (err) {
    next(err);
  }
});

// GET /search/preview/:trackId — detail/preview page for a single song
router.get('/preview/:trackId', async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const url = `https://itunes.apple.com/lookup?id=${trackId}&entity=song`;
    const response = await fetch(url, { headers: { 'User-Agent': 'TuneTrail/1.0' } });
    const data = await response.json();
    const track = (data.results || []).find(r => r.wrapperType === 'track' || r.kind === 'song');

    if (!track) return res.status(404).render('404', { title: 'Not Found' });

    // Also fetch MusicBrainz artist info
    let mbArtistInfo = null;
    try {
      const mbUrl = `${MUSICBRAINZ_BASE}/artist?query=artist:${encodeURIComponent(track.artistName)}&limit=1&fmt=json`;
      const mbRes = await fetch(mbUrl, { headers: { 'User-Agent': 'TuneTrail/1.0 (tunetrail@example.com)' } });
      const mbData = await mbRes.json();
      if (mbData.artists && mbData.artists.length > 0) {
        const a = mbData.artists[0];
        mbArtistInfo = {
          name:    a.name,
          type:    a.type || '',
          country: a.country || '',
          area:    a['begin-area']?.name || a.area?.name || '',
          tags:    (a.tags || []).slice(0, 6).map(t => t.name),
          formed:  a['life-span']?.begin || '',
          disambiguation: a.disambiguation || ''
        };
      }
    } catch (e) { /* optional */ }

    const existing = await Entry.findOne({ trackId: String(trackId), type: 'song' });

    const song = {
      trackId:     String(track.trackId),
      title:       track.trackName,
      artist:      track.artistName,
      album:       track.collectionName || '',
      artwork:     bigArtwork(track.artworkUrl100),
      genre:       track.primaryGenreName || 'Unknown',
      releaseYear: track.releaseDate ? track.releaseDate.substring(0, 4) : '',
      previewUrl:  track.previewUrl || '',
      durationMs:  track.trackTimeMillis || 0,
      duration:    formatDuration(track.trackTimeMillis),
      trackNumber: track.trackNumber || '',
      trackCount:  track.trackCount || ''
    };

    res.render('preview', {
      title: `${song.title} — TuneTrail`,
      song,
      mbArtistInfo,
      existing
    });
  } catch (err) {
    next(err);
  }
});

// GET /search/album/:albumId — album detail page
router.get('/album/:albumId', async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const url = `https://itunes.apple.com/lookup?id=${albumId}&entity=song`;
    const response = await fetch(url, { headers: { 'User-Agent': 'TuneTrail/1.0' } });
    const data = await response.json();

    const albumMeta = (data.results || []).find(r => r.wrapperType === 'collection');
    const tracks    = (data.results || []).filter(r => r.wrapperType === 'track');

    if (!albumMeta) return res.status(404).render('404', { title: 'Not Found' });

    // MusicBrainz artist info
    let mbArtistInfo = null;
    try {
      const mbUrl = `${MUSICBRAINZ_BASE}/artist?query=artist:${encodeURIComponent(albumMeta.artistName)}&limit=1&fmt=json`;
      const mbRes = await fetch(mbUrl, { headers: { 'User-Agent': 'TuneTrail/1.0 (tunetrail@example.com)' } });
      const mbData = await mbRes.json();
      if (mbData.artists && mbData.artists.length > 0) {
        const a = mbData.artists[0];
        mbArtistInfo = {
          name:    a.name,
          type:    a.type || '',
          country: a.country || '',
          area:    a['begin-area']?.name || a.area?.name || '',
          tags:    (a.tags || []).slice(0, 6).map(t => t.name),
          formed:  a['life-span']?.begin || '',
          disambiguation: a.disambiguation || ''
        };
      }
    } catch (e) { /* optional */ }

    const existing = await Entry.findOne({ albumId: String(albumId), type: 'album' });

    const album = {
      albumId:     String(albumMeta.collectionId),
      title:       albumMeta.collectionName,
      artist:      albumMeta.artistName,
      artwork:     bigArtwork(albumMeta.artworkUrl100),
      genre:       albumMeta.primaryGenreName || 'Unknown',
      releaseYear: albumMeta.releaseDate ? albumMeta.releaseDate.substring(0, 4) : '',
      trackCount:  albumMeta.trackCount || tracks.length,
      tracks:      tracks.map(t => ({
        trackNumber: t.trackNumber,
        title:       t.trackName,
        duration:    formatDuration(t.trackTimeMillis),
        previewUrl:  t.previewUrl || ''
      }))
    };

    res.render('album', {
      title: `${album.title} — TuneTrail`,
      album,
      mbArtistInfo,
      existing
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
