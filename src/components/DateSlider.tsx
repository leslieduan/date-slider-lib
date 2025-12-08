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
  useEventHandlers,
  useFocusManagement,
  useHandleDragState,
  useHandleAutoScrollToVisible,
  useInitialAutoScrollPosition,
  usePositionState,
  useViewportSize,
  useSliderConfig,
  useSliderDimesions,
  useScales,
  useSliderVirtualization,
} from '@/hooks';
import {
  checkDateDuration,
  clamp,
  clampPercent,
  cn,
  createSelectionResult,
  debounce,
  generateTrackWidth,
  getPercentFromDate,
} from '@/utils';
import { LAYOUT, PERCENTAGE, TIMING, ACCESSIBILITY } from '@/constants';
import type { SliderProps, TimeUnit, DragHandle, SelectionResult } from '@/type';
import { RenderSliderHandle } from './SliderHandle';
import { SliderTrack } from './SliderTrack';
import { SelectionPanel } from './SelectionPanel';
import { TimeUnitSelection } from './TimeUnitSelection';
import {
  customSelectionPanelRenderer,
  customDateLabelRenderer,
  customTimeUnitSelectionRenderer,
} from './defaultRender';

export const DateSlider = memo(
  ({
    mode: viewMode,
    min: propStartDate,
    max: propEndDate,
    initialTimeUnit,
    onChange,
    renderProps,
    classNames,
    imperativeRef: imperativeHandleRef,
    ...restProps
  }: SliderProps) => {
    const { isSmallScreen } = useViewportSize();

    const { locale, scaleTypeResolver, initialValues, icons, layout, behavior, dateFormat } =
      useSliderConfig(restProps as SliderProps, isSmallScreen);

    const [timeUnit, setTimeUnit] = useState<TimeUnit>(initialTimeUnit);

    // all prop dates are expected to be UTC Date objects
    const startDate = propStartDate;
    const endDate = propEndDate;

    const { allScales, numberOfScales, totalScaleUnits } = useScales({
      startDate,
      endDate,
      timeUnit,
      scaleTypeResolver,
    });

    const minGapPercent = useMemo(
      () => (1 / totalScaleUnits) * 100 * layout.minGapScaleUnits,
      [layout.minGapScaleUnits, totalScaleUnits]
    );

    const {
      rangeStartPosition,
      rangeEndPosition,
      pointPosition,
      setRangeStartPosition,
      setRangeEndPosition,
      setPointPosition,
      rangeStartRef,
      rangeEndRef,
      pointPositionRef,
    } = usePositionState(
      initialValues.range,
      initialValues.point,
      startDate,
      timeUnit,
      totalScaleUnits
    );

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

    const trackContainerRef = useRef<HTMLDivElement>(null);
    const sliderContainerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const dimensions = useSliderDimesions(sliderContainerRef, trackContainerRef);
    const { sliderContainerWidth, trackContainerWidth } = dimensions;

    const trackWidth = useMemo(() => {
      const safeGap =
        (sliderContainerWidth -
          (numberOfScales.long * layout.scaleUnitConfig.width.long +
            numberOfScales.medium * layout.scaleUnitConfig.width.medium +
            numberOfScales.short * layout.scaleUnitConfig.width.short)) /
        totalScaleUnits;
      const safeScaleUnitConfig = {
        ...layout.scaleUnitConfig,
        gap: Math.max(safeGap, layout.scaleUnitConfig.gap ?? 0),
      };
      return generateTrackWidth(totalScaleUnits, numberOfScales, safeScaleUnitConfig);
    }, [numberOfScales, layout.scaleUnitConfig, sliderContainerWidth, totalScaleUnits]);

    const dragBounds = useMemo(
      () => ({
        left: Math.min(0, sliderContainerWidth - trackContainerWidth),
        right: 0,
      }),
      [sliderContainerWidth, trackContainerWidth]
    );

    const autoScrollToVisibleAreaRef = useRef(false);

    const {
      position: sliderPosition,
      dragHandlers,
      isDragging: isSliderDragging,
      resetPosition,
    } = useDrag({
      targetRef: behavior.scrollable ? trackContainerRef : undefined,
      initialPosition: { x: 0, y: 0 },
      constrainToAxis: 'x',
      bounds: dragBounds,
      //inform slider is being dragged to prevent handle interactions
      onDragEnd: handleDragComplete,
      onDragStarted: () => {
        setHandleDragStarted(true);
        autoScrollToVisibleAreaRef.current = false;
      },
    });

    const { scales } = useSliderVirtualization({
      behavior,
      trackWidth,
      sliderContainerWidth,
      sliderPositionX: sliderPosition.x,
      allScales,
    });

    useHandleAutoScrollToVisible({
      pointHandleRef,
      isHandleDragging,
      sliderContainerRef,
      dragBounds,
      sliderPosition,
      resetPosition,
      pointPosition,
      isSliderDragging,
      autoScrollToVisibleAreaRef,
      sliderAutoScrollToPointHandleVisibleEnabled:
        behavior.sliderAutoScrollToPointHandleVisibleEnabled,
    });

    useInitialAutoScrollPosition({
      scrollable: behavior.scrollable,
      dimensions,
      viewMode,
      pointPosition,
      rangeStartPosition,
      rangeEndPosition,
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
            setRangeStartPosition(newStart);
            break;
          }
          case 'end': {
            const newEnd = clamp(clampPercentage, 100, rangeStartRef.current + minGapPercent);
            setRangeEndPosition(newEnd);
            break;
          }
          case 'point': {
            setPointPosition(clampPercentage);
            break;
          }
        }
        autoScrollToVisibleAreaRef.current = true;
      },
      [
        startDate,
        endDate,
        viewMode,
        rangeStartRef,
        rangeEndRef,
        minGapPercent,
        setRangeStartPosition,
        setRangeEndPosition,
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
            setRangeStartPosition(newStart);
            break;
          }
          case 'end': {
            const newEnd = Math.min(
              clampedPercentage,
              Math.max(percentage, rangeStartRef.current + minGapPercent) // Use original percentage here
            );
            setRangeEndPosition(newEnd);
            break;
          }
          case 'point': {
            setPointPosition(clampedPercentage);
            break;
          }
        }
      },
      [
        rangeEndRef,
        minGapPercent,
        setRangeStartPosition,
        rangeStartRef,
        setRangeEndPosition,
        setPointPosition,
      ]
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
      trackContainerRef,
      handleDragStarted,
      isSliderDragging,
      totalScaleUnits,
      behavior.freeSelectionOnTrackClick,
      autoScrollToVisibleAreaRef
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
        rangeStartPosition,
        startDate,
        endDate,
        rangeEndPosition,
        pointPosition,
        viewMode
      );
      debouncedOnChange(selection);
    }, [
      debouncedOnChange,
      endDate,
      pointPosition,
      rangeEndPosition,
      rangeStartPosition,
      startDate,
      viewMode,
    ]);
    return (
      // Date Slider wrapper
      <div
        className={cn('flex', classNames?.wrapper)}
        style={
          layout.sliderWidth === 'fill'
            ? {
                height: layout.sliderHeight ?? LAYOUT.DEFAULT_SLIDER_HEIGHT,
                width: '100%',
                minWidth: LAYOUT.MIN_SLIDER_WIDTH,
              }
            : {
                height: layout.sliderHeight ?? LAYOUT.DEFAULT_SLIDER_HEIGHT,
                width: layout.sliderWidth,
                minWidth: LAYOUT.MIN_SLIDER_WIDTH,
              }
        }
        role="group"
        aria-label={ACCESSIBILITY.SLIDER_ARIA_LABEL}
      >
        {/*
          Layout Architecture:
          - DateSlider wrapper width = SelectionPanel + SliderContainer + TimeUnitSelection (flex layout)
          - SliderContainer is the scrollable viewport (flex-1)
          - Track is the actual slider with scales, contained in SliderContainer

          Width Modes:
          1. 'fill' mode: Sets width: 100%, fills parent container. DateSlider wrapper width same as parent, SliderContainer width is flex-1, fill remaining width besides
          TimeUnitSelection and SelectionPanel. 
          2. Specified width: Sets explicit width in pixels. DateSlider wrapper width is specified width, SliderContainer width is flex-1, fill remaining width besides
          TimeUnitSelection and SelectionPanel. 
          3. Undefined: Uses flex sizing without width constraint. DateSlider wrapper width will fit content, largest to fill its parent div or screen. SliderContainer 
          width is flex-1, fill remaining width besides TimeUnitSelection and SelectionPanel. 

          Track Behavior:
          - Scrollable (default): Track width = calculated from scales, enables horizontal scroll if needed
          - Fixed: Track width = 100% of SliderContainer, no scrolling
        */}

        {/* Time display and date selection operation */}
        {layout.selectionPanelEnabled && (
          <SelectionPanel
            startDate={startDate}
            endDate={endDate}
            position={pointPosition}
            setDateTime={setDateTime}
            renderSelectionPanel={renderProps?.renderSelectionPanel || customSelectionPanelRenderer}
            dateFormat={dateFormat}
            timeUnit={timeUnit}
            locale={locale}
          />
        )}

        {/* Date slider container */}
        <div
          ref={sliderContainerRef}
          className="overflow-hidden flex-1 rounded-2xl"
          style={{ height: '100%' }}
        >
          {/* Track width, this trackContainerRef div width = track width + 2*trackPaddingX */}
          <div
            // if track width is fixed, it will fill the width of slider container, it cannot be scrolled.
            style={
              layout.isTrackFixedWidth
                ? { width: '100%', height: '100%' }
                : { width: trackWidth, height: '100%' }
            }
            ref={trackContainerRef}
            {...dragHandlers}
          >
            <div
              style={{
                paddingLeft: layout.trackPaddingX,
                paddingRight: layout.trackPaddingX,
                height: '100%',
                width: '100%',
              }}
              className={cn('pointer-events-auto', classNames?.slider)}
            >
              <div className="relative" style={{ height: '100%', width: '100%' }}>
                <SliderTrack
                  mode={viewMode}
                  pointPosition={pointPosition}
                  rangeStartPosition={rangeStartPosition}
                  rangeEndPosition={rangeEndPosition}
                  onTrackClick={handleTrackClick}
                  onTrackTouch={handleTrackTouch}
                  scales={scales}
                  scaleUnitConfig={layout.scaleUnitConfig}
                  trackRef={trackRef}
                  aria-label={ACCESSIBILITY.TRACK_ARIA_LABEL}
                  startDate={startDate}
                  endDate={endDate}
                  onDragging={!!isHandleDragging}
                  startHandleRef={startHandleRef}
                  endHandleRef={endHandleRef}
                  pointHandleRef={pointHandleRef}
                  trackHoverDateLabelDisabled={behavior.trackHoverDateLabelDisabled}
                  trackHoverCursorLineDisabled={behavior.trackHoverCursorLineDisabled}
                  classNames={classNames}
                  renderDateLabel={
                    layout.dateLabelEnabled
                      ? renderProps?.renderDateLabel || customDateLabelRenderer
                      : undefined
                  }
                  trackWidth={trackWidth}
                  withEndLabel={layout.withEndLabel}
                  dateLabelDistanceOverHandle={layout.dateLabelDistance}
                  dateFormat={dateFormat}
                  locale={locale}
                />

                <RenderSliderHandle
                  viewMode={viewMode}
                  rangeStartPosition={rangeStartPosition}
                  rangeEndPosition={rangeEndPosition}
                  pointPosition={pointPosition}
                  startDate={startDate}
                  endDate={endDate}
                  timeUnit={timeUnit}
                  isDragging={isHandleDragging}
                  rangeHandleIcon={icons.rangeHandleIcon}
                  pointHandleIcon={icons.pointHandleIcon}
                  startHandleRef={startHandleRef}
                  endHandleRef={endHandleRef}
                  pointHandleRef={pointHandleRef}
                  onHandleFocus={handleHandleFocus}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onKeyDown={handleHandleKeyDown}
                  isSliderDragging={isSliderDragging}
                  pointHandleLabelPersistent={behavior.pointHandleLabelPersistent}
                  pointHandleLabelDisabled={behavior.pointHandleLabelDisabled}
                  rangeHandleLabelPersistent={behavior.rangeHandleLabelPersistent}
                  rangeHandleLabelDisabled={behavior.rangeHandleLabelDisabled}
                  classNames={classNames}
                  renderDateLabel={
                    layout.dateLabelEnabled
                      ? renderProps?.renderDateLabel || customDateLabelRenderer
                      : undefined
                  }
                  sliderContainerRef={sliderContainerRef}
                  dateLabelDistanceOverHandle={layout.dateLabelDistance}
                  dateFormat={dateFormat}
                  locale={locale}
                  sliderPositionX={sliderPosition.x}
                  trackWidth={trackWidth}
                />
              </div>
            </div>
          </div>
        </div>

        {/* toggle time unit */}
        {layout.timeUnitSelectionEnabled && (
          <TimeUnitSelection
            isMonthValid={checkDateDuration(startDate, endDate).moreThanOneMonth}
            isYearValid={checkDateDuration(startDate, endDate).moreThanOneYear}
            onChange={handleTimeUnitChange}
            initialTimeUnit={initialTimeUnit}
            renderTimeUnitSelection={
              renderProps?.renderTimeUnitSelection || customTimeUnitSelectionRenderer
            }
          />
        )}
      </div>
    );
  }
);

DateSlider.displayName = 'DateSlider';
