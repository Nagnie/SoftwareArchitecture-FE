/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Candle } from '@/services/market';
import type { IndicatorValue, BollingerValue, MACDValue, StochasticValue } from '@/services/indicators';
import type { New } from '@/services/news';
import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, type IChartApi, type ISeriesApi, ColorType, type MouseEventParams, type SeriesMarker, type Time, LineStyle } from 'lightweight-charts';
import { useTheme } from '@/components/ThemeProvider';

interface PriceChartProps {
  data: Candle[];
  symbol?: string;
  interval?: string;
  // Technical Indicators data - Overlays
  maData?: IndicatorValue[];
  emaData?: IndicatorValue[];
  bollingerData?: BollingerValue[];
  // Technical Indicators data - Oscillators
  rsiData?: IndicatorValue[];
  macdData?: MACDValue[];
  stochData?: StochasticValue[];
  atrData?: IndicatorValue[];
  // Indicator visibility - Overlays
  showMA?: boolean;
  showEMA?: boolean;
  showBollinger?: boolean;
  // Indicator visibility - Oscillators
  showRSI?: boolean;
  showMACD?: boolean;
  showStochastic?: boolean;
  showATR?: boolean;
  // Indicator settings
  maColor?: string;
  emaColor?: string;
  // News events to display as markers
  newsEvents?: New[];
}

/**
 * Oscillator Pane Component - Renders RSI, MACD, Stochastic, ATR as separate charts below main price chart
 */
const OscillatorPane = ({
  data,
  type,
  height = 120,
  colors,
  isLast = false
}: {
  data: any[];
  type: 'RSI' | 'MACD' | 'STOCH' | 'ATR';
  height?: number;
  colors: any;
  isLast?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: colors.textColor
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor }
      },
      width: containerRef.current.clientWidth,
      height: height,
      timeScale: {
        visible: isLast,
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
        scaleMargins: { top: 0.1, bottom: 0.1 }
      },
      crosshair: {
        horzLine: { visible: false },
        vertLine: { visible: true }
      }
    });

    chartRef.current = chart;

    // Add series based on type
    if (type === 'RSI') {
      const rsiSeries = chart.addLineSeries({
        color: '#9C27B0',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true
      });

      // Add overbought/oversold lines
      const sortedData = [...data]
        .filter((d) => d.value !== null)
        .sort((a, b) => a.time - b.time)
        .map((d) => ({
          time: (d.time / 1000) as Time,
          value: d.value as number
        }));

      rsiSeries.setData(sortedData);

      // Create price lines for 70 and 30 levels
      rsiSeries.createPriceLine({
        price: 70,
        color: 'rgba(239, 83, 80, 0.5)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Overbought'
      });
      rsiSeries.createPriceLine({
        price: 30,
        color: 'rgba(38, 166, 154, 0.5)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Oversold'
      });
    } else if (type === 'ATR') {
      const atrSeries = chart.addLineSeries({
        color: '#607D8B',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true
      });

      const sortedData = [...data]
        .filter((d) => d.value !== null)
        .sort((a, b) => a.time - b.time)
        .map((d) => ({
          time: (d.time / 1000) as Time,
          value: d.value as number
        }));

      atrSeries.setData(sortedData);
    } else if (type === 'MACD') {
      // Histogram
      const histSeries = chart.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false
      });

      // MACD line
      const macdSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false
      });

      // Signal line
      const signalSeries = chart.addLineSeries({
        color: '#FF9800',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false
      });

      const sortedData = [...data]
        .filter((d) => d.macd !== null && d.signal !== null && d.histogram !== null)
        .sort((a, b) => a.time - b.time);

      histSeries.setData(
        sortedData.map((d) => ({
          time: (d.time / 1000) as Time,
          value: d.histogram as number,
          color: (d.histogram || 0) >= 0 ? 'rgba(38, 166, 154, 0.6)' : 'rgba(239, 83, 80, 0.6)'
        }))
      );

      macdSeries.setData(
        sortedData.map((d) => ({
          time: (d.time / 1000) as Time,
          value: d.macd as number
        }))
      );

      signalSeries.setData(
        sortedData.map((d) => ({
          time: (d.time / 1000) as Time,
          value: d.signal as number
        }))
      );
    } else if (type === 'STOCH') {
      const kSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true
      });

      const dSeries = chart.addLineSeries({
        color: '#FF9800',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true
      });

      const sortedData = [...data]
        .filter((d) => d.k !== null && d.d !== null)
        .sort((a, b) => a.time - b.time);

      kSeries.setData(
        sortedData.map((d) => ({
          time: (d.time / 1000) as Time,
          value: d.k as number
        }))
      );

      dSeries.setData(
        sortedData.map((d) => ({
          time: (d.time / 1000) as Time,
          value: d.d as number
        }))
      );

      // Add overbought/oversold lines
      kSeries.createPriceLine({
        price: 80,
        color: 'rgba(239, 83, 80, 0.5)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false
      });
      kSeries.createPriceLine({
        price: 20,
        color: 'rgba(38, 166, 154, 0.5)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false
      });
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, type, colors, height, isLast]);

  // Get indicator label and color
  const getLabel = () => {
    switch (type) {
      case 'RSI':
        return { name: 'RSI (14)', color: '#9C27B0' };
      case 'MACD':
        return { name: 'MACD (12,26,9)', color: '#2196F3' };
      case 'STOCH':
        return { name: 'Stochastic (14,3)', color: '#2196F3' };
      case 'ATR':
        return { name: 'ATR (14)', color: '#607D8B' };
      default:
        return { name: type, color: '#888' };
    }
  };

  const label = getLabel();

  return (
    <div className="relative">
      <div
        className="absolute left-3 top-1 z-10 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
        style={{ backgroundColor: label.color }}
      >
        {label.name}
      </div>
      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  );
};

export const PriceChart = ({
  data,
  symbol,
  interval,
  maData,
  emaData,
  bollingerData,
  rsiData,
  macdData,
  stochData,
  atrData,
  showMA = false,
  showEMA = false,
  showBollinger = false,
  showRSI = false,
  showMACD = false,
  showStochastic = false,
  showATR = false,
  maColor = '#2196F3',
  emaColor = '#FF9800',
  newsEvents = []
}: PriceChartProps) => {
  const { theme } = useTheme();

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bollingerUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bollingerMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bollingerLowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const lastDataLengthRef = useRef(0);

  const [legendData, setLegendData] = useState<{
    open: string;
    high: string;
    low: string;
    close: string;
    color: string;
    time: string;
    ma?: string;
    ema?: string;
  } | null>(null);

  // State for news tooltip when hovering over markers
  const [newsTooltip, setNewsTooltip] = useState<{
    news: New[];
    x: number;
    y: number;
    chartWidth: number;
  } | null>(null);

  // Define colors based on theme
  const isDark = theme === 'dark';
  const colors = {
    textColor: isDark ? '#94a3b8' : '#475569',
    gridColor: isDark ? '#1e293b' : '#e2e8f0',
    borderColor: isDark ? '#334155' : '#cbd5e1',
    upColor: '#26a69a',
    downColor: '#ef5350',
    legendBg: isDark ? 'bg-neutral-900/60' : 'bg-white/80',
    legendBorder: isDark ? 'border-neutral-700/50' : 'border-neutral-300/50',
    legendLabel: isDark ? 'text-neutral-500' : 'text-neutral-600',
    chartBg: isDark ? 'bg-neutral-900/50' : 'bg-neutral-50',
    chartBorder: isDark ? 'border-neutral-800' : 'border-neutral-200',
    bollingerColor: isDark ? 'rgba(156, 39, 176, 0.6)' : 'rgba(156, 39, 176, 0.8)'
  };

  // Create a mapping of chart time (seconds) to news titles for tooltip
  const newsTimeMap = useMemo((): Map<number, New[]> => {
    if (!newsEvents || newsEvents.length === 0 || data.length === 0) return new Map();

    const dataTimeSet = new Set(data.map((c) => Math.floor(c.time / 1000)));
    const timeMap = new Map<number, New[]>();

    newsEvents.forEach((news) => {
      const newsTime = Math.floor(new Date(news.published_at).getTime() / 1000);

      // Find the closest candle time
      let closestTime = 0;
      let minDiff = Infinity;

      dataTimeSet.forEach((candleTime) => {
        const diff = Math.abs(candleTime - newsTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestTime = candleTime;
        }
      });

      const maxDiffSeconds = interval === '1d' ? 86400 : interval === '4h' ? 14400 : interval === '1h' ? 3600 : 900;
      if (closestTime && minDiff <= maxDiffSeconds) {
        const existing = timeMap.get(closestTime) || [];
        existing.push(news);
        timeMap.set(closestTime, existing);
      }
    });

    return timeMap;
  }, [newsEvents, data, interval]);

  // Convert news events to chart markers
  const newsMarkers = useMemo((): SeriesMarker<Time>[] => {
    if (newsTimeMap.size === 0) return [];

    const markers: SeriesMarker<Time>[] = [];

    newsTimeMap.forEach((newsList, time) => {
      markers.push({
        time: time as Time,
        position: 'aboveBar',
        color: '#FFD700',
        shape: 'circle',
        text: `📰${newsList.length > 1 ? newsList.length : ''}`,
        size: 1
      });
    });

    return markers.slice(0, 20); // Limit to 20 markers to avoid clutter
  }, [newsTimeMap]);

  // Determine active oscillators for rendering
  const activeOscillators = useMemo(() => {
    const list: { type: 'RSI' | 'MACD' | 'STOCH' | 'ATR'; data: any[] }[] = [];
    if (showRSI && rsiData && rsiData.length > 0) list.push({ type: 'RSI', data: rsiData });
    if (showMACD && macdData && macdData.length > 0) list.push({ type: 'MACD', data: macdData });
    if (showStochastic && stochData && stochData.length > 0) list.push({ type: 'STOCH', data: stochData });
    if (showATR && atrData && atrData.length > 0) list.push({ type: 'ATR', data: atrData });
    return list;
  }, [showRSI, showMACD, showStochastic, showATR, rsiData, macdData, stochData, atrData]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: colors.textColor
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor }
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: colors.borderColor
      }
    });

    const series = (chart as any).addCandlestickSeries({
      upColor: colors.upColor,
      downColor: colors.downColor,
      borderVisible: false,
      wickUpColor: colors.upColor,
      wickDownColor: colors.downColor
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const updateLegend = (c: Candle, maValue?: number | null, emaValue?: number | null) => {
      const isUp = c.close >= c.open;
      setLegendData({
        open: c.open.toFixed(2),
        high: c.high.toFixed(2),
        low: c.low.toFixed(2),
        close: c.close.toFixed(2),
        color: isUp ? 'text-[#26a69a]' : 'text-[#ef5350]',
        time: new Date(c.time).toLocaleString(),
        ma: maValue !== null && maValue !== undefined ? maValue.toFixed(2) : undefined,
        ema: emaValue !== null && emaValue !== undefined ? emaValue.toFixed(2) : undefined
      });
    };

    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.point || !param.time) {
        setNewsTooltip(null);
        if (data.length > 0) {
          const lastCandle = data[data.length - 1];
          const lastMA = maData?.find((d) => d.time === lastCandle.time)?.value;
          const lastEMA = emaData?.find((d) => d.time === lastCandle.time)?.value;
          updateLegend(lastCandle, lastMA, lastEMA);
        }
      } else {
        const candle = param.seriesData.get(series);
        if (candle) {
          const c = candle as any;
          const candleTime = (param.time as number) * 1000;
          const maValue = maData?.find((d) => d.time === candleTime)?.value;
          const emaValue = emaData?.find((d) => d.time === candleTime)?.value;
          updateLegend(
            {
              time: candleTime,
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close
            },
            maValue,
            emaValue
          );

          // Check if there's news at this time and show tooltip
          const timeInSeconds = param.time as number;
          const newsAtTime = newsTimeMap.get(timeInSeconds);
          if (newsAtTime && newsAtTime.length > 0 && param.point) {
            setNewsTooltip({
              news: newsAtTime,
              x: param.point.x,
              y: param.point.y,
              chartWidth: chartContainerRef.current?.clientWidth ?? 400
            });
          } else {
            setNewsTooltip(null);
          }
        }
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []); // Only init chart once

  // Update colors when theme changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: colors.textColor
        },
        grid: {
          vertLines: { color: colors.gridColor },
          horzLines: { color: colors.gridColor }
        },
        timeScale: {
          borderColor: colors.borderColor
        },
        rightPriceScale: {
          borderColor: colors.borderColor
        }
      });
    }
  }, [theme, colors.textColor, colors.gridColor, colors.borderColor]);

  // Reset when symbol or interval changes
  useEffect(() => {
    lastDataLengthRef.current = 0;
  }, [symbol, interval]);

  // Handle data updates
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const lengthDiff = data.length - lastDataLengthRef.current;

    if (lengthDiff < 0 || lengthDiff > 2 || lastDataLengthRef.current === 0) {
      const formattedData = data.map((c) => ({
        time: (c.time / 1000) as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }));
      seriesRef.current.setData(formattedData);
    } else if (lengthDiff === 0 && lastDataLengthRef.current > 0) {
      const lastCandle = data[data.length - 1];
      seriesRef.current.update({
        time: (lastCandle.time / 1000) as any,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close
      });
    } else if (lengthDiff > 0 && lengthDiff <= 2) {
      for (let i = lastDataLengthRef.current; i < data.length; i++) {
        const candle = data[i];
        seriesRef.current.update({
          time: (candle.time / 1000) as any,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close
        });
      }
    }

    lastDataLengthRef.current = data.length;
  }, [data]);

  // Handle news markers
  useEffect(() => {
    if (!seriesRef.current || newsMarkers.length === 0) return;

    // Sort markers by time ascending
    const sortedMarkers = [...newsMarkers].sort((a, b) => (a.time as number) - (b.time as number));
    seriesRef.current.setMarkers(sortedMarkers);
  }, [newsMarkers]);

  // Handle MA indicator
  useEffect(() => {
    if (!chartRef.current) return;

    // Remove existing MA series if exists
    if (maSeriesRef.current) {
      chartRef.current.removeSeries(maSeriesRef.current);
      maSeriesRef.current = null;
    }

    // Add MA series if enabled and data exists
    if (showMA && maData && maData.length > 0) {
      const maSeries = (chartRef.current as any).addLineSeries({
        color: maColor,
        lineWidth: 2,
        title: `MA`,
        priceLineVisible: false,
        lastValueVisible: false
      });

      const formattedMAData = maData
        .filter((d) => d.value !== null)
        .map((d) => ({
          time: (d.time / 1000) as any,
          value: d.value as number
        }))
        .sort((a, b) => a.time - b.time); // Sort by time ascending

      maSeries.setData(formattedMAData);
      maSeriesRef.current = maSeries;
    }
  }, [showMA, maData, maColor]);

  // Handle EMA indicator
  useEffect(() => {
    if (!chartRef.current) return;

    // Remove existing EMA series if exists
    if (emaSeriesRef.current) {
      chartRef.current.removeSeries(emaSeriesRef.current);
      emaSeriesRef.current = null;
    }

    // Add EMA series if enabled and data exists
    if (showEMA && emaData && emaData.length > 0) {
      const emaSeries = (chartRef.current as any).addLineSeries({
        color: emaColor,
        lineWidth: 2,
        title: `EMA`,
        priceLineVisible: false,
        lastValueVisible: false
      });

      const formattedEMAData = emaData
        .filter((d) => d.value !== null)
        .map((d) => ({
          time: (d.time / 1000) as any,
          value: d.value as number
        }))
        .sort((a, b) => a.time - b.time); // Sort by time ascending

      emaSeries.setData(formattedEMAData);
      emaSeriesRef.current = emaSeries;
    }
  }, [showEMA, emaData, emaColor]);

  // Handle Bollinger Bands indicator
  useEffect(() => {
    if (!chartRef.current) return;

    // Remove existing Bollinger series if exists
    if (bollingerUpperRef.current) {
      chartRef.current.removeSeries(bollingerUpperRef.current);
      bollingerUpperRef.current = null;
    }
    if (bollingerMiddleRef.current) {
      chartRef.current.removeSeries(bollingerMiddleRef.current);
      bollingerMiddleRef.current = null;
    }
    if (bollingerLowerRef.current) {
      chartRef.current.removeSeries(bollingerLowerRef.current);
      bollingerLowerRef.current = null;
    }

    // Add Bollinger series if enabled and data exists
    if (showBollinger && bollingerData && bollingerData.length > 0) {
      const upperSeries = (chartRef.current as any).addLineSeries({
        color: colors.bollingerColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false
      });

      const middleSeries = (chartRef.current as any).addLineSeries({
        color: colors.bollingerColor,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false
      });

      const lowerSeries = (chartRef.current as any).addLineSeries({
        color: colors.bollingerColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false
      });

      const validData = bollingerData
        .filter((d) => d.upper !== null && d.middle !== null && d.lower !== null)
        .sort((a, b) => a.time - b.time); // Sort by time ascending

      upperSeries.setData(
        validData.map((d) => ({
          time: (d.time / 1000) as any,
          value: d.upper as number
        }))
      );

      middleSeries.setData(
        validData.map((d) => ({
          time: (d.time / 1000) as any,
          value: d.middle as number
        }))
      );

      lowerSeries.setData(
        validData.map((d) => ({
          time: (d.time / 1000) as any,
          value: d.lower as number
        }))
      );

      bollingerUpperRef.current = upperSeries;
      bollingerMiddleRef.current = middleSeries;
      bollingerLowerRef.current = lowerSeries;
    }
  }, [showBollinger, bollingerData, colors.bollingerColor]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border ${colors.chartBorder} ${colors.chartBg}`}>
      {/* Legend */}
      {legendData && (
        <div
          className={`pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap gap-x-4 gap-y-1 rounded-lg border ${colors.legendBorder} ${colors.legendBg} p-2 font-mono text-[11px] backdrop-blur-sm`}
        >
          <div className='flex gap-1'>
            <span className={`${colors.legendLabel} uppercase`}>O</span>
            <span className={legendData.color}>{legendData.open}</span>
          </div>
          <div className='flex gap-1'>
            <span className={`${colors.legendLabel} uppercase`}>H</span>
            <span className={legendData.color}>{legendData.high}</span>
          </div>
          <div className='flex gap-1'>
            <span className={`${colors.legendLabel} uppercase`}>L</span>
            <span className={legendData.color}>{legendData.low}</span>
          </div>
          <div className='flex gap-1'>
            <span className={`${colors.legendLabel} uppercase`}>C</span>
            <span className={legendData.color}>{legendData.close}</span>
          </div>
          {showMA && legendData.ma && (
            <div className='flex gap-1'>
              <span style={{ color: maColor }}>MA</span>
              <span style={{ color: maColor }}>{legendData.ma}</span>
            </div>
          )}
          {showEMA && legendData.ema && (
            <div className='flex gap-1'>
              <span style={{ color: emaColor }}>EMA</span>
              <span style={{ color: emaColor }}>{legendData.ema}</span>
            </div>
          )}
          <div className={`ml-2 ${colors.legendLabel}`}>{legendData.time}</div>
        </div>
      )}

      {/* Active indicators badge */}
      {(showMA || showEMA || showBollinger) && (
        <div className='absolute top-3 right-3 z-20 flex gap-1'>
          {showMA && (
            <span
              className='rounded px-1.5 py-0.5 text-[10px] font-bold text-white'
              style={{ backgroundColor: maColor }}
            >
              MA
            </span>
          )}
          {showEMA && (
            <span
              className='rounded px-1.5 py-0.5 text-[10px] font-bold text-white'
              style={{ backgroundColor: emaColor }}
            >
              EMA
            </span>
          )}
          {showBollinger && (
            <span
              className='rounded px-1.5 py-0.5 text-[10px] font-bold text-white'
              style={{ backgroundColor: colors.bollingerColor }}
            >
              BB
            </span>
          )}
        </div>
      )}

      {/* News Tooltip */}
      {newsTooltip && (
        <div
          className='pointer-events-none absolute z-30 max-w-xs rounded-lg border border-amber-500/50 bg-amber-950/95 p-3 shadow-lg backdrop-blur-sm'
          style={{
            left: Math.min(newsTooltip.x, newsTooltip.chartWidth - 200),
            top: Math.max(newsTooltip.y - 80, 10)
          }}
        >
          <div className='mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400'>
            <span>📰</span>
            <span>News Event{newsTooltip.news.length > 1 ? 's' : ''}</span>
          </div>
          <div className='space-y-1.5'>
            {newsTooltip.news.slice(0, 3).map((news, idx) => (
              <div key={news._id || idx} className='border-l-2 border-amber-500/50 pl-2'>
                <p className='line-clamp-2 text-xs font-medium text-white'>{news.title}</p>
                <p className='text-[10px] text-amber-300/70'>
                  {new Date(news.published_at).toLocaleString()}
                </p>
              </div>
            ))}
            {newsTooltip.news.length > 3 && (
              <p className='text-[10px] text-amber-400/60'>+{newsTooltip.news.length - 3} more</p>
            )}
          </div>
        </div>
      )}

      {/* Main Price Chart */}
      <div ref={chartContainerRef} className='h-100 w-full' />

      {/* Oscillator Panes - Rendered below main chart */}
      {activeOscillators.length > 0 && (
        <div className='border-t border-neutral-200 dark:border-neutral-700'>
          {activeOscillators.map((osc, idx) => (
            <div
              key={osc.type}
              className={idx < activeOscillators.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}
            >
              <OscillatorPane
                type={osc.type}
                data={osc.data}
                colors={colors}
                isLast={idx === activeOscillators.length - 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
