/**
 * @name 业财·能源氢费
 * @description 预付/充值关联入账；核对后扣费；客户月结收款；加氢站付款
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
import { EnergyHub } from './EnergyHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-shared.css';

export default function App() {
  useEffect(() => { clearHostPrototypeRouteInfo(); }, []);
  const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({ title: '业财·能源氢费' }), []);
  return (
    <PrototypeAnnotationHost source={annotationSourceDocument as unknown as AnnotationSourceDocument} options={annotationOptions}>
      <EnergyHub />
    </PrototypeAnnotationHost>
  );
}
