import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

export interface MarketDataTick {
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  timestamp: Date;
  volume?: string;
}

export interface DerivSymbolInfo {
  symbol: string;
  displayName: string;
  category: 'forex' | 'crypto' | 'stocks' | 'indices' | 'commodities' | 'synthetic';
  isActive: boolean;
}

interface MarketDataState {
  prices: Record<string, MarketDataTick>;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  apiConnected: boolean;
  activeSymbols: DerivSymbolInfo[];
  subscribedSymbols: string[];
}

interface UseDerivMarketDataOptions {
  enabled?: boolean;
  autoSubscribe?: string[];
}

export function useDerivMarketData(options: UseDerivMarketDataOptions = {}) {
  const { enabled = true, autoSubscribe = [] } = options;
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const mountedRef = useRef(true);

  const [state, setState] = useState<MarketDataState>({
    prices: {},
    isConnected: false,
    isConnecting: false,
    error: null,
    apiConnected: false,
    activeSymbols: [],
    subscribedSymbols: []
  });

  const memoAutoSubscribe = useMemo(() => autoSubscribe, [autoSubscribe.join(',')]);

  const connect = useCallback(() => {
    if (!enabled || state.isConnecting || state.isConnected) return;

    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setState(prev => ({
        ...prev,
        error: 'Maximum reconnection attempts exceeded',
        isConnecting: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    const socket = io('http://localhost:3002/market-data', {
      auth: { token: session?.accessToken },
      transports: ['websocket', 'polling'],
      forceNew: true,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      reconnectAttempts.current = 0;
      setState(prev => ({ ...prev, isConnected: true, isConnecting: false, error: null }));
      if (memoAutoSubscribe.length > 0) socket.emit('subscribe_symbols', { symbols: memoAutoSubscribe });
      socket.emit('get_active_symbols');
    });

    socket.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
      if (enabled) {
        reconnectAttempts.current++;
        const delay = Math.min(3000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
        reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connect error:', err);
      setState(prev => ({ ...prev, error: 'Connection failed', isConnecting: false }));
    });

    socket.on('price_update', (data: { type: string; data: MarketDataTick }) => {
      const tick = data.data;
      setState(prev => ({
        ...prev,
        prices: { ...prev.prices, [tick.symbol]: { ...tick, timestamp: new Date(tick.timestamp) } }
      }));
    });

    socket.on('active_symbols', (data: { symbols: DerivSymbolInfo[] }) => {
      setState(prev => ({ ...prev, activeSymbols: data.symbols }));
    });

    socket.on('subscribed', (data: { symbols: string[] }) => {
      setState(prev => ({ ...prev, subscribedSymbols: [...new Set([...prev.subscribedSymbols, ...data.symbols])] }));
    });

    socket.on('unsubscribed', (data: { symbols: string[] }) => {
      setState(prev => ({ ...prev, subscribedSymbols: prev.subscribedSymbols.filter(s => !data.symbols.includes(s)) }));
    });

    socket.on('api_status', (data: { connected: boolean }) => {
      setState(prev => ({ ...prev, apiConnected: data.connected }));
    });

    socket.on('error', (data: { message: string }) => {
      setState(prev => ({ ...prev, error: data.message }));
    });
  }, [enabled, session?.accessToken, memoAutoSubscribe, state.isConnecting, state.isConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    socketRef.current?.disconnect();
    socketRef.current = null;
    reconnectAttempts.current = 0;
    setState(prev => ({ ...prev, isConnected: false, isConnecting: false, subscribedSymbols: [] }));
  }, []);

  const subscribeToSymbols = useCallback((symbols: string[]) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('subscribe_symbols', { symbols });
  }, []);

  const unsubscribeFromSymbols = useCallback((symbols: string[]) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('unsubscribe_symbols', { symbols });
  }, []);
    const formatSymbolDisplay = useCallback((symbol: string) => {
    if (!symbol) return "";
    return symbol.replace(/[_-]/g, "/").toUpperCase(); // e.g. EUR_USD -> EUR/USD
  }, []);


  const getSymbolPrice = useCallback((symbol: string) => state.prices[symbol] || null, [state.prices]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    subscribeToSymbols,
    formatSymbolDisplay,
    unsubscribeFromSymbols,
    getSymbolPrice,
    connectedSymbolCount: state.subscribedSymbols.length,
    totalPriceUpdates: Object.keys(state.prices).length,
    connectionStatus: state.isConnected
      ? 'connected'
      : state.isConnecting
      ? 'connecting'
      : state.error
      ? 'error'
      : 'disconnected'
  };
}
  
