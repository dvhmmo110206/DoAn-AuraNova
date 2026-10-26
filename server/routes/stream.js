// CineStream Video Streaming Engine
// Implements HTTP Range Requests (RFC 7233) for chunked video streaming & seeking
// Dynamically detects and streams user-updated demo videos in server/media/demo_videos/

const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();
const mediaDir = path.resolve(__dirname, '..', 'media', 'demo_videos');

// Global round-robin counter for rotate mode
let rotationCounter = 0;

// Friendly title map for known demo files
const FRIENDLY_NAMES = {
  'celestial_starlight.mp4': 'Tears of Steel: Cybernetic Awakening',
  'neon_cyber_odyssey.mp4': 'Sintel: The Dragon Chronicles',
  'deep_abyss_expedition.mp4': 'The Silent Abyss: Oceanic Horizons',
  'animated_woodland_escape.mp4': 'Big Buck Bunny: The Great Escape',
  'phantom_assassin_chronicles.mp4': 'Flora Symphony: Nature Time-lapse',
  'hyperdrive_velocity.mp4': 'Hyper Velocity: Supersonic Midnight'
};

// Ordered Playlist Sequence
const PLAYLIST_ORDER = [
  'neon_cyber_odyssey.mp4',
  'deep_abyss_expedition.mp4',
  'celestial_starlight.mp4',
  'phantom_assassin_chronicles.mp4',
  'animated_woodland_escape.mp4',
  'hyperdrive_velocity.mp4'
];

// Dynamically scan media folder for all supported video files
function getAvailableVideos() {
  if (!fs.existsSync(mediaDir)) {
    return [];
  }
  const files = fs.readdirSync(mediaDir)
    .filter((f) => /\.(mp4|webm|mkv|mov)$/i.test(f))
    .sort((a, b) => {
      const idxA = PLAYLIST_ORDER.indexOf(a);
      const idxB = PLAYLIST_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

  return files.map((filename, index) => {
    const filePath = path.join(mediaDir, filename);
    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    const size = stat ? stat.size : 0;
    const rawBase = path.parse(filename).name;

    const prettyTitle = FRIENDLY_NAMES[filename] ||
      rawBase
        .split(/[_-]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    return {
      id: index,
      filename,
      title: prettyTitle,
      fileSize: size,
      streamUrl: `/api/stream/${index}`
    };
  });
}

// Deterministic hash to map any movie/episode ID consistently across available videos
function getIndexForId(idStr, total) {
  if (!total || total <= 0) return 0;
  if (!idStr) return 0;
  if (/^\d+$/.test(idStr)) {
    return parseInt(idStr, 10) % total;
  }
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % total;
}

// GET /api/stream/meta - Retrieve list of currently available demo videos & status
router.get('/meta', (req, res) => {
  const videos = getAvailableVideos();
  res.json({
    totalVideos: videos.length,
    rotationMode: 'Deterministic ID Modulo + Sequential Support',
    videos
  });
});

// GET /api/stream/playlist - Retrieve ordered video playlist array
router.get('/playlist', (req, res) => {
  const videos = getAvailableVideos();
  res.json({
    success: true,
    total: videos.length,
    playlist: videos
  });
});

// GET /api/stream/:id - Stream video with HTTP 206 Partial Content
router.get('/:id', (req, res) => {
  const videos = getAvailableVideos();
  if (videos.length === 0) {
    return res.status(404).json({
      error: 'No demo videos found in server/media/demo_videos/'
    });
  }

  const requestedId = req.params.id;
  const isRotating = req.query.rotate === 'true' || requestedId === 'rotate' || requestedId === 'random';

  let selectedVideo = null;

  // 1. Direct filename match if requested (e.g. /api/stream/kiem_lai or /api/stream/kiem_lai.mp4)
  const byName = videos.find((v) => 
    v.filename.toLowerCase() === requestedId.toLowerCase() ||
    path.parse(v.filename).name.toLowerCase() === requestedId.toLowerCase()
  );

  if (byName) {
    selectedVideo = byName;
  } else if (isRotating) {
    const videoIndex = rotationCounter % videos.length;
    rotationCounter++;
    selectedVideo = videos[videoIndex];
  } else if (req.query.v !== undefined && !isNaN(parseInt(req.query.v, 10))) {
    const videoIndex = parseInt(req.query.v, 10) % videos.length;
    selectedVideo = videos[videoIndex];
  } else {
    const videoIndex = getIndexForId(requestedId, videos.length);
    selectedVideo = videos[videoIndex];
  }

  const videoPath = path.join(mediaDir, selectedVideo.filename);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({
      error: 'Demo video file not found on server',
      filename: selectedVideo.filename
    });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Response headers for video streaming
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
  res.setHeader('X-CineStream-Video-Index', selectedVideo.id);
  res.setHeader('X-CineStream-Video-Filename', selectedVideo.filename);
  res.setHeader('X-CineStream-Video-Title', encodeURIComponent(selectedVideo.title));

  if (range) {
    // Parse Range header: e.g. "bytes=32324-" or "bytes=0-1024"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Safety checks for range bounds
    if (start >= fileSize || end >= fileSize || start > end) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      return res.end();
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    });

    fileStream.pipe(res);

    // Clean up stream if client disconnects/pauses
    req.on('close', () => {
      fileStream.destroy();
    });
  } else {
    // Full content response if no Range requested
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Content-Type': 'video/mp4'
    });

    const fileStream = fs.createReadStream(videoPath);
    fileStream.pipe(res);

    req.on('close', () => {
      fileStream.destroy();
    });
  }
});

module.exports = router;
