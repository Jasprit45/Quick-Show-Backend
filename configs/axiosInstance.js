import axios from "axios";
import axiosRetry from "axios-retry";

const tmdbAxios = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
  // Limit simultaneous sockets to TMDB
  httpsAgent: new (await import("https")).Agent({
    maxSockets: 2,        // max 2 concurrent connections
    keepAlive: true,      // reuse sockets instead of opening new ones each time
  }),
  timeout: 10000,         // 10s timeout
});

// Auto-retry on ECONNRESET with exponential backoff
axiosRetry(tmdbAxios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,   // 100ms → 200ms → 400ms
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkError(error) ||     // covers ECONNRESET
      axiosRetry.isRetryableError(error) ||   // 5xx responses
      error.code === "ECONNRESET"
    );
  },
  onRetry: (retryCount, error) => {
    console.warn(`Retry #${retryCount} for [${error.config?.url}] — ${error.code}`);
  },
});

export default tmdbAxios;