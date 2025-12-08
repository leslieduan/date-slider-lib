import type { ScaleTypeResolver, TimeUnit } from '@/type';
import { getTotalScales, generateScales } from '@/utils';
import { useMemo } from 'react';

export function useScales({
  startDate,
  endDate,
  timeUnit,
  scaleTypeResolver,
}: {
  startDate: Date;
  endDate: Date;
  timeUnit: TimeUnit;
  scaleTypeResolver?: ScaleTypeResolver;
}) {
  const totalScaleUnits = useMemo(
    () => getTotalScales(startDate, endDate, timeUnit),
    [startDate, endDate, timeUnit]
  );

  const { scales: allScales, numberOfScales } = useMemo(
    () => generateScales(startDate, endDate, timeUnit, totalScaleUnits, scaleTypeResolver),
    [endDate, startDate, timeUnit, totalScaleUnits, scaleTypeResolver]
  );

  return { allScales, numberOfScales, totalScaleUnits };
}
