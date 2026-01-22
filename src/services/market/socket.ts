import { io, Socket } from 'socket.io-client';

import { envConfig } from '@/config/envConfig';
import type { AllTickersCallback, AllTickersUpdateData } from '@/services/market/type';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor() {
    this.reconnectAttempts = envConfig.MARKET_WS_RECONNECT_ATTEMPTS;
    this.maxReconnectAttempts = envConfig.MARKET_WS_MAX_RECONNECT_ATTEMPTS;
    this.reconnectDelay = envConfig.MARKET_WS_RECONNECT_DELAY;
  }

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

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
