/**
 * @name 业财·还车应结
 * @description E签宝退租日；应收/应退分走收付闭环；明细含ETC/氢差/运维/安全
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
import { ReturnHub } from './ReturnHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-shared.css';

export default function App() {
  useEffect(() => { clearHostPrototypeRouteInfo(); }, []);
  const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({ title: '业财·还车应结' }), []);
  return (
    <PrototypeAnnotationHost source={annotationSourceDocument as unknown as AnnotationSourceDocument} options={annotationOptions}>
      <ReturnHub />
    </PrototypeAnnotationHost>
  );
}
