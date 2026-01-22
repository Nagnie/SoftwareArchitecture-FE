import { io, Socket } from 'socket.io-client';

import { envConfig } from '@/config/envConfig';
import type {
  AllTickersCallback,
  AllTickersUpdateData,
  CandleCallback,
  CandleUpdateData,
  HistoricalDataCallback,
  TickerCallback,
  TickerUpdateData
} from '@/services/market/type';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private candleUpdateHandler: ((data: CandleUpdateData) => void) | null = null;
  private tickerUpdateHandler: ((data: TickerUpdateData) => void) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private historicalDataHandler: ((data: any) => void) | null = null;

  constructor() {
    this.reconnectAttempts = envConfig.MARKET_WS_RECONNECT_ATTEMPTS;
    this.maxReconnectAttempts = envConfig.MARKET_WS_MAX_RECONNECT_ATTEMPTS;
    this.reconnectDelay = envConfig.MARKET_WS_RECONNECT_DELAY;
  }

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('>>> establishing WebSocket connection to', envConfig.MARKET_WS_URL);

    this.socket = io(envConfig.MARKET_WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000
    });

    this.setupEventHandlers();

    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('connected', (data) => {
      console.log('Connected to server:', data);
    });
  }

  subscribeToAllTickers(callback: AllTickersCallback): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket?.emit('subscribe-all-tickers');

    this.socket?.on('all-tickers-update', (data: AllTickersUpdateData) => {
      callback(data.data);
    });
  }

  unsubscribeFromAllTickers(): void {
    this.socket?.off('all-tickers-update');
  }

  subscribeToSymbol(
    symbol: string,
    interval: string,
    onCandleUpdate: CandleCallback,
    onTickerUpdate?: TickerCallback,
    onHistoricalData?: HistoricalDataCallback
  ): void {
    if (!this.socket) {
      this.connect();
    }

    // Remove old listeners first để tránh duplicate
    this.removeAllUpdateListeners();

    // Emit subscribe event
    this.socket?.emit('subscribe', { symbol, interval });

    // Create and store candle update handler với filter cả symbol VÀ interval
    this.candleUpdateHandler = (data: CandleUpdateData) => {
      if (data.symbol === symbol && data.interval === interval) {
        onCandleUpdate(data.data);
      }
    };
    this.socket?.on('candle-update', this.candleUpdateHandler);

    // Create and store ticker update handler
    if (onTickerUpdate) {
      this.tickerUpdateHandler = (data: TickerUpdateData) => {
        if (data.symbol === symbol) {
          onTickerUpdate(data.data);
        }
      };
      this.socket?.on('ticker-update', this.tickerUpdateHandler);
    }

    // Create and store historical data handler
    if (onHistoricalData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.historicalDataHandler = (data: any) => {
        console.log('Received historical data:', data);
        if (data.symbol === symbol && data.interval === interval && data.data && Array.isArray(data.data)) {
          onHistoricalData(data.data);
        } else {
          console.warn('Historical data is empty or invalid, will use HTTP fallback');
        }
      };
      this.socket?.on('historical-data', this.historicalDataHandler);
    }
  }

  unsubscribeFromSymbol(symbol: string, interval?: string): void {
    this.socket?.emit('unsubscribe', { symbol, interval });

    // Remove stored listeners
    this.removeAllUpdateListeners();
  }

  private removeAllUpdateListeners(): void {
    if (this.candleUpdateHandler) {
      this.socket?.off('candle-update', this.candleUpdateHandler);
      this.candleUpdateHandler = null;
    }
    if (this.tickerUpdateHandler) {
      this.socket?.off('ticker-update', this.tickerUpdateHandler);
      this.tickerUpdateHandler = null;
    }
    if (this.historicalDataHandler) {
      this.socket?.off('historical-data', this.historicalDataHandler);
      this.historicalDataHandler = null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
