import type { Meta, StoryObj } from '@storybook/react';
import { memo, useCallback, useRef, useState } from 'react';

import { DateSlider } from './DateSlider';
import type {
  SliderProps,
  SelectionResult,
  SliderExposedMethod,
  DateLabelRenderProps,
  TimeDisplayRenderProps,
  TimeUnitSelectionRenderProps,
  TimeUnit,
} from '@/type';
import { toUTCDate } from '@/utils';
import { ChevronLeftIcon, ChevronRightIcon, CircleIcon, MoveHorizontalIcon } from '@/icons';

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
        className="p-1 hover:bg-blue-50 rounded transition-colors shrink-0 cursor-pointer"
        aria-label="Previous date"
      >
        <ChevronLeftIcon className="w-4 h-4 text-gray-700" />
      </button>
      <span className="text-sm font-semibold text-gray-900 flex-1 text-center">{dateLabel}</span>
      <button
        onClick={toNextDate}
        className="p-1 hover:bg-blue-50 rounded transition-colors shrink-0 cursor-pointer"
        aria-label="Next date"
      >
        <ChevronRightIcon className="w-4 h-4 text-gray-700" />
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
        className="p-1 hover:bg-blue-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        aria-label="Previous time unit"
      >
        <ChevronLeftIcon className="w-3 h-3 text-gray-700 rotate-90" />
      </button>
      <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">{timeUnit}</span>
      <button
        onClick={handleTimeUnitNextSelect}
        disabled={isNextBtnDisabled()}
        className="p-1 hover:bg-blue-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        aria-label="Next time unit"
      >
        <ChevronRightIcon className="w-3 h-3 text-gray-700 rotate-90" />
      </button>
    </div>
  );
};

// Getting Started template component
const GettingStartedTemplate = () => {
  const [selection, setSelection] = useState<SelectionResult>();

  const value = { point: toUTCDate('2024-06-15') };

  return (
    <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-[400px] rounded-lg">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Getting Started with DateSlider</h2>
        <p className="text-gray-700 mb-6">
          This is the simplest possible DateSlider configuration. Try dragging the handle or using
          keyboard arrows!
        </p>

        <DateSlider
          mode="point"
          value={value}
          min={toUTCDate('2024-01-01')}
          max={toUTCDate('2024-12-31')}
          initialTimeUnit="day"
          onChange={setSelection}
          icons={{ point: <CircleIcon /> }}
          layout={{ width: 600, height: 80 }}
        />

        {selection && (
          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <strong className="text-blue-900">Selected Date:</strong>
            <pre className="mt-2 text-sm text-blue-800">
              {'point' in selection && selection.point.toISOString()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Getting Started
 *
 * This story demonstrates the absolute minimum code needed to use DateSlider.
 * Perfect for beginners who want to quickly integrate the component.
 *
 * ## Basic Usage:
 * ```tsx
 * import { DateSlider } from 'date-slider-lib';
 * import { CircleIcon } from '@/icons';
 *
 * function App() {
 *   const [value, setValue] = useState({ point: new Date() });
 *
 *   return (
 *     <DateSlider
 *       mode="point"
 *       value={value}
 *       onChange={setValue}
 *       min={new Date('2024-01-01')}
 *       max={new Date('2024-12-31')}
 *       initialTimeUnit="day"
 *       icons={{ point: <CircleIcon /> }}
 *     />
 *   );
 * }
 * ```
 *
 * ## Key Props:
 * - `mode`: Selection type ('point', 'range', or 'combined')
 * - `value`: Current selection (UTC dates)
 * - `onChange`: Callback when selection changes
 * - `min` / `max`: Date range boundaries
 * - `initialTimeUnit`: Starting granularity ('day', 'month', 'year')
 * - `icons`: Custom icons for handles
 */
export const GettingStarted: Story = {
  render: () => <GettingStartedTemplate />,
  args: {},
  parameters: {
    docs: {
      source: {
        code: `
 import { DateSlider } from 'date-slider-lib';
 import { CircleIcon } from '@/icons';
 
 function App() {
   const [value, setValue] = useState({ point: new Date() });
 
   return (
     <DateSlider
       mode="point"
       value={value}
       onChange={setValue}
       min={new Date('2024-01-01')}
       max={new Date('2024-12-31')}
       initialTimeUnit="day"
       icons={{ point: <CircleIcon /> }}
     />
   );
 }
 `,
      },
    },
  },
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
              rangeStart: <MoveHorizontalIcon />,
              rangeEnd: <MoveHorizontalIcon />,
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
              rangeStart: <MoveHorizontalIcon />,
              rangeEnd: <MoveHorizontalIcon />,
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

// Story configurations with better defaults and documentation

/**
 * Range Mode - Basic date range selection
 */
export const RangeMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'range',
    value: {
      start: toUTCDate('2020-03-01'),
      end: toUTCDate('2021-08-01'),
    },
    min: toUTCDate('2020-01-01'),
    max: toUTCDate('2022-03-15'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 800,
      height: 120,
    },
    classNames: {
      trackActive: 'bg-blue-400/20',
      track: 'bg-gray-400',
    },
    behavior: {
      handleLabelPersistent: true,
    },
    renderProps: { renderDateLabel: customDateLabelRenderer },
  },
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { MoveHorizontalIcon } from '@/icons';

function RangeSlider() {
  const [selection, setSelection] = useState();

  return (
    <DateSlider
      mode="range"
      value={{
        start: new Date('2021-03-01'),
        end: new Date('2021-06-01')
      }}
      min={new Date('2020-01-01')}
      max={new Date('2025-03-15')}
      initialTimeUnit="month"
      onChange={setSelection}
      icons={{
        rangeStart: <MoveHorizontalIcon />,
        rangeEnd: <MoveHorizontalIcon />
      }}
    />
  );
}`,
      },
    },
  },
};

/**
 * Point Mode - Single date point selection
 * Uses custom numeric date format for compact display
 */
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
    // Custom format: numeric dates
    dateFormat: (date: Date) => {
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      if (month === 0 && day === 1) return 'mm-yyyy'; // "01 2019"
      if (day === 1) return 'mm'; // "02"
      return 'dd'; // "15"
    },
  },
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { CircleIcon } from '@/icons';

function PointSlider() {
  const [selection, setSelection] = useState();

  return (
    <DateSlider
      mode="point"
      value={{ point: new Date('2019-01-01') }}
      min={new Date('2019-01-01')}
      max={new Date('2019-02-08')}
      initialTimeUnit="day"
      onChange={setSelection}
      icons={{ point: <CircleIcon /> }}
    />
  );
}`,
      },
    },
  },
};

/**
 * Combined Mode - Both point and range selection
 */
export const CombinedMode: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'combined',
    value: {
      start: toUTCDate('2021-03-01'),
      end: toUTCDate('2022-06-01'),
      point: toUTCDate('2021-08-01'),
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
    behavior: {
      pointHandleLabelPersistent: true,
      handleLabelPersistent: true,
    },
    renderProps: { renderDateLabel: customDateLabelRenderer },
  },
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { CircleIcon, MoveHorizontalIcon } from '@/icons';

function CombinedSlider() {
  return (
    <DateSlider
      mode="combined"
      value={{
        start: new Date('2021-03-01'),
        end: new Date('2021-06-01'),
        point: new Date('2023-08-01')
      }}
      min={new Date('2020-10-05')}
      max={new Date('2025-11-11')}
      initialTimeUnit="month"
      icons={{
        point: <CircleIcon />,
        rangeStart: <MoveHorizontalIcon />,
        rangeEnd: <MoveHorizontalIcon />
      }}
    />
  );
}`,
      },
    },
  },
};

/**
 * Without Scale Marks - Hides all tick marks on the track
 */
export const WithoutScaleMarks: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'range',
    value: {
      start: toUTCDate('2024-03-01'),
      end: toUTCDate('2024-09-01'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: { width: 700, height: 100 },
    classNames: {
      trackActive: 'bg-blue-500/30',
      track: 'bg-gray-300',
      scaleMark: 'hidden',
      scaleMarkMajor: 'hidden',
      scaleMarkMedium: 'hidden',
      scaleMarkMinor: 'hidden',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { MoveHorizontalIcon } from '@/icons';

function WithoutScaleMarks() {
  return (
    <DateSlider
      mode="range"
      value={{
        start: new Date('2024-03-01'),
        end: new Date('2024-09-01')
      }}
      min={new Date('2024-01-01')}
      max={new Date('2024-12-31')}
      initialTimeUnit="month"
      icons={{
        rangeStart: <MoveHorizontalIcon />,
        rangeEnd: <MoveHorizontalIcon />
      }}
      classNames={{
        scaleMark: 'hidden', // Hide scale marks
        scaleMarkMajor: 'hidden',
      }}
    />
  );
}`,
      },
    },
  },
};

/**
 * Persistent Handle Labels - Labels always visible
 *
 * This story demonstrates persistent handle labels that remain visible at all times.
 * The label shows the currently selected date and stays visible above the handle.
 *
 * ## Label Behavior
 * - When `handleLabelPersistent` is `true`, labels are always visible
 * - When `false`, labels appear only on hover, drag, or temporarily after interaction
 * - On mobile devices, labels are automatically persistent for better usability
 *
 * ## Smart Label Display
 * The component intelligently shows labels to avoid confusion:
 * - Only the actively moved handle's label appears during interaction
 * - When clicking the track, only the moved handle's label is shown
 * - During scrolling, labels remain stable without flickering
 */
export const PersistentHandleLabels: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2024-08-01'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: { width: 700, height: 100 },
    behavior: {
      handleLabelPersistent: true,
    },
    classNames: {
      trackActive: 'bg-blue-500/30',
      track: 'bg-gray-300',
    },
    renderProps: { renderDateLabel: customDateLabelRenderer },
  },
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { MoveHorizontalIcon } from '@/icons';

function PersistentLabels() {
  return (
    <DateSlider
      mode="range"
      value={{
        start: new Date('2024-04-01'),
        end: new Date('2024-08-01')
      }}
      min={new Date('2024-01-01')}
      max={new Date('2024-12-31')}
      initialTimeUnit="month"
      icons={{
        rangeStart: <MoveHorizontalIcon />,
        rangeEnd: <MoveHorizontalIcon />
      }}
      behavior={{
        handleLabelPersistent: true // Labels always visible
      }}
    />
  );
}`,
      },
    },
  },
};

/**
 * Year Time Unit - Navigate by years
 *
 * This story demonstrates year-level navigation with combined mode (both range and point selection).
 *
 * ## Features Demonstrated
 * - Year-based time unit navigation
 * - Combined mode with all three handles (start, end, point)
 * - Custom date format showing years
 * - Custom time display renderer
 * - Smart label behavior: only the moved handle's label appears when interacting
 *
 * ## Try It Out
 * - Click on the track to move the nearest handle
 * - Drag any handle to change its position
 * - Notice that only the actively moved handle shows its date label
 * - Use the time display controls to navigate through years
 */
export const YearTimeUnit: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'combined',
    value: {
      start: toUTCDate('2015-01-01'),
      end: toUTCDate('2023-01-01'),
      point: toUTCDate('2018-01-01'),
    },
    min: toUTCDate('2000-01-01'),
    max: toUTCDate('2030-12-31'),
    initialTimeUnit: 'year' as TimeUnit,
    layout: {
      width: 700,
      height: 100,
      scaleUnitConfig: {
        gap: 60,
        width: { short: 1, medium: 1, long: 2 },
        height: { short: 15, medium: 25, long: 45 },
      },
    },
    classNames: {
      trackActive: 'bg-orange-500/30',
      track: 'bg-gray-300',
    },
    // Custom format: always show year for year-level navigation
    dateFormat: () => 'yyyy', // Always show 4-digit year
    renderProps: {
      renderDateLabel: customDateLabelRenderer,
      renderTimeDisplay: customTimeDisplayRenderer,
    },
  },
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { MoveHorizontalIcon } from '@/icons';

function YearSlider() {
  return (
    <DateSlider
      mode="range"
      value={{
        start: new Date('2015-01-01'),
        end: new Date('2023-01-01')
      }}
      min={new Date('2000-01-01')}
      max={new Date('2030-12-31')}
      initialTimeUnit="year" // Navigate by years
      icons={{
        rangeStart: <MoveHorizontalIcon />,
        rangeEnd: <MoveHorizontalIcon />
      }}
    />
  );
}`,
      },
    },
  },
};

/**
 * With Custom Render Props - Custom UI components
 */
export const WithCustomRenderProps: Story = {
  render: (args: Partial<SliderProps>) => <DateSliderTemplate {...args} />,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2022-06-15'),
    },
    min: toUTCDate('2022-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 800,
      height: 100,
    },
    behavior: { handleLabelPersistent: false, sliderAutoScrollToPointHandleVisibleEnabled: false },
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
  parameters: {
    docs: {
      source: {
        code: `import { DateSlider } from 'date-slider-lib';
import { CircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@/icons';

// Custom date label renderer
const customDateLabelRenderer = ({ label }) => (
  <span className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded shadow-md">
    {label}
  </span>
);

// Custom time display renderer
const customTimeDisplayRenderer = ({ toNextDate, toPrevDate, dateLabel }) => (
  <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1.5">
    <button onClick={toPrevDate}><ChevronLeftIcon /></button>
    <span>{dateLabel}</span>
    <button onClick={toNextDate}><ChevronRightIcon /></button>
  </div>
);

function CustomRenderProps() {
  return (
    <DateSlider
      mode="point"
      value={{ point: new Date('2022-06-15') }}
      min={new Date('2022-01-01')}
      max={new Date('2022-12-31')}
      initialTimeUnit="day"
      icons={{ point: <CircleIcon /> }}
      renderProps={{
        renderDateLabel: customDateLabelRenderer,
        renderTimeDisplay: customTimeDisplayRenderer,
      }}
    />
  );
}`,
      },
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
              point: <CircleIcon className="fill-white text-white" />,
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
 *
 * A visually stunning timeline slider with:
 * - Vibrant gradient background (purple to pink)
 * - Animated blur effects
 * - White transparent handle
 * - Minute-level precision
 * - Perfect for event timelines, video scrubbers, or any time-based UI
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
