import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Truck,
  Wrench,
  Calendar,
  Layers,
  Building2,
} from 'lucide-react';
import type { RoleId, RoleConfig, DeptId } from '../types';
import { ROLE_CONFIGS, DEPT_CONFIGS } from '../data/roles';
import { V2Select, V2Empty } from '../../../resources/design-system/components/UIComponents';

/** 客户交车：在租数量 / 租赁数量，占比 = 在租 ÷ 租赁 */
const CUSTOMER_FLEET_ROWS = [
  { id: 'hz', name: '杭州城配物流有限公司', inRent: 45, leased: 52 },
  { id: 'sh', name: '上海港城配短驳服务部', inRent: 38, leased: 45 },
  { id: 'sz', name: '苏州冷链速运有限公司', inRent: 25, leased: 30 },
  { id: 'nb', name: '宁波港区氢能配送中心', inRent: 20, leased: 24 },
  { id: 'jx', name: '嘉兴城际绿运有限公司', inRent: 14, leased: 17 },
] as const;

function calcRentShare(inRent: number, leased: number): number {
  if (leased <= 0) return 0;
  return (inRent / leased) * 100;
}

export interface RoleInsightsCockpitProps {
  currentRole: RoleConfig;
  activeRoleIds: RoleId[];
  onCockpitRoleSwitch?: (roleId: RoleId) => void;
}

export const RoleInsightsCockpit: React.FC<RoleInsightsCockpitProps> = ({
  currentRole,
  activeRoleIds,
  onCockpitRoleSwitch,
}) => {
  const [selectedCockpitRoleId, setSelectedCockpitRoleId] = useState<RoleId>(currentRole.id);
  const [reviewMonth, setReviewMonth] = useState<'current' | 'next'>('current');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('all');

  useEffect(() => {
    if (!activeRoleIds.includes(selectedCockpitRoleId)) {
      setSelectedCockpitRoleId(currentRole.id);
    }
  }, [activeRoleIds, currentRole.id, selectedCockpitRoleId]);

  const activeCockpitRoleId = activeRoleIds.includes(selectedCockpitRoleId)
    ? selectedCockpitRoleId
    : currentRole.id;

  const cockpitRole = ROLE_CONFIGS[activeCockpitRoleId];
  const boundDeptId = cockpitRole.boundDeptId as DeptId | undefined;
  const dept = boundDeptId ? DEPT_CONFIGS[boundDeptId] : undefined;

  const customerFilterOptions = useMemo(
    () => [
      { value: 'all', label: '全部客户' },
      ...CUSTOMER_FLEET_ROWS.map((row) => ({ value: row.id, label: row.name })),
    ],
    [],
  );

  const customerFleetMetrics = useMemo(() => {
    if (selectedCustomerFilter === 'all') {
      const inRent = CUSTOMER_FLEET_ROWS.reduce((sum, row) => sum + row.inRent, 0);
      const leased = CUSTOMER_FLEET_ROWS.reduce((sum, row) => sum + row.leased, 0);
      return {
        scopeLabel: '全部客户合计',
        inRent,
        leased,
        share: calcRentShare(inRent, leased),
      };
    }
    const row = CUSTOMER_FLEET_ROWS.find((item) => item.id === selectedCustomerFilter);
    if (!row) {
      return { scopeLabel: '全部客户合计', inRent: 0, leased: 0, share: 0 };
    }
    return {
      scopeLabel: row.name,
      inRent: row.inRent,
      leased: row.leased,
      share: calcRentShare(row.inRent, row.leased),
    };
  }, [selectedCustomerFilter]);

  const showRoleTabs = activeRoleIds.length > 1;

  const renderBizTri = () => (
    <div className="v2-wb-tri-grid">
      <div
        className="v2-wb-cockpit-col v2-wb-fleet-card"
        data-annotation-id="wb-customer-fleet"
      >
        <div className="v2-wb-cockpit-col__title">
          <span className="v2-wb-fleet-card__heading">
            <TrendingUp size={14} style={{ color: 'var(--oneos-primary)' }} />
            客户交车在租大盘
          </span>
          <div className="v2-wb-fleet-card__filter">
            <V2Select
              searchable
              options={customerFilterOptions}
              value={selectedCustomerFilter}
              onChange={(val) => setSelectedCustomerFilter(String(val))}
              placeholder="全部客户"
            />
          </div>
        </div>

        <p className="v2-wb-fleet-card__scope" title={customerFleetMetrics.scopeLabel}>
          {customerFleetMetrics.scopeLabel}
        </p>

        <div className="v2-wb-fleet-card__metrics">
          <div className="v2-wb-fleet-card__metric">
            <div className="v2-wb-fleet-card__metric-label">在租数量</div>
            <div className="v2-wb-fleet-card__metric-value">
              <span className="v2-wb-fleet-card__metric-num is-primary">
                {customerFleetMetrics.inRent}
              </span>
              <span className="v2-wb-fleet-card__metric-unit">辆</span>
            </div>
          </div>
          <div className="v2-wb-fleet-card__metric-divider" aria-hidden />
          <div className="v2-wb-fleet-card__metric">
            <div className="v2-wb-fleet-card__metric-label">租赁数量</div>
            <div className="v2-wb-fleet-card__metric-value">
              <span className="v2-wb-fleet-card__metric-num">
                {customerFleetMetrics.leased}
              </span>
              <span className="v2-wb-fleet-card__metric-unit">辆</span>
            </div>
          </div>
        </div>

        <div className="v2-wb-fleet-card__ratio">
          <div className="v2-wb-fleet-card__ratio-head">
            <span>在租占比</span>
            <strong className="v2-wb-fleet-card__ratio-value">
              {customerFleetMetrics.share.toFixed(2)}%
            </strong>
          </div>
          <div
            className="v2-wb-fleet-card__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number(customerFleetMetrics.share.toFixed(2))}
          >
            <div
              className="v2-wb-fleet-card__fill"
              style={{ width: `${Math.min(100, customerFleetMetrics.share)}%` }}
            />
          </div>
          <p className="v2-wb-fleet-card__ratio-hint">占比 = 在租数量 ÷ 租赁数量</p>
        </div>
      </div>

      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PieChart size={14} style={{ color: 'var(--oneos-primary)' }} />
            车型业务占比
          </span>
        </div>
        <div className="v2-wb-stat-list">
          <div className="v2-wb-stat-row">
            <span>18T 氢能重卡</span>
            <strong>82 辆 (57.75%)</strong>
          </div>
          <div className="v2-wb-stat-row">
            <span>4.5T 氢能轻卡</span>
            <strong>48 辆 (33.80%)</strong>
          </div>
          <div className="v2-wb-stat-row">
            <span>氢能团体客车</span>
            <strong>12 辆 (8.45%)</strong>
          </div>
        </div>
      </div>

      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} style={{ color: 'var(--oneos-primary)' }} />
            省市运营区域分布
          </span>
        </div>
        <div className="v2-wb-stat-list">
          <div className="v2-wb-stat-row">
            <span>浙江省 (杭州/宁波)</span>
            <strong>65 辆 (45.77%)</strong>
          </div>
          <div className="v2-wb-stat-row">
            <span>上海市 (金山/浦东)</span>
            <strong>52 辆 (36.62%)</strong>
          </div>
          <div className="v2-wb-stat-row">
            <span>江苏省 (苏州/无锡)</span>
            <strong>25 辆 (17.61%)</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOpsQuad = () => (
    <div className="v2-wb-ops-grid">
      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} style={{ color: 'var(--oneos-primary)' }} />
            年审执行率
          </span>
          <div className="v2-wb-mini-tabs">
            <button
              type="button"
              className={reviewMonth === 'current' ? 'is-on' : ''}
              onClick={() => setReviewMonth('current')}
            >
              本月
            </button>
            <button
              type="button"
              className={reviewMonth === 'next' ? 'is-on' : ''}
              onClick={() => setReviewMonth('next')}
            >
              下月
            </button>
          </div>
        </div>
        <div className="v2-wb-big-metric">
          <span className="is-primary">
            {reviewMonth === 'current' ? '87.5%' : '60.0%'}
          </span>
          <small>{reviewMonth === 'current' ? '7/8 辆已完成' : '3/5 辆已完成'}</small>
        </div>
        <div className="v2-wb-fleet-card__track">
          <div
            className="v2-wb-fleet-card__fill"
            style={{ width: reviewMonth === 'current' ? '87.5%' : '60%' }}
          />
        </div>
      </div>

      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Truck size={14} style={{ color: 'var(--oneos-primary)' }} />
            车辆运营分布
          </span>
        </div>
        <div className="v2-wb-mini-kpi-grid">
          <div>
            <div className="muted">长租在运营</div>
            <strong>142 辆</strong>
          </div>
          <div>
            <div className="muted">在库闲置</div>
            <strong className="is-warn">18 辆</strong>
          </div>
        </div>
      </div>

      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} style={{ color: 'var(--oneos-primary)' }} />
            交还车工单
          </span>
        </div>
        <div className="v2-wb-stat-list">
          <div className="v2-wb-stat-row">
            <span>本周拟交付</span>
            <strong className="is-primary">15 辆</strong>
          </div>
          <div className="v2-wb-stat-row">
            <span>本周拟退车</span>
            <strong>3 辆</strong>
          </div>
        </div>
      </div>

      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wrench size={14} style={{ color: 'var(--oneos-primary)' }} />
            故障处置闭环率
          </span>
        </div>
        <div className="v2-wb-big-metric">
          <span className="is-success">80.0%</span>
          <small>4/5 起已归档</small>
        </div>
        <div className="muted tiny">1 起排故中（沪A12345F 挂起索赔中）</div>
      </div>
    </div>
  );

  const renderFinanceDual = () => (
    <div className="v2-wb-tri-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ color: 'var(--oneos-primary)' }} />
            本月回款完成率
          </span>
        </div>
        <div className="v2-wb-big-metric">
          <span className="is-primary">72.4%</span>
          <small>实收 ¥8.6M / 应收 ¥11.9M</small>
        </div>
        <div className="v2-wb-fleet-card__track">
          <div className="v2-wb-fleet-card__fill" style={{ width: '72.4%' }} />
        </div>
      </div>
      <div className="v2-wb-cockpit-col">
        <div className="v2-wb-cockpit-col__title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} style={{ color: 'var(--oneos-primary)' }} />
            待核销 / 未关联
          </span>
        </div>
        <div className="v2-wb-mini-kpi-grid">
          <div>
            <div className="muted">提车待核销</div>
            <strong className="is-warn">5 笔</strong>
          </div>
          <div>
            <div className="muted">流水未关联</div>
            <strong className="is-warn">4 笔</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneric = (deptName: string) => (
    <div className="v2-wb-cockpit-col">
      <div className="v2-wb-cockpit-col__title">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Building2 size={14} style={{ color: 'var(--oneos-primary)' }} />
          {deptName}运营概览
        </span>
      </div>
      <div className="v2-wb-mini-kpi-grid">
        <div>
          <div className="muted">本周待办</div>
          <strong>12</strong>
        </div>
        <div>
          <div className="muted">本周已办</div>
          <strong className="is-success">28</strong>
        </div>
        <div>
          <div className="muted">临期预警</div>
          <strong className="is-warn">3</strong>
        </div>
        <div>
          <div className="muted">逾期事项</div>
          <strong className="is-danger">1</strong>
        </div>
      </div>
    </div>
  );

  const renderBody = () => {
    if (!dept || !boundDeptId) {
      return (
        <V2Empty
          title="未绑定部门看板"
          description="请先在若依用户中心 · 角色管理中为该角色绑定部门，绑定后即可显示对应部门运营看板。"
        />
      );
    }

    switch (dept.layout) {
      case 'biz-tri':
        return renderBizTri();
      case 'ops-quad':
        return renderOpsQuad();
      case 'finance-dual':
        return renderFinanceDual();
      default:
        return renderGeneric(dept.name);
    }
  };

  return (
    <div className="v2-wb-cockpit" data-annotation-id="wb-cockpit">
      <div className="v2-wb-cockpit__top">
        <div className="v2-wb-cockpit__title">
          <BarChart3 size={18} style={{ color: 'var(--oneos-primary)' }} />
          <span>运营看板与业务洞察</span>
          {dept && (
            <span className="v2-wb-cockpit__dept-tag">
              <Building2 size={12} />
              {dept.name}
            </span>
          )}
        </div>

        {showRoleTabs && (
          <div className="v2-wb-cockpit__role-switcher" role="tablist" aria-label="角色视角">
            <span className="v2-wb-cockpit__tab-hint">角色：</span>
            {activeRoleIds.map((rId) => {
              const rConfig = ROLE_CONFIGS[rId];
              const isActive = activeCockpitRoleId === rId;
              return (
                <button
                  key={rId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`v2-wb-cockpit__role-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedCockpitRoleId(rId);
                    onCockpitRoleSwitch?.(rId);
                  }}
                  title={
                    rConfig.boundDeptId
                      ? `绑定部门：${DEPT_CONFIGS[rConfig.boundDeptId].name}`
                      : '未绑定部门'
                  }
                >
                  {rConfig.shortLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {renderBody()}
    </div>
  );
};
