/**
 * @name 业财·提车应收
 * @description 15日前后算法出应收；收款关联付清或特批后可交车
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
import { PickupHub } from './PickupHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-shared.css';

export default function BfclPickupReceivable() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);
  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '业财·提车应收' }),
    [],
  );
  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <PickupHub />
    </PrototypeAnnotationHost>
  );
}
