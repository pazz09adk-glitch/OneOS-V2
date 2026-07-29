/**
 * @name 还车应结款
 * @description OneOS V2 还车应结款：三视角台账 + 费用明细；无忧包按各车型收费方案自动核算；安全板块自动展示本段违章事故
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
import { VehicleReturnSettlementHub } from './VehicleReturnSettlementHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/vrs.css';

export default function VehicleReturnSettlement() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({
      title: '还车应结款',
    }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <VehicleReturnSettlementHub />
    </PrototypeAnnotationHost>
  );
}
