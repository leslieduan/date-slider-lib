import { useCallback, type MutableRefObject } from 'react';
import { clamp, clampPercent, getPercentFromDate } from '@/utils';
import { PERCENTAGE } from '@/constants';
import type { DragHandle, ViewMode } from '@/type';

interface UseHandlePositionParams {
  minGapPercent: number;
  startDate: Date;
  endDate: Date;
  viewMode: ViewMode;
  setRangeStartPosition: (position: number) => void;
  setRangeEndPosition: (position: number) => void;
  setPointPosition: (position: number) => void;
  rangeStartRef: MutableRefObject<number>;
  rangeEndRef: MutableRefObject<number>;
  autoScrollToVisibleAreaRef: MutableRefObject<boolean>;
}

/**
 * Hook to manage handle position updates for both direct position changes and date-based updates.
 * Encapsulates logic for clamping, gap constraints, and auto-scroll triggers.
 */
export function useHandlePosition({
  minGapPercent,
  startDate,
  endDate,
  viewMode,
  setRangeStartPosition,
  setRangeEndPosition,
  setPointPosition,
  rangeStartRef,
  rangeEndRef,
  autoScrollToVisibleAreaRef,
}: UseHandlePositionParams) {
  /**
   * Update handle position by percentage with gap constraints
   */
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
      autoScrollToVisibleAreaRef,
    ]
  );

  return { setDateTime, updateHandlePosition };
}
