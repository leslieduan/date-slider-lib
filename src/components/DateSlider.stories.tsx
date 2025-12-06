import type { Meta, StoryObj } from '@storybook/react';
import { memo, useCallback, useRef, useState } from 'react';

import { DateSlider } from './DateSlider';
import type {
  SliderProps,
  SelectionResult,
  SliderExposedMethod,
  TimeUnit,
  DateLabelRenderProps,
} from '@/type';
import { toUTCDate } from '@/utils';
import { CircleIcon, MoveHorizontalIcon } from '@/icons';

const meta: Meta<typeof DateSlider> = {
  title: 'Components/DateSlider',
  component: DateSlider,
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['range', 'point', 'combined'],
    },
    initialTimeUnit: {
      control: { type: 'select' },
      options: ['day', 'month', 'year'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A flexible date slider component supporting point, range, and combined selection modes with UTC date architecture.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<Partial<SliderProps>>;

// Memoized selection display component
const SelectionDisplay = memo(({ selection }: { selection?: SelectionResult }) => {
  if (!selection) return null;
  let result = '';
  if ('start' in selection && 'point' in selection) {
    result = `start: ${selection.start.toISOString()}\nend: ${selection.end.toISOString()}\npoint: ${selection.point.toISOString()}`;
  } else if ('start' in selection) {
    result = `start: ${selection.start.toISOString()}\nend: ${selection.end.toISOString()}`;
  } else if ('point' in selection) {
    result = `point: ${selection.point.toISOString()}`;
  }
  return (
    <div className="mt-6 font-mono">
      <strong>Selection Output:</strong>
      <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-xs overflow-auto max-h-48 mt-2">
        {result}
      </pre>
    </div>
  );
});

SelectionDisplay.displayName = 'SelectionDisplay';

// Memoized control buttons component
const ControlButtons = memo(
  ({
    sliderMethodRef,
    viewMode,
  }: {
    sliderMethodRef: React.RefObject<SliderExposedMethod | null>;
    viewMode: SliderProps['mode'];
  }) => {
    const handleSetDateTime = useCallback(
      (date: Date, target?: 'point' | 'start' | 'end') => {
        sliderMethodRef.current?.setDateTime(date, target);
      },
      [sliderMethodRef]
    );

    const handleFocusHandle = useCallback(
      (handle: 'point' | 'start' | 'end') => {
        sliderMethodRef.current?.focusHandle(handle);
      },
      [sliderMethodRef]
    );

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {(viewMode === 'point' || viewMode === 'combined') && (
          <>
            <button
              onClick={() => handleSetDateTime(toUTCDate('2022-01-01'), 'point')}
              className="cursor-pointer h-8 rounded-md px-3 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Set Point to 2022-01-01
            </button>
            <button
              onClick={() => handleFocusHandle('point')}
              className="cursor-pointer h-8 rounded-md px-3 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Focus Point Handle
            </button>
          </>
        )}

        {(viewMode === 'range' || viewMode === 'combined') && (
          <>
            <button
              onClick={() => handleSetDateTime(toUTCDate('2021-06-01'), 'start')}
              className="cursor-pointer h-8 rounded-md px-3 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Set Range Start to 2021-06-01
            </button>
            <button
              onClick={() => handleSetDateTime(toUTCDate('2021-09-01'), 'end')}
              className="cursor-pointer h-8 rounded-md px-3 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Set Range End to 2021-09-01
            </button>
            <button
              onClick={() => handleFocusHandle('start')}
              className="cursor-pointer h-8 rounded-md px-3 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Focus Start Handle
            </button>
            <button
              onClick={() => handleFocusHandle('end')}
              className="cursor-pointer h-8 rounded-md px-3 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Focus End Handle
            </button>
          </>
        )}

        <button
          onClick={() => handleSetDateTime(new Date(Date.now()))}
          className="cursor-pointer h-8 rounded-md px-3 bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 text-sm font-medium transition-colors"
        >
          Set to Current Date
        </button>
      </div>
    );
  }
);

ControlButtons.displayName = 'ControlButtons';

// Enhanced template with better performance and accessibility
const DateSliderTemplate = (args: Partial<SliderProps>) => {
  const [selection, setSelection] = useState<SelectionResult>();
  const sliderMethodRef = useRef<SliderExposedMethod>(null);

  const handleSelectionChange = useCallback((newSelection: SelectionResult) => {
    setSelection(newSelection);
  }, []);

  // Construct value and icons based on mode
  const mode = args.mode ?? 'point';

  // Type-safe construction based on mode
  if (mode === 'point') {
    const value =
      args.value && 'point' in args.value ? args.value : { point: toUTCDate('2022-06-15') };
    return (
      <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-[500px] rounded-lg">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <DateSlider
            mode="point"
            value={value}
            min={args.min ?? toUTCDate('2000-01-01')}
            max={args.max ?? toUTCDate('2030-12-31')}
            initialTimeUnit={args.initialTimeUnit ?? 'day'}
            onChange={handleSelectionChange}
            imperativeRef={sliderMethodRef}
            icons={{
              point: <CircleIcon />,
            }}
            classNames={args.classNames}
            behavior={args.behavior}
            layout={args.layout}
            renderProps={args.renderProps}
            dateFormat={args.dateFormat}
          />
          <SelectionDisplay selection={selection} />
          <ControlButtons sliderMethodRef={sliderMethodRef} viewMode="point" />
        </div>
      </div>
    );
  } else if (mode === 'range') {
    const value =
      args.value && 'start' in args.value && 'end' in args.value && !('point' in args.value)
        ? args.value
        : { start: toUTCDate('2022-03-01'), end: toUTCDate('2022-09-01') };
    return (
      <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-[500px] rounded-lg">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <DateSlider
            mode="range"
            value={value}
            min={args.min ?? toUTCDate('2000-01-01')}
            max={args.max ?? toUTCDate('2030-12-31')}
            initialTimeUnit={args.initialTimeUnit ?? 'day'}
            onChange={handleSelectionChange}
            imperativeRef={sliderMethodRef}
            icons={{
              range: <MoveHorizontalIcon />,
            }}
            classNames={args.classNames}
            behavior={args.behavior}
            layout={args.layout}
            renderProps={args.renderProps}
            dateFormat={args.dateFormat}
          />
          <SelectionDisplay selection={selection} />
          <ControlButtons sliderMethodRef={sliderMethodRef} viewMode="range" />
        </div>
      </div>
    );
  } else {
    const value =
      args.value && 'start' in args.value && 'end' in args.value && 'point' in args.value
        ? args.value
        : {
            point: toUTCDate('2022-06-15'),
            start: toUTCDate('2022-03-01'),
            end: toUTCDate('2022-09-01'),
          };
    return (
      <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-[500px] rounded-lg">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <DateSlider
            mode="combined"
            value={value}
            min={args.min ?? toUTCDate('2000-01-01')}
            max={args.max ?? toUTCDate('2030-12-31')}
            initialTimeUnit={args.initialTimeUnit ?? 'day'}
            onChange={handleSelectionChange}
            imperativeRef={sliderMethodRef}
            icons={{
              point: <CircleIcon />,
              range: <MoveHorizontalIcon />,
            }}
            classNames={args.classNames}
            behavior={args.behavior}
            layout={args.layout}
            renderProps={args.renderProps}
            dateFormat={args.dateFormat}
          />
          <SelectionDisplay selection={selection} />
          <ControlButtons sliderMethodRef={sliderMethodRef} viewMode="combined" />
        </div>
      </div>
    );
  }
};

/**
 * Getting Started - Minimal Configuration
 */
export const GettingStarted: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2024-06-15'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 600,
      height: 80,
    },
  },
};

/**
 * Point Mode
 */
export const PointMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2024-06-15'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 700,
      height: 100,
      dateLabelEnabled: true,
      showEndLabel: true,
    },
    classNames: {
      trackActive: 'bg-green-400/30',
      track: 'bg-gray-300',
      scaleMarkMajor: 'bg-green-600',
      scaleMarkMinor: 'bg-gray-400',
      scaleLabel: 'text-green-800 font-medium',
    },
    // Custom date format: show month abbreviations
    dateFormat: (date: Date) => {
      const day = date.getUTCDate();
      if (day === 1) return 'MMM'; // "Jan", "Feb", etc
      return 'dd'; // "15"
    },
  },
};

/**
 * Range Mode
 */
export const RangeMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'range',
    value: {
      start: toUTCDate('2020-03-01'),
      end: toUTCDate('2022-09-01'),
    },
    min: toUTCDate('2020-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 800,
      height: 110,
      dateLabelEnabled: true,
      trackPaddingX: 20,
      scaleUnitConfig: {
        gap: 80,
        width: { short: 1, medium: 1, long: 2 },
        height: { short: 15, medium: 25, long: 45 },
      },
    },
    behavior: {
      rangeHandleLabelPersistent: true,
      scrollable: true,
      freeSelectionOnTrackClick: true,
    },
    classNames: {
      trackActive: 'bg-blue-500/30',
      track: 'bg-gray-200',
      handle: 'bg-blue-600 border-2 border-white shadow-md',
      scaleMarkMajor: 'bg-blue-600',
      scaleLabel: 'text-blue-900 font-semibold',
    },
  },
};

/**
 * Combined Mode
 */
export const CombinedMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'combined',
    value: {
      start: toUTCDate('2024-03-01'),
      end: toUTCDate('2024-09-01'),
      point: toUTCDate('2024-06-15'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 900,
      height: 130,
      dateLabelEnabled: false,
    },
    classNames: {
      trackActive: 'bg-purple-500/25',
      track: 'bg-gray-200',
      handlePoint: 'bg-purple-700 border-2 border-white shadow-lg scale-110',
      handleStart: 'bg-purple-500 border-2 border-white shadow-md',
      handleEnd: 'bg-purple-500 border-2 border-white shadow-md',
      scaleMarkMajor: 'bg-purple-600',
      scaleLabel: 'text-purple-900',
    },
  },
};

/**
 * With Render Components
 *
 * ## Component Toggles:
 * - `dateLabelEnabled`: Show date labels on handles
 * - `timeDisplayEnabled`: Show time display with navigation controls
 * - `timeUnitSelectionEnabled`: Show day/month/year selector
 */
export const WithRenderComponents: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'combined',
    value: {
      start: toUTCDate('2024-03-01'),
      end: toUTCDate('2024-09-01'),
      point: toUTCDate('2024-06-15'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2025-12-31'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 800,
      height: 120,
      // Simply toggle components on - defaults are provided!
      dateLabelEnabled: true,
      timeDisplayEnabled: true,
      timeUnitSelectionEnabled: true,
    },
    behavior: {
      handleLabelPersistent: true,
    },
    classNames: {
      trackActive: 'bg-indigo-500/30',
      track: 'bg-gray-300',
    },
  },
};

// Timeline Style Template - Visually appealing design
const TimelineTemplate = (args: Partial<SliderProps>) => {
  const [selection, setSelection] = useState<SelectionResult>();

  const value =
    args.value && 'point' in args.value ? args.value : { point: toUTCDate('2024-12-05T10:52:00Z') };

  const timelineDateLabel = ({ label }: DateLabelRenderProps) => {
    return (
      <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs px-3 py-1.5 rounded-lg shadow-lg font-medium border border-white/30">
        {label}
      </div>
    );
  };

  return (
    <div
      className="p-8 min-h-[400px] rounded-lg relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[300px]">
        <div className="w-full max-w-3xl">
          <h3 className="text-white text-2xl font-bold mb-6 text-center drop-shadow-lg">
            Timeline Date Slider
          </h3>
          <DateSlider
            mode="point"
            value={value}
            min={args.min ?? toUTCDate('2024-12-03')}
            max={args.max ?? toUTCDate('2024-12-25')}
            initialTimeUnit={args.initialTimeUnit ?? 'day'}
            onChange={setSelection}
            icons={{
              point: <CircleIcon />,
            }}
            classNames={args.classNames}
            behavior={args.behavior}
            layout={args.layout}
            renderProps={{
              renderDateLabel: timelineDateLabel,
            }}
            dateFormat={args.dateFormat}
          />
        </div>
      </div>

      {selection && (
        <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          <strong className="text-white">Selected:</strong>
          <pre className="mt-2 text-sm text-white/90 font-mono">
            {'point' in selection && selection.point.toLocaleString()}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Timeline Style - Beautiful gradient design for timeline interfaces
 
 */
export const TimelineStyle: Story = {
  render: (args: Partial<SliderProps>) => <TimelineTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2024-12-04T10:52:00Z'),
    },
    min: toUTCDate('2024-12-03'),
    max: toUTCDate('2024-12-25'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 700,
      height: 80,
      scaleUnitConfig: {
        gap: 150,
        width: { short: 0, medium: 0, long: 2 },
        height: { short: 0, medium: 0, long: 40 },
      },
    },
    icons: {
      point: <CircleIcon />,
    },
    behavior: {
      scrollable: true,
      handleLabelPersistent: true,
      handleLabelDisabled: false,
    },
    classNames: {
      trackActive: 'bg-white/40',
      track: 'bg-white/20',
      trackInner: 'h-1 top-1/2 bg-red-500',
      scaleMark: 'bg-transparent',
      scaleMarkMajor: 'bg-white/60',
      handle: 'shadow-2xl top-1/2 -translate-y-1/2 ',
      handlePoint: 'hover:scale-125 transition-transform',
      scaleLabel: 'text-white/90 font-medium -bottom-4',
    },
    // Custom format: month abbreviation for timeline
    dateFormat: (date: Date) => {
      const day = date.getUTCDate();
      return day === 1 ? 'MMM' : 'dd'; // "Dec" or "15"
    },
  },
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { CircleIcon } from '@/icons';

function TimelineSlider() {
  const [selection, setSelection] = useState();

  return (
    <div 
      className="p-8 rounded-lg"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}
    >
      <DateSlider
        mode="point"
        value={{ point: new Date('2024-12-05T10:52:00Z') }}
        min={new Date('2024-12-03')}
        max={new Date('2024-12-25')}
        initialTimeUnit="day"
        onChange={setSelection}
        icons={{ point: <CircleIcon /> }}
        layout={{
          width: 700,
          height: 80,
          scaleUnitConfig: {
            gap: 150,
            width: { short: 0, medium: 0, long: 2 },
            height: { short: 0, medium: 0, long: 40 },
          },
        }}
        behavior={{
          scrollable: true,
          handleLabelPersistent: true,
        }}
        classNames={{
          trackActive: 'bg-white/40',
          track: 'bg-white/20',
          trackInner: 'h-1 top-1/2',
          handle: 'bg-white shadow-2xl border-4 border-white/40',
          scaleMarkMajor: 'bg-white/60',
        }}
      />
    </div>
  );
}`,
      },
    },
  },
};
