# DateSlider

A powerful, fully customizable React date slider component with range, point, and combined selection modes. Built with TypeScript, styled with Tailwind CSS.

[![npm version](https://img.shields.io/npm/v/date-slider-lib.svg)](https://www.npmjs.com/package/date-slider-lib)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat&logo=storybook&logoColor=white)](https://leslieduan.github.io/date-slider-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 [View Live Demo & Documentation](https://leslieduan.github.io/date-slider-lib)

## ✨ Features

- **3 Selection Modes**: Point, Range, and Combined selection
- **Fully Customizable**: Every element can be styled with Tailwind CSS
- **Type-Safe**: Complete TypeScript support with discriminated unions
- **Accessible**: WCAG compliant, keyboard navigation, ARIA labels
- **Responsive**: Works seamlessly on mobile and desktop
- **Flexible Time Units**: Day, month, and year navigation
- **Custom Rendering**: Render props for complete UI customization
- **UTC Architecture**: All dates are UTC Date objects for consistency
- **Scrollable**: Support for large date ranges with horizontal scrolling
- **Imperative API**: Programmatically control the slider
- **Label Control**: Persistent, disabled, or hover-only handle labels

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

**1. Import the CSS** (required for styling):

```tsx
// In your main file (e.g., App.tsx or main.tsx)
import 'date-slider-lib/style.css';
```

**2. Configure Tailwind CSS** (if using Tailwind in your project):

```js
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/date-slider-lib/dist/**/*.{js,mjs,cjs}", // Add this line
  ],
  // ...
}
```

### Basic Usage

```tsx
import { DateSlider } from 'date-slider-lib';
import type { SelectionResult } from 'date-slider-lib';
import { Circle } from '@/icons';
import { useState } from 'react';

function App() {
  const [selection, setSelection] = useState<SelectionResult>({
    point: new Date('2024-06-15')
  });

  return (
    <DateSlider
      mode="point"
      value={selection}
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

DateSlider supports three selection modes:

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


### Custom Render Props

For complete UI control, use render props:

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  renderProps={{
    renderDateLabel: ({ label }) => (
      <span className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded shadow-md">
        {label}
      </span>
    ),
    renderTimeDisplay: ({ dateLabel, toNextDate, toPrevDate }) => (
      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
        <button onClick={toPrevDate}>←</button>
        <span>{dateLabel}</span>
        <button onClick={toNextDate}>→</button>
      </div>
    ),
  }}
/>
```

### Custom Date Formatting

Control how dates are formatted on scale labels and handles using the `dateFormat` prop and `formatDate` utility.

#### Default Format

The library uses `dateFormatFn` by default for natural readability:
- Regular days → "15"
- First of month → "Jun"
- First of year → "2024"

#### Creating Custom Formats

Create your own format function using the `DateFormat` type:

```tsx
import { DateSlider, dateFormatFn } from 'date-slider-lib';
import type { DateFormat } from 'date-slider-lib';

// Example: Custom format that shows full date on Mondays
const mondayFormat: DateFormat = (date) => {
  const isMonday = date.getUTCDay() === 1;
  return isMonday ? 'dd-MMM-yyyy' : 'dd';
};

<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  dateFormat={mondayFormat}  // Use custom format
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

## 📐 Layout & Width Behavior

### Width Modes

**Fill Parent Container** (default):
```tsx
<DateSlider
  layout={{ width: 'fill' }}  // Fills parent width
  // ...
/>
```

**Fixed Width**:
```tsx
<DateSlider
  layout={{ width: 800 }}  // Fixed 800px width
  // ...
/>
```

### Scrollable Layout

Enable horizontal scrolling for large date ranges:

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2022-06-15') }}
  min={new Date('2020-01-01')}
  max={new Date('2024-12-31')}
  initialTimeUnit="day"
  behavior={{
    scrollable: true, // Enable horizontal scrolling
  }}
  layout={{
    width: 600,
    height: 80,
    scaleUnitConfig: {
      gap: 100,
      width: { short: 1, medium: 2, long: 2 },
      height: { short: 18, medium: 36, long: 60 },
    },
  }}
/>
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
| `initialTimeUnit` | `'day' \| 'month' \| 'year'` | No | Initial time unit |

### Configuration Props

| Prop | Type | Description |
|------|------|-------------|
| `classNames` | `DateSliderClassNames` | Tailwind classes for all elements |
| `icons` | `IconsConfig` | Custom icons for handles |
| `behavior` | `BehaviorConfig` | Interaction behavior settings |
| `layout` | `LayoutConfig` | Size and layout configuration |
| `renderProps` | `RenderPropsConfig` | Custom render functions |
| `imperativeRef` | `React.Ref<SliderExposedMethod>` | Imperative API reference |

### DateSliderClassNames

All className props accept Tailwind CSS utilities:

```typescript
type DateSliderClassNames = {
  // Containers
  wrapper?: string;           // Main container
  slider?: string;            // Slider container

  // Track
  track?: string;             // Track base element
  trackInner?: string;        // Track inner wrapper
  trackActive?: string;       // Active track portion
  trackInactive?: string;     // Inactive track portion

  // Handles
  handle?: string;            // Base handle styles
  handlePoint?: string;       // Point handle
  handleStart?: string;       // Range start handle
  handleEnd?: string;         // Range end handle
  handleDragging?: string;    // Dragging state
  handleIcon?: string;        // Handle icon wrapper

  // Visual elements
  cursorLine?: string;        // Hover cursor line
  scaleMark?: string;         // Scale tick marks
  scaleMarkMajor?: string;    // Major tick marks
  scaleMarkMedium?: string;   // Medium tick marks
  scaleMarkMinor?: string;    // Minor tick marks
  scaleLabel?: string;        // Scale labels
};
```

### BehaviorConfig

```typescript
type BehaviorConfig = {
  scrollable?: boolean;                 // Enable horizontal scrolling (default: true)
  freeSelectionOnTrackClick?: boolean;  // Free selection vs snap to units
  handleLabelPersistent?: boolean;      // Keep labels always visible
  handleLabelDisabled?: boolean;        // Completely hide handle labels
};
```

### LayoutConfig

```typescript
type LayoutConfig = {
  width?: 'fill' | number;        // Slider width (px or fill parent)
  height?: number;                // Slider height in pixels
  trackPaddingX?: number;         // Horizontal track padding
  showEndLabel?: boolean;         // Show end date label
  minGapScaleUnits?: number;      // Minimum gap between handles
  scaleUnitConfig?: {             // Custom scale configuration
    gap: number;
    width: { short: number; medium: number; long: number };
    height: { short: number; medium: number; long: number };
  };
};
```

### RenderPropsConfig

```typescript
type RenderPropsConfig = {
  renderDateLabel?: (props: DateLabelRenderProps) => ReactNode;
  renderTimeDisplay?: (props: TimeDisplayRenderProps) => ReactNode;
  renderTimeUnitSelection?: (props: TimeUnitSelectionRenderProps) => ReactNode;
};
```

### Imperative API

Control the slider programmatically:

```tsx
const sliderRef = useRef<SliderExposedMethod>(null);

// Set date programmatically
sliderRef.current?.setDateTime(new Date('2024-06-15'), 'point');

// Focus a handle
sliderRef.current?.focusHandle('point');

<DateSlider imperativeRef={sliderRef} />
```

## 📦 TypeScript Support

DateSlider is written in TypeScript and exports all necessary types and utilities:

```tsx
// Import components and utilities
import {
  DateSlider,
  dateFormatFn,          // Built-in date format (default)
  formatDate,            // Format utility function
} from 'date-slider-lib';

// Import types
import type {
  // Main component types
  SliderProps,           // Main props type
  SelectionResult,       // onChange return type
  SliderExposedMethod,   // Imperative API type

  // Value types (for type guards)
  PointValue,            // { point: Date }
  RangeValue,            // { start: Date; end: Date }
  CombinedValue,         // { point: Date; start: Date; end: Date }

  // Configuration types
  DateSliderClassNames,  // For classNames prop
  LayoutConfig,          // For layout prop
  BehaviorConfig,        // For behavior prop
  RenderPropsConfig,     // For renderProps prop
  IconsConfig,           // For icons prop

  // Render prop parameter types
  DateLabelRenderProps,
  TimeDisplayRenderProps,
  TimeUnitSelectionRenderProps,

  // Utility types
  TimeUnit,              // 'day' | 'month' | 'year'
  DateGranularity,       // 'day' | 'hour' | 'minute'
  DateFormat,            // Date format function type
} from 'date-slider-lib';
```

## 🏗️ Architecture

### UTC-First Design

DateSlider follows a **"UTC Everywhere, Display Locally"** architecture:

```
┌─────────────────────────────────────────────────────────┐
│  CONSUMER LAYER (Your Code)                             │
│  - All dates are UTC Date objects                       │
│  - Use new Date() with ISO strings                      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│  DATESLIDER (UTC Dates Only)                            │
│  - All Date props must be UTC Date objects              │
│  - All calculations use UTC methods                     │
│  - Single source of truth                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│  DISPLAY LAYER (User Interface)                         │
│  - Formats dates for visual display                     │
│  - Shows dates in UTC (configurable locale)             │
└─────────────────────────────────────────────────────────┘
```

**Why UTC?**

1. **Unambiguous**: No DST or timezone confusion
2. **Consistent**: Same timestamp for all users globally
3. **Scalable**: Works for days, hours, minutes

## 💡 Best Practices

### Store Dates as UTC

```tsx
// ✅ CORRECT - Use UTC Date objects
<DateSlider
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  value={{ point: new Date('2024-06-15') }}
/>

// ❌ WRONG - Don't use date strings directly
<DateSlider
  min="2024-01-01"  // TypeScript error
/>
```

### Type Your Callbacks

```tsx
const handleChange = useCallback((selection: SelectionResult) => {
  if ('point' in selection) {
    // TypeScript knows this is PointSelection
    const date = selection.point;
    console.log(date.toISOString());
  }
}, []);
```

### Use Memoization for Performance

```tsx
const minDate = useMemo(() => new Date('2024-01-01'), []);
const maxDate = useMemo(() => new Date('2024-12-31'), []);

<DateSlider min={minDate} max={maxDate} />
```

## 🔧 Troubleshooting

### Dates are off by one day

**Cause:** Not using UTC Date objects properly

**Solution:** Ensure all dates are valid UTC Date objects:
```tsx
// ✅ CORRECT
const date = new Date('2024-01-15T00:00:00Z');  // Explicit UTC

// ❌ WRONG
const date = new Date('2024-01-15');  // May use local timezone
```

### Handle not focusing programmatically

**Cause:** Using imperativeRef incorrectly

**Solution:**
```tsx
const sliderRef = useRef<SliderExposedMethod>(null);

// ✅ CORRECT
sliderRef.current?.focusHandle('point');

<DateSlider imperativeRef={sliderRef} />
```

## ♿ Accessibility

DateSlider is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support (Arrow keys, Home, End, Page Up/Down)
- **ARIA Labels**: Proper ARIA labels for screen readers
- **Focus Management**: Visible focus indicators
- **WCAG Compliant**: Color contrast ratios meet WCAG AAA standards
- **Touch Support**: Works seamlessly on touch devices

## 🛠️ Development

### Install Dependencies

```bash
pnpm install
```

### Run Storybook

```bash
pnpm storybook
```

This will start Storybook at http://localhost:6006

### Build Library

```bash
pnpm build
```

This will:
1. Generate TypeScript declarations
2. Bundle the library with Vite (ESM and CJS formats)
3. Output to the `dist` directory

### Quality Scripts

```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix ESLint issues
pnpm format       # Format code with Prettier
pnpm type-check   # TypeScript type checking
pnpm validate     # Run all checks
```

## 📂 Project Structure

```
src/
├── components/                      # DateSlider components
│   ├── DateSlider.tsx              # Main component
│   ├── DateSlider.stories.tsx      # Storybook stories (15 variants)
│   ├── SliderTrack.tsx             # Track with scales (refactored)
│   ├── SliderHandle.tsx            # Draggable handles
│   ├── DateLabel.tsx               # Floating date labels
│   ├── TimeDisplay.tsx             # Date navigation display
│   ├── TimeUnitSelection.tsx       # Time unit selector
│   ├── ScalesUnitLabels.tsx        # Scale unit labels
│   └── index.ts
├── hooks/                          # Custom React hooks
│   ├── useDateLabelPersist.ts      # Label persistence logic
│   ├── useDragState.ts             # Drag state management
│   ├── useEventHandlers.ts         # Event handlers
│   ├── useFocusManagement.ts       # Focus management
│   ├── usePositionState.ts         # Position calculations
│   ├── useDrag.ts                  # Generic drag hook
│   ├── useElementSize.ts           # Element size observer
│   ├── useResizeObserver.ts        # Resize observer
│   ├── useViewPortSize.ts          # Viewport size tracking
│   ├── useHandleVisible.ts         # Handle visibility logic
│   ├── useInitialAutoScrollPosition.ts  # Auto-scroll positioning
│   └── useRAFDFn.ts                # RAF debouncing
├── utils/                          # Utility functions
│   ├── dateSliderUtils.ts          # Date calculations
│   ├── cn.ts                       # Tailwind class merger
│   ├── clamp.ts                    # Number clamping
│   ├── clampToLowerBound.ts        # Lower bound clamping
│   ├── debounce.ts                 # Debounce utility
│   ├── checkDateDuration.ts        # Date duration checks
│   └── snapToClosestStep.ts        # Snapping logic
├── type.ts                         # TypeScript types
├── constants.ts                    # Constants
├── index.css                       # Global styles
└── index.ts                        # Library entry point
```


## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Development workflow
- Commit message conventions
- Pull request process
- Code quality standards


## 📄 License

MIT

---

**Made with ❤️ by Leslie Duan**
