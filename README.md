# DateSlider

A powerful, fully customizable React date slider component with range, point, and combined selection modes.

[![npm version](https://img.shields.io/npm/v/date-slider-lib.svg)](https://www.npmjs.com/package/date-slider-lib)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat&logo=storybook&logoColor=white)](https://leslieduan.github.io/date-slider-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 [View Live Demo & Documentation](https://leslieduan.github.io/date-slider-lib)

## Features

- **3 Selection Modes**: Point, Range, and Combined
- **4 Time Units**: Hour, Day, Month, and Year granularity
- **Fully Customizable**: Style with Tailwind CSS classes and custom scale type resolvers
- **TypeScript**: Complete type safety
- **Accessible**: WCAG compliant with keyboard navigation
- **Mobile-Optimized**: Auto-adapts with persistent labels on mobile
- **Optional UI Components**: Time display, unit selector, and date labels with defaults
- **Default Icons**: Built-in icons, customization optional
- **High Performance**: Automatic virtualization for large date ranges

## Performance

DateSlider automatically optimizes rendering for large date ranges using **virtualization**. Only visible elements are rendered in the DOM, dramatically improving performance with no configuration required.

**Performance Example**: A 10-year date range with daily granularity:
- **Without virtualization**: ~7,300 DOM elements
- **With virtualization**: ~200 DOM elements (97% reduction)

**How it works**:
- Virtualization activates automatically when `scrollable={true}` and the track width exceeds the viewport
- Only scale marks and time labels in the visible area (plus a buffer zone) are rendered
- As you scroll, elements smoothly appear and disappear
- Completely transparent to users - no API changes or configuration needed

**Example of a large date range**:
```tsx
<DateSlider
  mode="range"
  value={{
    start: new Date('2020-01-01'),
    end: new Date('2022-12-31'),
  }}
  min={new Date('2015-01-01')}
  max={new Date('2025-12-31')}  // 10-year range
  initialTimeUnit="day"
  behavior={{ scrollable: true }}  // Virtualization activates automatically
/>
```

**Note**: Non-scrollable sliders and small date ranges that fit in the viewport render all elements normally. Virtualization only activates when needed for performance.

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

Customize date formats using standard [dayjs format tokens](https://day.js.org/docs/en/display/format). Specify formats separately for scale marks and handle labels:

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date() }}
  dateFormat={{
    scale: (date) => {
      const day = date.getUTCDate();
      if (day === 1) return 'MMM';      // "Jun" on first day
      return 'DD';                       // "15" on other days
    },
    label: (date) => 'DD-MMM-YYYY',      // "15-Jun-2024"
  }}
/>
```

**Common format tokens**: `YYYY`, `MM`, `DD`, `MMM`, `MMMM`, `HH`, `mm`, `ddd`, `dddd`

**Full token list**: [dayjs format documentation](https://day.js.org/docs/en/display/format)

**Separator examples**:
```tsx
dateFormat={{
  scale: (date) => 'YYYY-MM-DD',   // "2024-06-15" (hyphens)
  label: (date) => 'DD/MM/YYYY'    // "15/06/2024" (slashes)
}}

dateFormat={{
  scale: (date) => 'MMM DD, YYYY', // "Jun 15, 2024" (comma + space)
  label: (date) => 'YYYY.MM.DD'    // "2024.06.15" (dots)
}}
```

You can specify `scale` only, `label` only, or both:

```tsx
// Same format for both scale and labels
dateFormat={{ scale: (date) => 'YYYY-MM-DD' }}

// Different formats
dateFormat={{
  scale: (date) => 'DD',
  label: (date) => 'DD-MMM-YYYY'
}}
```

### Locale Support

Format dates in different languages using dayjs locales. Import the locale you need and pass the locale code:

```tsx
import 'dayjs/locale/fr';  // French
import 'dayjs/locale/de';  // German
import 'dayjs/locale/ja';  // Japanese
import 'dayjs/locale/es';  // Spanish

<DateSlider
  mode="point"
  value={{ point: new Date() }}
  locale="fr"  // French locale
  dateFormat={{
    scale: (date) => 'DD MMM',
    label: (date) => 'dddd, DD MMMM YYYY'  // "lundi, 15 juin 2024"
  }}
/>
```

**Available locales**: [dayjs locale list](https://github.com/iamkun/dayjs/tree/dev/src/locale)

**Note**: Import locales at your app's entry point or before using the component. The default locale is `'en'` (English).

### Time Units

DateSlider supports four time unit granularities for different use cases:

#### Hour
Perfect for detailed timeline views, event scheduling, or time tracking applications:

```tsx
<DateSlider
  mode="point"
  value={{ point: new Date('2024-12-07T12:00:00Z') }}
  min={new Date('2024-12-07T00:00:00Z')}
  max={new Date('2024-12-08T23:59:59Z')}
  initialTimeUnit="hour"
  dateFormat={{
    scale: (date) => {
      const hour = date.getUTCHours();
      if (hour === 0) return 'DD HH:mm';  // Midnight: show date
      return 'HH:mm';                      // Other hours: show time
    },
    label: () => 'DD MMM YYYY HH:mm'
  }}
/>
```

#### Day
Standard daily granularity for most date selection use cases:

```tsx
<DateSlider
  mode="range"
  initialTimeUnit="day"
  // ... other props
/>
```

#### Month
Monthly granularity for longer-term planning:

```tsx
<DateSlider
  mode="range"
  initialTimeUnit="month"
  // ... other props
/>
```

#### Year
Yearly granularity for historical or long-term date ranges:

```tsx
<DateSlider
  mode="range"
  initialTimeUnit="year"
  // ... other props
/>
```

### Custom Scale Type Resolver

Control the visual hierarchy of scale marks (short/medium/long) with a custom resolver function. This allows you to customize which dates get emphasized with different tick mark heights.

**Default behavior** (when no custom resolver provided):
- **Hour**: long=year start, medium=month start, short=each hour
- **Day**: long=month start, medium=Monday, short=each day
- **Month**: long=year start, medium=quarter start, short=each month
- **Year**: long=decade start, medium=5-year mark, short=each year

**Partial resolver example** - Only customize hour timeUnit, use defaults for others:

```tsx
<DateSlider
  mode="point"
  initialTimeUnit="hour"
  scaleTypeResolver={(date, timeUnit) => {
    // Only handle hour timeUnit
    if (timeUnit === 'hour') {
      const hour = date.getUTCHours();
      if (hour % 6 === 0) return 'long';    // Every 6 hours
      if (hour % 3 === 0) return 'medium';  // Every 3 hours
      return 'short';                        // Other hours
    }
    // Return undefined to use default logic for day/month/year
    return undefined;
  }}
/>
```

**The resolver function:**
- **Receives**: `(date: Date, timeUnit: TimeUnit)`
- **Returns**: `'long' | 'medium' | 'short' | undefined`
  - `'long'`: Tallest tick marks (major divisions)
  - `'medium'`: Medium tick marks (intermediate divisions)
  - `'short'`: Shortest tick marks (minor divisions)
  - `undefined`: Fall back to default logic for this timeUnit

**Tip**: Return `undefined` for timeUnits you don't want to customize. This allows partial customization while using sensible defaults for the rest!

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
| `initialTimeUnit` | `'hour' \| 'day' \| 'month' \| 'year'` | No | Initial time unit |
| `scaleTypeResolver` | `function` | No | Custom function to determine scale types |
| `icons` | `object` | No | Custom icons (optional, defaults provided) |
| `classNames` | `object` | No | Tailwind classes for styling |
| `behavior` | `object` | No | Interaction behavior options |
| `layout` | `object` | No | Size and layout configuration |
| `renderProps` | `object` | No | Custom render functions (optional) |
| `dateFormat` | `object` | No | Custom date format for scale and labels `{ scale?, label? }` |
| `locale` | `string` | No | Date locale for formatting (default: 'en') |
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


## License

MIT

---

**Made with ❤️ by Leslie Duan**
