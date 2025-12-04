import type { ScaleType, SliderTrackProps } from '@/type';
import {
  cn,
  getPercentageFromMouseEvent,
  formatForDisplay,
  getDateFromPercent,
  calculateLabelPosition,
  getPercentageFromTouchEvent,
} from '@/utils';
import { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { DateLabel } from './DateLabel';
import { ScalesUnitLabels } from './ScalesUnitLabels';

const CursorLine = memo(
  ({
    position,
    isVisible,
    className,
  }: {
    position?: number;
    isVisible: boolean;
    className?: string;
  }) => {
    if (!isVisible || position === undefined) return null;

    return (
      <div
        style={{ left: `${position}%` }}
        className={cn(
          'hidden md:block absolute top-0 h-full w-px transform -translate-x-0.5 pointer-events-none z-20 transition-opacity duration-150',
          'motion-reduce:transition-none',
          className || 'bg-blue-500/70'
        )}
        aria-hidden="true"
      />
    );
  }
);

CursorLine.displayName = 'CursorLine';

const Scales = memo(
  ({
    scales,
    scaleUnitConfig,
    scalesClassName,
    scaleMarkClassName,
    scaleMarkMajorClassName,
    scaleMarkMediumClassName,
    scaleMarkMinorClassName,
  }: {
    scales?: Array<{ position: number; type: ScaleType }>;
    scaleUnitConfig: {
      width: Record<ScaleType, number>;
      height: Record<ScaleType, number>;
    };
    scalesClassName?: string;
    scaleMarkClassName?: string;
    scaleMarkMajorClassName?: string;
    scaleMarkMediumClassName?: string;
    scaleMarkMinorClassName?: string;
  }) => {
    const getSize = useCallback(
      (type: ScaleType) => ({
        width: scaleUnitConfig.width[type] ?? 1,
        height: scaleUnitConfig.height[type] ?? 1,
      }),
      [scaleUnitConfig]
    );

    const getScaleClassName = useCallback(
      (type: ScaleType) => {
        const baseClass = 'absolute transform -translate-x-0.5 top-0';
        const typeSpecificClass =
          type === 'long'
            ? scaleMarkMajorClassName
            : type === 'medium'
              ? scaleMarkMediumClassName
              : scaleMarkMinorClassName;

        return cn(baseClass, typeSpecificClass || scaleMarkClassName || 'bg-slate-600');
      },
      [
        scaleMarkClassName,
        scaleMarkMajorClassName,
        scaleMarkMediumClassName,
        scaleMarkMinorClassName,
      ]
    );

    if (!scales?.length) return null;

    return (
      <div className={cn('absolute inset-0', scalesClassName)}>
        {scales.map((scale, index) => (
          <div
            key={index}
            className={getScaleClassName(scale.type)}
            style={{ left: `${scale.position}%`, ...getSize(scale.type) }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }
);
Scales.displayName = 'Scales';

export const SliderTrack = memo(
  ({
    onTrackClick,
    onTrackTouch,
    scales,
    scaleUnitConfig,
    trackRef,
    startDate,
    endDate,
    onDragging,
    startHandleRef,
    endHandleRef,
    pointHandleRef,
    classNames,
    renderDateLabel,
    timeLabels,
    trackWidth,
    withEndLabel,
    ...props
  }: SliderTrackProps) => {
    const [isHoverTrack, setIsHoverTrack] = useState(false);
    const [isHandleHover, setIsHandleHover] = useState(false);
    const [mouseHoverPosition, setMouseHoverPosition] = useState<number>();
    const [labelPosition, setLabelPosition] = useState<{
      x: number;
      y: number;
    }>();
    const [dateLabel, setDateLabel] = useState<string>();

    const updateDateLabel = useCallback(
      (percentage: number, clientX: number, isHover: boolean) => {
        const label = formatForDisplay(
          getDateFromPercent(percentage, startDate, endDate),
          'day',
          'en-AU',
          true
        );

        setIsHoverTrack(isHover);
        setDateLabel(label);
        setMouseHoverPosition(percentage);
        setLabelPosition(calculateLabelPosition(trackRef, clientX));
      },
      [trackRef, startDate, endDate]
    );

    const handleMouseLeave = useCallback(() => {
      setIsHoverTrack(false);
      setMouseHoverPosition(undefined);
      setLabelPosition(undefined);
    }, []);

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!trackRef.current) return;
        const percentage = getPercentageFromMouseEvent(e, trackRef);
        updateDateLabel(percentage, e.clientX, true);
      },
      [trackRef, updateDateLabel]
    );

    const handleTouchMove = useCallback(
      (e: TouchEvent) => {
        const percentage = getPercentageFromTouchEvent(e, trackRef);
        const touchX = e.touches?.[0]?.clientX ?? 0;
        updateDateLabel(percentage, touchX, false);
      },
      [trackRef, updateDateLabel]
    );

    const handleTouchEnd = useCallback(() => {
      setIsHoverTrack(false);
      setMouseHoverPosition(undefined);
      setLabelPosition(undefined);
    }, []);

    const handleHandlerMouseMove = useCallback(() => {
      setIsHandleHover(true);
    }, []);

    const handleHandlerMouseLeave = useCallback(() => {
      setIsHandleHover(false);
    }, []);

    useEffect(() => {
      const trackRefInstance = trackRef.current;
      if (!trackRefInstance) return;

      const handleRefs = [startHandleRef.current, endHandleRef.current, pointHandleRef.current];

      trackRefInstance.addEventListener('touchend', handleTouchEnd);
      trackRefInstance.addEventListener('touchmove', handleTouchMove);
      trackRefInstance.addEventListener('mousemove', handleMouseMove);
      trackRefInstance.addEventListener('mouseleave', handleMouseLeave);

      handleRefs.forEach((handleRef) => {
        handleRef?.addEventListener('mousemove', handleHandlerMouseMove);
        handleRef?.addEventListener('mouseleave', handleHandlerMouseLeave);
      });

      return () => {
        trackRefInstance.removeEventListener('touchend', handleTouchEnd);
        trackRefInstance.removeEventListener('touchmove', handleTouchMove);
        trackRefInstance.removeEventListener('mousemove', handleMouseMove);
        trackRefInstance.removeEventListener('mouseleave', handleMouseLeave);

        handleRefs.forEach((handleRef) => {
          handleRef?.removeEventListener('mousemove', handleHandlerMouseMove);
          handleRef?.removeEventListener('mouseleave', handleHandlerMouseLeave);
        });
      };
    }, [
      trackRef,
      startHandleRef,
      endHandleRef,
      pointHandleRef,
      handleMouseLeave,
      handleMouseMove,
      handleTouchEnd,
      handleTouchMove,
      handleHandlerMouseMove,
      handleHandlerMouseLeave,
    ]);

    const baseClassName = useMemo(
      () =>
        cn('h-full w-full relative overflow-visible cursor-pointer touch-none', classNames?.track),
      [classNames?.track]
    );

    const showCursorLine = isHoverTrack && !onDragging && !isHandleHover;
    const showDateLabel = isHoverTrack;

    const commonElements = useMemo(
      () => (
        <>
          <Scales
            scales={scales}
            scaleUnitConfig={scaleUnitConfig}
            scalesClassName={classNames?.scales}
            scaleMarkClassName={classNames?.scaleMark}
            scaleMarkMajorClassName={classNames?.scaleMarkMajor}
            scaleMarkMediumClassName={classNames?.scaleMarkMedium}
            scaleMarkMinorClassName={classNames?.scaleMarkMinor}
          />
          <ScalesUnitLabels
            timeLabels={timeLabels}
            scales={scales}
            trackWidth={trackWidth}
            withEndLabel={withEndLabel}
            classNames={classNames}
          />
          <CursorLine
            position={mouseHoverPosition}
            isVisible={showCursorLine}
            className={classNames?.cursorLine}
          />
          {showDateLabel && (
            <DateLabel
              className="hidden md:block"
              label={dateLabel}
              position={labelPosition}
              renderDateLabel={renderDateLabel}
            />
          )}
        </>
      ),
      [
        scales,
        scaleUnitConfig,
        classNames,
        timeLabels,
        trackWidth,
        withEndLabel,
        mouseHoverPosition,
        showCursorLine,
        showDateLabel,
        dateLabel,
        labelPosition,
        renderDateLabel,
      ]
    );

    const activeTrack = useMemo(() => {
      const baseActiveClasses = cn(
        'absolute h-full transition-all duration-200 z-10',
        'motion-reduce:transition-none',
        classNames?.trackActive || 'bg-blue-500/30'
      );

      if (props.mode === 'point') {
        return (
          <div
            className={cn(baseActiveClasses, 'rounded-full')}
            style={{ width: `${props.pointPosition}%` }}
          />
        );
      }

      if (props.mode === 'range' || props.mode === 'combined') {
        return (
          <div
            className={baseActiveClasses}
            style={{
              left: `${props.rangeStart}%`,
              width: `${(props.rangeEnd ?? 0) - (props.rangeStart ?? 0)}%`,
            }}
          />
        );
      }

      return null;
    }, [props, classNames?.trackActive]);

    if (props.mode === 'point' || props.mode === 'range' || props.mode === 'combined') {
      return (
        <div
          onClick={onTrackClick}
          onTouchEnd={onTrackTouch}
          className={baseClassName}
          aria-hidden="true"
        >
          <div className={classNames?.trackInner}>
            {commonElements}
            {activeTrack}
          </div>
        </div>
      );
    }

    return null;
  }
);

SliderTrack.displayName = 'SliderTrack';
