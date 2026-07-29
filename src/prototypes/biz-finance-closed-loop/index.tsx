/**
 * @name 业财闭环
 * @description 租赁→能源→采购保险全链条业财一体化总览导航；多会话建设入口
 */
import React, { useEffect, useMemo } from 'react';
import {
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import { clearHostPrototypeRouteInfo } from '../../common/useHashPage';
import '../../resources/design-system/oneos-ds-tokens.css';
import { BizFinanceClosedLoopHub } from './BizFinanceClosedLoopHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-hub.css';

export default function BizFinanceClosedLoop() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '业财闭环' }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <BizFinanceClosedLoopHub />
    </PrototypeAnnotationHost>
  );
}
