// server.js (CommonJS)
require("dotenv").config();
const axios = require("axios");
console.log("Your API Key:", process.env.POKEMON_API_KEY);

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve your front-end from /public
app.use(express.static(path.join(__dirname, "public")));

// Helper: load episodes.json from disk (so edits are picked up)
function loadEpisodes() {
  const raw = fs.readFileSync(path.join(__dirname, "episodes.json"), "utf-8");
  return JSON.parse(raw);
}

/**
 * GET /api/episodes?query=pokemon
 * Returns:
 *   { results: [ { id, title, number, image } ] }
 */
app.get("/api/episodes", async (req, res) => {
  // TODO: if you have a legal external provider, call it here and map to our shape.
  // For now, we fallback to local episodes.json:
  const q = (req.query.query || "").toString().toLowerCase();
  const eps = loadEpisodes();
  let results = eps.map((e, idx) => ({
    id: String(e.id),
    title: e.title,
    number: e.id ?? (idx + 1),
    image: e.image || `https://picsum.photos/seed/poke-${e.id}/640/360`
  }));
  if (q) {
    results = results.filter(
      r => r.title.toLowerCase().includes(q) || String(r.number).includes(q)
    );
  }
  res.json({ results });
});

/**
 * GET /api/episode-sources?id=1
 * Returns:
 *   { title, number, total, sources: [ { url, quality, isHls } ] }
 */
app.get("/api/episode-sources", async (req, res) => {
  const id = (req.query.id || "").toString();
  if (!id) return res.status(400).json({ error: "id required" });

  // TODO: if you have a legal external provider, call it here and map to our shape.
  // Fallback to local episodes.json (single source per episode)
  const eps = loadEpisodes();
  const idx = eps.findIndex(e => String(e.id) === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const ep = eps[idx];
  const total = eps.length;
  const isHls = /\.m3u8($|\?)/i.test(ep.url);

  res.json({
    title: ep.title,
    number: ep.id ?? (idx + 1),
    total,
    sources: [
      { url: ep.url, quality: isHls ? "HLS" : "MP4", isHls }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT}/episodes.html`);
});
