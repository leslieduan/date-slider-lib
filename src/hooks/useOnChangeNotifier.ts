import { useEffect, useMemo, useRef } from 'react';
import { createSelectionResult, debounce } from '@/utils';
import { TIMING } from '@/constants';
import type { ViewMode, SelectionResult } from '@/type';

interface UseOnChangeNotifierParams {
  onChange: (selection: SelectionResult) => void;
  rangeStartPosition: number;
  rangeEndPosition: number;
  pointPosition: number;
  startDate: Date;
  endDate: Date;
  viewMode: ViewMode;
}

/**
 * Hook to handle debounced onChange notifications.
 * Creates selection results from positions and notifies parent component.
 */
export function useOnChangeNotifier({
  onChange,
  rangeStartPosition,
  rangeEndPosition,
  pointPosition,
  startDate,
  endDate,
  viewMode,
}: UseOnChangeNotifierParams) {
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
}
