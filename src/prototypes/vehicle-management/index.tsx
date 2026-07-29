/**
 * @name 车辆资产
 * OneOS V2 单页：列表台账 + 页内详情（无看板/主从切换，无下级页面）
 */
import '../../resources/design-system/oneos-ds-tokens.css';
import '../../common/vm-pagination.css';
import '../../common/vm-operation-actions.css';
import '../../common/ln-numeric.css';
import './style.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import seedVehicles from './data/vehicles.json';
import seedInsurancePurchases from './data/insurance-purchases.json';
import annotationSourceDocument from './annotation-source.json';
import type {
  InsurancePurchaseRecord,
  KpiKey,
  VehicleFilters,
  VehicleRecord,
} from './types';
import { EMPTY_FILTERS } from './types';
import { applyFilters } from './utils/filters';
import { countKpi, formatOpsAssignNow, normalizeVehicleRecords, resolveOpsAssignLogs } from './utils/vehicle';
import { buildInsuranceExpireMap } from './utils/insurance';
import { ListView, DEFAULT_PAGE_SIZE } from './components/ListView';
import { DetailView } from './components/DetailView';
import {
  ImportModal,
  OperateCityModal,
  OpsManagerModal,
  Toast,
  VehicleEditModal,
} from './components/Modals';
import { MapModal } from './components/VehicleLocationMap';

export default function VehicleAssetsApp() {
  const [records, setRecords] = useState<VehicleRecord[]>(() => normalizeVehicleRecords(seedVehicles as VehicleRecord[]));
  const [pendingFilters, setPendingFilters] = useState<VehicleFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<VehicleFilters>(EMPTY_FILTERS);
  const [kpiTab, setKpiTab] = useState<KpiKey>('all');
  const [listPage, setListPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [opsRecord, setOpsRecord] = useState<VehicleRecord | null>(null);
  const [cityRecord, setCityRecord] = useState<VehicleRecord | null>(null);
  const [mapRecord, setMapRecord] = useState<VehicleRecord | null>(null);
  const [editRecord, setEditRecord] = useState<VehicleRecord | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2800);
  }, []);

  const insuranceMap = useMemo(
    () => buildInsuranceExpireMap(seedInsurancePurchases as InsurancePurchaseRecord[]),
    [],
  );

  const kpiCounts = useMemo(() => ({
    all: countKpi(records, 'all'),
    lease: countKpi(records, 'lease'),
    logistics: countKpi(records, 'logistics'),
    stock: countKpi(records, 'stock'),
    nonOperating: countKpi(records, 'nonOperating'),
    exit: countKpi(records, 'exit'),
    licenseAbnormal: countKpi(records, 'licenseAbnormal'),
    insuranceAbnormal: countKpi(records, 'insuranceAbnormal'),
  }), [records]);

  const filtered = useMemo(
    () => applyFilters(records, appliedFilters, kpiTab, insuranceMap),
    [records, appliedFilters, kpiTab, insuranceMap],
  );

  // 兼容旧链接 #page=list|detail：清掉 hash，避免侧栏再出现下级页面
  useEffect(() => {
    const hash = window.location.hash || '';
    if (!hash.includes('page=')) return;
    const next = hash
      .replace(/^#/, '')
      .split('&')
      .filter((part) => !part.startsWith('page='))
      .join('&');
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next ? `#${next}` : ''}`);
  }, []);

  const detailRecord = useMemo(
    () => records.find((r) => r.id === detailId) || null,
    [records, detailId],
  );

  const openDetail = (record: VehicleRecord) => {
    setDetailId(record.id);
  };

  const closeDetail = () => {
    setDetailId(null);
  };

  /** 与 annotation-source.json 节点 pageId（list|detail）对齐，供页面标注点过滤 */
  const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    showThemeToggle: true,
    showColorFilter: true,
    emptyWhenNoData: false,
    toolbarEdge: 'right',
    currentPageId: detailRecord ? 'detail' : 'list',
  }), [detailRecord]);

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <main className="va-page" aria-label="车辆资产">
        {detailRecord ? (
          <DetailView
            record={detailRecord}
            insurance={insuranceMap.get(detailRecord.id)}
            onBack={closeDetail}
            onOps={() => setOpsRecord(detailRecord)}
            onOperateCity={() => setCityRecord(detailRecord)}
            onUpdate={(patch) => {
              setRecords((prev) => prev.map((r) => (
                r.id === detailRecord.id ? { ...r, ...patch } : r
              )));
            }}
            onToast={showToast}
          />
        ) : (
          <div className="va-shell">
            <ListView
              records={records}
              kpiCounts={kpiCounts}
              kpiTab={kpiTab}
              onKpiChange={(key) => {
                setKpiTab(key);
                setListPage(1);
              }}
              pendingFilters={pendingFilters}
              appliedFilters={appliedFilters}
              onPendingChange={setPendingFilters}
              onSearch={(nextFilters) => {
                setPendingFilters(nextFilters || pendingFilters);
                setAppliedFilters(nextFilters || pendingFilters);
                setListPage(1);
              }}
              onReset={() => {
                setPendingFilters(EMPTY_FILTERS);
                setAppliedFilters(EMPTY_FILTERS);
                setListPage(1);
              }}
              filtered={filtered}
              insuranceMap={insuranceMap}
              onOpenDetail={openDetail}
              onExport={() => showToast(`导出功能（原型演示）：当前列表共 ${filtered.length} 条`)}
              onImportOpen={() => setImportOpen(true)}
              onOps={setOpsRecord}
              onOperateCity={setCityRecord}
              onMap={setMapRecord}
              onEdit={setEditRecord}
              onToast={showToast}
              page={listPage}
              pageSize={pageSize}
              onPageChange={setListPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setListPage(1);
              }}
            />
          </div>
        )}

        {importOpen ? (
          <ImportModal
            onClose={() => setImportOpen(false)}
            onImport={(file, duplicateMode) => {
              const modeLabel =
                duplicateMode === 'overwrite' ? '覆盖重复'
                  : duplicateMode === 'error' ? '报错'
                    : '跳过重复';
              showToast(`已接收 ${file.name}（${modeLabel}，主键：车辆识别代码），导入校验为原型演示`);
              setImportOpen(false);
            }}
          />
        ) : null}

        {opsRecord ? (
          <OpsManagerModal
            record={opsRecord}
            onClose={() => setOpsRecord(null)}
            onSave={(managers) => {
              const log = {
                id: `ops-${opsRecord.id}-${Date.now()}`,
                operatedAt: formatOpsAssignNow(),
                operator: '运维主管',
                assignees: managers,
              };
              setRecords((prev) => prev.map((r) => {
                if (r.id !== opsRecord.id) return r;
                const prevLogs = resolveOpsAssignLogs(r);
                return {
                  ...r,
                  opsManagers: managers,
                  opsAssignLogs: [log, ...prevLogs].slice(0, 20),
                };
              }));
              setOpsRecord(null);
              showToast('运维负责人已更新');
            }}
          />
        ) : null}

        {cityRecord ? (
          <OperateCityModal
            record={cityRecord}
            onClose={() => setCityRecord(null)}
            onSave={(location) => {
              const updatedAt = formatOpsAssignNow();
              setRecords((prev) => prev.map((r) => (
                r.id === cityRecord.id
                  ? {
                    ...r,
                    location,
                    operateCitySource: '人工' as const,
                    /* 人工维护：以本次修改时间作为列表 / 详情「更新时间」 */
                    gpsTime: updatedAt,
                  }
                  : r
              )));
              setCityRecord(null);
              showToast('运营城市已更新');
            }}
          />
        ) : null}

        {editRecord ? (
          <VehicleEditModal
            record={editRecord}
            onClose={() => setEditRecord(null)}
            onSave={(next) => {
              setRecords((prev) => prev.map((r) => (r.id === next.id ? next : r)));
              setEditRecord(null);
              showToast('车辆信息已更新');
            }}
          />
        ) : null}

        {mapRecord ? (
          <MapModal record={mapRecord} onClose={() => setMapRecord(null)} />
        ) : null}

        <Toast message={toast} />
      </main>
    </PrototypeAnnotationHost>
  );
}
