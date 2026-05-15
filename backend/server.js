const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectionString = 'mongodb+srv://kishore2818:8903777150@cluster0.oa6zeab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(connectionString)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Meat Booking API is Running!');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
