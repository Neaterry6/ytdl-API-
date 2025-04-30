const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())

// Root route
app.get('/', (req, res) => {
  res.send('YouTube Search & Downloader API is up and running!')
})

// Search YouTube
app.get('/search', async (req, res) => {
  const query = req.query.q
  if (!query) return res.status(400).json({ status: false, message: 'Missing search query' })

  try {
    const result = await ytSearch(query)
    if (!result.videos.length) return res.status(404).json({ status: false, message: 'No results found' })

    const video = result.videos[0]
    res.json({
      status: true,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.timestamp,
      views: video.views,
      author: video.author.name
    })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Search failed', error: error.message })
  }
})

// Download video by search
app.get('/download/video', async (req, res) => {
  const query = req.query.q
  if (!query) return res.status(400).json({ status: false, message: 'Missing search query' })

  try {
    const result = await ytSearch(query)
    if (!result.videos.length) return res.status(404).json({ status: false, message: 'No results found' })

    const videoURL = result.videos[0].url
    res.header('Content-Disposition', `attachment; filename="video.mp4"`)
    ytdl(videoURL, { format: 'mp4' }).pipe(res)
  } catch (error) {
    res.status(500).json({ status: false, message: 'Video download failed', error: error.message })
  }
})

// Download audio by search
app.get('/download/audio', async (req, res) => {
  const query = req.query.q
  if (!query) return res.status(400).json({ status: false, message: 'Missing search query' })

  try {
    const result = await ytSearch(query)
    if (!result.videos.length) return res.status(404).json({ status: false, message: 'No results found' })

    const videoURL = result.videos[0].url
    res.header('Content-Disposition', `attachment; filename="audio.mp3"`)
    ytdl(videoURL, { filter: 'audioonly' }).pipe(res)
  } catch (error) {
    res.status(500).json({ status: false, message: 'Audio download failed', error: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`YouTube Search & Downloader API running at http://localhost:${PORT}`)
})
