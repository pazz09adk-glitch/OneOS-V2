/**
 * @name 任务工单
 * OneOS V2 统一运营管理平台 · 采购管理与工单协同
 */

import React, { useEffect, useMemo, useState } from 'react';
import * as dayjsModule from 'dayjs';
import { Plus, CheckCircle2, List, LayoutGrid, Columns } from 'lucide-react';
import {
  AnnotationSourceDocument,
  AnnotationViewerOptions,
} from '@axhub/annotation';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import {
  consumeWorkOrderPrefill,
  bumpLinkedWorkOrders,
} from '../../common/vehicle-purchase';
import {
  V2Button,
  V2SegmentedControl,
} from '../../resources/design-system/components/UIComponents';
import { BentoKpiGrid } from './components/BentoKpiGrid';
import { ContractWizardModal } from './components/ContractWizardModal';
import { FilterPanel } from './components/FilterPanel';
import { KanbanViewBoard } from './components/KanbanViewBoard';
import { ListViewTable } from './components/ListViewTable';
import { SplitMasterDetail } from './components/SplitMasterDetail';
import { TaskCreatePage } from './components/TaskCreatePage';
import { TaskDetailPage } from './components/TaskDetailPage';
import { UrgeModal } from './components/UrgeModal';
import {
  buildInitialTasks,
  CURRENT_USER,
  MOCK_OWNERS,
  MOCK_PURCHASE_CONTRACTS,
  MOCK_VEHICLES,
} from './mockData';
import {
  findMileageRuleConflictVehicleIds,
  formatMileageConflictMessage,
  platesOfVehicles,
  resolveRelatedBiz,
} from './relatedBiz';
import { generateWorkOrderCode, generateWorkOrderCodes } from './workOrderCode';
import {
  HubPage,
  TaskFilters,
  TaskWorkOrder,
  ViewMode,
  ViewTab,
} from './types';

import '../../resources/design-system/oneos-ds-tokens.css';
import './styles/task-work-order-v2.css';
import annotationSourceDocument from './annotation-source.json';

const dayjsFn: any = (dayjsModule as any).default || dayjsModule;

const EMPTY_FILTERS: TaskFilters = {
  taskType: 'all',
  status: 'all',
  relatedBizType: 'all',
  ownerId: '',
  keyword: '',
  startDate: '',
  endDate: '',
};

export function TaskWorkOrderHub() {
  const [tasks, setTasks] = useState<TaskWorkOrder[]>(() => buildInitialTasks());
  const [viewTab, setViewTab] = useState<ViewTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({ ...EMPTY_FILTERS });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [hubPage, setHubPage] = useState<HubPage>('ledger');

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [contractWizardOpen, setContractWizardOpen] = useState(false);
  const [urgeTask, setUrgeTask] = useState<TaskWorkOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const payload = consumeWorkOrderPrefill() as any;
    if (!payload || !payload.contractId) return;

    const contract =
      MOCK_PURCHASE_CONTRACTS.find((c) => c.id === payload.contractId) || {
        id: payload.contractId,
        code: payload.contractCode,
        clauses: {},
      };

    if (payload.batch && Array.isArray(payload.rows) && payload.rows.length) {
      const now = dayjsFn().format('YYYY-MM-DD HH:mm');
      setTasks((prev) => {
        const mileageRows = payload.rows.filter(
          (row: any) => (row.clauseType || row.taskType) === 'mileage'
        );
        const batchVehicleIds: string[] = [
          ...new Set(
            mileageRows.flatMap((row: any) => row.vehicleIds || []) as string[]
          ),
        ];
        const conflictIds = findMileageRuleConflictVehicleIds(batchVehicleIds, prev);
        if (conflictIds.length) {
          showToast(
            formatMileageConflictMessage(platesOfVehicles(conflictIds, MOCK_VEHICLES))
          );
          return prev;
        }

        const codes = generateWorkOrderCodes(
          prev.map((t) => t.code),
          payload.rows.length
        );
        const created: TaskWorkOrder[] = payload.rows.map((row: any, idx: number) => {
          const taskType = row.clauseType === 'general' ? 'general' : row.clauseType;
          const code = codes[idx];
          const contractCode = contract.code || payload.contractCode;
          return {
            id: `wo-prefill-${Date.now()}-${idx}`,
            code,
            taskType,
            title: row.title || `${taskType} · ${contract.code}`,
            requirement:
              row.requirement ||
              (contract.clauses && (contract.clauses as any)[row.clauseType]) ||
              '—',
            source: 'contract' as const,
            contractId: contract.id,
            contractCode,
            relatedBizType: 'purchase_contract' as const,
            relatedBizId: contract.id,
            relatedBizCode: contractCode,
            vehicleIds: row.vehicleIds || [],
            periodStart: dayjsFn().format('YYYY-MM-DD'),
            periodEnd: dayjsFn().add(30, 'day').format('YYYY-MM-DD'),
            initiatorId: CURRENT_USER.id,
            accountableOwnerId: row.accountableOwnerId || 'u_chen',
            currentOwnerId: row.currentOwnerId || 'u_zhang',
            status: 'pending' as const,
            createdAt: now,
            feedbacks: [],
            timeline: [
              {
                at: now,
                action: '发布任务',
                operator: CURRENT_USER.name,
                remark: `自采购合同 ${payload.contractCode} 批量拆解`,
              },
            ],
            syncWorkbench: true,
          };
        });
        bumpLinkedWorkOrders(payload.contractId, created.length);
        const hasMileage = created.some((t) => t.taskType === 'mileage' && t.vehicleIds.length);
        showToast(
          hasMileage
            ? `已批量发布 ${created.length} 条工单，里程规则已同步至车辆资产 · 里程任务`
            : `已按采购合同批量发布 ${created.length} 条协同工单`
        );
        return [...created, ...prev];
      });
      return;
    }

    setContractWizardOpen(true);
    showToast(`已载入采购合同 ${payload.contractCode}，请确认信息后发布工单`);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (viewTab === 'published' && t.initiatorId !== CURRENT_USER.id) return false;
      if (viewTab === 'supervise' && t.accountableOwnerId !== CURRENT_USER.id) return false;

      if (kpiFilter === 'active' && t.status !== 'pending' && t.status !== 'in_progress')
        return false;
      if (kpiFilter === 'overdue' && t.status !== 'overdue') return false;
      if (kpiFilter === 'mileage' && t.taskType !== 'mileage') return false;

      if (filters.taskType && filters.taskType !== 'all' && t.taskType !== filters.taskType)
        return false;
      if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;

      if (filters.relatedBizType && filters.relatedBizType !== 'all') {
        const related = resolveRelatedBiz(t);
        if (related.type !== filters.relatedBizType) return false;
      }
      if (filters.ownerId && t.currentOwnerId !== filters.ownerId) return false;

      if (filters.startDate && (t.createdAt || '').slice(0, 10) < filters.startDate) return false;
      if (filters.endDate && (t.createdAt || '').slice(0, 10) > filters.endDate) return false;

      if (filters.keyword) {
        const kw = filters.keyword.trim().toLowerCase();
        const related = resolveRelatedBiz(t);
        const matchTitle = t.title.toLowerCase().includes(kw);
        const matchCode = t.code.toLowerCase().includes(kw);
        const matchRelated = (related.code || '').toLowerCase().includes(kw);
        if (!matchTitle && !matchCode && !matchRelated) return false;
      }

      return true;
    });
  }, [tasks, viewTab, kpiFilter, filters]);

  const detailTask = useMemo(
    () => (detailTaskId ? tasks.find((t) => t.id === detailTaskId) || null : null),
    [detailTaskId, tasks]
  );

  const tabCounts = useMemo(
    () => ({
      all: tasks.length,
      published: tasks.filter((t) => t.initiatorId === CURRENT_USER.id).length,
      supervise: tasks.filter((t) => t.accountableOwnerId === CURRENT_USER.id).length,
    }),
    [tasks]
  );

  /** @returns false 表示被门禁拦截 */
  const handleCreateTask = (taskData: Partial<TaskWorkOrder>): boolean => {
    const vehicleIds = taskData.vehicleIds || [];
    if (taskData.taskType === 'mileage' && vehicleIds.length) {
      const conflictIds = findMileageRuleConflictVehicleIds(vehicleIds, tasks);
      if (conflictIds.length) {
        showToast(
          formatMileageConflictMessage(platesOfVehicles(conflictIds, MOCK_VEHICLES))
        );
        return false;
      }
    }

    const now = dayjsFn().format('YYYY-MM-DD HH:mm');
    const newCode = generateWorkOrderCode(tasks.map((t) => t.code));

    const relatedBizType =
      taskData.relatedBizType ||
      (taskData.contractCode ? 'purchase_contract' : undefined);
    const relatedBizCode = taskData.relatedBizCode || taskData.contractCode;
    const relatedBizId = taskData.relatedBizId || taskData.contractId;
    const dataAdjustItems = taskData.dataAdjustItems;
    const isDataAdjust = taskData.taskType === 'data_adjustment';
    const accountableId = taskData.accountableOwnerId || CURRENT_USER.id;

    const timeline = (() => {
      const base = {
        at: now,
        operator: CURRENT_USER.name,
      };
      if (isDataAdjust) {
        const n = dataAdjustItems?.length || 0;
        const supervisor = MOCK_OWNERS.find((o) => o.id === accountableId)?.name || '部门主管';
        return [
          {
            ...base,
            action: '新增发布',
            remark: relatedBizCode
              ? `业务数据调整 · ${n} 条明细 · ${relatedBizCode}`
              : `业务数据调整 · ${n} 条明细`,
          },
          {
            at: now,
            action: '系统指定归口',
            operator: '系统',
            remark: `已指定部门主管${supervisor}`,
          },
          {
            at: now,
            action: '交办数智中心',
            operator: '系统',
            remark: '待主管审批通过后由数智部处理（原型演示）',
          },
        ];
      }
      return [
        {
          ...base,
          action: taskData.source === 'contract' ? '自合同发布' : '新增发布',
          remark: relatedBizCode ? `关联业务工单 ${relatedBizCode}` : '自新建发布',
        },
      ];
    })();

    const newTask: TaskWorkOrder = {
      id: `wo-${Date.now()}`,
      code: newCode,
      taskType: taskData.taskType || 'general',
      title: taskData.title || `协同任务 · ${newCode}`,
      requirement: taskData.requirement || '—',
      source: taskData.source || 'standalone',
      contractId: taskData.contractId,
      contractCode: taskData.contractCode,
      relatedBizType,
      relatedBizCode,
      relatedBizId,
      dataAdjustItems,
      vehicleIds,
      periodStart: taskData.periodStart,
      periodEnd: taskData.periodEnd,
      mileageTarget: taskData.mileageTarget,
      mileageMode: taskData.mileageMode || 'period_avg',
      initiatorId: CURRENT_USER.id,
      accountableOwnerId: accountableId,
      currentOwnerId: taskData.currentOwnerId || CURRENT_USER.id,
      status: 'pending',
      createdAt: now,
      feedbacks: [],
      timeline,
      syncWorkbench: true,
    };

    setTasks((prev) => [newTask, ...prev]);
    setContractWizardOpen(false);
    setHubPage('ledger');
    setDetailTaskId(null);

    if (taskData.contractId) {
      bumpLinkedWorkOrders(taskData.contractId, 1);
    }

    const mileageSynced =
      newTask.taskType === 'mileage' && newTask.vehicleIds.length > 0;
    showToast(
      mileageSynced
        ? `工单 ${newCode} 已发布；里程规则已同步至车辆资产 · 里程任务`
        : isDataAdjust
          ? `工单 ${newCode} 已发布（业务数据调整 · ${dataAdjustItems?.length || 0} 条明细）`
          : `工单 ${newCode} 已成功发布，并同步至执行人待办`
    );
    return true;
  };

  const handleSubmitUrge = (taskId: string, remark: string, channels: string[]) => {
    const now = dayjsFn().format('YYYY-MM-DD HH:mm');
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          timeline: [
            ...t.timeline,
            {
              at: now,
              action: `催办 (${channels.join('/')})`,
              operator: CURRENT_USER.name,
              remark,
            },
          ],
        };
      })
    );
    setUrgeTask(null);
    showToast(`已向执行人发送催办提醒 (${channels.length} 通道)` + ' (原型演示)');
  };

  const handleSearch = () => setShowMoreFilters(false);

  const resetFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setKpiFilter(null);
    setShowMoreFilters(false);
  };

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({
      showToolbar: true,
      showThemeToggle: true,
      showColorFilter: true,
      emptyWhenNoData: false,
      toolbarEdge: 'right',
      currentPageId:
        hubPage === 'create' ? 'create' : hubPage === 'detail' ? 'detail' : 'list',
    }),
    [hubPage]
  );

  const openDetail = (task: TaskWorkOrder) => {
    setDetailTaskId(task.id);
    setHubPage('detail');
  };

  const backToLedger = () => {
    setHubPage('ledger');
    setDetailTaskId(null);
  };

  return (
    <div className="v2-two-container">
      {toastMessage && (
        <div className="v2-two-toast" role="status">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {hubPage === 'create' ? (
        <TaskCreatePage onBack={backToLedger} onSubmit={handleCreateTask} />
      ) : hubPage === 'detail' && detailTask ? (
        <TaskDetailPage
          task={detailTask}
          onBack={backToLedger}
          onUrge={(task) => setUrgeTask(task)}
        />
      ) : (
        <>
          <div className="v2-two-topbar">
            <V2SegmentedControl
              value={viewMode}
              onChange={setViewMode}
              options={[
                { key: 'list', label: '列表视图', icon: <List size={14} /> },
                { key: 'kanban', label: '看板视图', icon: <LayoutGrid size={14} /> },
                { key: 'split', label: '主从工作台', icon: <Columns size={14} /> },
              ]}
            />
            <div className="v2-two-topbar-actions">
              <V2Button
                variant="primary"
                size="md"
                icon={<Plus size={14} />}
                onClick={() => setHubPage('create')}
              >
                新增工单
              </V2Button>
            </div>
          </div>

          {viewMode !== 'split' && (
            <BentoKpiGrid
              tasks={tasks}
              viewTab={viewTab}
              currentKpiFilter={kpiFilter}
              onKpiSelect={setKpiFilter}
            />
          )}

          {viewMode !== 'split' && (
            <div
              className={[
                'v2-two-ledger-stack',
                viewMode === 'kanban' ? 'is-board' : '',
                showMoreFilters ? 'is-filters-open' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <FilterPanel
                viewTab={viewTab}
                onViewTabChange={setViewTab}
                tabCounts={tabCounts}
                filters={filters}
                onFilterChange={setFilters}
                onSearch={handleSearch}
                onReset={resetFilters}
                showMoreFilters={showMoreFilters}
                onToggleMoreFilters={() => setShowMoreFilters((v) => !v)}
                connected={viewMode === 'list' && !showMoreFilters}
              />

              {viewMode === 'list' && (
                <ListViewTable
                  tasks={filteredTasks}
                  onViewDetail={openDetail}
                  onUrge={(task) => setUrgeTask(task)}
                  connected={!showMoreFilters}
                />
              )}

              {viewMode === 'kanban' && (
                <KanbanViewBoard
                  tasks={filteredTasks}
                  onViewDetail={openDetail}
                  onUrge={(task) => setUrgeTask(task)}
                />
              )}
            </div>
          )}

          {viewMode === 'split' && (
            <SplitMasterDetail
              tasks={filteredTasks}
              onUrge={(task) => setUrgeTask(task)}
              onOpenFullDetail={openDetail}
            />
          )}
        </>
      )}

      <ContractWizardModal
        open={contractWizardOpen}
        onCancel={() => setContractWizardOpen(false)}
        onSubmit={handleCreateTask}
      />

      <UrgeModal
        task={urgeTask}
        open={!!urgeTask}
        onCancel={() => setUrgeTask(null)}
        onSubmitUrge={handleSubmitUrge}
      />

      <PrototypeAnnotationHost
        source={annotationSourceDocument as AnnotationSourceDocument}
        options={annotationOptions}
      />
    </div>
  );
}

export default TaskWorkOrderHub;
