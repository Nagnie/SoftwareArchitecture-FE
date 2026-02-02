import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/pages/PriceChartPage/components/Header';
import { PriceChart } from '@/pages/PriceChartPage/components/PriceChart';
import { NewsFeed } from '@/pages/PriceChartPage/components/NewsFeed';
import { SourcesManagement } from '@/pages/PriceChartPage/components/SourcesManagement';
import { getAIAnalysis, type AIAnalysisResponse } from '@/services/ai';
import { get24hrTicker, getHistoryCandles, type Candle, type TickerData } from '@/services/market';
import { websocketService } from '@/services/market/socket';
import { ArrowUpRight, ArrowDownRight, BrainCircuit, ChevronUp, Clock, Lock, Rss, FileStack, LogIn, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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

  // AI Insights collapse state
  const [isAICollapsed, setIsAICollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const aiInsightsRef = useRef<HTMLDivElement>(null);

  // Get authentication state from AuthContext
  const { user, isAuthenticated, isVip } = useAuth();
  const userId = user?.id?.toString() || '';

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Effect to handle AI Insights auto-collapse on scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const aiInsights = aiInsightsRef.current;

    if (!scrollContainer || !aiInsights) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const aiHeight = aiInsights.offsetHeight;

      // Collapse khi scroll vượt quá 30% chiều cao của AI section
      const shouldCollapse = scrollTop > aiHeight * 0.3;

      setIsAICollapsed(shouldCollapse);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [showAnalysis]); // Re-run khi showAnalysis thay đổi vì nó ảnh hưởng đến chiều cao

  // Function to fetch AI Analysis - can be called for retry
  const fetchAIAnalysis = async (signal?: AbortSignal) => {
    if (!isVip || !symbol) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const data = await getAIAnalysis({ symbol }, signal);
      setAiAnalysis(data);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch AI analysis:', error);
        setAiError('Failed to load AI insights');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Effect to fetch AI Analysis for VIP users
  useEffect(() => {
    if (!isVip || !symbol) return;

    const controller = new AbortController();
    fetchAIAnalysis(controller.signal);

    return () => {
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVip, symbol]);

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

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className='flex h-full flex-col'>
      <Header priceDirection={priceDirection} ticker={ticker} />

      <main className='flex-1 space-y-8 overflow-y-auto p-4 lg:px-12 lg:py-6'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12'>
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
                          : 'hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-300'
                      }`}
                    >
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className='flex h-100 animate-pulse items-center justify-center rounded-2xl border border-neutral-800/50 bg-neutral-800/20'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='h-12 w-12 animate-spin rounded-full border-t-2 border-blue-500'></div>
                    <p className='font-mono text-[10px] tracking-[0.3em] text-neutral-500 uppercase'>
                      Syncing {symbol}...
                    </p>
                  </div>
                </div>
              ) : (
                <PriceChart data={candles} symbol={symbol} interval={interval} />
              )}
            </div>
          </div>

          {/* News And AI - Single scrollable container */}
          <div className='flex flex-col overflow-hidden lg:h-[calc(100vh-12rem)]'>
            <Tabs defaultValue='news' className='flex h-full flex-col'>
              <TabsList className='mb-4 grid w-full grid-cols-2'>
                <TabsTrigger value='news'>
                  <Rss className='mr-2 h-4 w-4' />
                  News
                </TabsTrigger>
                <TabsTrigger value='sources'>
                  <FileStack className='mr-2 h-4 w-4' />
                  Sources
                </TabsTrigger>
              </TabsList>

              <TabsContent value='news' className='flex-1 overflow-hidden'>
                {!isAuthenticated ? (
                  <div className='flex items-center justify-center'>
                    <Card className='w-full'>
                      <CardContent className='flex flex-col items-center gap-6 text-center'>
                        <div>
                          <h3 className='mb-2 text-xl font-bold'>Login Required</h3>
                          <p className='text-muted-foreground text-sm'>Please login to see news and AI insights</p>
                        </div>
                        <Button onClick={handleLogin} size='lg'>
                          <LogIn className='mr-2 h-4 w-4' />
                          Login
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div
                    ref={scrollContainerRef}
                    className='scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent flex h-full flex-col gap-6 overflow-x-hidden overflow-y-auto p-5 pt-0 pb-8 lg:pr-3'
                  >
                    {/* AI Insights Section with smooth collapse */}
                    <div
                      ref={aiInsightsRef}
                      className={`relative shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${
                        isAICollapsed
                          ? 'lg:pointer-events-none lg:max-h-0 lg:scale-95 lg:opacity-0'
                          : 'lg:max-h-500 lg:scale-100 lg:opacity-100'
                      }`}
                    >
                      {/* Header */}
                      <div className='mb-6 flex items-center justify-between'>
                        <h2 className='flex items-center gap-2 text-lg font-bold'>
                          <BrainCircuit />
                          AI Insights
                          {isVip && (
                            <span className='inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black'>
                              <Sparkles className='h-3 w-3' />
                              VIP
                            </span>
                          )}
                        </h2>
                        {isVip && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setShowAnalysis(!showAnalysis)}
                            className='h-8 text-xs'
                          >
                            {showAnalysis ? 'Hide' : 'Show'} Analysis
                          </Button>
                        )}
                      </div>

                      {/* Content wrapper - conditionally blurred for non-VIP */}
                      <div className={!isVip ? 'pointer-events-none select-none blur-xs' : ''}>
                        {/* Loading State */}
                        {isVip && aiLoading && (
                          <div className='mb-6 flex items-center justify-center py-8'>
                            <div className='flex flex-col items-center gap-3'>
                              <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
                              <p className='text-muted-foreground text-sm'>Analyzing market data...</p>
                            </div>
                          </div>
                        )}

                        {/* Error State */}
                        {isVip && aiError && !aiLoading && (
                          <div className='mb-6'>
                            <Card className='border-red-500/30 bg-red-500/10 py-4'>
                              <CardContent className='px-4 text-center'>
                                <p className='text-sm text-red-400'>{aiError}</p>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='mt-2 text-xs'
                                  onClick={() => fetchAIAnalysis()}
                                >
                                  Try Again
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Prediction Card */}
                        {(!isVip || (isVip && aiAnalysis && !aiLoading)) && (
                          <div className='mb-6'>
                            <Card className='gap-0 py-4'>
                              <CardHeader className='px-4'>
                                <div className='flex items-start justify-between'>
                                  <div>
                                    <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase'>
                                      Trend Prediction
                                    </p>
                                    <h3
                                      className={`flex items-center gap-2 text-2xl font-bold ${
                                        (aiAnalysis?.trend.direction || 'BULLISH').toUpperCase() === 'BULLISH'
                                          ? 'text-[#26a69a]'
                                          : 'text-[#ef5350]'
                                      }`}
                                    >
                                      {(aiAnalysis?.trend.direction || 'BULLISH').toUpperCase()}
                                      {(aiAnalysis?.trend.direction || 'BULLISH').toUpperCase() === 'BULLISH' ? (
                                        <ArrowUpRight className='h-6 w-6 text-[#26a69a]' />
                                      ) : (
                                        <ArrowDownRight className='h-6 w-6 text-[#ef5350]' />
                                      )}
                                    </h3>
                                  </div>
                                  <div className='text-right'>
                                    <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase'>
                                      Confidence
                                    </p>
                                    <p className='text-xl font-bold text-white'>
                                      {aiAnalysis?.trend.confidence ?? 85}%
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className='px-4'>
                                <div className='bg-accent rounded-lg p-3'>
                                  <div className='text-accent-foreground mb-1 flex justify-between text-xs'>
                                    <span>Fear</span>
                                    <span className='font-bold'>
                                      {aiAnalysis?.fear_greed.label ?? 'Greed'} ({aiAnalysis?.fear_greed.score ?? 68})
                                    </span>
                                  </div>
                                  <div className='h-2 w-full overflow-hidden rounded-full bg-gray-700'>
                                    <div
                                      className='relative h-full rounded-full bg-linear-to-r from-red-500 via-yellow-500 to-green-500'
                                      style={{ width: `${aiAnalysis?.fear_greed.score ?? 68}%` }}
                                    >
                                      <div className='absolute top-0 right-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'></div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* The "Why" Section (Causal Analysis) - Only visible for VIP */}
                        {isVip && showAnalysis && aiAnalysis && !aiLoading && (
                          <div className='mb-6 flex flex-col gap-2'>
                            <div className='flex items-center justify-between'>
                              <h3 className='text-sm font-bold'>Causal Analysis</h3>
                            </div>
                            <Card className='py-4'>
                              <CardContent className='px-4'>
                                <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                                  {aiAnalysis.causal_analysis}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>

                      {/* Unlock CTA Overlay - Only visible for non-VIP */}
                      {!isVip && (
                        <div className='absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px] dark:bg-black/20'>
                          <div className='flex flex-col items-center gap-4 text-center'>
                            <div className='rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-400/20 p-4'>
                              <Lock className='h-8 w-8 text-amber-500' />
                            </div>
                            <div>
                              <h3 className='mb-1 text-lg font-bold'>Unlock AI Insights</h3>
                              <p className='text-muted-foreground mb-4 text-sm'>
                                Upgrade to VIP to access advanced AI predictions and analysis
                              </p>
                            </div>
                            <Button
                              onClick={() => navigate('/upgrade')}
                              className='bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-600 hover:to-yellow-500'
                            >
                              <Sparkles className='h-4 w-4' />
                              Upgrade to VIP
                            </Button>
                          </div>
                        </div>
                      )}

                      <Separator className={!isVip ? 'mt-4' : ''} />
                    </div>

                    {/* Collapse indicator - Sticky at top when collapsed */}
                    {isAICollapsed && (
                      <div
                        className={`bg-background/80 sticky top-0 z-10 flex items-center justify-center rounded-lg px-5 py-3 backdrop-blur transition-all duration-300 ${
                          isAICollapsed
                            ? 'lg:translate-y-0 lg:opacity-100'
                            : 'lg:pointer-events-none lg:-translate-y-full lg:opacity-0'
                        }`}
                      >
                        <button
                          onClick={scrollToTop}
                          className='hover:bg-accent flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors'
                        >
                          <ChevronUp className='h-4 w-4' />
                          <span>Scroll up to see AI Insights</span>
                          <ChevronUp className='h-4 w-4' />
                        </button>
                      </div>
                    )}

                    {/* News Feed - Remove internal scroll, let parent handle it */}
                    <div className='flex-1'>
                      <NewsFeed symbol={symbol} />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='sources' className='flex-1 overflow-hidden'>
                {!isAuthenticated ? (
                    <Card className='w-full'>
                      <CardContent className='flex flex-col items-center gap-6 text-center'>
                        <div>
                          <h3 className='mb-2 text-xl font-bold'>Login Required</h3>
                          <p className='text-muted-foreground text-sm'>Please login to view news source</p>
                        </div>
                        <Button onClick={handleLogin} size='lg'>
                          <LogIn className='mr-2 h-4 w-4' />
                          Login
                        </Button>
                      </CardContent>
                    </Card>
                ) : (
                  <div className='scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent h-full overflow-y-auto pt-0 pb-8'>
                    <SourcesManagement userId={userId} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};
