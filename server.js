const express = require('express')
const ytdl = require('ytdl-core')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

// Home route (static HTML page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Video info endpoint
app.get('/info', async (req, res) => {
    const videoURL = req.query.url
    if (!videoURL) return res.status(400).json({ error: 'Video URL is required' })

    try {
        const info = await ytdl.getInfo(videoURL)
        res.json({
            title: info.videoDetails.title,
            description: info.videoDetails.description,
            lengthSeconds: info.videoDetails.lengthSeconds,
            author: info.videoDetails.author.name,
            thumbnails: info.videoDetails.thumbnails,
            views: info.videoDetails.viewCount,
        })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch video info' })
    }
})

// Download video
app.get('/download/video', async (req, res) => {
    const videoURL = req.query.url
    if (!videoURL) return res.status(400).json({ error: 'Video URL is required' })

    try {
        const info = await ytdl.getInfo(videoURL)
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '')

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`)

        ytdl(videoURL, { format: 'mp4' }).pipe(res)
    } catch (err) {
        res.status(500).json({ error: 'Failed to download video' })
    }
})

// Download audio
app.get('/download/audio', async (req, res) => {
    const videoURL = req.query.url
    if (!videoURL) return res.status(400).json({ error: 'Video URL is required' })

    try {
        const info = await ytdl.getInfo(videoURL)
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '')

        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`)

        ytdl(videoURL, {
            filter: 'audioonly',
            quality: 'highestaudio',
        }).pipe(res)
    } catch (err) {
        res.status(500).json({ error: 'Failed to download audio' })
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
}
