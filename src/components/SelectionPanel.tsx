import type { SelectionPanelProps } from '@/type';
import { getDateFromPercent, formatDate } from '@/utils';
import { useMemo } from 'react';

export const SelectionPanel = ({
  position,
  startDate,
  endDate,
  moveByStep,
  renderSelectionPanel,
  dateFormat,
  locale,
}: SelectionPanelProps) => {
  const dateLabel = useMemo(() => {
    const date = getDateFromPercent(position, startDate, endDate);
    return formatDate(date, dateFormat, locale, 'label');
  }, [position, startDate, endDate, dateFormat, locale]);

  return renderSelectionPanel({
    dateLabel,
    toNextDate: () => moveByStep('forward', 'point'),
    toPrevDate: () => moveByStep('backward', 'point'),
  });
};
