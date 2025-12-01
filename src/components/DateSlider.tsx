import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useDrag,
  useElementSize,
  useEventHandlers,
  useFocusManagement,
  useHandleDragState,
  useInitialAutoScrollPosition,
  usePositionState,
  useRAFDFn,
  useResizeObserver,
} from '@/hooks';
import {
  checkDateDuration,
  clamp,
  clampPercent,
  cn,
  createSelectionResult,
  debounce,
  generateScalesWithInfo,
  generateTimeLabelsWithPositions,
  generateTrackWidth,
  getPercentFromDate,
  getTotalScales,
} from '@/utils';
import {
  LAYOUT,
  DEFAULTS,
  DEFAULT_SCALE_CONFIG,
  PERCENTAGE,
  TIMING,
  ACCESSIBILITY,
} from '@/constants';
import type { SliderProps, TimeUnit, DragHandle, SelectionResult } from '@/type';
import { RenderSliderHandle } from './SliderHandle';
import { SliderTrack } from './SliderTrack';
import { TimeDisplay } from './TimeDisplay';
import { TimeUnitLabels } from './TimeUnitLabels';
import { TimeUnitSelection } from './TimeUnitSelection';

export const DateSlider = memo(
  ({
    // Core props
    mode: viewMode,
    value,
    min: propStartDate,
    max: propEndDate,
    initialTimeUnit,
    onChange,
    renderProps,
    // Grouped configs
    classNames,
    icons,
    behavior,
    layout,
    // Advanced
    granularity = 'day',
    imperativeRef: imperativeHandleRef,
  }: SliderProps) => {
    // Extract icon config with defaults - safely handle discriminated union
    const pointHandleIcon = icons && 'point' in icons ? icons.point : undefined;
    const rangeHandleIcon =
      icons && ('rangeStart' in icons || 'rangeEnd' in icons)
        ? (icons.rangeStart ?? icons.rangeEnd)
        : undefined;

    // Extract behavior config with defaults
    const scrollable = behavior?.scrollable ?? true;
    const freeSelectionOnTrackClick = behavior?.freeSelectionOnTrackClick ?? false;
    const handleLabelPersistent = behavior?.handleLabelPersistent ?? false;
    const handleLabelDisabled = behavior?.handleLabelDisabled ?? false;

    // Extract layout config with defaults
    const sliderWidth = layout?.width;
    const sliderHeight = layout?.height;
    const trackPaddingX = layout?.trackPaddingX ?? LAYOUT.TRACK_PADDING_X;
    // if not scrollable, track is fixed with, which is 100% of slider container width.
    const isTrackFixedWidth = !scrollable;
    const withEndLabel = layout?.showEndLabel ?? true;
    const minGapScaleUnits = layout?.minGapScaleUnits ?? DEFAULTS.MIN_GAP_SCALE_UNITS;
    const scaleUnitConfig = layout?.scaleUnitConfig ?? DEFAULT_SCALE_CONFIG;
    const [dimensions, setDimensions] = useState({ parent: 0, slider: 0 });
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(initialTimeUnit);

    /**
     * All prop dates are expected to be UTC Date objects
     * No conversion needed - consumers use toUTCDate()  helpers
     */
    const startDate = propStartDate;
    const endDate = propEndDate;

    // Extract initial values from the unified value prop (or use defaults based on mode)
    const propInitialPoint =
      value && 'point' in value ? value.point : viewMode === 'point' ? startDate : undefined;
    const propInitialRange =
      value && 'start' in value && 'end' in value
        ? { start: value.start, end: value.end }
        : viewMode === 'range' || viewMode === 'combined'
          ? { start: startDate, end: endDate }
          : undefined;

    const initialPoint = propInitialPoint;
    const initialRange = propInitialRange;

    const totalScaleUnits = useMemo(
      () => getTotalScales(startDate, endDate, timeUnit),
      [startDate, endDate, timeUnit]
    );

    const minGapPercent = useMemo(
      () => (1 / totalScaleUnits) * 100 * minGapScaleUnits,
      [minGapScaleUnits, totalScaleUnits]
    );

    const {
      rangeStart,
      rangeEnd,
      pointPosition,
      setRangeStart,
      setRangeEnd,
      setPointPosition,
      rangeStartRef,
      rangeEndRef,
      pointPositionRef,
    } = usePositionState(initialRange, initialPoint, startDate, timeUnit, totalScaleUnits);

    const {
      requestHandleFocus,
      handleHandleFocus,
      setLastInteractionType,
      startHandleRef,
      endHandleRef,
      pointHandleRef,
    } = useFocusManagement();

    const {
      isHandleDragging,
      handleDragStarted,
      setIsHandleDragging,
      setHandleDragStarted,
      handleDragComplete,
    } = useHandleDragState();

    const {
      ref: sliderContainerRef,
      size: { width: sliderContainerWidth },
    } = useElementSize<HTMLDivElement>();

    const sliderRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const { scales, numberOfScales } = useMemo(
      () => generateScalesWithInfo(startDate, endDate, timeUnit, totalScaleUnits),
      [endDate, startDate, timeUnit, totalScaleUnits]
    );

    const trackWidth = useMemo(() => {
      const safeGap =
        (sliderContainerWidth -
          (numberOfScales.long * scaleUnitConfig.width.long +
            numberOfScales.medium * scaleUnitConfig.width.medium +
            numberOfScales.short * scaleUnitConfig.width.short)) /
        totalScaleUnits;
      const safeScaleUnitConfig = {
        ...scaleUnitConfig,
        gap: Math.max(safeGap, scaleUnitConfig.gap ?? 0),
      };
      return generateTrackWidth(totalScaleUnits, numberOfScales, safeScaleUnitConfig);
    }, [numberOfScales, scaleUnitConfig, sliderContainerWidth, totalScaleUnits]);

    //TODO: could refactor this to always generate full labels regardless of time unit. But later,
    // in formatForDisplay to decide what to display and how display format.
    //day unit, generate all labels per day. month unit, generate per month. year unit, per year.
    const timeLabels = useMemo(
      () => generateTimeLabelsWithPositions(startDate, endDate, timeUnit),
      [startDate, endDate, timeUnit]
    );

    const updateDimensions = useCallback(() => {
      if (sliderContainerRef?.current && sliderRef.current) {
        const parentWidth = sliderContainerRef.current.getBoundingClientRect().width;
        const trackWidth = sliderRef.current.getBoundingClientRect().width;
        setDimensions({ parent: parentWidth, slider: trackWidth });
      }
    }, [sliderContainerRef]);

    const scheduleUpdateDimensions = useRAFDFn(updateDimensions);

    useResizeObserver(sliderRef || { current: null }, scheduleUpdateDimensions);

    const dragBounds = useMemo(
      () => ({
        left: Math.min(0, dimensions.parent - dimensions.slider),
        right: 0,
      }),
      [dimensions.parent, dimensions.slider]
    );

    const autoScrollToVisibleAreaEnabled = useRef(false);

    const {
      position: sliderPosition,
      dragHandlers,
      isDragging: isSliderDragging,
      resetPosition,
    } = useDrag({
      targetRef: scrollable ? sliderRef : undefined,
      initialPosition: { x: 0, y: 0 },
      constrainToAxis: 'x',
      bounds: dragBounds,
      //inform slider is being dragged to prevent handle interactions
      onDragEnd: handleDragComplete,
      onDragStarted: () => {
        setHandleDragStarted(true);
        autoScrollToVisibleAreaEnabled.current = false;
      },
    });

    //TODO: 1. when scroll handle outside of view, then click on left/right button, it should scroll to make handle fully visible.
    //TODO: 2. currently, the auto scroll only works when left/right button clicked. keyboard arrow navigation does not trigger auto scroll. Should fix this.
    //TODO: 3. date label and time unit lablel format should be customizable.
    //TODO: 4. update docs, there are two readme files now.
    //TODO: 5. add more tests.
    //TODO: 6. improve performance, avoid too many re-renders when dragging.
    //TODO: 7. remove Button component and its dependencies if not used.
    //TODO: 8. refactor files structure under components/DateSlider for better clarity.
    //TODO: 9. add more comments and documentation in the code.

    // auto scroll slider to keep point handle in view when point date changes by moving point handle
    if (
      !isSliderDragging &&
      !isHandleDragging &&
      pointHandleRef.current &&
      sliderContainerRef.current &&
      autoScrollToVisibleAreaEnabled.current
    ) {
      const pointHandleRect = pointHandleRef.current.getBoundingClientRect();
      const containerRect = sliderContainerRef.current.getBoundingClientRect();

      const distanceFromRightEdge = containerRect.right - pointHandleRect.right;
      const distanceFromLeftEdge = pointHandleRect.left - containerRect.left;

      if (distanceFromRightEdge < 0) {
        const newX = sliderPosition.x - dimensions.parent / 2;
        const clampedX = Math.max(newX, dragBounds.left);
        resetPosition({ x: clampedX, y: 0 });
        autoScrollToVisibleAreaEnabled.current = false;
      } else if (distanceFromLeftEdge < 0) {
        const newX = sliderPosition.x + dimensions.parent / 2;
        const clampedX = Math.min(newX, dragBounds.right);
        resetPosition({ x: clampedX, y: 0 });
        autoScrollToVisibleAreaEnabled.current = false;
      }
    }

    useInitialAutoScrollPosition({
      scrollable,
      dimensions,
      viewMode,
      pointPosition,
      rangeStart,
      rangeEnd,
      resetPosition,
    });

    const handleTimeUnitChange = useCallback(
      (unit: TimeUnit) => {
        setTimeUnit(unit);
        resetPosition({ x: 0, y: 0 });
      },
      [resetPosition]
    );

    /**
     * Sets the date time for the specified target handle
     *
     * Accepts UTC Date objects only. Consumers should use toUTCDate()
     * to convert their data before passing to this function.
     *
     * @param date - UTC Date object
     * @param target - The target handle ('point', 'rangeStart', 'rangeEnd')
     */
    const setDateTime = useCallback(
      (date: Date, target?: DragHandle) => {
        // Date is expected to be UTC, no conversion needed
        const percentage = getPercentFromDate(date, startDate, endDate);

        let actualTarget = target;
        if (!actualTarget) {
          switch (viewMode) {
            case 'point':
              actualTarget = 'point';
              break;
            case 'range': {
              const distanceToStart = Math.abs(percentage - rangeStartRef.current);
              const distanceToEnd = Math.abs(percentage - rangeEndRef.current);
              actualTarget = distanceToStart < distanceToEnd ? 'start' : 'end';
              break;
            }
            case 'combined':
              actualTarget = 'point';
              break;
          }
        }
        const clampPercentage = clampPercent(percentage, PERCENTAGE.MAX);

        switch (actualTarget) {
          case 'start': {
            const newStart = clamp(clampPercentage, 0, rangeEndRef.current - minGapPercent);
            setRangeStart(newStart);
            break;
          }
          case 'end': {
            const newEnd = clamp(clampPercentage, 100, rangeStartRef.current + minGapPercent);
            setRangeEnd(newEnd);
            break;
          }
          case 'point': {
            setPointPosition(clampPercentage);
            break;
          }
        }
        autoScrollToVisibleAreaEnabled.current = true;
      },
      [
        startDate,
        endDate,
        viewMode,
        rangeStartRef,
        rangeEndRef,
        minGapPercent,
        setRangeStart,
        setRangeEnd,
        setPointPosition,
      ]
    );

    useImperativeHandle(
      imperativeHandleRef,
      () => ({
        setDateTime,
        focusHandle: (handleType: DragHandle) => requestHandleFocus(handleType, 'keyboard'),
      }),
      [setDateTime, requestHandleFocus]
    );

    const updateHandlePosition = useCallback(
      (handle: DragHandle, percentage: number) => {
        const clampedPercentage = clampPercent(percentage, PERCENTAGE.MAX);

        switch (handle) {
          case 'start': {
            const newStart = Math.max(
              0,
              Math.min(clampedPercentage, rangeEndRef.current - minGapPercent)
            );
            setRangeStart(newStart);
            break;
          }
          case 'end': {
            const newEnd = Math.min(
              clampedPercentage,
              Math.max(percentage, rangeStartRef.current + minGapPercent) // Use original percentage here
            );
            setRangeEnd(newEnd);
            break;
          }
          case 'point': {
            setPointPosition(clampedPercentage);
            break;
          }
        }
      },
      [rangeEndRef, minGapPercent, setRangeStart, rangeStartRef, setRangeEnd, setPointPosition]
    );

    const {
      handleMouseDown,
      handleTouchStart,
      handleTrackClick,
      handleTrackTouch,
      handleHandleKeyDown,
    } = useEventHandlers(
      startDate,
      endDate,
      timeUnit,
      rangeStartRef,
      rangeEndRef,
      pointPositionRef,
      viewMode,
      updateHandlePosition,
      requestHandleFocus,
      setIsHandleDragging,
      setHandleDragStarted,
      setLastInteractionType,
      isHandleDragging,
      trackRef,
      handleDragComplete,
      sliderRef,
      handleDragStarted,
      isSliderDragging,
      totalScaleUnits,
      freeSelectionOnTrackClick
    );

    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const debouncedOnChange = useMemo(
      () =>
        debounce(
          (selection: SelectionResult) => onChangeRef.current(selection),
          TIMING.DEBOUNCE_DELAY
        ),
      []
    );

    useEffect(() => {
      const selection = createSelectionResult(
        rangeStart,
        startDate,
        endDate,
        rangeEnd,
        pointPosition,
        viewMode
      );
      debouncedOnChange(selection);
    }, [debouncedOnChange, endDate, pointPosition, rangeEnd, rangeStart, startDate, viewMode]);
    return (
      <div
        className={cn('flex', classNames?.wrapper)}
        style={
          sliderWidth === 'fill'
            ? {
                height: sliderHeight ?? LAYOUT.DEFAULT_SLIDER_HEIGHT,
                width: '100%',
                minWidth: LAYOUT.MIN_SLIDER_WIDTH,
              }
            : {
                height: sliderHeight ?? LAYOUT.DEFAULT_SLIDER_HEIGHT,
                width: sliderWidth,
                minWidth: LAYOUT.MIN_SLIDER_WIDTH,
              }
        }
        role="group"
        aria-label={ACCESSIBILITY.SLIDER_ARIA_LABEL}
      >
        {/* 
                  date slider width mode: 1. fill parent div. 2. specified width.
                  date slider width = TimeDisplay + SliderContainer + TimeUnitSelection
                  SliderContainer is the visible area of DateSlider Track.
                      Track can be fixed width, 100% of SliderContainer width.
                      Track can be dynamic width, calculation result from each scale unit width, gap and number of sacales.
                  
               NOTICE!!!!!!   So layout.width(sliderWidth) cannot be undefined, must be either fill or a specified width number.
                      

        {/* Time display and date selection operation */}
        {renderProps?.renderTimeDisplay && (
          <TimeDisplay
            startDate={startDate}
            endDate={endDate}
            position={pointPosition}
            granularity={granularity}
            setDateTime={setDateTime}
            renderTimeDisplay={renderProps?.renderTimeDisplay}
          />
        )}

        {/* Date slider */}
        <div ref={sliderContainerRef} className="overflow-hidden h-full flex-1 rounded-2xl">
          <div
            className="h-full"
            // if track width is fixed, it will fill the width of slider container, it cannot be scrolled.
            style={isTrackFixedWidth ? { width: '100%' } : { width: trackWidth }}
            ref={sliderRef}
            {...dragHandlers}
          >
            <div
              style={{
                paddingLeft: trackPaddingX,
                paddingRight: trackPaddingX,
              }}
              className={cn('h-full w-full pointer-events-auto', classNames?.slider)}
            >
              <div className="relative h-full w-full" ref={trackRef}>
                <SliderTrack
                  mode={viewMode}
                  pointPosition={pointPosition}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  onTrackClick={handleTrackClick}
                  onTrackTouch={handleTrackTouch}
                  scales={scales}
                  scaleUnitConfig={scaleUnitConfig}
                  trackRef={trackRef}
                  aria-label={ACCESSIBILITY.TRACK_ARIA_LABEL}
                  startDate={startDate}
                  endDate={endDate}
                  onDragging={!!isHandleDragging}
                  startHandleRef={startHandleRef}
                  endHandleRef={endHandleRef}
                  pointHandleRef={pointHandleRef}
                  handleLabelPersistent={handleLabelPersistent}
                  handleLabelDisabled={handleLabelDisabled}
                  classNames={classNames}
                  renderDateLabel={renderProps?.renderDateLabel}
                />
                {/* TODO: move TimeUnitLabels to SliderTrack?*/}
                <TimeUnitLabels
                  timeLabels={timeLabels}
                  scales={scales}
                  trackWidth={trackWidth}
                  withEndLabel={withEndLabel}
                  classNames={classNames}
                />
                <RenderSliderHandle
                  viewMode={viewMode}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  pointPosition={pointPosition}
                  startDate={startDate}
                  endDate={endDate}
                  timeUnit={timeUnit}
                  isDragging={isHandleDragging}
                  rangeHandleIcon={rangeHandleIcon}
                  pointHandleIcon={pointHandleIcon}
                  startHandleRef={startHandleRef}
                  endHandleRef={endHandleRef}
                  pointHandleRef={pointHandleRef}
                  onHandleFocus={handleHandleFocus}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onKeyDown={handleHandleKeyDown}
                  isSliderDragging={isSliderDragging}
                  handleLabelPersistent={handleLabelPersistent}
                  handleLabelDisabled={handleLabelDisabled}
                  classNames={classNames}
                  renderDateLabel={renderProps?.renderDateLabel}
                />
              </div>
            </div>
          </div>
        </div>

        {/* toggle time unit */}
        {renderProps?.renderTimeUnitSelection && (
          <TimeUnitSelection
            isMonthValid={checkDateDuration(startDate, endDate).moreThanOneMonth}
            isYearValid={checkDateDuration(startDate, endDate).moreThanOneYear}
            onChange={handleTimeUnitChange}
            initialTimeUnit={initialTimeUnit}
            renderTimeUnitSelection={renderProps.renderTimeUnitSelection}
          />
        )}
      </div>
    );
  }
);

DateSlider.displayName = 'DateSlider';
