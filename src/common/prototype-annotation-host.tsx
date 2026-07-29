import React, { useMemo } from 'react';
import {
  AnnotationViewer,
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation';
import { useAnnotationMermaidRenderer } from './prototype-annotation-mermaid';
import { buildAnnotationViewerSource } from './prototype-annotation-utils';

export interface PrototypeAnnotationHostProps {
  source: AnnotationSourceDocument;
  options: AnnotationViewerOptions;
  children?: React.ReactNode;
}

/**
 * 统一标注壳：PRD 分章节展示在右侧「原型标注」目录面板，
 * 不包含跨原型导航与目录内页面跳转节点。
 */
export function PrototypeAnnotationHost(props: PrototypeAnnotationHostProps) {
  const { source, options, children } = props;
  useAnnotationMermaidRenderer();

  const viewerSource = useMemo(
    () => buildAnnotationViewerSource(source, options.currentPageId),
    [source, options.currentPageId],
  );

  return (
    <>
      {children}
      <AnnotationViewer source={viewerSource} options={options} />
    </>
  );
}

export default PrototypeAnnotationHost;
