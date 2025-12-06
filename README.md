# DateSlider

A powerful, fully customizable React date slider component with range, point, and combined selection modes. Built with TypeScript, styled with Tailwind CSS.

[![npm version](https://img.shields.io/npm/v/date-slider-lib.svg)](https://www.npmjs.com/package/date-slider-lib)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat&logo=storybook&logoColor=white)](https://leslieduan.github.io/date-slider-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 [View Live Demo & Documentation](https://leslieduan.github.io/date-slider-lib)

## ✨ Features

- **3 Selection Modes**: Point, Range, and Combined selection
- **Fully Customizable**: Style with Tailwind CSS classes
- **Type-Safe**: Complete TypeScript support
- **Accessible**: WCAG compliant with keyboard navigation
- **Responsive & Mobile-Optimized**: Auto-adapts to mobile devices with persistent labels
- **Flexible Time Units**: Day, month, and year navigation
- **Custom Rendering**: Full UI customization via render props
- **Label Control**: Configurable handle and track hover labels
- **Touch-Friendly**: Optimized touch interactions for mobile devices

## 🚀 Quick Start

### Installation

```bash
npm install date-slider-lib
# or
pnpm add date-slider-lib
# or
yarn add date-slider-lib
```

### Setup

**1. Import the CSS** (required):

```tsx
// In your main file (e.g., App.tsx)
import 'date-slider-lib/style.css';
```

**2. Configure Tailwind CSS** (if using Tailwind):

```js
// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/date-slider-lib/dist/**/*.{js,mjs,cjs}", // Add this
  ],
}
```

### Basic Usage

```tsx
import { DateSlider } from 'date-slider-lib';
import type { SelectionResult } from 'date-slider-lib';
import { Circle } from '@/icons';

function App() {
  const [selection, setSelection] = useState<SelectionResult>();

  return (
    <DateSlider
      mode="point"
      value={{ point: new Date('2024-06-15') }}
      onChange={setSelection}
      min={new Date('2024-01-01')}
      max={new Date('2024-12-31')}
      initialTimeUnit="day"
      icons={{ point: <Circle /> }}
    />
  );
}
```

## 📖 Modes

### Point Mode

Select a single date point.

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  onChange={(value) => console.log(value.point)}
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  initialTimeUnit="day"
  icons={{ point: <Circle /> }}
/>
```

### Range Mode

Select a date range with start and end dates.

```tsx
<DateSlider
  mode="range"
  value={{
    start: new Date('2024-03-01'),
    end: new Date('2024-09-01')
  }}
  onChange={(value) => console.log(value.start, value.end)}
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  initialTimeUnit="month"
  icons={{
    rangeStart: <MoveHorizontal />,
    rangeEnd: <MoveHorizontal />
  }}
/>
```

### Combined Mode

Select both a point and a range simultaneously.

```tsx
<DateSlider
  mode="combined"
  value={{
    point: new Date('2024-06-15'),
    start: new Date('2024-03-01'),
    end: new Date('2024-09-01')
  }}
  onChange={(value) => console.log(value)}
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  initialTimeUnit="month"
  icons={{
    point: <Circle />,
    rangeStart: <MoveHorizontal />,
    rangeEnd: <MoveHorizontal />
  }}
/>
```

## 🎨 Customization

### Styling with Tailwind Classes

```tsx
<DateSlider
  mode="range"
  value={{ start: new Date('2024-03-01'), end: new Date('2024-09-01') }}
  classNames={{
    trackActive: 'bg-blue-500/30',
    track: 'bg-gray-300',
    handle: 'bg-blue-600 border-2 border-white shadow-lg',
    handleDragging: 'scale-110',
    scaleMarkMajor: 'bg-gray-600',
    scaleLabel: 'text-gray-700',
  }}
/>
```

### Custom Date Formatting

Control how dates are formatted on labels and scales:

```tsx
import type { DateFormat } from 'date-slider-lib';

// Custom format function
const customFormat: DateFormat = (date) => {
  const day = date.getUTCDate();
  const month = date.getUTCMonth();

  if (month === 0 && day === 1) return 'yyyy';  // First of year: "2024"
  if (day === 1) return 'MMM';                  // First of month: "Jun"
  return 'dd';                                   // Regular day: "15"
};

<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  dateFormat={customFormat}
/>
```

**Available format tokens:**
- `yyyy` - 4-digit year (2024)
- `mm` - 2-digit month (06)
- `dd` - 2-digit day (15)
- `hh` - 2-digit hour (14)
- `MM` - 2-digit minutes (30)
- `MMM` - Short month name (Jun)
- `MMMM` - Full month name (June)

### Custom Render Props

Customize the UI with your own render functions. The library provides default renderers, so renderProps are optional:

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  layout={{
    dateLabelEnabled: true,
    timeDisplayEnabled: true,
    timeUnitSelectionEnabled: true,
  }}
  // Custom renderers (optional - defaults are provided)
  renderProps={{
    renderDateLabel: ({ label }) => (
      <span className="bg-blue-700 text-white px-3 py-1.5 rounded">
        {label}
      </span>
    ),
    renderTimeDisplay: ({ dateLabel, toNextDate, toPrevDate }) => (
      <div className="flex items-center gap-2">
        <button onClick={toPrevDate}>←</button>
        <span>{dateLabel}</span>
        <button onClick={toNextDate}>→</button>
      </div>
    ),
    renderTimeUnitSelection: ({ timeUnit, handleTimeUnitNextSelect, handleTimeUnitPreviousSelect }) => (
      <div className="flex items-center gap-2">
        <button onClick={handleTimeUnitPreviousSelect}>-</button>
        <span>{timeUnit}</span>
        <button onClick={handleTimeUnitNextSelect}>+</button>
      </div>
    ),
  }}
/>
```

### Label Behavior

Control when date labels appear:

```tsx
<DateSlider
  mode="combined"
  value={{
    point: new Date('2024-06-15'),
    start: new Date('2024-03-01'),
    end: new Date('2024-09-01')
  }}
  behavior={{
    // Handle labels
    handleLabelPersistent: true,          // All handles: always visible
    pointHandleLabelPersistent: true,     // Point handle only: always visible
    rangeHandleLabelPersistent: false,    // Range handles only: hover to show
    handleLabelDisabled: false,           // All handles: disable labels
    pointHandleLabelDisabled: false,      // Point handle only: disable label
    rangeHandleLabelDisabled: false,      // Range handles only: disable labels

    // Track hover behavior
    trackHoverDateLabelDisabled: false,   // Disable date label on track hover
    trackHoverCursorLineDisabled: false,  // Disable cursor line on track hover
  }}
/>
```

**Note**: On mobile devices (small screens), all handle labels are automatically persistent regardless of these settings to ensure better usability on touch devices.

### Layout Configuration

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  layout={{
    width: 800,                    // Fixed width in pixels (or 'fill' for parent width)
    height: 100,                   // Height in pixels
    trackPaddingX: 40,             // Horizontal padding
    showEndLabel: true,            // Show end date label on scale
    minGapScaleUnits: 50,          // Minimum gap between scale units
    dateLabelDistanceOverHandle: 35, // Distance of date label above handle

    // Component visibility toggles
    timeDisplayEnabled: true,      // Show/hide time display component (default: false)
    timeUnitSelectionEnabled: true, // Show/hide time unit selector (default: false)
    dateLabelEnabled: true,        // Show/hide date labels (default: false)

    scaleUnitConfig: {
      gap: 100,                    // Gap between scale units
      width: { short: 1, medium: 2, long: 2 },
      height: { short: 18, medium: 36, long: 60 },
    },
  }}
/>
```

### Component Visibility Control

Control which UI components are rendered. Default renderers are provided, so renderProps are optional!

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  layout={{
    width: 'fill',
    timeDisplayEnabled: true,       // Show time display with navigation
    timeUnitSelectionEnabled: true, // Show time unit selector (day/month/year)
    dateLabelEnabled: true,         // Show date labels on handles
  }}
  // No renderProps needed - default renderers are provided!
/>
```

**Optionally**, you can customize the UI by providing your own renderers:

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  layout={{
    width: 'fill',
    timeDisplayEnabled: true,
    timeUnitSelectionEnabled: true,
    dateLabelEnabled: true,
  }}
  renderProps={{
    // Optional: Customize the renderers
    renderTimeDisplay: ({ dateLabel, toNextDate, toPrevDate }) => (
      <div>
        <button onClick={toPrevDate}>←</button>
        <span>{dateLabel}</span>
        <button onClick={toNextDate}>→</button>
      </div>
    ),
    renderTimeUnitSelection: ({ timeUnit, handleTimeUnitNextSelect, handleTimeUnitPreviousSelect }) => (
      <div>
        <button onClick={handleTimeUnitPreviousSelect}>-</button>
        <span>{timeUnit}</span>
        <button onClick={handleTimeUnitNextSelect}>+</button>
      </div>
    ),
    renderDateLabel: ({ label }) => <span>{label}</span>,
  }}
/>
```

### Behavior Options

```tsx
<DateSlider
  mode="range"
  value={{ start: new Date('2024-03-01'), end: new Date('2024-09-01') }}
  behavior={{
    scrollable: true,                   // Enable horizontal scrolling
    freeSelectionOnTrackClick: false,   // Snap to scale units on click
  }}
/>
```

### Imperative API

Control the slider programmatically:

```tsx
import { useRef } from 'react';
import type { SliderExposedMethod } from 'date-slider-lib';

function App() {
  const sliderRef = useRef<SliderExposedMethod>(null);

  const setToToday = () => {
    sliderRef.current?.setDateTime(new Date(), 'point');
  };

  const focusHandle = () => {
    sliderRef.current?.focusHandle('point');
  };

  return (
    <>
      <DateSlider
        mode="point"
        value={{ point: new Date('2024-06-15') }}
        imperativeRef={sliderRef}
      />
      <button onClick={setToToday}>Set to Today</button>
      <button onClick={focusHandle}>Focus Handle</button>
    </>
  );
}
```

## 📘 API Reference

### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `'point' \| 'range' \| 'combined'` | Yes | Selection mode |
| `value` | `PointValue \| RangeValue \| CombinedValue` | Yes | Current selection (UTC dates) |
| `onChange` | `(value: SelectionResult) => void` | Yes | Selection change callback |
| `min` | `Date` | No | Minimum selectable date (UTC) |
| `max` | `Date` | No | Maximum selectable date (UTC) |
| `initialTimeUnit` | `'day' \| 'month' \| 'year'` | No | Initial time unit (default: 'day') |
| `icons` | `IconsConfig` | No | Custom icons for handles |
| `classNames` | `DateSliderClassNames` | No | Tailwind classes for styling |
| `behavior` | `BehaviorConfig` | No | Interaction behavior |
| `layout` | `LayoutConfig` | No | Size and layout |
| `renderProps` | `RenderPropsConfig` | No | Custom render functions |
| `dateFormat` | `DateFormat` | No | Custom date format function |
| `locale` | `string` | No | Date locale (default: 'en-AU') |
| `imperativeRef` | `Ref<SliderExposedMethod>` | No | Imperative API reference |

### Value Types

```typescript
// Point mode
type PointValue = { point: Date };

// Range mode
type RangeValue = { start: Date; end: Date };

// Combined mode
type CombinedValue = { point: Date; start: Date; end: Date };
```

### BehaviorConfig

```typescript
type BehaviorConfig = {
  scrollable?: boolean;                    // Enable horizontal scrolling
  freeSelectionOnTrackClick?: boolean;     // Free selection vs snap to units

  // Handle label control (global)
  handleLabelPersistent?: boolean;         // All handles: always visible
  handleLabelDisabled?: boolean;           // All handles: disable labels

  // Handle label control (specific)
  pointHandleLabelPersistent?: boolean;    // Point handle: always visible
  pointHandleLabelDisabled?: boolean;      // Point handle: disable label
  rangeHandleLabelPersistent?: boolean;    // Range handles: always visible
  rangeHandleLabelDisabled?: boolean;      // Range handles: disable labels

  // Track hover behavior
  trackHoverDateLabelDisabled?: boolean;   // Disable date label on track hover
  trackHoverCursorLineDisabled?: boolean;  // Disable cursor line on track hover

  // Auto-scroll behavior
  sliderAutoScrollToPointHandleVisibleEnabled?: boolean; // Auto-scroll to keep point handle visible (default: true)
};
```

**Note**: On mobile devices, `handleLabelPersistent` is automatically set to `true` regardless of configuration.

### DateSliderClassNames

```typescript
type DateSliderClassNames = {
  // Containers
  wrapper?: string;
  slider?: string;

  // Track
  track?: string;
  trackInner?: string;
  trackActive?: string;
  trackInactive?: string;

  // Handles
  handle?: string;              // Base handle styles
  handlePoint?: string;         // Point handle
  handleStart?: string;         // Range start handle
  handleEnd?: string;           // Range end handle
  handleDragging?: string;      // Dragging state
  handleIcon?: string;          // Handle icon wrapper

  // Visual elements
  cursorLine?: string;          // Hover cursor line
  scales?: string;              // Scales wrapper
  scaleMark?: string;           // Base scale mark
  scaleMarkMajor?: string;      // Major tick marks
  scaleMarkMedium?: string;     // Medium tick marks
  scaleMarkMinor?: string;      // Minor tick marks
  scaleLabel?: string;          // Scale labels
};
```

### LayoutConfig

```typescript
type LayoutConfig = {
  // Sizing
  width: 'fill' | number;              // Slider width - 'fill' or pixels
  height?: number;                     // Slider height in pixels
  trackPaddingX?: number;              // Horizontal padding for track

  // Scale configuration
  showEndLabel?: boolean;              // Show end date label on scale (default: true)
  minGapScaleUnits?: number;           // Minimum gap between scale units in pixels
  scaleUnitConfig?: ScaleUnitConfig;   // Custom scale unit sizing

  // Component positioning
  dateLabelDistanceOverHandle?: number; // Distance of date label above handle in pixels

  // Component visibility toggles (all default to false)
  timeDisplayEnabled?: boolean;        // Show time display component
  timeUnitSelectionEnabled?: boolean;  // Show time unit selector component
  dateLabelEnabled?: boolean;          // Show date labels on handles
};
```

**Note**: All UI components use default renderers. You can optionally provide custom renderers via `renderProps` to customize the appearance.

## 📦 TypeScript Support

Full TypeScript support with exported types:

```tsx
import {
  DateSlider,
  dateFormatFn,       // Default date format function
} from 'date-slider-lib';

import type {
  SliderProps,
  SelectionResult,
  SliderExposedMethod,
  PointValue,
  RangeValue,
  CombinedValue,
  DateSliderClassNames,
  LayoutConfig,
  BehaviorConfig,
  RenderPropsConfig,
  IconsConfig,
  DateFormat,
  TimeUnit,
} from 'date-slider-lib';
```

## 💡 Best Practices

### Use UTC Dates

All dates should be UTC Date objects:

```tsx
// ✅ CORRECT
<DateSlider
  min={new Date('2024-01-01T00:00:00Z')}
  max={new Date('2024-12-31T23:59:59Z')}
  value={{ point: new Date('2024-06-15T00:00:00Z') }}
/>

// ✅ Also works (assumes UTC when only date is provided)
<DateSlider
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  value={{ point: new Date('2024-06-15') }}
/>
```

### Type Your Callbacks

```tsx
const handleChange = useCallback((selection: SelectionResult) => {
  if ('point' in selection) {
    console.log('Point:', selection.point);
  }
  if ('start' in selection) {
    console.log('Range:', selection.start, selection.end);
  }
}, []);
```


## ♿ Accessibility

- **Keyboard Navigation**: Arrow keys, Home, End, Page Up/Down
- **ARIA Labels**: Screen reader support
- **Focus Management**: Visible focus indicators
- **Touch Support**: Mobile-friendly

## 📱 Mobile & Responsive Behavior

The DateSlider automatically adapts to different screen sizes with mobile-optimized behavior:

### Automatic Mobile Optimizations

On small screens (mobile devices), the following behaviors are automatically applied:

1. **Persistent Handle Labels**: All handle labels become persistent (always visible) on mobile devices, regardless of the `handleLabelPersistent` setting. This ensures better usability on touch devices.

2. **Touch-Optimized Interactions**: Handle dragging is optimized for touch input with proper touch event handling.

3. **Responsive Sizing**: The slider automatically adjusts its layout for smaller viewports.

### Mobile Best Practices

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  layout={{
    width: 'fill', // Use 'fill' to adapt to parent container
    height: 100,   // Ensure sufficient height for touch targets
  }}
  behavior={{
    scrollable: true, // Enable scrolling for better mobile UX
  }}
  // Labels will be persistent on mobile automatically
/>
```

### Testing on Mobile

The component detects small screens automatically. On desktop, you can simulate mobile behavior by resizing your browser window to a mobile viewport size.

## 📄 License

MIT

---

**Made with ❤️ by Leslie Duan**
