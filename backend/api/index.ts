import app from '../src/app';

// Ensure full compatibility with both CommonJS (module.exports = app)
// and ES module default export runners in Vercel serverless functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

export default app;
