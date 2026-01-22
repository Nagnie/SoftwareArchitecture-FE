/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Candle } from '@/services/market';
import { useEffect, useRef, useState } from 'react';
import { createChart, type IChartApi, type ISeriesApi, ColorType, type MouseEventParams } from 'lightweight-charts';
import { useTheme } from '@/components/ThemeProvider';

interface PriceChartProps {
  data: Candle[];
  symbol?: string;
  interval?: string;
}

export const PriceChart = ({ data, symbol, interval }: PriceChartProps) => {
  const { theme } = useTheme();

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lastDataLengthRef = useRef(0);

  const [legendData, setLegendData] = useState<{
    open: string;
    high: string;
    low: string;
    close: string;
    color: string;
    time: string;
  } | null>(null);

  // Định nghĩa màu sắc theo theme
  const isDark = theme === 'dark';
  const colors = {
    textColor: isDark ? '#94a3b8' : '#475569',
    gridColor: isDark ? '#1e293b' : '#e2e8f0',
    borderColor: isDark ? '#334155' : '#cbd5e1',
    upColor: '#26a69a',
    downColor: '#ef5350',
    legendBg: isDark ? 'bg-slate-900/60' : 'bg-white/80',
    legendBorder: isDark ? 'border-slate-700/50' : 'border-slate-300/50',
    legendLabel: isDark ? 'text-slate-500' : 'text-slate-600',
    chartBg: isDark ? 'bg-slate-900/50' : 'bg-slate-50',
    chartBorder: isDark ? 'border-slate-800' : 'border-slate-200'
  };

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

    const updateLegend = (c: Candle) => {
      const isUp = c.close >= c.open;
      setLegendData({
        open: c.open.toFixed(2),
        high: c.high.toFixed(2),
        low: c.low.toFixed(2),
        close: c.close.toFixed(2),
        color: isUp ? 'text-[#26a69a]' : 'text-[#ef5350]',
        time: new Date(c.time).toLocaleString()
      });
    };

    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (!param.point || !param.time) {
        if (data.length > 0) updateLegend(data[data.length - 1]);
      } else {
        const candle = param.seriesData.get(series);
        if (candle) {
          const c = candle as any;
          updateLegend({
            time: (param.time as number) * 1000,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
          });
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

  // Cập nhật màu sắc khi theme thay đổi
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

  // Reset khi symbol hoặc interval thay đổi
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

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border ${colors.chartBorder} ${colors.chartBg}`}>
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
          <div className={`ml-2 ${colors.legendLabel}`}>{legendData.time}</div>
        </div>
      )}
      <div ref={chartContainerRef} className='h-[400px] w-full' />
    </div>
  );
};
