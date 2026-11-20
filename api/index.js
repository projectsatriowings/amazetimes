// Vercel Serverless Function entry point for Amaze Times API
import app from '../server/index.js';

export default function handler(req, res) {
  return app(req, res);
}
