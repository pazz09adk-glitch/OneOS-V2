/**
 * @name 业财·客户风险
 * @description KA/LA/SMB 宽限 + 法务/安全/财务三维评分；红线预警与新签特批
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
import { CustomerRiskHub } from './CustomerRiskHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-risk.css';

export default function BfclCustomerRisk() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '业财·客户风险' }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <CustomerRiskHub />
    </PrototypeAnnotationHost>
  );
}
