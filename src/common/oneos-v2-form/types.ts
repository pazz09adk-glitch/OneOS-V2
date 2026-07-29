import type { CSSProperties, ReactNode } from 'react';

/** 筛选区 32px / 表单区 36px */
export type O2ControlSize = 'sm' | 'md';

export type O2SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type O2FieldProps = {
  label?: ReactNode;
  required?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 控件尺寸：sm=筛选 32px，md=表单 36px（默认） */
  size?: O2ControlSize;
  disabled?: boolean;
  id?: string;
};

export type DateRangeValue = {
  startDate: string;
  endDate: string;
};
