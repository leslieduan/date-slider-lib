import type { SelectionPanelProps } from '@/type';
import { getDateFromPercent, formatDate, addTime } from '@/utils';
import { useMemo } from 'react';

export const SelectionPanel = ({
  position,
  startDate,
  endDate,
  setDateTime,
  renderSelectionPanel,
  dateFormat,
  timeUnit,
  locale,
}: SelectionPanelProps) => {
  const dateLabel = useMemo(() => {
    const date = getDateFromPercent(position, startDate, endDate);
    return formatDate(date, dateFormat, locale, 'label');
  }, [position, startDate, endDate, dateFormat, locale]);

  const handleDateUpdate = (direction: 'forward' | 'backward') => {
    const currentDate = getDateFromPercent(position, startDate, endDate);
    const amount = direction === 'forward' ? 1 : -1;

    const newDate = addTime(currentDate, amount, timeUnit);
    setDateTime(newDate, 'point');
  };
  return renderSelectionPanel({
    dateLabel,
    toNextDate: () => handleDateUpdate('forward'),
    toPrevDate: () => handleDateUpdate('backward'),
  });
};
