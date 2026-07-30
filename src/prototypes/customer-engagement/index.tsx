/**
 * @name 客户对接过程管理
 * @description 签约前客户主体独占认领、跟进过程、准入衔接与建合同门禁
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
import '../../common/detail-entry.css';
import { EngagementHub } from './EngagementHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/ce.css';

export default function CustomerEngagementApp() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '客户对接过程管理' }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <EngagementHub />
    </PrototypeAnnotationHost>
  );
}
