/**
 * DateSlider Storybook Stories
 *
 * This file demonstrates all the use cases and features of the DateSlider component.
 *
 * ## Available Stories (Use Cases):
 *
 * 1. **RangeMode** - Basic date range selection with start and end dates
 *    - Use case: Selecting a date range for reports, bookings, or filters
 *    - Features: Month-level granularity, custom track colors
 *
 * 2. **PointMode** - Single date point selection
 *    - Use case: Picking a single date for events, deadlines, or birthdays
 *    - Features: Day-level granularity, compact layout
 *
 * 3. **CombinedMode** - Both point and range selection together
 *    - Use case: Advanced filtering with both date range and specific highlight date
 *    - Features: Shows all three handles simultaneously
 *
 * 4. **FixedTrackWidth** - Responsive width slider with fixed track
 *    - Use case: Full-width layouts that maintain consistent track appearance
 *    - Features: width: 'fill', fixedTrackWidth: true
 *
 * 5. **CustomStyles** - Advanced styling with Tailwind gradients
 *    - Use case: Branded or themed date pickers matching your design system
 *    - Features: Custom wrapper, slider, track, and selector styles
 *
 * 6. **YearlyOverview** - Long-term date selection (years)
 *    - Use case: Historical data analysis, timeline navigation
 *    - Features: Year-level granularity, custom scale configuration
 *
 * 7. **ScrollableSlider** - Horizontal scrolling for large date ranges
 *    - Use case: Navigating through very large date ranges
 *    - Features: scrollable: true, custom scale unit spacing
 *
 * 8. **ResponsiveWidth** - Full-width responsive slider
 *    - Use case: Mobile-friendly layouts that adapt to container width
 *    - Features: width: 'fill'
 *
 * 9. **WithCustomRenderProps** - Custom UI components via render props
 *    - Use case: Complete UI customization for date labels, display, and controls
 *    - Features: renderDateLabel, renderTimeDisplay, renderTimeUnitSelection
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronLeft, ChevronRight, Circle, MoveHorizontal } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';

import { Button } from '../Button';
import { DateSlider } from './DateSlider';
import type {
  DateLabelRenderProps,
  SelectionResult,
  SliderExposedMethod,
  SliderProps,
  TimeDisplayRenderProps,
  TimeUnit,
  TimeUnitSelectionRenderProps,
} from './type';
import { toUTCDate } from './utils';

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
    granularity: {
      control: { type: 'select' },
      options: ['day', 'hour', 'minute'],
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
  if (!selection) return '';
  let result = '';
  if ('start' in selection && 'point' in selection) {
    result = `start: ${selection.start} \nend: ${selection.end} \npoint: ${selection.point}`;
  } else if ('start' in selection) {
    result = `start: ${selection.start} \nend: ${selection.end}`;
  } else if ('point' in selection) {
    result = `point: ${selection.point}`;
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
            <Button onClick={() => handleSetDateTime(toUTCDate('2022-01-01'), 'point')} size="sm">
              Set Point to 2022-01-01
            </Button>
            <Button onClick={() => handleFocusHandle('point')} variant="outline" size="sm">
              Focus Point Handle
            </Button>
          </>
        )}

        {(viewMode === 'range' || viewMode === 'combined') && (
          <>
            <Button onClick={() => handleSetDateTime(toUTCDate('2021-06-01'), 'start')} size="sm">
              Set Range Start to 2021-06-01
            </Button>
            <Button onClick={() => handleSetDateTime(toUTCDate('2021-09-01'), 'end')} size="sm">
              Set Range End to 2021-09-01
            </Button>
            <Button onClick={() => handleFocusHandle('start')} variant="outline" size="sm">
              Focus Start Handle
            </Button>
            <Button onClick={() => handleFocusHandle('end')} variant="outline" size="sm">
              Focus End Handle
            </Button>
          </>
        )}

        <Button
          onClick={() => handleSetDateTime(new Date(Date.now()))}
          variant="secondary"
          size="sm"
        >
          Set to Current Date
        </Button>
      </div>
    );
  }
);

ControlButtons.displayName = 'ControlButtons';

// Custom render prop examples
const customDateLabelRenderer = ({ label }: DateLabelRenderProps) => {
  return (
    <span className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded shadow-md font-semibold">
      {label}
    </span>
  );
};

const customTimeDisplayRenderer = ({
  toNextDate,
  toPrevDate,
  dateLabel,
}: TimeDisplayRenderProps) => {
  return (
    <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1.5 shadow-sm border border-gray-300 w-40 shrink-0">
      <button
        onClick={toPrevDate}
        className="p-1 hover:bg-blue-50 rounded transition-colors shrink-0"
        aria-label="Previous date"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700" />
      </button>
      <span className="text-sm font-semibold text-gray-900 flex-1 text-center">{dateLabel}</span>
      <button
        onClick={toNextDate}
        className="p-1 hover:bg-blue-50 rounded transition-colors shrink-0"
        aria-label="Next date"
      >
        <ChevronRight className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
};

const customTimeUnitSelectionRenderer = ({
  timeUnit,
  handleTimeUnitNextSelect,
  handleTimeUnitPreviousSelect,
  isNextBtnDisabled,
  isPrevBtnDisabled,
}: TimeUnitSelectionRenderProps) => {
  return (
    <div className="flex flex-col items-center gap-1 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-300 w-20 shrink-0">
      <button
        onClick={handleTimeUnitPreviousSelect}
        disabled={isPrevBtnDisabled()}
        className="p-1 hover:bg-blue-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        aria-label="Previous time unit"
      >
        <ChevronLeft className="w-3 h-3 text-gray-700 rotate-90" />
      </button>
      <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">{timeUnit}</span>
      <button
        onClick={handleTimeUnitNextSelect}
        disabled={isNextBtnDisabled()}
        className="p-1 hover:bg-blue-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        aria-label="Next time unit"
      >
        <ChevronRight className="w-3 h-3 text-gray-700 rotate-90" />
      </button>
    </div>
  );
};

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
            granularity={args.granularity ?? 'day'}
            onChange={handleSelectionChange}
            imperativeRef={sliderMethodRef}
            icons={{
              point: <Circle />,
            }}
            classNames={args.classNames}
            behavior={args.behavior}
            layout={args.layout}
            renderProps={args.renderProps}
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
            granularity={args.granularity ?? 'day'}
            onChange={handleSelectionChange}
            imperativeRef={sliderMethodRef}
            icons={{
              rangeStart: <MoveHorizontal />,
              rangeEnd: <MoveHorizontal />,
            }}
            classNames={args.classNames}
            behavior={args.behavior}
            layout={args.layout}
            renderProps={args.renderProps}
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
            granularity={args.granularity ?? 'day'}
            onChange={handleSelectionChange}
            imperativeRef={sliderMethodRef}
            icons={{
              point: <Circle />,
              rangeStart: <MoveHorizontal />,
              rangeEnd: <MoveHorizontal />,
            }}
            classNames={args.classNames}
            behavior={args.behavior}
            layout={args.layout}
            renderProps={args.renderProps}
          />
          <SelectionDisplay selection={selection} />
          <ControlButtons sliderMethodRef={sliderMethodRef} viewMode="combined" />
        </div>
      </div>
    );
  }
};

// Story configurations with better defaults and documentation
export const RangeMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'range',
    value: {
      start: toUTCDate('2021-03-01'),
      end: toUTCDate('2021-06-01'),
    },
    min: toUTCDate('2020-01-01'),
    max: toUTCDate('2025-03-15'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 800,
      height: 120,
      minGapScaleUnits: 1,
    },
    classNames: {
      trackActive: 'bg-blue-400/20',
      track: 'bg-gray-400',
    },
  },
};

export const PointMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2019-01-01'),
    },
    min: toUTCDate('2019-01-01'),
    max: toUTCDate('2019-02-08'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 600,
      height: 90,
    },
    classNames: {
      trackActive: 'bg-green-400/20',
      track: 'bg-gray-400',
    },
  },
};

export const CombinedMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'combined',
    value: {
      start: toUTCDate('2021-03-01'),
      end: toUTCDate('2021-06-01'),
      point: toUTCDate('2023-08-01'),
    },
    min: toUTCDate('2020-10-05'),
    max: toUTCDate('2025-11-11'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 900,
      height: 140,
      minGapScaleUnits: 2,
    },
    classNames: {
      trackActive: 'bg-purple-400/20',
      track: 'bg-gray-300',
    },
  },
};

export const FixedTrackWidth: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'range',
    value: {
      start: toUTCDate('2021-11-05'),
      end: toUTCDate('2022-01-05'),
    },
    min: toUTCDate('2020-10-05'),
    max: toUTCDate('2025-11-11'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 'fill',
      fixedTrackWidth: true,
      height: 100,
    },
    classNames: {
      trackActive: 'bg-orange-400/20',
      track: 'bg-gray-400',
    },
  },
};

export const CustomStyles: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'combined',
    value: {
      start: toUTCDate('2021-11-05'),
      end: toUTCDate('2022-01-05'),
      point: toUTCDate('2023-10-10'),
    },
    min: toUTCDate('2020-10-01'),
    max: toUTCDate('2025-11-11'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 700,
      height: 110,
      minGapScaleUnits: 1,
      trackPaddingX: 48,
    },
    classNames: {
      wrapper: 'rounded-xl shadow-lg bg-white border-2 border-indigo-200',
      slider: 'rounded-lg border border-gray-300 bg-gradient-to-r from-indigo-50 to-purple-50',
      trackActive: 'bg-gradient-to-r from-indigo-400/30 to-purple-400/30',
      track: 'bg-gray-400 border border-gray-200',
    },
    renderProps: {
      renderDateLabel: customDateLabelRenderer,
      renderTimeDisplay: customTimeDisplayRenderer,
      renderTimeUnitSelection: customTimeUnitSelectionRenderer,
    },
  },
};

export const YearlyOverview: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2024-01-01'),
    },
    min: toUTCDate('2000-01-01'),
    max: toUTCDate('2030-12-31'),
    initialTimeUnit: 'year' as TimeUnit,
    layout: {
      width: 800,
      height: 100,
      scaleUnitConfig: {
        gap: 60,
        width: { short: 1, medium: 1, long: 1 },
        height: { short: 10, medium: 20, long: 40 },
      },
    },
    classNames: {
      trackActive: 'bg-rose-400/20',
      track: 'bg-gray-300',
    },
  },
};

export const ScrollableSlider: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2022-06-15'),
    },
    min: toUTCDate('2020-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 600,
      height: 80,
      scaleUnitConfig: {
        gap: 100,
        width: { short: 1, medium: 2, long: 2 },
        height: { short: 18, medium: 36, long: 60 },
      },
    },
    behavior: {
      scrollable: true,
    },
    classNames: {
      trackActive: 'bg-teal-400/20',
      track: 'bg-gray-300',
    },
  },
};

export const ResponsiveWidth: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2020-01-15'),
    },
    min: toUTCDate('2020-01-01'),
    max: toUTCDate('2020-02-10'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 'fill',
      height: 80,
    },
    classNames: {
      trackActive: 'bg-indigo-400/20',
      track: 'bg-gray-300',
    },
  },
};

export const WithCustomRenderProps: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2022-06-15'),
    },
    min: toUTCDate('2022-01-01'),
    max: toUTCDate('2022-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 800,
      height: 100,
    },
    classNames: {
      trackActive: 'bg-purple-400/20',
      track: 'bg-gray-300',
    },
    renderProps: {
      renderDateLabel: customDateLabelRenderer,
      renderTimeDisplay: customTimeDisplayRenderer,
      renderTimeUnitSelection: customTimeUnitSelectionRenderer,
    },
  },
};

// Custom template for frosted glass effect - needs gradient background
const FrostedGlassTemplate = (args: Partial<SliderProps>) => {
  const [selection, setSelection] = useState<SelectionResult>();
  const sliderMethodRef = useRef<SliderExposedMethod>(null);

  const handleSelectionChange = useCallback((newSelection: SelectionResult) => {
    setSelection(newSelection);
  }, []);

  const value =
    args.value && 'point' in args.value ? args.value : { point: toUTCDate('2022-06-15') };

  return (
    <div className="p-8 bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 min-h-[500px] rounded-lg">
      <div className="p-6">
        <DateSlider
          mode="point"
          value={value}
          min={args.min ?? toUTCDate('2022-01-01')}
          max={args.max ?? toUTCDate('2022-12-31')}
          initialTimeUnit={args.initialTimeUnit ?? 'day'}
          granularity={args.granularity ?? 'day'}
          onChange={handleSelectionChange}
          imperativeRef={sliderMethodRef}
          icons={{
            point: <Circle />,
          }}
          classNames={args.classNames}
          behavior={args.behavior}
          layout={args.layout}
          renderProps={args.renderProps}
        />
        <SelectionDisplay selection={selection} />
        <ControlButtons sliderMethodRef={sliderMethodRef} viewMode="point" />
      </div>
    </div>
  );
};

export const FrostSlider: Story = {
  render: (args: Partial<SliderProps>) => <FrostedGlassTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2022-06-15'),
    },
    min: toUTCDate('2022-01-01'),
    max: toUTCDate('2022-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 'fill',
      height: 100,
      scaleUnitConfig: {
        gap: 100,
        width: { short: 1, medium: 2, long: 2 },
        height: { short: 18, medium: 36, long: 60 },
      },
    },
    behavior: {
      scrollable: true,
    },
    classNames: {
      slider: 'frosted',
      trackActive: 'bg-white/30',
      track: 'bg-white/10',
    },
    renderProps: {
      renderDateLabel: customDateLabelRenderer,
      renderTimeDisplay: customTimeDisplayRenderer,
      renderTimeUnitSelection: customTimeUnitSelectionRenderer,
    },
  },
};
