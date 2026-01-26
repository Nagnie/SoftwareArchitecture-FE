export const envConfig = {
  MARKET_API_URL: import.meta.env.VITE_MARKET_API_URL as string,
  MARKET_WS_URL: import.meta.env.VITE_MARKET_WS_URL as string,
  MARKET_WS_RECONNECT_ATTEMPTS: parseInt(import.meta.env.VITE_MARKET_WS_RECONNECT_ATTEMPTS) || 0,
  MARKET_WS_MAX_RECONNECT_ATTEMPTS: parseInt(import.meta.env.VITE_MARKET_WS_MAX_RECONNECT_ATTEMPTS) || 5,
  MARKET_WS_RECONNECT_DELAY: parseInt(import.meta.env.VITE_MARKET_WS_RECONNECT_DELAY) || 1000,

  NEWS_API_URL: import.meta.env.VITE_NEWS_API_URL as string
};
