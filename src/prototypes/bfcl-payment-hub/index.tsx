/**
 * @name 业财·收付款中枢
 * @description 财务收款/付款记录导入与业务单据关联；无关联不得假性结清
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
import { PaymentHub } from './PaymentHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-pay.css';

export default function BfclPaymentHub() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '业财·收付款中枢' }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <PaymentHub />
    </PrototypeAnnotationHost>
  );
}
