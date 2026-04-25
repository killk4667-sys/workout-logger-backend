// server.js
require('dotenv').config(); // <-- THIS MUST BE LINE 1

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});