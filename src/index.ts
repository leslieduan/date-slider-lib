// Import Tailwind CSS
import './index.css';

// Export components
export { DateSlider } from './components';

// Export utility functions
export { scaleDateFormatFn as dateFormatFn } from './utils';

// Export types - Public API only
export type {
  // Main component types
  SliderProps,
  SelectionResult,
  SliderExposedMethod,

  // Value types (for type guards and discrimination)
  PointValue,
  RangeValue,
  CombinedValue,

  // Configuration types
  DateSliderClassNames,
  LayoutConfig,
  BehaviorConfig,
  RenderPropsConfig,
  IconsConfig,

  // Render prop parameter types (for custom renderers)
  HandleRenderProps,
  DateLabelRenderProps,
  SelectionPanelRenderProps,
  TimeUnitSelectionRenderProps,

  // Utility types
  TimeUnit,
  DateFormat,
} from './type';
