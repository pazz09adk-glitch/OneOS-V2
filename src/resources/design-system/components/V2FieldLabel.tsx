import React from 'react';

export interface V2FieldLabelProps {
  children: React.ReactNode;
  /** 必填：红色胶囊「必填」；禁止仅用黑色 * */
  required?: boolean;
  /** 选填：灰色胶囊「选填」 */
  optional?: boolean;
  className?: string;
  htmlFor?: string;
}

/**
 * 表单字段标签 + 必填/选填胶囊（DESIGN.md §3.1.2）
 * 新建/改造表单页统一使用；禁止仅黑色星号标注必填。
 */
export function V2FieldLabel({
  children,
  required,
  optional,
  className,
  htmlFor,
}: V2FieldLabelProps) {
  const Tag = htmlFor ? 'label' : 'div';
  return (
    <Tag
      className={['v2-field-label', className].filter(Boolean).join(' ')}
      {...(htmlFor ? { htmlFor } : {})}
    >
      <span className="v2-field-label__text">{children}</span>
      {required && <span className="v2-field-req-pill">必填</span>}
      {optional && !required && <span className="v2-field-opt-pill">选填</span>}
    </Tag>
  );
}

export default V2FieldLabel;
