/**
 * @name 业财·租赁账单
 * @description 交车起算；25日生成；KA/LA/SMB宽限；收款关联闭环
 * layout(detail): fullBleed
 */
import React, { useEffect, useMemo } from 'react';
import {
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import { clearHostPrototypeRouteInfo } from '../../common/useHashPage';
import '../../resources/design-system/oneos-ds-tokens.css';
import '../../resources/design-system/oneos-ds-filter-affordance.css';
import '../../common/vm-operation-actions.css';
import { LeaseBillHub } from './LeaseBillHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-shared.css';

export default function App() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);
  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '业财·租赁账单' }),
    [],
  );
  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <LeaseBillHub />
    </PrototypeAnnotationHost>
  );
}
