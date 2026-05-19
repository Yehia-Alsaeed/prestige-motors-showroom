// Centralized API configuration
// In production, set VITE_API_URL in your .env to an empty string ("") to use relative paths, 
// or point it to the actual backend URL if separated.
export const API_BASE = typeof import.meta.env.VITE_API_URL === 'string'
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000';
