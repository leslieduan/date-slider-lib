# DateSlider

A powerful, fully customizable React date slider component with range, point, and combined selection modes.

[![npm version](https://img.shields.io/npm/v/date-slider-lib.svg)](https://www.npmjs.com/package/date-slider-lib)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat&logo=storybook&logoColor=white)](https://leslieduan.github.io/date-slider-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 [View Live Demo & Documentation](https://leslieduan.github.io/date-slider-lib)

## Features

- **3 Selection Modes**: Point, Range, and Combined
- **Fully Customizable**: Style with Tailwind CSS classes
- **TypeScript**: Complete type safety
- **Accessible**: WCAG compliant with keyboard navigation
- **Mobile-Optimized**: Auto-adapts with persistent labels on mobile
- **Optional UI Components**: Time display, unit selector, and date labels with defaults
- **Default Icons**: Built-in icons, customization optional

## Installation

```bash
npm install date-slider-lib
```

### Setup

**1. Import CSS** (required):

```tsx
import 'date-slider-lib/style.css';
```

**2. Configure Tailwind** (if using):

```js
// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/date-slider-lib/dist/**/*.{js,mjs,cjs}",
  ],
}
```

## Quick Start

```tsx
import { DateSlider } from 'date-slider-lib';

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
    />
  );
}
```

## Modes

### Point Mode

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-06-15') }}
  onChange={setValue}
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  initialTimeUnit="day"
/>
```

### Range Mode

```tsx
<DateSlider
  mode="range"
  value={{
    start: new Date('2024-03-01'),
    end: new Date('2024-09-01')
  }}
  onChange={setValue}
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  initialTimeUnit="month"
/>
```

### Combined Mode

```tsx
<DateSlider
  mode="combined"
  value={{
    point: new Date('2024-06-15'),
    start: new Date('2024-03-01'),
    end: new Date('2024-09-01')
  }}
  onChange={setValue}
  min={new Date('2024-01-01')}
  max={new Date('2024-12-31')}
  initialTimeUnit="month"
/>
```

## Customization

### Styling

```tsx
<DateSlider
  mode="range"
  value={{ start: new Date('2024-03-01'), end: new Date('2024-09-01') }}
  classNames={{
    trackActive: 'bg-blue-500/30',
    track: 'bg-gray-300',
    handle: 'bg-blue-600 border-2 border-white shadow-lg',
    scaleMarkMajor: 'bg-gray-600',
    scaleLabel: 'text-gray-700',
  }}
/>
```

### Custom Icons (Optional)

Icons are optional. Defaults are provided.

```tsx
import { MyIcon } from './icons';

<DateSlider
  mode="point"
  value={{ point: new Date() }}
  icons={{ point: <MyIcon /> }}
/>

<DateSlider
  mode="range"
  value={{ start: new Date(), end: new Date() }}
  icons={{ range: <MyRangeIcon /> }}
/>

<DateSlider
  mode="combined"
  value={{ point: new Date(), start: new Date(), end: new Date() }}
  icons={{
    point: <MyPointIcon />,
    range: <MyRangeIcon />
  }}
/>
```

### UI Components

Enable optional UI components. Default renderers are provided.

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date() }}
  layout={{
    dateLabelEnabled: true,           // Show date labels on handles
    selectionPanelEnabled: true,          // Show time display with navigation
    timeUnitSelectionEnabled: true,    // Show day/month/year selector
  }}
  // No renderProps needed - defaults are provided!
/>
```

**Customize renderers** (optional):

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date() }}
  layout={{
    dateLabelEnabled: true,
    selectionPanelEnabled: true,
  }}
  renderProps={{
    renderDateLabel: ({ label }) => <span className="...">{label}</span>,
    renderSelectionPanel: ({ dateLabel, toNextDate, toPrevDate }) => (
      <div>
        <button onClick={toPrevDate}>←</button>
        <span>{dateLabel}</span>
        <button onClick={toNextDate}>→</button>
      </div>
    ),
  }}
/>
```

### Date Formatting

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date() }}
  dateFormat={(date) => {
    const day = date.getUTCDate();
    if (day === 1) return 'MMM';  // "Jun"
    return 'dd';                   // "15"
  }}
/>
```

**Format tokens**: `yyyy`, `mm`, `dd`, `MMM`, `MMMM`, `hh`, `MM`

### Label Behavior

```tsx
<DateSlider
  mode="combined"
  value={{ point: new Date(), start: new Date(), end: new Date() }}
  behavior={{
    handleLabelPersistent: true,           // All handles: always visible
    pointHandleLabelPersistent: true,      // Point only: always visible
    rangeHandleLabelPersistent: false,     // Range only: hover to show
    trackHoverDateLabelDisabled: false,    // Enable/disable track hover label
    trackHoverCursorLineDisabled: false,   // Enable/disable cursor line
  }}
/>
```

**Note**: On mobile, labels are automatically persistent for better usability.

### Layout & Behavior

```tsx
<DateSlider
  mode="range"
  value={{ start: new Date(), end: new Date() }}
  layout={{
    width: 800,                     // or 'fill'
    height: 100,
    trackPaddingX: 40,
    showEndLabel: true,
    minGapScaleUnits: 50,
    dateLabelDistanceOverHandle: 35,
    scaleUnitConfig: {
      gap: 100,
      width: { short: 1, medium: 2, long: 2 },
      height: { short: 18, medium: 36, long: 60 },
    },
  }}
  behavior={{
    scrollable: true,
    freeSelectionOnTrackClick: false,
    sliderAutoScrollToPointHandleVisibleEnabled: true,
  }}
/>
```

### Imperative API

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
        value={{ point: new Date() }}
        imperativeRef={sliderRef}
      />
      <button onClick={setToToday}>Set to Today</button>
      <button onClick={focusHandle}>Focus Handle</button>
    </>
  );
}
```

## API Reference

### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `'point' \| 'range' \| 'combined'` | Yes | Selection mode |
| `value` | `PointValue \| RangeValue \| CombinedValue` | Yes | Current selection (UTC dates) |
| `onChange` | `(value) => void` | Yes | Selection change callback |
| `min` | `Date` | No | Minimum date (UTC) |
| `max` | `Date` | No | Maximum date (UTC) |
| `initialTimeUnit` | `'day' \| 'month' \| 'year'` | No | Initial time unit |
| `icons` | `object` | No | Custom icons (optional, defaults provided) |
| `classNames` | `object` | No | Tailwind classes for styling |
| `behavior` | `object` | No | Interaction behavior options |
| `layout` | `object` | No | Size and layout configuration |
| `renderProps` | `object` | No | Custom render functions (optional) |
| `dateFormat` | `function` | No | Custom date format function |
| `locale` | `string` | No | Date locale (default: 'en-AU') |
| `imperativeRef` | `Ref` | No | Imperative API reference |

### Value Types

```typescript
type PointValue = { point: Date };
type RangeValue = { start: Date; end: Date };
type CombinedValue = { point: Date; start: Date; end: Date };
```

### BehaviorConfig

```typescript
{
  scrollable?: boolean;
  freeSelectionOnTrackClick?: boolean;
  sliderAutoScrollToPointHandleVisibleEnabled?: boolean;

  handleLabelPersistent?: boolean;
  handleLabelDisabled?: boolean;
  pointHandleLabelPersistent?: boolean;
  pointHandleLabelDisabled?: boolean;
  rangeHandleLabelPersistent?: boolean;
  rangeHandleLabelDisabled?: boolean;

  trackHoverDateLabelDisabled?: boolean;
  trackHoverCursorLineDisabled?: boolean;
}
```

### LayoutConfig

```typescript
{
  width: 'fill' | number;
  height?: number;
  trackPaddingX?: number;
  showEndLabel?: boolean;
  minGapScaleUnits?: number;
  scaleUnitConfig?: object;
  dateLabelDistanceOverHandle?: number;

  // Component toggles (default: false)
  selectionPanelEnabled?: boolean;
  timeUnitSelectionEnabled?: boolean;
  dateLabelEnabled?: boolean;
}
```

## Mobile Behavior

On small screens:
- Handle labels become persistent (always visible)
- Touch-optimized interactions
- Responsive sizing

Test mobile behavior by resizing your browser to mobile viewport.

## Accessibility

- ✅ Keyboard navigation (Arrow keys, Home, End, Page Up/Down)
- ✅ ARIA labels for screen readers
- ✅ Visible focus indicators
- ✅ Touch support

## TypeScript Support

```tsx
import {
  DateSlider,
  dateFormatFn,
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
  DateFormat,
  TimeUnit,
} from 'date-slider-lib';
```

## License

MIT

---

**Made with ❤️ by Leslie Duan**
