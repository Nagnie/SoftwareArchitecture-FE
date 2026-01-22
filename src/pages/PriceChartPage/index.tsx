import { Header } from '@/pages/PriceChartPage/components/Header';
import { get24hrTicker, getHistoryCandles, getSymbols, type Candle, type TickerData } from '@/services/market';
import { websocketService } from '@/services/market/socket';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export const PriceChartPage = () => {
  const { baseAsset, tickerSymbol } = useParams();
  const symbol = tickerSymbol!;

  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setIntervalTime] = useState('1h');
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

  // Price Flash State
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number>(0);
  const flashTimerRef = useRef<number | null>(null);

  // Fetch available symbols on mount
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const symbols = await getSymbols();
        setAvailableSymbols(symbols);
      } catch (error) {
        console.log('🚀 ~ fetchSymbols ~ error:', error);
      }
    };
    fetchSymbols();
  }, []);

  // Effect to handle price flashing
  useEffect(() => {
    if (ticker?.lastPrice) {
      const currentPrice = parseFloat(ticker.lastPrice);

      if (prevPriceRef.current !== 0 && prevPriceRef.current !== currentPrice) {
        if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);

        if (currentPrice > prevPriceRef.current) {
          requestAnimationFrame(() => {
            setPriceDirection('up');
          });
        } else if (currentPrice < prevPriceRef.current) {
          requestAnimationFrame(() => {
            setPriceDirection('down');
          });
        }

        flashTimerRef.current = window.setTimeout(() => {
          setPriceDirection(null);
        }, 400);
      }
      prevPriceRef.current = currentPrice;
    }
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, [ticker?.lastPrice]);

  // Main data loading effect
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      let historicalDataReceived = false;

      try {
        // Connect WebSocket first để có thể nhận historical data
        websocketService.subscribeToSymbol(
          symbol,
          interval,
          (candleUpdate) => {
            setCandles((prev) => {
              if (prev.length === 0) return [candleUpdate];
              const lastCandle = prev[prev.length - 1];

              if (lastCandle.time === candleUpdate.time) {
                // Update existing candle
                const newCandles = [...prev];
                newCandles[newCandles.length - 1] = candleUpdate;
                return newCandles;
              } else if (candleUpdate.time > lastCandle.time) {
                // Chỉ thêm nến mới nếu nến cuối cùng đã isFinal HOẶC đây là nến đầu tiên
                // Điều này ngăn việc tạo nến mới khi nến hiện tại chưa hoàn thành
                if (lastCandle.isFinal) {
                  return [...prev, candleUpdate];
                } else {
                  // Nếu nến cuối chưa final mà có time mới hơn, cập nhật nến cuối
                  // (có thể là do đồng bộ dữ liệu hoặc chuyển timeframe)
                  const newCandles = [...prev];
                  newCandles[newCandles.length - 1] = candleUpdate;
                  return newCandles;
                }
              }
              return prev;
            });
          },
          (tickerUpdate) => {
            setTicker(tickerUpdate);
          },
          (historicalCandles) => {
            // Callback khi nhận được historical data từ WebSocket
            if (historicalCandles && historicalCandles.length > 0) {
              console.log('✅ Using historical data from WebSocket:', historicalCandles.length);
              setCandles(historicalCandles);
              historicalDataReceived = true;
            }
          }
        );

        // Đợi một chút để xem WebSocket có gửi historical data không
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Nếu WebSocket không gửi dữ liệu lịch sử (hoặc gửi mảng rỗng), fallback về HTTP
        if (!historicalDataReceived) {
          console.log('⚠️ No historical data from WebSocket, using HTTP fallback');
          const [candlesData, tickerData] = await Promise.all([
            getHistoryCandles(symbol, interval),
            get24hrTicker(symbol)
          ]);
          console.log('🚀 ~ initData ~ candlesData:', candlesData);

          setCandles(candlesData);

          if (tickerData) {
            setTicker(tickerData);
            prevPriceRef.current = parseFloat(tickerData.lastPrice);
          }
        } else {
          // Vẫn cần fetch ticker và news nếu chỉ có historical data từ WebSocket
          const [tickerData] = await Promise.all([get24hrTicker(symbol)]);

          if (tickerData) {
            setTicker(tickerData);
            prevPriceRef.current = parseFloat(tickerData.lastPrice);
          }
        }
      } catch (err) {
        console.error('Initialization error', err);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // Cleanup on unmount or when dependencies change
    return () => {
      websocketService.unsubscribeFromSymbol(symbol, interval);
    };
  }, [interval, symbol]);

  return (
    <div>
      <Header priceDirection={priceDirection} ticker={ticker} />
      <div>Price Chart Content</div>
    </div>
  );
};
