import type { SliderHandleProps, RenderSliderHandleProps } from '@/type';
import { cn, formatDate, getDateFromPercent, handleOutsideVisibleArea } from '@/utils';
import { memo, useLayoutEffect, useState } from 'react';
import { DateLabel } from './DateLabel';

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

  useLayoutEffect(() => {
    if (!ref.current) return;

    const updatePosition = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setLabelPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - dateLabelDistanceOverHandle,
      });
    };

    updatePosition();
  }, [ref, position, dateLabelDistanceOverHandle, sliderPositionX]);

  // Get handle-specific className
  const handleSpecificClass =
    handleType === 'point'
      ? classNames?.handlePoint
      : handleType === 'start'
        ? classNames?.handleStart
        : classNames?.handleEnd;

  const handleBaseClass = classNames?.handle || handleSpecificClass;
  const handleDraggingClass = onDragging ? classNames?.handleDragging : '';

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
      {!onDragging && !isSliderDragging && !outsideVisibleArea && (
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
    rangeStart,
    rangeEnd,
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
              position={rangeStart}
              label={formatDate(
                getDateFromPercent(rangeStart, startDate, endDate),
                dateFormat,
                locale,
                'label'
              )}
              onMouseDown={onMouseDown('start')}
              onTouchStart={onTouchStart('start')}
              value={rangeStart}
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
              position={rangeEnd}
              label={formatDate(
                getDateFromPercent(rangeEnd, startDate, endDate),
                dateFormat,
                locale,
                'label'
              )}
              onMouseDown={onMouseDown('end')}
              onTouchStart={onTouchStart('end')}
              value={rangeEnd}
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
            label={formatDate(
              getDateFromPercent(pointPosition, startDate, endDate),
              dateFormat,
              locale,
              'label'
            )}
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
