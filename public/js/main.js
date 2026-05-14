// // TuneTrail — client-side JS

// // ── Active nav link ────────────────────────────────────────
// const currentPath = window.location.pathname;
// document.querySelectorAll('.nav-link').forEach(link => {
//   const href = link.getAttribute('href');
//   if (href === '/' ? currentPath === '/' : currentPath.startsWith(href)) {
//     link.classList.add('active');
//   }
// });

// // ── Audio preview player ───────────────────────────────────
// const audio       = document.getElementById('audioPlayer');
// const playerBar   = document.getElementById('playerBar');
// const playerTitle = document.getElementById('playerTitle');
// const playBtn     = document.getElementById('playerPlayBtn');
// const progress    = document.getElementById('playerProgress');
// const closeBtn    = document.getElementById('playerClose');

// let currentPreviewUrl = null;

// function playPreview(url, title) {
//   if (!audio) return;
//   currentPreviewUrl = url;
//   audio.src = url;
//   audio.play();
//   playerTitle.textContent = title || 'Preview';
//   playerBar.classList.add('visible');
//   playBtn.textContent = '⏸';
// }

// function togglePlay() {
//   if (!audio) return;
//   if (audio.paused) { audio.play(); playBtn.textContent = '⏸'; }
//   else              { audio.pause(); playBtn.textContent = '▶'; }
// }

// if (playBtn) playBtn.addEventListener('click', togglePlay);

// if (closeBtn) closeBtn.addEventListener('click', () => {
//   audio.pause();
//   audio.src = '';
//   playerBar.classList.remove('visible');
//   currentPreviewUrl = null;
// });

// if (audio) {
//   audio.addEventListener('timeupdate', () => {
//     if (audio.duration) {
//       const pct = (audio.currentTime / audio.duration) * 100;
//       if (progress) progress.style.width = pct + '%';
//     }
//   });
//   audio.addEventListener('ended', () => {
//     if (playBtn) playBtn.textContent = '▶';
//     if (progress) progress.style.width = '0%';
//   });
// }

// // Attach play buttons (search results list)
// document.querySelectorAll('.btn-play').forEach(btn => {
//   btn.addEventListener('click', () => {
//     const url   = btn.dataset.preview;
//     const title = btn.closest('.result-row')?.querySelector('.result-title')?.textContent?.trim() || 'Preview';
//     playPreview(url, title);
//   });
// });

// // Attach play buttons (tracklist)
// document.querySelectorAll('.btn-play-sm').forEach(btn => {
//   btn.addEventListener('click', () => {
//     const url   = btn.dataset.preview;
//     const title = btn.closest('.track-row')?.querySelector('.track-name')?.textContent?.trim() || 'Preview';
//     playPreview(url, title);
//   });
// });

// // Big preview button (detail page)
// const bigPreviewBtn = document.querySelector('.btn-preview-big');
// if (bigPreviewBtn) {
//   bigPreviewBtn.addEventListener('click', () => {
//     const url   = bigPreviewBtn.dataset.preview;
//     const title = bigPreviewBtn.dataset.title || 'Preview';
//     if (audio && !audio.paused && currentPreviewUrl === url) {
//       togglePlay();
//     } else {
//       playPreview(url, title);
//       bigPreviewBtn.textContent = '⏸ Playing…';
//     }
//   });
// }

// // ── Star picker (edit page) ────────────────────────────────
// const starPicker   = document.getElementById('starPicker');
// const ratingInput  = document.getElementById('ratingInput');

// if (starPicker && ratingInput) {
//   const starBtns = starPicker.querySelectorAll('.star-btn');

//   starBtns.forEach(btn => {
//     btn.addEventListener('click', () => {
//       const val = parseInt(btn.dataset.val);
//       ratingInput.value = val;
//       starBtns.forEach((s, i) => {
//         s.classList.toggle('active', i < val);
//       });
//     });

//     btn.addEventListener('mouseenter', () => {
//       const val = parseInt(btn.dataset.val);
//       starBtns.forEach((s, i) => s.classList.toggle('active', i < val));
//     });
//   });

//   starPicker.addEventListener('mouseleave', () => {
//     const current = parseInt(ratingInput.value) || 0;
//     starBtns.forEach((s, i) => s.classList.toggle('active', i < current));
//   });
// }

// // ── Notes char counter ─────────────────────────────────────
// const noteArea  = document.getElementById('notes');
// const noteCount = document.getElementById('noteCount');
// if (noteArea && noteCount) {
//   noteArea.addEventListener('input', () => {
//     noteCount.textContent = noteArea.value.length;
//   });
// }

// // ── Flash toast for ?added=true ────────────────────────────
// const params = new URLSearchParams(window.location.search);
// if (params.get('added') === 'true') {
//   const toast = document.createElement('div');
//   toast.textContent = '✓ Added to your journal!';
//   Object.assign(toast.style, {
//     position: 'fixed', bottom: '90px', right: '1.5rem',
//     background: '#1db954', color: '#000',
//     padding: '0.75rem 1.25rem', borderRadius: '8px',
//     fontWeight: '600', fontSize: '0.88rem',
//     zIndex: '999', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
//     transition: 'opacity 0.4s ease'
//   });
//   document.body.appendChild(toast);
//   setTimeout(() => { toast.style.opacity = '0'; }, 2500);
//   setTimeout(() => toast.remove(), 3000);
// }


// TuneTrail — client-side JS

// ── Active nav link ────────────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === '/' ? currentPath === '/' : currentPath.startsWith(href)) {
    link.classList.add('active');
  }
});

// ── Audio preview player ───────────────────────────────────
const audio       = document.getElementById('audioPlayer');
const playerBar   = document.getElementById('playerBar');
const playerTitle = document.getElementById('playerTitle');
const playBtn     = document.getElementById('playerPlayBtn');
const progress    = document.getElementById('playerProgress');
const closeBtn    = document.getElementById('playerClose');

let currentPreviewUrl = null;

function playPreview(url, title) {
  if (!audio) return;
  currentPreviewUrl = url;
  audio.src = url;
  audio.play();
  playerTitle.textContent = title || 'Preview';
  playerBar.classList.add('visible');
  playBtn.textContent = '⏸';
}

function togglePlay() {
  if (!audio) return;
  if (audio.paused) { audio.play(); playBtn.textContent = '⏸'; }
  else              { audio.pause(); playBtn.textContent = '▶'; }
}

if (playBtn) playBtn.addEventListener('click', togglePlay);

if (closeBtn) closeBtn.addEventListener('click', () => {
  audio.pause();
  audio.src = '';
  playerBar.classList.remove('visible');
  currentPreviewUrl = null;
});

if (audio) {
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (progress) progress.style.width = pct + '%';
    }
  });
  audio.addEventListener('ended', () => {
    if (playBtn) playBtn.textContent = '▶';
    if (progress) progress.style.width = '0%';
  });
}

// Attach play buttons (search results list)
document.querySelectorAll('.btn-play').forEach(btn => {
  btn.addEventListener('click', () => {
    const url   = btn.dataset.preview;
    const title = btn.closest('.result-row')?.querySelector('.result-title')?.textContent?.trim() || 'Preview';
    playPreview(url, title);
  });
});

// Attach play buttons (tracklist)
document.querySelectorAll('.btn-play-sm').forEach(btn => {
  btn.addEventListener('click', () => {
    const url   = btn.dataset.preview;
    const title = btn.closest('.track-row')?.querySelector('.track-name')?.textContent?.trim() || 'Preview';
    playPreview(url, title);
  });
});

// Big preview button (detail page)
const bigPreviewBtn = document.querySelector('.btn-preview-big');
if (bigPreviewBtn) {
  bigPreviewBtn.addEventListener('click', () => {
    const url   = bigPreviewBtn.dataset.preview;
    const title = bigPreviewBtn.dataset.title || 'Preview';
    if (audio && !audio.paused && currentPreviewUrl === url) {
      togglePlay();
    } else {
      playPreview(url, title);
      bigPreviewBtn.textContent = '⏸ Playing…';
    }
  });
}

// ── Star picker (edit page) ────────────────────────────────
const starPicker   = document.getElementById('starPicker');
const ratingInput  = document.getElementById('ratingInput');

if (starPicker && ratingInput) {
  const starBtns = starPicker.querySelectorAll('.star-btn');

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.val);
      ratingInput.value = val;
      starBtns.forEach((s, i) => {
        s.classList.toggle('active', i < val);
      });
    });

    btn.addEventListener('mouseenter', () => {
      const val = parseInt(btn.dataset.val);
      starBtns.forEach((s, i) => s.classList.toggle('active', i < val));
    });
  });

  starPicker.addEventListener('mouseleave', () => {
    const current = parseInt(ratingInput.value) || 0;
    starBtns.forEach((s, i) => s.classList.toggle('active', i < current));
  });
}

// ── Notes char counter ─────────────────────────────────────
const noteArea  = document.getElementById('notes');
const noteCount = document.getElementById('noteCount');
if (noteArea && noteCount) {
  noteArea.addEventListener('input', () => {
    noteCount.textContent = noteArea.value.length;
  });
}

// ── Flash toast for ?added=true ────────────────────────────
const params = new URLSearchParams(window.location.search);
if (params.get('added') === 'true') {
  const toast = document.createElement('div');
  toast.textContent = '✓ Added to your journal!';
  Object.assign(toast.style, {
    position: 'fixed', bottom: '90px', right: '1.5rem',
    background: '#4f8ef7', color: '#fff',
    padding: '0.75rem 1.25rem', borderRadius: '8px',
    fontWeight: '600', fontSize: '0.88rem',
    zIndex: '999', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    transition: 'opacity 0.4s ease'
  });
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  setTimeout(() => toast.remove(), 3000);
}