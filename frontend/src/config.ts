// Centralized API configuration
// In production, set VITE_API_URL in your .env to the real HTTPS backend URL
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
