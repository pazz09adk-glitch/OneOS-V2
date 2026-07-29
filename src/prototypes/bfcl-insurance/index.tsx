/**
 * @name 业财·保险采购
 * @description 供应商账户→比价通过自动付款任务→付款关联→批量保单一车多保
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
import { InsuranceHub } from './InsuranceHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-shared.css';

export default function App() {
  useEffect(() => { clearHostPrototypeRouteInfo(); }, []);
  const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({ title: '业财·保险采购' }), []);
  return (
    <PrototypeAnnotationHost source={annotationSourceDocument as unknown as AnnotationSourceDocument} options={annotationOptions}>
      <InsuranceHub />
    </PrototypeAnnotationHost>
  );
}
