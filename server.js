// server.js
import app from './app.js';
import open from 'open';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // Automatically open the default browser to the server URL
  open(`http://localhost:${PORT}`);
});