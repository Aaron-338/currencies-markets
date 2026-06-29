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
  autoSubscribeSymbols?: string[];
}

export function useDerivMarketDataV2(options: UseDerivMarketDataOptions = {}) {
  const { enabled = true } = options;
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);

  const autoSubscribeSymbols = useMemo(
    () => options.autoSubscribeSymbols || [],
    [options.autoSubscribeSymbols?.join(',')]
  );

  const [state, setState] = useState<MarketDataState>({
    prices: {},
    isConnected: false,
    isConnecting: false,
    error: null,
    apiConnected: false,
    activeSymbols: [],
    subscribedSymbols: []
  });

  // Connect to backend WebSocket
  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current || state.isConnected || state.isConnecting) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    const socket = io('http://localhost:3002/market-data', {
      auth: { token: session?.accessToken },
      transports: ['websocket', 'polling'],
      forceNew: true,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, isConnected: true, isConnecting: false, error: null }));
      // Auto-subscribe to symbols
      if (autoSubscribeSymbols.length > 0) {
        socket.emit('subscribe_symbols', { symbols: autoSubscribeSymbols });
      }
      socket.emit('get_active_symbols');
    });

    socket.on('disconnect', () => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
    });

    socket.on('connect_error', (err) => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, error: 'Connection failed', isConnecting: false }));
      console.error('WebSocket connect error:', err);
    });

    socket.on('price_update', (data: MarketDataTick) => {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        prices: { ...prev.prices, [data.symbol]: { ...data, timestamp: new Date(data.timestamp) } }
      }));
    });

    socket.on('active_symbols', (data: DerivSymbolInfo[]) => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, activeSymbols: data }));
    });

    socket.on('subscribed', (data: { symbols: string[] }) => {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        subscribedSymbols: [...new Set([...prev.subscribedSymbols, ...data.symbols])]
      }));
    });

    socket.on('unsubscribed', (data: { symbols: string[] }) => {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        subscribedSymbols: prev.subscribedSymbols.filter(s => !data.symbols.includes(s))
      }));
    });

    socket.on('api_status', (data: { connected: boolean }) => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, apiConnected: data.connected }));
    });

    socket.on('error', (data: { message: string }) => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, error: data.message }));
    });

  }, [enabled, session?.accessToken, autoSubscribeSymbols]);

  const subscribeToSymbols = useCallback((symbols: string[]) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('subscribe_symbols', { symbols });
  }, []);

  const unsubscribeFromSymbols = useCallback((symbols: string[]) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('unsubscribe_symbols', { symbols });
  }, []);

  const getSymbolPrice = useCallback((symbol: string) => {
    return state.prices[symbol] || null;
  }, [state.prices]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();
    return () => {
      mountedRef.current = false;
      socketRef.current?.disconnect();
    };
  }, [enabled, connect]);

  useEffect(() => {
    if (state.isConnected && autoSubscribeSymbols.length > 0) {
      subscribeToSymbols(autoSubscribeSymbols);
    }
  }, [state.isConnected, autoSubscribeSymbols, subscribeToSymbols]);

  return {
    ...state,
    connect,
    disconnect: () => socketRef.current?.disconnect(),
    subscribeToSymbols,
    unsubscribeFromSymbols,
    getSymbolPrice,
    totalPriceUpdates: Object.keys(state.prices).length,
    connectionStatus: state.isConnected ? 'connected' :
                      state.isConnecting ? 'connecting' :
                      state.error ? 'error' : 'disconnected'
  };
}
