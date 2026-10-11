import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 5000;

// Only start the HTTP listener in local development/standalone Node.
// In serverless environments (Vercel) or tests, the app is exported without binding a port.
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
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
}

// Ensure full compatibility with both CommonJS and ES module loaders
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

export default app;

