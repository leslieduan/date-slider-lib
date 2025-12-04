import type { TimeDisplayProps } from '@/type';
import { getDateFromPercent, formatDate, addTime } from '@/utils';
import { useMemo } from 'react';

export const TimeDisplay = ({
  position,
  startDate,
  endDate,
  setDateTime,
  renderTimeDisplay,
  dateFormat,
  timeUnit,
}: TimeDisplayProps) => {
  const dateLabel = useMemo(() => {
    const date = getDateFromPercent(position, startDate, endDate);
    return formatDate(date, dateFormat, 'en-AU', 'label');
  }, [position, startDate, endDate, dateFormat]);

  const handleDateUpdate = (direction: 'forward' | 'backward') => {
    const currentDate = getDateFromPercent(position, startDate, endDate);
    const amount = direction === 'forward' ? 1 : -1;

    const newDate = addTime(currentDate, amount, timeUnit);
    setDateTime(newDate, 'point');
  };
  return renderTimeDisplay({
    dateLabel,
    toNextDate: () => handleDateUpdate('forward'),
    toPrevDate: () => handleDateUpdate('backward'),
  });
};
