import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Settings2, TrendingUp, Activity } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { EnabledIndicators, IndicatorSettings } from '@/services/indicators';

interface IndicatorControlsProps {
  enabledIndicators: EnabledIndicators;
  settings: IndicatorSettings;
  onToggleIndicator: (indicator: keyof EnabledIndicators) => void;
  onSettingsChange: (settings: IndicatorSettings) => void;
  isLoading?: boolean;
}

const OVERLAY_INDICATORS = [
  { key: 'ma' as const, label: 'MA', description: 'Simple Moving Average', defaultPeriod: 20 },
  { key: 'ema' as const, label: 'EMA', description: 'Exponential Moving Average', defaultPeriod: 12 },
  { key: 'bollinger' as const, label: 'BB', description: 'Bollinger Bands', defaultPeriod: 20 }
];

const OSCILLATOR_INDICATORS = [
  { key: 'rsi' as const, label: 'RSI', description: 'Relative Strength Index (0-100)', defaultPeriod: 14 },
  { key: 'macd' as const, label: 'MACD', description: 'Moving Average Convergence Divergence' },
  { key: 'stochastic' as const, label: 'STOCH', description: 'Stochastic Oscillator' },
  { key: 'atr' as const, label: 'ATR', description: 'Average True Range', defaultPeriod: 14 }
];

const PERIOD_OPTIONS = [7, 9, 12, 14, 20, 25, 50, 100, 200];

export const IndicatorControls = ({
  enabledIndicators,
  settings,
  onToggleIndicator,
  onSettingsChange,
  isLoading = false
}: IndicatorControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePeriodChange = useCallback(
    (indicator: 'ma' | 'ema', period: number) => {
      onSettingsChange({
        ...settings,
        [indicator]: { ...settings[indicator], period }
      });
    },
    [settings, onSettingsChange]
  );

  const activeCount = Object.values(enabledIndicators).filter(Boolean).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='relative gap-2'
          disabled={isLoading}
        >
          <TrendingUp className='h-4 w-4' />
          <span className='hidden sm:inline'>Indicators</span>
          {activeCount > 0 && (
            <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white'>
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 max-h-[70vh] flex flex-col p-0' align='end'>
        <div className='p-4 shrink-0'>
          <div className='flex items-center justify-between'>
            <h4 className='font-semibold'>Technical Indicators</h4>
            <Settings2 className='h-4 w-4 text-muted-foreground' />
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            Add technical analysis overlays to your chart
          </p>
        </div>

        <Separator className='shrink-0' />

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto'>
          {/* Overlay Indicators (on price chart) */}
          <div className='p-4'>
            <h5 className='mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              <TrendingUp className='h-3 w-3' />
              Overlay Indicators
            </h5>
            <div className='space-y-2'>
              {OVERLAY_INDICATORS.map((ind) => (
                <div
                  key={ind.key}
                  className='flex items-center justify-between rounded-lg border p-2 transition-colors hover:bg-accent/50'
                >
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => onToggleIndicator(ind.key)}
                      className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${
                        enabledIndicators[ind.key] ? 'bg-blue-600' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          enabledIndicators[ind.key] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>{ind.label}</span>
                        {(ind.key === 'ma' || ind.key === 'ema') && (
                          <span
                            className='h-2 w-2 rounded-full'
                            style={{ backgroundColor: settings[ind.key].color }}
                          />
                        )}
                      </div>
                      <span className='text-[10px] text-muted-foreground'>{ind.description}</span>
                    </div>
                  </div>

                  {/* Period selector for MA/EMA */}
                  {(ind.key === 'ma' || ind.key === 'ema') && enabledIndicators[ind.key] && (
                    <select
                      value={settings[ind.key].period}
                      onChange={(e) => handlePeriodChange(ind.key, Number(e.target.value))}
                      className='h-7 rounded border bg-background px-2 text-xs'
                    >
                      {PERIOD_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Oscillator Indicators (separate pane) */}
          <div className='p-4'>
            <h5 className='mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              <Activity className='h-3 w-3' />
              Oscillators
            </h5>
            <div className='space-y-2'>
              {OSCILLATOR_INDICATORS.map((ind) => (
                <div
                  key={ind.key}
                  className='flex items-center justify-between rounded-lg border p-2 transition-colors hover:bg-accent/50'
                >
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => onToggleIndicator(ind.key)}
                      className={`flex h-6 w-10 items-center rounded-full px-0.5 transition-colors ${
                        enabledIndicators[ind.key] ? 'bg-blue-600' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          enabledIndicators[ind.key] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div>
                      <span className='text-sm font-medium'>{ind.label}</span>
                      <p className='text-[10px] text-muted-foreground'>{ind.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className='border-t bg-muted/30 px-4 py-2 shrink-0'>
          <p className='text-[10px] text-muted-foreground'>
            Overlay indicators appear on the price chart. Oscillators appear in separate panels below.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
