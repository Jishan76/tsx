import express, { Request, Response } from 'express';
import ytSearch from 'yt-search';
import ytdl from 'ytdl-core';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/video', async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).send('Missing query parameter');
  }

  try {
    const { videos } = await ytSearch(query);

    if (!videos.length) {
      return res.status(404).send('No videos found');
    }

    const firstVideo = videos[0];
    const videoInfo = await ytdl.getInfo(firstVideo.url);
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });

    if (!videoFormat) {
      return res.status(404).send('No video found');
    }

    const videoUrl = videoFormat.url;
    res.redirect(videoUrl);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/audio', async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).send('Missing query parameter');
  }

  try {
    const { videos } = await ytSearch(query);

    if (!videos.length) {
      return res.status(404).send('No videos found');
    }

    const firstVideo = videos[0];
    const videoInfo = await ytdl.getInfo(firstVideo.url);
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

    if (!audioFormat) {
      return res.status(404).send('No audio found');
    }

    const audioUrl = audioFormat.url;
    res.redirect(audioUrl);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
