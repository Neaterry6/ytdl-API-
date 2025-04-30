// Disable ytdl-core update check
process.env.YTDL_NO_UPDATE = 'true';

const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('YouTube Downloader API is running.');
});

// Search route
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing search query (q)' });

    const result = await ytSearch(query);
    if (!result.videos.length) return res.status(404).json({ error: 'No videos found' });

    const videos = result.videos.slice(0, 5).map(video => ({
      title: video.title,
      url: video.url,
      views: video.views,
      duration: video.timestamp,
      thumbnail: video.thumbnail,
      author: video.author.name
    }));

    res.json({ results: videos });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

// Download video route
app.get('/download/video', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing video query (q)' });

    const result = await ytSearch(query);
    if (!result.videos.length) return res.status(404).json({ error: 'No videos found' });

    const video = result.videos[0];
    const info = await ytdl.getInfo(video.url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

    ytdl(video.url, {
      format: 'mp4',
      quality: 'highest'
    }).pipe(res);

  } catch (err) {
    res.status(500).json({ error: 'Download failed', details: err.message });
  }
});

// Download audio route
app.get('/download/audio', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing audio query (q)' });

    const result = await ytSearch(query);
    if (!result.videos.length) return res.status(404).json({ error: 'No videos found' });

    const video = result.videos[0];
    const info = await ytdl.getInfo(video.url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);

    ytdl(video.url, {
      filter: 'audioonly',
      quality: 'highestaudio'
    }).pipe(res);

  } catch (err) {
    res.status(500).json({ error: 'Download failed', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
