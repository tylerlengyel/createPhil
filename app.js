// app.js
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();

// Parse JSON bodies
app.use(bodyParser.json({ limit: '10mb' }));

// Serve static files from the "public" folder
app.use(express.static(path.join(process.cwd(), 'public')));

// Serve your JSON files for trait paths (assuming they're in a folder named "trait_json")
app.use('/traits_json', express.static(path.join(process.cwd(), 'trait_json')));

// Endpoint to save generated SVG traits
app.post('/save-trait', (req, res) => {
  const { trait, svg } = req.body;
  if (!trait || !svg) {
    return res.status(400).json({ error: 'Missing trait or svg data' });
  }
  
  // Ensure the save directory exists (using process.cwd() to get the current working directory)
  const dir = path.join(process.cwd(), 'saved_traits');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // Create a filename (using a timestamp to avoid collisions)
  const filename = `${trait}-${Date.now()}.svg`;
  const filePath = path.join(dir, filename);
  
  // Write the file
  fs.writeFile(filePath, svg, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error saving file' });
    }
    res.json({ message: 'File saved', filename });
  });
});

export default app;