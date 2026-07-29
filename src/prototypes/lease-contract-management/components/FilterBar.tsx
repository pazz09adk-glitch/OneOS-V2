import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Search } from 'lucide-react';
import { ContractFilterState } from '../types';
import { V2SingleInputDateRangePicker } from '../../../resources/design-system/components/UIComponents';

interface FilterBarProps {
  filterState: ContractFilterState;
  onFilterChange: (newState: ContractFilterState) => void;
  /** 重置条件；外层应同时收起「更多筛选」面板（V2 查询收起规则） */
  onReset: () => void;
  /** 应用条件；外层必须收起「更多筛选」面板（V2 查询收起规则） */
  onSearch: () => void;
  isDark: boolean;
  /** 由外层「更多筛选」打开时默认展开全部 13 项 */
  defaultExpanded?: boolean;
}

export function FilterBar({
  filterState,
  onFilterChange,
  onReset,
  onSearch,
  isDark,
  defaultExpanded = false,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const surface = isDark ? '#121418' : '#ffffff';
  const inputBg = isDark ? '#1a1d24' : '#f8fafc';
  const border = isDark ? '#23272f' : '#e3e8ee';
  const textPrimary = isDark ? '#f7fafc' : '#0a2540';
  const textSecondary = isDark ? '#a0aec0' : '#425466';
  const accent = '#533afd';

  const updateField = (key: keyof ContractFilterState, value: any) => {
    onFilterChange({ ...filterState, [key]: value });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      ...filterState,
      contractTemplateCategory: val,
      standardContractName: '', // clear linked standard contract
    });
  };

  /** 查询：内层折叠 + 回调外层收起面板 */
  const handleSearch = () => {
    setExpanded(false);
    onSearch();
  };

  /** 重置：内层折叠 + 回调外层收起面板 */
  const handleReset = () => {
    setExpanded(false);
    onReset();
  };

  const inputStyle: React.CSSProperties = {
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: '8px',
    padding: '7px 12px',
    fontSize: '13px',
    color: textPrimary,
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: textSecondary,
    marginBottom: '4px',
    display: 'block',
  };

  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '20px',
        boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Row 1: First 4 Fields */}
        <div>
          <label style={labelStyle}>合同编码</label>
          <input
            type="text"
            placeholder="搜索合同编码..."
            value={filterState.contractCode || ''}
            onChange={(e) => updateField('contractCode', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>项目名称</label>
          <input
            type="text"
            placeholder="搜索项目名称..."
            value={filterState.projectName || ''}
            onChange={(e) => updateField('projectName', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>客户名称</label>
          <input
            type="text"
            placeholder="搜索客户公司..."
            value={filterState.customerName || ''}
            onChange={(e) => updateField('customerName', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>签约公司主体</label>
          <select
            value={filterState.signingCompany || ''}
            onChange={(e) => updateField('signingCompany', e.target.value)}
            style={inputStyle}
          >
            <option value="">全部签约主体</option>
            <option value="羚牛氢能(浙江)供应链管理有限公司">羚牛氢能(浙江)供应链管理有限公司</option>
            <option value="上海羚牛氢能科技有限公司">上海羚牛氢能科技有限公司</option>
          </select>
        </div>
      </div>

      {/* Expanded 9 Fields */}
      {expanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: `1px solid ${border}`,
          }}
        >
          <div>
            <label style={labelStyle}>审批状态</label>
            <select
              value={filterState.approvalStatus[0] || '全部'}
              onChange={(e) => updateField('approvalStatus', [e.target.value])}
              style={inputStyle}
            >
              <option value="全部">全部审批状态</option>
              <option value="unsubmitted">未提交</option>
              <option value="pending">待审批</option>
              <option value="approving">审批中</option>
              <option value="approved">审批通过</option>
              <option value="rejected">审批驳回</option>
              <option value="terminated">审批终止</option>
              <option value="withdrawn">撤回</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>合同状态</label>
            <select
              value={filterState.contractStatus[0] || '全部'}
              onChange={(e) => updateField('contractStatus', [e.target.value])}
              style={inputStyle}
            >
              <option value="全部">全部合同状态</option>
              <option value="draft">草稿</option>
              <option value="submitted">已提交审批</option>
              <option value="active">合同进行中</option>
              <option value="terminated">已终止</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>业务部门</label>
            <select
              value={filterState.businessDept[0] || ''}
              onChange={(e) => updateField('businessDept', e.target.value ? [e.target.value] : [])}
              style={inputStyle}
            >
              <option value="">全部部门</option>
              <option value="华东业务一部">华东业务一部</option>
              <option value="华东业务二部">华东业务二部</option>
              <option value="沪苏业务部">沪苏业务部</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>业务负责人</label>
            <select
              value={filterState.businessOwner[0] || ''}
              onChange={(e) => updateField('businessOwner', e.target.value ? [e.target.value] : [])}
              style={inputStyle}
            >
              <option value="">全部负责人</option>
              <option value="陈业务">陈业务</option>
              <option value="林经理">林经理</option>
              <option value="周专员">周专员</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>合同模板</label>
            <select
              value={filterState.contractTemplateCategory || ''}
              onChange={handleTemplateChange}
              style={inputStyle}
            >
              <option value="">全部模板分类</option>
              <option value="formal">正式租赁合同模板</option>
              <option value="trial">试用合同模板</option>
              <option value="heavy_18t">现代18吨正式合同模板</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>标准合同名称 (模板联动)</label>
            <select
              disabled={!filterState.contractTemplateCategory}
              value={filterState.standardContractName || ''}
              onChange={(e) => updateField('standardContractName', e.target.value)}
              style={{
                ...inputStyle,
                opacity: !filterState.contractTemplateCategory ? 0.5 : 1,
                cursor: !filterState.contractTemplateCategory ? 'not-allowed' : 'pointer',
              }}
            >
              {!filterState.contractTemplateCategory ? (
                <option value="">请先选择合同模板</option>
              ) : (
                <>
                  <option value="">全部标准合同文书</option>
                  {filterState.contractTemplateCategory === 'formal' && (
                    <option value="2026年标准商用车租赁合同">2026年标准商用车租赁合同</option>
                  )}
                  {filterState.contractTemplateCategory === 'trial' && (
                    <option value="2026年商用车试用租赁协议">2026年商用车试用租赁协议</option>
                  )}
                  {filterState.contractTemplateCategory === 'heavy_18t' && (
                    <option value="2026年现代18吨氢能厢式货车租赁合同">2026年现代18吨氢能厢式货车租赁合同</option>
                  )}
                </>
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>审批类型</label>
            <select
              value={filterState.approvalType[0] || '全部'}
              onChange={(e) => updateField('approvalType', [e.target.value])}
              style={inputStyle}
            >
              <option value="全部">全部类型</option>
              <option value="standard">标准合同</option>
              <option value="non_standard">非标准合同 (需要特批)</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>创建人</label>
            <input
              type="text"
              placeholder="搜索创建人..."
              value={filterState.creator[0] || ''}
              onChange={(e) => updateField('creator', e.target.value ? [e.target.value] : [])}
              style={inputStyle}
            />
          </div>

          {/* Field 13: Contract End Date Range */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>合同结束日期 (V2SingleInputDateRangePicker)</label>
            <V2SingleInputDateRangePicker
              startDate={filterState.startDate || ''}
              endDate={filterState.endDate || ''}
              onChange={(start, end) => {
                onFilterChange({
                  ...filterState,
                  startDate: start,
                  endDate: end
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Control Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '12px',
            color: accent,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0,
          }}
        >
          {expanded ? (
            <>
              收起高阶筛选 <ChevronUp size={14} />
            </>
          ) : (
            <>
              展开更多筛选条件 (共 13 项) <ChevronDown size={14} />
            </>
          )}
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${border}`,
              background: surface,
              color: textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={14} /> 重置
          </button>

          <button
            type="button"
            onClick={handleSearch}
            style={{
              padding: '7px 20px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: accent,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(83, 58, 253, 0.3)',
            }}
          >
            <Search size={14} /> 查询
          </button>
        </div>
      </div>
    </div>
  );
}
