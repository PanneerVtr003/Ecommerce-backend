const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Direct route - no separate files needed
app.post('/api/orders', (req, res) => {
  res.json({
    success: true,
    message: 'Order endpoint is now working!',
    order: {
      id: 'ORD-' + Date.now(),
      ...req.body,
      status: 'confirmed'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});