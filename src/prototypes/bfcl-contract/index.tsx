/**
 * @name 业财·签约锁死
 * @description 标准合同模板→租赁合同；非标审批；E签宝/线下签章闭环；未闭环催办常驻
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
import { ContractHub } from './ContractHub';
import annotationSourceDocument from './annotation-source.json';
import './styles/bfcl-shared.css';

export default function App() {
  useEffect(() => {
    clearHostPrototypeRouteInfo();
  }, []);
  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({ title: '业财·签约锁死' }),
    [],
  );
  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <ContractHub />
    </PrototypeAnnotationHost>
  );
}
