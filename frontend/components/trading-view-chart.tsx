"use client"

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol = "NASDAQ:AAPL" }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Suppress known TradingView console warnings on client side
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      // Suppress TradingView schema validation warnings
      if (message.includes('data type: unknown does not match a schema') ||
          message.includes('Property:The state with a data type')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      // Restore original console.error on cleanup
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    if (!container.current) return;
    
    const scriptId = 'tradingview-widget-script';
    // Ensure script is not loaded multiple times
    if (document.getElementById(scriptId)) {
      initializeWidget();
      return;
    }

    try {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        initializeWidget();
      };
      
      script.onerror = () => {
        console.error("Failed to load TradingView script");
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error("Error loading TradingView widget:", error);
    }

    return () => {
      // Cleanup on unmount
      if (widgetRef.current) {
        try {
          widgetRef.current.remove?.();
        } catch (e) {
          console.warn("Error removing TradingView widget:", e);
        }
        widgetRef.current = null;
      }
      
      if (container.current) {
        container.current.innerHTML = "";
      }
    }
  }, [symbol]);

  const initializeWidget = () => {
    if (!container.current || !window.TradingView) return;

    try {
      const widgetContainerId = `tradingview_container_${Math.random().toString(36).substring(2, 9)}`;
      container.current.id = widgetContainerId;
      
      // Clear any existing content
      container.current.innerHTML = "";
      
      const widgetConfig = {
        autosize: true,
        symbol: symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "light" as const,
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: widgetContainerId,
        // Add additional configuration to prevent schema errors
        hide_side_toolbar: false,
        hide_legend: false,
        save_image: false,
        calendar: false,
        hide_volume: false,
        support_host: "https://www.tradingview.com"
      };
      
      widgetRef.current = new window.TradingView.widget(widgetConfig);
    } catch (error) {
      console.error("Error initializing TradingView widget:", error);
    }
  };

  return (
    <div className="tradingview-widget-container" style={{ height: "500px", width: "100%" }}>
      <div ref={container} className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }} />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewChart);
