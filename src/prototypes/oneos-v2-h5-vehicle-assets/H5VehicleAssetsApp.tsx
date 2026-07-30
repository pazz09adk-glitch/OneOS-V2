import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Truck,
  Search,
  Filter,
  List,
  Kanban,
  Columns,
  ChevronRight,
  ChevronDown,
  Calendar,
  Shield,
  FileText,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  XCircle,
  MapPin,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  RotateCcw,
  Check,
  X,
  Phone,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  ChevronUp,
  FileCheck,
  Wrench,
  Activity,
  Layers,
  Info,
  User
} from 'lucide-react';
import '../../resources/design-system/oneos-ds-tokens.css';
import vehiclesSeed from '../vehicle-management/data/vehicles.json';
import {
  V2Select,
  V2SingleInputDateRangePicker,
  V2RadioGroup,
  V2CheckboxGroup,
  V2Switch,
  V2Pagination,
  V2Empty,
  V2MobileHeader,
  V2MobileBottomNav,
  V2MobileActionBar
} from '../oneos-v2/UIComponents';

export interface VehicleRecord {
  id: string;
  plateNo: string;
  vin: string;
  vehicleNo?: string;
  color?: string;
  ownership?: string;
  scrapDate?: string;
  operateCompany?: string;
  vehicleSource?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  customer?: string;
  department?: string;
  manager?: string;
  contractNo?: string;
  operateStatus?: string;
  vehicleStatus?: string;
  licenseStatus?: string;
  insuranceStatus?: string;
  mileage?: string;
  location?: string;
  locationAddress?: string;
  operateProvince?: string;
  operateCity?: string;
  onlineStatus?: string;
}

const ALL_VEHICLES = vehiclesSeed as VehicleRecord[];

export function H5VehicleAssetsApp() {
  // Device Viewport Simulator Mode ('pc' | 'iphone_390' | 'android_375')
  const [viewportMode, setViewportMode] = useState<'iphone_390' | 'android_375' | 'pc'>('iphone_390');
  const [isDark, setIsDark] = useState<boolean>(false);

  // 3-View Perspectives ('list' | 'kanban' | 'split')
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'split'>('list');

  // Active Bottom Tab Bar Key
  const [activeBottomTab, setActiveBottomTab] = useState<string>('assets');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDrawerOpen, setFilterOpen] = useState<boolean>(false);
  const [selectedOperateStatus, setSelectedOperateStatus] = useState<string>('');
  const [selectedVehicleStatus, setSelectedVehicleStatus] = useState<string>('');
  const [selectedLicenseStatus, setSelectedLicenseStatus] = useState<string>('');
  const [selectedInsuranceStatus, setSelectedInsuranceStatus] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedOnline, setSelectedOnline] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('2026-01-01');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('2026-12-31');

  // KPI Quick Filter Key
  const [kpiFilter, setKpiFilter] = useState<'all' | 'delivered' | 'pending' | 'warning'>('all');

  // Pagination State for List Mode
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Expanded Cards Sub-Table State in List View
  const [expandedCardIds, setExpandedCardIds] = useState<{ [id: string]: boolean }>({});

  // Kanban Mode Pipeline Tab ('all' | 'pending' | 'delivered' | 'repair' | 'settled')
  const [kanbanStage, setKanbanStage] = useState<string>('all');

  // Split / Detail View Selected Vehicle Record
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('1');
  const [detailSubTab, setDetailSubTab] = useState<'basic' | 'contract' | 'license' | 'insurance' | 'violation'>('basic');

  // Action Drawer / Modal States
  const [actionModal, setActionModal] = useState<{ open: boolean; type: string; vehicle?: VehicleRecord }>({
    open: false,
    type: ''
  });
  const [inputMileage, setInputMileage] = useState<string>('8500.0');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Toggle Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.dataset.dsMode = 'dark';
      root.dataset.oneosTheme = 'dark';
      root.classList.add('dark');
    } else {
      root.dataset.dsMode = 'light';
      root.dataset.oneosTheme = 'light';
      root.classList.remove('dark');
    }
  }, [isDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Filter Logic
  const filteredVehicles = useMemo(() => {
    return ALL_VEHICLES.filter((item) => {
      // Clean Plate No check (remove dots)
      const cleanPlate = (item.plateNo || '').replace(/·/g, '').toLowerCase();
      const cleanVin = (item.vin || '').toLowerCase();
      const cleanQuery = searchQuery.trim().toLowerCase();

      if (cleanQuery) {
        const matchSearch =
          cleanPlate.includes(cleanQuery) ||
          cleanVin.includes(cleanQuery) ||
          (item.customer || '').toLowerCase().includes(cleanQuery) ||
          (item.contractNo || '').toLowerCase().includes(cleanQuery);
        if (!matchSearch) return false;
      }

      // KPI Quick Filter
      if (kpiFilter === 'delivered' && item.vehicleStatus !== '已交车') return false;
      if (kpiFilter === 'pending' && item.vehicleStatus === '已交车') return false;
      if (kpiFilter === 'warning' && item.licenseStatus !== '到期预警' && item.insuranceStatus !== '即将到期' && item.licenseStatus !== '已过期') return false;

      // High level 13 filters
      if (selectedOperateStatus && item.operateStatus !== selectedOperateStatus) return false;
      if (selectedVehicleStatus && item.vehicleStatus !== selectedVehicleStatus) return false;
      if (selectedLicenseStatus && item.licenseStatus !== selectedLicenseStatus) return false;
      if (selectedInsuranceStatus && item.insuranceStatus !== selectedInsuranceStatus) return false;
      if (selectedBrand && item.brand !== selectedBrand) return false;
      if (selectedCity && !((item.operateCity || item.location || '').includes(selectedCity))) return false;
      if (selectedSource && item.vehicleSource !== selectedSource) return false;
      if (selectedOnline && item.onlineStatus !== selectedOnline) return false;

      return true;
    });
  }, [
    searchQuery,
    kpiFilter,
    selectedOperateStatus,
    selectedVehicleStatus,
    selectedLicenseStatus,
    selectedInsuranceStatus,
    selectedBrand,
    selectedCity,
    selectedSource,
    selectedOnline
  ]);

  // Paginated List
  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, page, pageSize]);

  // Active Vehicle for Split/Detail
  const activeVehicle = useMemo(() => {
    return ALL_VEHICLES.find((v) => v.id === selectedVehicleId) || ALL_VEHICLES[0];
  }, [selectedVehicleId]);

  // Count active filters badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedOperateStatus) count++;
    if (selectedVehicleStatus) count++;
    if (selectedLicenseStatus) count++;
    if (selectedInsuranceStatus) count++;
    if (selectedBrand) count++;
    if (selectedCity) count++;
    if (selectedSource) count++;
    if (selectedOnline) count++;
    return count;
  }, [
    selectedOperateStatus,
    selectedVehicleStatus,
    selectedLicenseStatus,
    selectedInsuranceStatus,
    selectedBrand,
    selectedCity,
    selectedSource,
    selectedOnline
  ]);

  const toggleExpandCard = (id: string) => {
    setExpandedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetFilters = () => {
    setSelectedOperateStatus('');
    setSelectedVehicleStatus('');
    setSelectedLicenseStatus('');
    setSelectedInsuranceStatus('');
    setSelectedBrand('');
    setSelectedCity('');
    setSelectedSource('');
    setSelectedOnline('');
    setSearchQuery('');
    setKpiFilter('all');
    // V2 查询收起规则：重置后关闭筛选 Bottom Sheet
    setFilterOpen(false);
    showToast('已重置所有筛选条件');
  };

  // Render Inner H5 Page Content
  const renderH5Content = () => (
    <div
      className="h5-page-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        background: 'var(--ln-canvas-parchment, #F6F9FC)',
        color: 'var(--ln-ink)',
        boxSizing: 'border-box',
        paddingBottom: '80px' // Reserved for bottom navbar & action bar
      }}
    >
      {/* 1. App Native Navigation Header */}
      <V2MobileHeader
        title="车辆资产档案"
        subtitle={`共 ${filteredVehicles.length} 台车辆`}
        showBack={false}
        rightIcons={
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: 'var(--ln-ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px'
            }}
            title="高阶筛选"
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--oneos-primary, #533AFD)'
                }}
              />
            )}
          </button>
        }
      />

      {/* 2. Top Three View Perspectives Segmented Switcher */}
      <div
        style={{
          padding: '10px 12px',
          background: 'var(--ln-surface-card)',
          borderBottom: '1px solid var(--ln-hairline)',
          position: 'sticky',
          top: '52px',
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--ln-surface-pearl, #F1F5F9)',
            borderRadius: '10px',
            padding: '3px',
            gap: '3px'
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              flex: 1,
              minHeight: '38px',
              border: 'none',
              borderRadius: '8px',
              background: viewMode === 'list' ? 'var(--oneos-primary, #533AFD)' : 'transparent',
              color: viewMode === 'list' ? '#FFFFFF' : 'var(--ln-body)',
              fontSize: '13px',
              fontWeight: viewMode === 'list' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'list' ? '0 2px 8px color-mix(in srgb, var(--oneos-primary, #533afd) 30%, transparent)' : 'none'
            }}
          >
            <List size={16} />
            1. 列表模式
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            style={{
              flex: 1,
              minHeight: '38px',
              border: 'none',
              borderRadius: '8px',
              background: viewMode === 'kanban' ? 'var(--oneos-primary, #533AFD)' : 'transparent',
              color: viewMode === 'kanban' ? '#FFFFFF' : 'var(--ln-body)',
              fontSize: '13px',
              fontWeight: viewMode === 'kanban' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'kanban' ? '0 2px 8px color-mix(in srgb, var(--oneos-primary, #533afd) 30%, transparent)' : 'none'
            }}
          >
            <Kanban size={16} />
            2. 看板模式
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            style={{
              flex: 1,
              minHeight: '38px',
              border: 'none',
              borderRadius: '8px',
              background: viewMode === 'split' ? 'var(--oneos-primary, #533AFD)' : 'transparent',
              color: viewMode === 'split' ? '#FFFFFF' : 'var(--ln-body)',
              fontSize: '13px',
              fontWeight: viewMode === 'split' ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'split' ? '0 2px 8px color-mix(in srgb, var(--oneos-primary, #533afd) 30%, transparent)' : 'none'
            }}
          >
            <Columns size={16} />
            3. 档案工作台
          </button>
        </div>
      </div>

      {/* VIEW 1: LIST MODE */}
      {viewMode === 'list' && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Bento KPI Grid Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}
          >
            <div
              onClick={() => setKpiFilter(kpiFilter === 'all' ? 'all' : 'all')}
              style={{
                background: 'var(--ln-surface-card)',
                borderRadius: '10px',
                padding: '10px 12px',
                border: kpiFilter === 'all' ? '1.5px solid var(--oneos-primary, #533AFD)' : '1px solid var(--ln-hairline)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={12} style={{ color: 'var(--oneos-primary, #533AFD)' }} /> 全部车辆资产
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--ln-ink)',
                  fontFamily: '"JetBrains Mono", tabular-nums',
                  marginTop: '2px'
                }}
              >
                {ALL_VEHICLES.length} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ln-muted)' }}>台</span>
              </div>
            </div>

            <div
              onClick={() => setKpiFilter(kpiFilter === 'delivered' ? 'all' : 'delivered')}
              style={{
                background: 'var(--ln-surface-card)',
                borderRadius: '10px',
                padding: '10px 12px',
                border: kpiFilter === 'delivered' ? '1.5px solid #10B981' : '1px solid var(--ln-hairline)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} style={{ color: '#10B981' }} /> 已交车履约中
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#10B981',
                  fontFamily: '"JetBrains Mono", tabular-nums',
                  marginTop: '2px'
                }}
              >
                {ALL_VEHICLES.filter((v) => v.vehicleStatus === '已交车').length}{' '}
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ln-muted)' }}>台</span>
              </div>
            </div>

            <div
              onClick={() => setKpiFilter(kpiFilter === 'pending' ? 'all' : 'pending')}
              style={{
                background: 'var(--ln-surface-card)',
                borderRadius: '10px',
                padding: '10px 12px',
                border: kpiFilter === 'pending' ? '1.5px solid #D97706' : '1px solid var(--ln-hairline)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock3 size={12} style={{ color: '#D97706' }} /> 待交车 / 在库
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#D97706',
                  fontFamily: '"JetBrains Mono", tabular-nums',
                  marginTop: '2px'
                }}
              >
                {ALL_VEHICLES.filter((v) => v.vehicleStatus !== '已交车').length}{' '}
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ln-muted)' }}>台</span>
              </div>
            </div>

            <div
              onClick={() => setKpiFilter(kpiFilter === 'warning' ? 'all' : 'warning')}
              style={{
                background: 'var(--ln-surface-card)',
                borderRadius: '10px',
                padding: '10px 12px',
                border: kpiFilter === 'warning' ? '1.5px solid #EF4444' : '1px solid var(--ln-hairline)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--ln-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} style={{ color: '#EF4444' }} /> 年检/保险预警
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#EF4444',
                  fontFamily: '"JetBrains Mono", tabular-nums',
                  marginTop: '2px'
                }}
              >
                {ALL_VEHICLES.filter((v) => v.licenseStatus === '到期预警' || v.insuranceStatus === '即将到期' || v.licenseStatus === '已过期').length}{' '}
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ln-muted)' }}>台</span>
              </div>
            </div>
          </div>

          {/* Quick Search Input & Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--ln-muted)'
                }}
              />
              <input
                type="text"
                placeholder="搜索车牌号、VIN 码或客户名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  paddingLeft: '38px',
                  paddingRight: searchQuery ? '32px' : '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  color: 'var(--ln-ink)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ln-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              style={{
                minHeight: '44px',
                padding: '0 14px',
                borderRadius: '10px',
                border: activeFilterCount > 0 ? '1px solid var(--oneos-primary, #533AFD)' : '1px solid var(--ln-hairline)',
                background: activeFilterCount > 0 ? 'color-mix(in srgb, var(--oneos-primary, #533afd) 8%, transparent)' : 'var(--ln-surface-card)',
                color: activeFilterCount > 0 ? 'var(--oneos-primary, #533AFD)' : 'var(--ln-ink)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Filter size={16} />
              筛选 {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Active Filter Chips Row */}
          {(activeFilterCount > 0 || kpiFilter !== 'all') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {kpiFilter !== 'all' && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    background: 'color-mix(in srgb, var(--oneos-primary, #533afd) 12%, transparent)',
                    color: 'var(--oneos-primary, #533AFD)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  大盘: {kpiFilter === 'delivered' ? '已交车' : kpiFilter === 'pending' ? '待交车' : '预警车辆'}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setKpiFilter('all')} />
                </span>
              )}
              {selectedVehicleStatus && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    background: 'var(--ln-surface-strong)',
                    color: 'var(--ln-ink)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  状态: {selectedVehicleStatus}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedVehicleStatus('')} />
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  fontSize: '11px',
                  color: 'var(--oneos-primary, #533AFD)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                清空重置
              </button>
            </div>
          )}

          {/* H5 Vehicle Cards List */}
          {filteredVehicles.length === 0 ? (
            <V2Empty
              type="no_search"
              title="未匹配到符合条件的车辆"
              description="请尝试调整车牌/VIN关键词或重置筛选条件"
              primaryActionText="重置筛选条件"
              onPrimaryAction={handleResetFilters}
            />
          ) : (
            paginatedVehicles.map((item) => {
              const isDelivered = item.vehicleStatus === '已交车';
              const isExpanded = !!expandedCardIds[item.id];
              // Clean Plate No format (no dots)
              const cleanPlate = (item.plateNo || '').replace(/·/g, '');

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--ln-surface-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--ln-hairline)',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Card Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '17px',
                          fontWeight: 800,
                          color: 'var(--oneos-primary, #533AFD)',
                          fontFamily: '"JetBrains Mono", SFMono-Regular, monospace',
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.3px'
                        }}
                      >
                        {cleanPlate || '待上牌'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--ln-muted)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'var(--ln-surface-pearl)'
                        }}
                      >
                        {item.vehicleType || '氢能重卡'}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: isDelivered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                        color: isDelivered ? '#10B981' : '#D97706',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isDelivered ? '#10B981' : '#D97706'
                        }}
                      />
                      {item.vehicleStatus || '待交车'}
                    </span>
                  </div>

                  {/* Vehicle Brand Model & VIN Row */}
                  <div style={{ fontSize: '13px', color: 'var(--ln-body)', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 700, color: 'var(--ln-ink)' }}>
                      {item.brand} {item.model}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ln-muted)', fontFamily: 'monospace' }}>
                      VIN: {item.vin || '—'}
                    </div>
                  </div>

                  {/* Detail Info Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'var(--ln-surface-pearl)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--ln-muted)' }}>关联客户</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.customer || '库存待出租'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--ln-muted)' }}>实时里程 (km)</div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--oneos-primary, #533AFD)',
                          fontFamily: '"JetBrains Mono", tabular-nums'
                        }}
                      >
                        {item.mileage ? `${Number(item.mileage).toLocaleString()} km` : '0.0 km'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--ln-muted)' }}>运营区域</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-ink)' }}>
                        {item.operateCity || item.location || '浙江-嘉兴'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--ln-muted)' }}>证照与保险</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: item.licenseStatus === '到期预警' ? '#EF4444' : '#10B981' }}>
                        {item.licenseStatus || '正常'} / {item.insuranceStatus || '正常'}
                      </div>
                    </div>
                  </div>

                  {/* Associated Vehicle Sub-Table Collapsible Area */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '4px',
                        paddingTop: '10px',
                        borderTop: '1px dashed var(--ln-hairline)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--oneos-primary, #533AFD)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} /> 车辆关联履约与保单子明细
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--ln-body)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>• 履约合同编号: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.contractNo || 'LNZL2026-001'}</span></div>
                        <div>• 归属产权公司: {item.ownership || '羚牛氢能科技(浙江)有限公司'}</div>
                        <div>• 行驶证归属地: {item.locationAddress || '浙江省嘉兴市秀洲区运力基地'}</div>
                        <div>• 商业险到期日: <span style={{ color: '#D97706', fontWeight: 600 }}>2026-11-30 (剩余 128 天)</span></div>
                        <div>• 年检到期时间: <span style={{ color: '#10B981', fontWeight: 600 }}>2027-04-15</span></div>
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Actions Group */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpandCard(item.id)}
                      style={{
                        minHeight: '36px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--ln-hairline)',
                        background: 'var(--ln-surface-card)',
                        color: 'var(--ln-body)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? '收起子明细' : '展开履约/保单'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVehicleId(item.id);
                        setViewMode('split');
                        showToast(`已载入车牌 ${cleanPlate} 档案工作台`);
                      }}
                      style={{
                        flex: 1,
                        minHeight: '36px',
                        padding: '0 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--oneos-primary, #533AFD)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 6px rgba(83, 58, 253, 0.25)'
                      }}
                    >
                      深度档案 <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* V2Pagination for List View */}
          {filteredVehicles.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <V2Pagination
                page={page}
                pageSize={pageSize}
                total={filteredVehicles.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                showTotal={true}
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN MODE */}
      {viewMode === 'kanban' && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Kanban Stage Pipeline Tabs Horizontal Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'all', label: '全部阶段', count: ALL_VEHICLES.length },
              { id: 'pending', label: '库存待交车', count: ALL_VEHICLES.filter((v) => v.vehicleStatus !== '已交车').length },
              { id: 'delivered', label: '履约执行中', count: ALL_VEHICLES.filter((v) => v.vehicleStatus === '已交车').length },
              { id: 'warning', label: '预警/出险', count: ALL_VEHICLES.filter((v) => v.licenseStatus === '到期预警' || v.insuranceStatus === '即将到期').length }
            ].map((tab) => {
              const active = kanbanStage === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setKanbanStage(tab.id)}
                  style={{
                    minHeight: '38px',
                    padding: '0 14px',
                    borderRadius: '9999px',
                    border: active ? 'none' : '1px solid var(--ln-hairline)',
                    background: active ? 'var(--oneos-primary, #533AFD)' : 'var(--ln-surface-card)',
                    color: active ? '#FFFFFF' : 'var(--ln-body)',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      background: active ? 'rgba(255,255,255,0.25)' : 'var(--ln-surface-pearl)',
                      color: active ? '#FFFFFF' : 'var(--ln-muted)'
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kanban Cards Columns Pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ALL_VEHICLES.slice(0, 8).map((item) => {
              const cleanPlate = (item.plateNo || '').replace(/·/g, '');
              const isDelivered = item.vehicleStatus === '已交车';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--ln-surface-card)',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${isDelivered ? '#10B981' : '#D97706'}`,
                    borderTop: '1px solid var(--ln-hairline)',
                    borderRight: '1px solid var(--ln-hairline)',
                    borderBottom: '1px solid var(--ln-hairline)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--oneos-primary, #533AFD)', fontFamily: 'monospace' }}>
                      {cleanPlate}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>跟进人: {item.manager || '金可鹏'}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--ln-body)' }}>
                    {item.brand} {item.model} • 客户: {item.customer || '自营储备'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ln-muted)' }}>
                    <span>📍 {item.operateCity || '浙江-嘉兴'}</span>
                    <span style={{ fontFamily: 'monospace' }}>{item.mileage || '0'} km</span>
                  </div>

                  {/* Kanban Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px dashed var(--ln-hairline)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActionModal({ open: true, type: 'mileage', vehicle: item });
                      }}
                      style={{
                        flex: 1,
                        minHeight: '36px',
                        borderRadius: '6px',
                        border: '1px solid var(--ln-hairline)',
                        background: 'var(--ln-surface-pearl)',
                        color: 'var(--ln-ink)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      更新里程
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVehicleId(item.id);
                        setViewMode('split');
                      }}
                      style={{
                        flex: 1,
                        minHeight: '36px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--oneos-primary, #533AFD)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      查看工作台
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: SPLIT / MASTER-DETAIL WORKBENCH MODE */}
      {viewMode === 'split' && activeVehicle && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Top Vehicle Selector Slider */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)', marginBottom: '6px' }}>
              快速选择车辆焦点:
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {ALL_VEHICLES.slice(0, 10).map((v) => {
                const selected = v.id === selectedVehicleId;
                const cleanPlate = (v.plateNo || '').replace(/·/g, '');

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicleId(v.id)}
                    style={{
                      minHeight: '38px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: selected ? '1.5px solid var(--oneos-primary, #533AFD)' : '1px solid var(--ln-hairline)',
                      background: selected ? 'rgba(83, 58, 253, 0.1)' : 'var(--ln-surface-card)',
                      color: selected ? 'var(--oneos-primary, #533AFD)' : 'var(--ln-ink)',
                      fontSize: '12px',
                      fontWeight: selected ? 800 : 500,
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    {cleanPlate}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Vehicle Main Header Card */}
          <div
            style={{
              background: 'var(--ln-surface-card)',
              borderRadius: '12px',
              border: '1px solid var(--ln-hairline)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--oneos-primary, #533AFD)',
                    fontFamily: '"JetBrains Mono", monospace'
                  }}
                >
                  {(activeVehicle.plateNo || '').replace(/·/g, '')}
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ln-ink)', marginTop: '2px' }}>
                  {activeVehicle.brand} {activeVehicle.model}
                </div>
              </div>

              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: activeVehicle.vehicleStatus === '已交车' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                  color: activeVehicle.vehicleStatus === '已交车' ? '#10B981' : '#D97706'
                }}
              >
                {activeVehicle.vehicleStatus || '履约中'}
              </span>
            </div>

            {/* Sub Tabs Navigator */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--ln-hairline)', gap: '16px', overflowX: 'auto' }}>
              {[
                { id: 'basic', label: '基础档案' },
                { id: 'contract', label: '履约合同' },
                { id: 'license', label: '证照年检' },
                { id: 'insurance', label: '保险保单' },
                { id: 'violation', label: '出险违章' }
              ].map((tab) => {
                const active = detailSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailSubTab(tab.id as any)}
                    style={{
                      padding: '8px 0',
                      border: 'none',
                      borderBottom: active ? '2.5px solid var(--oneos-primary, #533AFD)' : '2.5px solid transparent',
                      background: 'transparent',
                      color: active ? 'var(--oneos-primary, #533AFD)' : 'var(--ln-muted)',
                      fontSize: '13px',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sub Tab Content Panels */}
            <div style={{ fontSize: '13px', color: 'var(--ln-body)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {detailSubTab === 'basic' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div><span style={{ color: 'var(--ln-muted)' }}>VIN 码:</span> <span style={{ fontFamily: 'monospace' }}>{activeVehicle.vin}</span></div>
                  <div><span style={{ color: 'var(--ln-muted)' }}>车辆颜色:</span> {activeVehicle.color || '白色'}</div>
                  <div><span style={{ color: 'var(--ln-muted)' }}>产权归属:</span> {activeVehicle.ownership || '羚牛氢能'}</div>
                  <div><span style={{ color: 'var(--ln-muted)' }}>运营城市:</span> {activeVehicle.operateCity || '嘉兴市'}</div>
                  <div><span style={{ color: 'var(--ln-muted)' }}>实时里程:</span> <span style={{ color: 'var(--oneos-primary, var(--ln-primary, #533AFD))', fontWeight: 700 }}>{activeVehicle.mileage || '7504.0'} km</span></div>
                  <div><span style={{ color: 'var(--ln-muted)' }}>车联网状态:</span> <span style={{ color: '#10B981', fontWeight: 600 }}>在线 🟢</span></div>
                </div>
              )}

              {detailSubTab === 'contract' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>• 关联客户: <strong>{activeVehicle.customer || '武汉洛安供应链有限公司'}</strong></div>
                  <div>• 合同编号: <span style={{ fontFamily: 'monospace', color: 'var(--oneos-primary, var(--ln-primary, #533AFD))' }}>{activeVehicle.contractNo || 'LNZLHT2026040301-042'}</span></div>
                  <div>• 责任经理: {activeVehicle.manager || '金可鹏'}</div>
                  <div>• 押金缴存: <span style={{ color: '#10B981', fontWeight: 600 }}>¥ 30,000.00 (已结清)</span></div>
                </div>
              )}

              {detailSubTab === 'license' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>• 行驶证状态: <span style={{ color: '#10B981', fontWeight: 700 }}>正常</span></div>
                  <div>• 营运证编号: 浙交运管字33040210088</div>
                  <div>• 下次年检日期: <span style={{ color: '#D97706', fontWeight: 700 }}>2027-04-15 (剩余 265 天)</span></div>
                </div>
              )}

              {detailSubTab === 'insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>• 商业险保单: PICC-2026-99881230</div>
                  <div>• 交强险到期日: 2026-11-30 (剩余 128 天)</div>
                  <div>• 三者险保额: <span style={{ fontWeight: 700 }}>¥ 3,000,000.00</span></div>
                </div>
              )}

              {detailSubTab === 'violation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>• 未处理违章: <span style={{ color: '#10B981', fontWeight: 600 }}>0 笔 (无扣分)</span></div>
                  <div>• 历史出险记录: 2026-03-12 刮蹭定损 ¥ 1,200.00 (已结案)</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Bottom Action Bar (`V2MobileActionBar`) for H5 */}
      <V2MobileActionBar
        fixed={true}
        summaryPrice={viewMode === 'split' ? activeVehicle?.plateNo?.replace(/·/g, '') : undefined}
        summaryLabel={viewMode === 'split' ? '焦点车辆' : undefined}
        secondaryText="更新里程"
        onSecondary={() => {
          setActionModal({ open: true, type: 'mileage', vehicle: activeVehicle });
        }}
        primaryText="录入出险/处置"
        onPrimary={() => {
          setActionModal({ open: true, type: 'incident', vehicle: activeVehicle });
        }}
      />

      {/* 4. Bottom TabBar (`V2MobileBottomNav`) */}
      <V2MobileBottomNav
        activeKey={activeBottomTab}
        onChange={(k) => {
          setActiveBottomTab(k);
          showToast(`已切换至底部菜单: ${k}`);
        }}
        items={[
          { key: 'assets', label: '车辆资产', icon: <Truck size={20} /> },
          { key: 'contracts', label: '履约合同', icon: <FileText size={20} />, badge: 3 },
          { key: 'service', label: '维保处置', icon: <Wrench size={20} /> },
          { key: 'my', label: '我的档案', icon: <User size={20} /> }
        ]}
      />

      {/* High Level 13 Filter Bottom Sheet Modal */}
      {filterDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setFilterOpen(false)}
        >
          <div
            style={{
              background: 'var(--ln-surface-card)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '16px',
              maxHeight: '82vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--ln-hairline)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--ln-hairline)', position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)' }} />
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ln-ink)' }}>13 项高阶条件筛选 (Filter Sheet)</span>
              </div>
              <button type="button" onClick={() => setFilterOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ln-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Filter Controls Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>
                  1. 车辆状态 (Vehicle Status)
                </label>
                <V2RadioGroup
                  options={[
                    { value: '', label: '不限' },
                    { value: '已交车', label: '已交车' },
                    { value: '待交车', label: '待交车' },
                    { value: '维修中', label: '维保中' }
                  ]}
                  value={selectedVehicleStatus}
                  onChange={setSelectedVehicleStatus}
                  variant="segmented"
                  size="small"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>
                  2. 运营模式 (Operate Status)
                </label>
                <V2Select
                  options={[
                    { value: '', label: '不限运营模式' },
                    { value: '租赁', label: '车辆租赁' },
                    { value: '自营', label: '自营运力' },
                    { value: '代管', label: '托管运营' }
                  ]}
                  value={selectedOperateStatus}
                  onChange={setSelectedOperateStatus}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>
                  3. 证照年检状态 (License Status)
                </label>
                <V2RadioGroup
                  options={[
                    { value: '', label: '不限' },
                    { value: '正常', label: '正常' },
                    { value: '到期预警', label: '到期预警' }
                  ]}
                  value={selectedLicenseStatus}
                  onChange={setSelectedLicenseStatus}
                  variant="card"
                  size="small"
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ln-body)', marginBottom: '6px', display: 'block' }}>
                  4. 年检到期时间范围 (Date Range)
                </label>
                <V2SingleInputDateRangePicker
                  startDate={dateRangeStart}
                  endDate={dateRangeEnd}
                  onChange={(s, e) => {
                    setDateRangeStart(s);
                    setDateRangeEnd(e);
                  }}
                />
              </div>
            </div>

            {/* Bottom Actions for Filter Sheet */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--ln-hairline)' }}>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  color: 'var(--ln-ink)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                重置条件
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterOpen(false);
                  showToast('已应用高阶筛选条件');
                }}
                style={{
                  flex: 2,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--oneos-primary, #533AFD)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--oneos-primary, #533afd) 30%, transparent)'
                }}
              >
                确认查询 ({filteredVehicles.length} 台)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal Dialog */}
      {actionModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActionModal({ open: false, type: '' })}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              background: 'var(--ln-surface-card)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ln-ink)' }}>
              {actionModal.type === 'mileage' ? '更新车辆实时里程' : '录入事故/处置记录'}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ln-muted)' }}>
              目标车辆: <strong style={{ color: 'var(--oneos-primary, var(--ln-primary, #533AFD))' }}>{(actionModal.vehicle?.plateNo || '').replace(/·/g, '')}</strong> ({actionModal.vehicle?.brand})
            </div>

            {actionModal.type === 'mileage' ? (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', marginBottom: '4px', display: 'block' }}>
                  最新仪表盘里程 (km)
                </label>
                <input
                  type="text"
                  value={inputMileage}
                  onChange={(e) => setInputMileage(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--ln-hairline)',
                    background: 'var(--ln-surface-card)',
                    color: 'var(--ln-ink)',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ln-body)', marginBottom: '4px', display: 'block' }}>
                  处置或报修备注说明
                </label>
                <textarea
                  placeholder="请输入车辆出险位置、定损金额或处置说明..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--ln-hairline)',
                    background: 'var(--ln-surface-card)',
                    color: 'var(--ln-ink)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: '' })}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: '1px solid var(--ln-hairline)',
                  background: 'var(--ln-surface-card)',
                  color: 'var(--ln-ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionModal({ open: false, type: '' });
                  showToast('操作成功，已更新数据并记录审计日志');
                }}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--oneos-primary, #533AFD)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 120,
            background: 'rgba(10, 11, 13, 0.88)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );

  // Outer Wrapper: PC Frame vs Phone Shell Simulator
  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark ? '#0A0B0D' : '#F1F5F9',
        padding: viewportMode === 'pc' ? '0' : '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Device Viewport Simulator Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          background: 'var(--ln-surface-card)',
          borderRadius: '12px',
          border: '1px solid var(--ln-hairline)',
          padding: '10px 16px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(83, 58, 253, 0.1)', color: 'var(--oneos-primary, var(--ln-primary, #533AFD))', fontSize: '13px', fontWeight: 800 }}>
            H5 移动端
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ln-ink)' }}>
              车辆资产 H5 移动端（微信小程序 / 小羚羚 App 嵌套视图）
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ln-muted)' }}>
              基于 OneOS V2 Stripe Violet 设计规范 | 全量 3 视角与 44px 触控标准
            </div>
          </div>
        </div>

        {/* Viewport & Theme Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--ln-surface-pearl)', borderRadius: '8px', padding: '2px', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setViewportMode('iphone_390')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewportMode === 'iphone_390' ? 'var(--oneos-primary, #533AFD)' : 'transparent',
                color: viewportMode === 'iphone_390' ? '#FFFFFF' : 'var(--ln-body)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Smartphone size={14} /> iPhone 15 (390px)
            </button>

            <button
              type="button"
              onClick={() => setViewportMode('android_375')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewportMode === 'android_375' ? 'var(--oneos-primary, #533AFD)' : 'transparent',
                color: viewportMode === 'android_375' ? '#FFFFFF' : 'var(--ln-body)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Smartphone size={14} /> Android (375px)
            </button>

            <button
              type="button"
              onClick={() => setViewportMode('pc')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewportMode === 'pc' ? 'var(--oneos-primary, #533AFD)' : 'transparent',
                color: viewportMode === 'pc' ? '#FFFFFF' : 'var(--ln-body)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Monitor size={14} /> PC 全宽
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--ln-hairline)',
              background: 'var(--ln-surface-card)',
              color: 'var(--ln-ink)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isDark ? <Sun size={14} style={{ color: '#F59E0B' }} /> : <Moon size={14} style={{ color: 'var(--oneos-primary, var(--ln-primary, #533AFD))' }} />}
            {isDark ? '浅色' : '深色'}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      {viewportMode === 'pc' ? (
        <div style={{ width: '100%', maxWidth: '100%', background: 'var(--ln-surface-card)' }}>
          {renderH5Content()}
        </div>
      ) : (
        /* Phone Shell Simulator Container */
        <div
          style={{
            width: viewportMode === 'iphone_390' ? '390px' : '375px',
            height: '844px',
            borderRadius: '40px',
            border: '12px solid #1E2028',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--ln-surface-card)',
            boxSizing: 'border-box'
          }}
        >
          {/* Phone Dynamic Notch / Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '28px',
              background: '#000000',
              borderBottomLeftRadius: '14px',
              borderBottomRightRadius: '14px',
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0D0E12', border: '1px solid #232530' }} />
          </div>

          <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            {renderH5Content()}
          </div>
        </div>
      )}
    </div>
  );
}

export default H5VehicleAssetsApp;
