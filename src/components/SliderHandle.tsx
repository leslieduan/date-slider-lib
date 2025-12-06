import type { SliderHandleProps, RenderSliderHandleProps } from '@/type';
import { cn, formatDate, getDateFromPercent, handleOutsideVisibleArea } from '@/utils';
import { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { DateLabel } from './DateLabel';
import { useIsScrolling } from '@/hooks';

export const SliderHandle = ({
  onDragging,
  position,
  label,
  icon,
  onMouseDown,
  onTouchStart,
  ref,
  min,
  max,
  value,
  handleType,
  onKeyDown,
  onFocus,
  isSliderDragging,
  handleLabelPersistent,
  handleLabelDisabled,
  classNames,
  renderDateLabel,
  sliderContainerRef,
  dateLabelDistanceOverHandle,
  sliderPositionX,
}: SliderHandleProps) => {
  const { leftOut, rightOut } = handleOutsideVisibleArea({
    handleRef: ref,
    sliderContainerRef,
  });
  const outsideVisibleArea = leftOut || rightOut;

  const [labelPosition, setLabelPosition] = useState<{ x: number; y: number } | undefined>();
  const isScrolling = useIsScrolling(window);

  const updatePosition = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setLabelPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - dateLabelDistanceOverHandle,
    });
  }, [ref, dateLabelDistanceOverHandle]);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const handleScroll = () => {
      if (!isScrolling) updatePosition();
    };

    updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ref, position, dateLabelDistanceOverHandle, sliderPositionX, isScrolling, updatePosition]);

  // Get handle-specific className
  const handleSpecificClass =
    handleType === 'point'
      ? classNames?.handlePoint
      : handleType === 'start'
        ? classNames?.handleStart
        : classNames?.handleEnd;

  const handleBaseClass = classNames?.handle || handleSpecificClass;
  const handleDraggingClass = onDragging ? classNames?.handleDragging : '';

  const isHandleVisible = !onDragging && !isSliderDragging && !outsideVisibleArea && !isScrolling;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'group absolute cursor-pointer z-20 transform -translate-x-1/2 hover:scale-110 touch-none top-0 bg-transparent',
        'w-fit h-fit inline-flex items-center justify-center',
        'focus-visible:outline focus-visible:outline-offset-2',
        handleBaseClass,
        handleSpecificClass,
        handleDraggingClass || (onDragging ? 'scale-110' : '')
      )}
      style={{ left: `${position}%` }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      role="slider"
      aria-orientation="horizontal"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={label}
      aria-label={`${handleType} handle`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    >
      {icon}
      {isHandleVisible && (
        <DateLabel
          position={labelPosition}
          label={label}
          immediateDisappear={isSliderDragging}
          handleLabelPersistent={handleLabelPersistent}
          handleLabelDisabled={handleLabelDisabled}
          renderDateLabel={renderDateLabel}
        />
      )}
    </button>
  );
};

export const RenderSliderHandle = memo<RenderSliderHandleProps>(
  ({
    viewMode,
    rangeStartPosition,
    rangeEndPosition,
    pointPosition,
    startDate,
    endDate,
    isDragging,
    rangeHandleIcon,
    pointHandleIcon,
    startHandleRef,
    endHandleRef,
    pointHandleRef,
    onHandleFocus,
    onMouseDown,
    onTouchStart,
    onKeyDown,
    isSliderDragging,
    pointHandleLabelPersistent,
    pointHandleLabelDisabled,
    rangeHandleLabelPersistent,
    rangeHandleLabelDisabled,
    classNames,
    renderDateLabel,
    sliderContainerRef,
    dateLabelDistanceOverHandle,
    dateFormat,
    locale,
    sliderPositionX,
  }) => {
    const commonProps = {
      onFocus: onHandleFocus,
      min: 0,
      max: 100,
      classNames,
    };

    const startLabel = useMemo(
      () =>
        formatDate(
          getDateFromPercent(rangeStartPosition, startDate, endDate),
          dateFormat,
          locale,
          'label'
        ),
      [rangeStartPosition, startDate, endDate, dateFormat, locale]
    );

    const endLabel = useMemo(
      () =>
        formatDate(
          getDateFromPercent(rangeEndPosition, startDate, endDate),
          dateFormat,
          locale,
          'label'
        ),
      [rangeEndPosition, startDate, endDate, dateFormat, locale]
    );

    const pointLabel = useMemo(
      () =>
        formatDate(
          getDateFromPercent(pointPosition, startDate, endDate),
          dateFormat,
          locale,
          'label'
        ),
      [pointPosition, startDate, endDate, dateFormat, locale]
    );

    return (
      <>
        {(viewMode === 'range' || viewMode === 'combined') && (
          <>
            <SliderHandle
              viewMode={viewMode}
              ref={startHandleRef}
              {...commonProps}
              icon={rangeHandleIcon}
              onDragging={isDragging === 'start'}
              position={rangeStartPosition}
              label={startLabel}
              onMouseDown={onMouseDown('start')}
              onTouchStart={onTouchStart('start')}
              value={rangeStartPosition}
              handleType="start"
              onKeyDown={onKeyDown('start')}
              isSliderDragging={isSliderDragging}
              handleLabelPersistent={rangeHandleLabelPersistent}
              handleLabelDisabled={rangeHandleLabelDisabled}
              renderDateLabel={renderDateLabel}
              sliderContainerRef={sliderContainerRef}
              dateLabelDistanceOverHandle={dateLabelDistanceOverHandle}
              sliderPositionX={sliderPositionX}
            />
            <SliderHandle
              viewMode={viewMode}
              ref={endHandleRef}
              {...commonProps}
              icon={rangeHandleIcon}
              onDragging={isDragging === 'end'}
              position={rangeEndPosition}
              label={endLabel}
              onMouseDown={onMouseDown('end')}
              onTouchStart={onTouchStart('end')}
              value={rangeEndPosition}
              handleType="end"
              onKeyDown={onKeyDown('end')}
              isSliderDragging={isSliderDragging}
              handleLabelPersistent={rangeHandleLabelPersistent}
              handleLabelDisabled={rangeHandleLabelDisabled}
              renderDateLabel={renderDateLabel}
              sliderContainerRef={sliderContainerRef}
              dateLabelDistanceOverHandle={dateLabelDistanceOverHandle}
              sliderPositionX={sliderPositionX}
            />
          </>
        )}

        {(viewMode === 'point' || viewMode === 'combined') && (
          <SliderHandle
            viewMode={viewMode}
            ref={pointHandleRef}
            {...commonProps}
            icon={pointHandleIcon}
            onDragging={isDragging === 'point'}
            position={pointPosition}
            label={pointLabel}
            onMouseDown={onMouseDown('point')}
            onTouchStart={onTouchStart('point')}
            value={pointPosition}
            handleType="point"
            onKeyDown={onKeyDown('point')}
            isSliderDragging={isSliderDragging}
            handleLabelPersistent={pointHandleLabelPersistent}
            handleLabelDisabled={pointHandleLabelDisabled}
            renderDateLabel={renderDateLabel}
            sliderContainerRef={sliderContainerRef}
            dateLabelDistanceOverHandle={dateLabelDistanceOverHandle}
            sliderPositionX={sliderPositionX}
          />
        )}
      </>
    );
  }
);

RenderSliderHandle.displayName = 'RenderSliderHandle';
