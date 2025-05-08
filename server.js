import express from 'express';
import path from 'path';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static assets from Vite's build output (dist)
app.use(express.static(path.join(process.cwd(), 'dist')));

// Proxy endpoint for checking admin balance
app.post('/api/check_balance', async (req, res) => {
  try {
    const { token } = req.body;
    const { data } = await axios.post(
      'https://api.potanshop.com/endpoint/v1/check_balance',
      { token },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return res.json(data);
  } catch (err) {
    console.error('Error in proxy /api/check_balance:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    return res.status(status).json({ error: err.message });
  }
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 