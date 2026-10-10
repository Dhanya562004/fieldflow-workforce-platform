import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 FieldFlow Operations REST API running on port ${PORT}`);
  console.log(`📊 Health Endpoint: http://localhost:${PORT}/health`);
  console.log(`📑 API Explorer & Specs: http://localhost:${PORT}/api/docs`);
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
