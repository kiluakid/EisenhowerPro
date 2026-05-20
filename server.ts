import express from "express";
import fs from "fs/promises";
import path from "path";
import { createServer as createViteServer } from "vite";

const DATA_FILE = path.join(process.cwd(), ".data.json");

async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (err) {
    const defaultData = {
      calendars: [{ id: "default", name: "My Work" }],
      tasks: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

async function startServer() {
  await initDataFile();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API constraints
  app.get("/api/data", async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).json({ error: "Failed to read data" });
    }
  });

  app.post("/api/data", async (req, res) => {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
