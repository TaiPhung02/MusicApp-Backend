const express = require("express");
const cors = require("cors");
const axios = require("axios");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const DEEZER_API_URL = process.env.DEEZER_API_URL || "https://api.deezer.com";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});

const YOUTUBE_API_KEYS = process.env.YOUTUBE_API_KEYS.split(",");
let currentKeyIndex = 0;

const getYouTubeUrl = async (query) => {
  let attempts = 0;

  while (attempts < YOUTUBE_API_KEYS.length) {
    const apiKey = YOUTUBE_API_KEYS[currentKeyIndex];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&key=${apiKey}`;

    try {
      const response = await axios.get(url);

      if (response.data.items.length > 0) {
        return `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
      } else {
        return null;
      }
    } catch (error) {
      console.error(
        `Error with API Key: ${apiKey}`,
        error.response?.data || error.message
      );

      if (error.response && error.response.status === 403) {
        currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length;
        attempts++;
      } else {
        throw error;
      }
    }
  }

  return null;
};

app.get("/api/youtube", async (req, res) => {
  try {
    const { song, artist } = req.query;
    if (!song || !artist) {
      return res.status(400).json({ error: "Missing song or artist query" });
    }

    const query = `${song} ${artist}`;
    const youtubeUrl = await getYouTubeUrl(query);

    if (youtubeUrl) {
      return res.json({ url: youtubeUrl });
    } else {
      return res
        .status(404)
        .json({ error: "No results found or quota exceeded" });
    }
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/deezer/chart", async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const index = req.query.index || 0;

    const response = await axios.get(
      `${DEEZER_API_URL}/chart/0/tracks?limit=${limit}&index=${index}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/api/deezer/track/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    const response = await axios.get(`${DEEZER_API_URL}/track/${trackId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch track details" });
  }
});

app.get("/api/deezer/artist/:artistId", async (req, res) => {
  try {
    const { artistId } = req.params;
    const response = await axios.get(`${DEEZER_API_URL}/artist/${artistId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch artist details" });
  }
});

app.get("/api/deezer/artist/:artistId/top", async (req, res) => {
  try {
    const { artistId } = req.params;
    const limit = req.query.limit || 10;

    const response = await axios.get(
      `${DEEZER_API_URL}/artist/${artistId}/top?limit=${limit}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching artist's top tracks:", error);
    res.status(500).json({ error: "Failed to fetch artist's top tracks" });
  }
});

app.get("/api/deezer/album/:albumId", async (req, res) => {
  try {
    const { albumId } = req.params;
    const response = await axios.get(`${DEEZER_API_URL}/album/${albumId}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching album details:", error);
    res.status(500).json({ error: "Failed to fetch album details" });
  }
});

app.get("/api/deezer/artist/:artistId/albums", async (req, res) => {
  try {
    const { artistId } = req.params;
    const limit = req.query.limit || 10;
    const index = req.query.index || 0;

    const response = await axios.get(
      `${DEEZER_API_URL}/artist/${artistId}/albums?limit=${limit}&index=${index}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching artist's albums:", error);
    res.status(500).json({ error: "Failed to fetch artist's albums" });
  }
});

app.get("/api/deezer/album/:albumId/tracks", async (req, res) => {
  try {
    const { albumId } = req.params;
    const response = await axios.get(
      `${DEEZER_API_URL}/album/${albumId}/tracks`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching album tracklist:", error);
    res.status(500).json({ error: "Failed to fetch album tracklist" });
  }
});

app.get("/api/deezer/chart/albums", async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const index = req.query.index || 0;

    const response = await axios.get(
      `${DEEZER_API_URL}/chart/0/albums?limit=${limit}&index=${index}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch albums chart" });
  }
});

app.get("/api/deezer/chart/artists", async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const index = req.query.index || 0;

    const response = await axios.get(
      `${DEEZER_API_URL}/chart/0/artists?limit=${limit}&index=${index}`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

app.get("/api/deezer/chart/playlists", async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const index = req.query.index || 0;

    const response = await axios.get(
      `${DEEZER_API_URL}/chart/0/playlists?limit=${limit}&index=${index}`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

app.get("/api/deezer/playlist/:playlistId", async (req, res) => {
  try {
    const { playlistId } = req.params;
    const response = await axios.get(
      `${DEEZER_API_URL}/playlist/${playlistId}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlist details" });
  }
});

app.get("/api/deezer/search", async (req, res) => {
  try {
    const { q, index } = req.query;
    const response = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q, index },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

app.get("/api/deezer/search/artist", async (req, res) => {
  try {
    const { q, limit = 20, index = 0 } = req.query;
    const response = await axios.get(`${DEEZER_API_URL}/search/artist`, {
      params: { q, limit, index },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

app.get("/api/deezer/search/album", async (req, res) => {
  try {
    const { q, limit = 20, index = 0 } = req.query;
    const response = await axios.get(`${DEEZER_API_URL}/search/album`, {
      params: { q, limit, index },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

app.get("/api/deezer/search/playlist", async (req, res) => {
  try {
    const { q, limit = 20, index = 0 } = req.query;
    const response = await axios.get(`${DEEZER_API_URL}/search/playlist`, {
      params: { q, limit, index },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
