/**
 * @name 应收催款
 * @description 分期期末金额 + 当前总欠款台账；生成催款单并模拟E签宝盖章版归档
 * layout(detail|notice): fullBleed
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
import { ReceivableDunningHub } from './ReceivableDunningHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/rd.css';

export default function ReceivableDunning() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({
      title: '应收催款',
    }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <ReceivableDunningHub />
    </PrototypeAnnotationHost>
  );
}
