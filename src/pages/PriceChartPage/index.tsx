import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/pages/PriceChartPage/components/Header';
import { PriceChart } from '@/pages/PriceChartPage/components/PriceChart';
import { get24hrTicker, getHistoryCandles, type Candle, type TickerData } from '@/services/market';
import { websocketService } from '@/services/market/socket';
import { ArrowUpRight, BrainCircuit, Clock, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' }
];

export const PriceChartPage = () => {
  const { tickerSymbol } = useParams();
  const symbol = tickerSymbol!;

  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setIntervalTime] = useState('1h');
  const [ticker, setTicker] = useState<TickerData | null>(null);

  // Price Flash State
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number>(0);
  const flashTimerRef = useRef<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

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

      <main className='flex-1 space-y-8 overflow-y-auto p-4 lg:p-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Price Chart */}
          <div className='space-y-6 lg:col-span-2'>
            <div className='space-y-4'>
              <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                <h2 className='flex items-center gap-2 text-xs font-bold tracking-widest uppercase'>
                  <Clock className='h-3 w-3' /> Chart Performance • {interval.toUpperCase()}
                </h2>
                <div className='bg-card flex rounded-xl border p-1 backdrop-blur-sm'>
                  {INTERVALS.map((int) => (
                    <button
                      key={int.value}
                      onClick={() => setIntervalTime(int.value)}
                      className={`rounded-lg px-4 py-1.5 text-[11px] font-black transition-all ${
                        interval === int.value
                          ? 'bg-blue-600 text-white dark:shadow-lg dark:shadow-blue-600/30'
                          : 'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-slate-300'
                      }`}
                    >
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className='flex h-[400px] animate-pulse items-center justify-center rounded-2xl border border-slate-800/50 bg-slate-800/20'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500'></div>
                    <p className='font-mono text-[10px] tracking-[0.3em] text-slate-500 uppercase'>
                      Syncing {symbol}...
                    </p>
                  </div>
                </div>
              ) : (
                <PriceChart data={candles} symbol={symbol} interval={interval} />
              )}
            </div>
          </div>
          {/* News And AI */}
          <div className='flex flex-col gap-6 p-5 pt-0'>
            {/* Header */}
            <div className='flex items-center justify-between'>
              <h2 className='flex items-center gap-2 text-lg font-bold'>
                <BrainCircuit />
                AI Insights
              </h2>
            </div>
            {/* Prediction Card */}
            <div>
              <Card className='gap-0 py-4'>
                <CardHeader className='px-4'>
                  <div className='mb-4 flex items-start justify-between'>
                    <div>
                      <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase'>
                        Trend Prediction
                      </p>
                      <h3 className='flex items-center gap-2 text-2xl font-bold text-[#26a69a]'>
                        BULLISH
                        {/* <span className='material-symbols-outlined text-2xl'>arrow_upward</span> */}
                        <ArrowUpRight className='h-6 w-6 text-[#26a69a]' />
                      </h3>
                    </div>
                    <div className='text-right'>
                      <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase'>
                        Confidence
                      </p>
                      <p className='text-xl font-bold text-white'>85%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='px-4'>
                  <div className='bg-accent mb-3 rounded-lg p-3'>
                    <div className='text-accent-foreground mb-1 flex justify-between text-xs'>
                      <span>Fear</span>
                      <span className='font-bold'>Greed (68)</span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-gray-700'>
                      <div className='relative h-full w-[68%] rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'>
                        <div className='absolute top-0 right-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* The "Why" Section (Causal Analysis) */}
            <div className='flex flex-col gap-2'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-bold'>Causal Analysis</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className='h-8 text-xs'
                >
                  {showAnalysis ? 'Hide' : 'Show'} Analysis
                </Button>
              </div>
              {showAnalysis && (
                <Card className='py-4'>
                  <CardContent className='relative px-4'>
                    <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                      On-chain data indicates significant whale accumulation in the $41.8k - $42.2k zone over the last 4
                      hours. Combined with the recent SEC clarity on ETF filings...
                    </p>
                    {/* VIP Blurring */}
                    <div className='mt-2 text-sm leading-relaxed text-gray-600 opacity-50 blur-[3px] select-none dark:text-gray-300'>
                      Furthermore, the RSI divergence on the 4H chart suggests a weakening of bearish momentum. Our NLP
                      models parsed 15,000 tweets and found a 30% spike in positive sentiment keywords related to
                      institutional adoption.
                    </div>
                    {/* Unlock CTA */}
                    <div className='absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px] dark:bg-black/10'>
                      <Button>
                        <Lock className='h-4 w-4' />
                        Unlock Full Reasoning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <Separator />
            {/* News Feed */}
            <div className='flex flex-col gap-3'>
              {/* Header */}
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-bold'>Smart News Feed</h3>
                <button className='text-primary text-xs hover:underline'>View All</button>
              </div>
              {/* News Items */}
              <Card className='gap-2 py-4'>
                <CardHeader className='px-4'>
                  <span className='text-[10px] font-semibold tracking-wider uppercase'>
                    cryptonews.com • 2024-03-24
                  </span>
                  <h4 className='mt-1 text-sm font-bold'>Bitcoin Breaks Above $42K Amidst Market Optimism</h4>
                </CardHeader>
                <CardContent className='px-4'>
                  <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-300'>
                    Bitcoin surged past the $42,000 mark today, driven by renewed investor confidence and positive
                    developments in the regulatory landscape. Analysts attribute the rally to increased institutional
                    interest and favorable on-chain metrics...
                  </p>
                </CardContent>
              </Card>
              <Card className='gap-2 py-4'>
                <CardHeader className='px-4'>
                  <span className='text-[10px] font-semibold tracking-wider uppercase'>
                    cryptonews.com • 2024-03-24
                  </span>
                  <h4 className='mt-1 text-sm font-bold'>Bitcoin Breaks Above $42K Amidst Market Optimism</h4>
                </CardHeader>
                <CardContent className='px-4'>
                  <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-300'>
                    Bitcoin surged past the $42,000 mark today, driven by renewed investor confidence and positive
                    developments in the regulatory landscape. Analysts attribute the rally to increased institutional
                    interest and favorable on-chain metrics...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
