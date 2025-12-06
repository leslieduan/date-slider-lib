/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta, StoryObj } from '@storybook/react';
import { memo, useRef, useState } from 'react';
import { DateSlider } from './DateSlider';
import type { SliderProps, SelectionResult, SliderExposedMethod, TimeUnit } from '@/type';
import { toUTCDate } from '@/utils';
import { CircleIcon, MoveHorizontalIcon } from '@/icons';

/**
 * DateSlider - A powerful, customizable date slider component
 *
 * Supports three modes:
 * - Point: Single date selection
 * - Range: Start and end date selection
 * - Combined: Both point and range selection
 *
 * Features:
 * - Fully customizable with Tailwind CSS
 * - Built-in default icons and renderers
 * - Mobile-optimized with automatic responsive behavior
 * - Keyboard accessible (WCAG compliant)
 * - Optional UI components (date labels, time display, unit selector)
 */
const meta: Meta<typeof DateSlider> = {
  title: 'Components/DateSlider',
  component: DateSlider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible date slider supporting point, range, and combined selection modes with UTC date architecture.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['point', 'range', 'combined'],
      description: 'Selection mode',
      table: {
        type: { summary: "'point' | 'range' | 'combined'" },
        defaultValue: { summary: 'point' },
      },
    },
    initialTimeUnit: {
      control: 'select',
      options: ['day', 'month', 'year'],
      description: 'Initial time unit for navigation',
      table: {
        type: { summary: "'day' | 'month' | 'year'" },
        defaultValue: { summary: 'day' },
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DateSlider>;

// Helper components for stories
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
      <strong>Selection:</strong>
      <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-xs mt-2">{result}</pre>
    </div>
  );
});

SelectionDisplay.displayName = 'SelectionDisplay';

const Template = (args: Partial<SliderProps>) => {
  const [selection, setSelection] = useState<SelectionResult>();
  const sliderRef = useRef<SliderExposedMethod>(null);

  return (
    <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-[400px] rounded-lg">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <DateSlider {...(args as any)} onChange={setSelection} imperativeRef={sliderRef} />
        <SelectionDisplay selection={selection} />
      </div>
    </div>
  );
};

/**
 * Default story - Minimal configuration
 *
 * Shows the simplest possible setup with just required props.
 * Perfect starting point for new users.
 */
export const Default: Story = {
  render: Template,
  args: {
    mode: 'point',
    value: { point: toUTCDate('2024-06-15') },
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
 * Point Mode - Single date selection
 *
 * Demonstrates point mode with custom styling and date formatting.
 * Useful for event selection, calendar pickers, etc.
 */
export const PointMode: Story = {
  render: Template,
  args: {
    mode: 'point',
    value: { point: toUTCDate('2024-06-15') },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 700,
      height: 100,
      dateLabelEnabled: true,
    },
    classNames: {
      trackActive: 'bg-green-500/30',
      track: 'bg-gray-300',
      handle: 'bg-green-600 border-2 border-white shadow-lg',
      scaleMarkMajor: 'bg-green-600',
      scaleLabel: 'text-green-800 font-medium',
    },
    dateFormat: {
      scale: (date) => {
        const day = date.getUTCDate();
        return day === 1 ? 'MMM' : 'dd';
      },
      label: () => 'dd-MMM-yyyy',
    },
  },
};

/**
 * Range Mode - Date range selection
 *
 * Shows range selection with scrollable behavior and custom scale configuration.
 * Ideal for booking systems, filters, and analytics dashboards.
 */
export const RangeMode: Story = {
  render: Template,
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
 * Combined Mode - Point + Range selection
 *
 * Demonstrates using both point and range handles simultaneously.
 * Shows different label behaviors for each handle type.
 */
export const CombinedMode: Story = {
  render: Template,
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
      dateLabelEnabled: true,
      dateLabelDistanceOverHandle: 40,
    },
    behavior: {
      pointHandleLabelPersistent: true,
      rangeHandleLabelPersistent: false,
      trackHoverDateLabelDisabled: true,
    },
    classNames: {
      trackActive: 'bg-purple-500/25',
      track: 'bg-gray-200',
      handlePoint: 'bg-purple-700 border-2 border-white shadow-lg scale-110',
      handleStart: 'bg-purple-500 border-2 border-white shadow-md',
      handleEnd: 'bg-purple-500 border-2 border-white shadow-md',
    },
  },
};

/**
 * With UI Components - Full feature set
 *
 * Shows all optional UI components enabled.
 * Default renderers are provided - no custom renderProps needed!
 */
export const WithUIComponents: Story = {
  render: Template,
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
      width: 850,
      height: 130,
      dateLabelEnabled: true,
      selectionPanelEnabled: true,
      timeUnitSelectionEnabled: true,
      minGapScaleUnits: 3,
    },
    behavior: {
      handleLabelPersistent: true,
      scrollable: true,
      sliderAutoScrollToPointHandleVisibleEnabled: true,
    },
    classNames: {
      trackActive: 'bg-indigo-400/30',
      track: 'bg-gray-200',
      handle: 'bg-indigo-600 border-2 border-white shadow-lg',
      scaleMarkMajor: 'bg-indigo-500',
      scaleLabel: 'text-indigo-900 font-medium',
    },
  },
};

/**
 * Year Navigation - Long-term planning
 *
 * Demonstrates year-level navigation for historical data or long-term planning.
 * Shows custom date formatting to display years.
 */
export const YearNavigation: Story = {
  render: Template,
  args: {
    mode: 'range',
    value: {
      start: toUTCDate('2015-01-01'),
      end: toUTCDate('2023-01-01'),
    },
    min: toUTCDate('2000-01-01'),
    max: toUTCDate('2030-12-31'),
    initialTimeUnit: 'year' as TimeUnit,
    layout: {
      width: 700,
      height: 100,
      dateLabelEnabled: true,
      timeUnitSelectionEnabled: true,
    },
    behavior: {
      handleLabelPersistent: true,
    },
    classNames: {
      trackActive: 'bg-orange-500/30',
      track: 'bg-gray-300',
    },
    dateFormat: {
      scale: (date) => {
        const day = date.getUTCDate();
        return day === 1 ? 'MMM' : 'dd';
      },
      label: () => 'dd-MMM-yyyy',
    },
  },
};

/**
 * Custom Icons - Personalized handles
 *
 * Shows how to provide custom icons for handles.
 * Icons are optional - defaults are provided if not specified.
 */
export const CustomIcons: Story = {
  render: Template,
  args: {
    mode: 'combined',
    value: {
      point: toUTCDate('2024-06-15'),
      start: toUTCDate('2024-03-01'),
      end: toUTCDate('2024-09-01'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'month' as TimeUnit,
    icons: {
      point: <CircleIcon className="fill-red-600 text-red-600" />,
      range: <MoveHorizontalIcon className="text-blue-600" />,
    },
    layout: {
      width: 800,
      height: 100,
      dateLabelEnabled: true,
    },
    classNames: {
      trackActive: 'bg-gradient-to-r from-blue-400/20 to-red-400/20',
      track: 'bg-gray-300',
    },
  },
};

/**
 * Fill Width - Responsive sizing
 *
 * Demonstrates using 'fill' width to adapt to parent container.
 * Useful for responsive layouts.
 */
export const FillWidth: Story = {
  render: Template,
  args: {
    mode: 'range',
    value: {
      start: toUTCDate('2024-03-01'),
      end: toUTCDate('2024-09-01'),
    },
    min: toUTCDate('2024-01-01'),
    max: toUTCDate('2024-12-31'),
    initialTimeUnit: 'month' as TimeUnit,
    layout: {
      width: 'fill',
      height: 90,
      dateLabelEnabled: true,
    },
    behavior: {
      rangeHandleLabelPersistent: true,
    },
  },
};

/**
 * Timeline Style - Minimal scale marks for timeline displays
 *
 * Demonstrates a timeline-style configuration with minimal scale marks,
 * custom positioning, and optimized for clean timeline interfaces.
 */
export const TimelineStyle: Story = {
  render: Template,
  args: {
    mode: 'point',
    value: {
      point: toUTCDate('2024-12-04T10:52:00Z'),
    },
    min: toUTCDate('2024-11-03'),
    max: toUTCDate('2024-12-25'),
    initialTimeUnit: 'day' as TimeUnit,
    layout: {
      width: 600,
      height: 80,
      scaleUnitConfig: {
        gap: 150,
        width: { short: 0, medium: 0, long: 2 },
        height: { short: 0, medium: 0, long: 40 },
      },
      dateLabelEnabled: true,
    },
    behavior: {
      scrollable: true,
      handleLabelPersistent: true,
    },
    classNames: {
      trackActive: 'bg-gradient-to-r from-blue-500 to-purple-500',
      track: 'bg-gray-200',
      trackInner: 'h-1 top-1/2 bg-red-400',
      handle: 'shadow-xl top-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-600 to-purple-600',
      handlePoint: 'hover:scale-125 transition-transform border-2 border-white',
      scaleLabel: 'text-gray-700 font-semibold -bottom-4',
    },
    dateFormat: {
      scale: (date) => {
        const day = date.getUTCDate();
        return day === 1 ? 'MMM' : 'dd';
      },
      label: () => 'dd-MMM-yyyy',
    },
  },
};
