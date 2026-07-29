import React, { useEffect, useMemo, useState } from 'react';
import { CheckSquare, AlertCircle, Clock, Send, ExternalLink } from 'lucide-react';
import type { TodoItem, RoleConfig } from '../types';
import { MOCK_TODO_ITEMS } from '../mockData';
import { UrgeModal } from './UrgeModal';
import { V2Select, V2Tag } from '../../../resources/design-system/components/UIComponents';

export interface MyTodoListProps {
  currentRole: RoleConfig;
  onUrgeSuccessToast: (message: string) => void;
}

function sortTodos(items: TodoItem[]): TodoItem[] {
  return items.slice().sort((a, b) => {
    const aOver = a.urgentLevel === 'overdue' ? 0 : 1;
    const bOver = b.urgentLevel === 'overdue' ? 0 : 1;
    if (aOver !== bOver) return aOver - bOver;
    return b.createTime.localeCompare(a.createTime);
  });
}

export const MyTodoList: React.FC<MyTodoListProps> = ({ currentRole, onUrgeSuccessToast }) => {
  const [todoList] = useState<TodoItem[]>(MOCK_TODO_ITEMS);
  const [urgentFilter, setUrgentFilter] = useState<'all' | 'normal' | 'overdue'>('all');
  const [bizTypeFilter, setBizTypeFilter] = useState<string[]>([]);
  const [selectedUrgeItem, setSelectedUrgeItem] = useState<TodoItem | null>(null);

  useEffect(() => {
    setUrgentFilter('all');
    setBizTypeFilter([]);
  }, [currentRole.id]);

  const roleTodos = useMemo(
    () =>
      todoList.filter(
        (item) => item.roleIds.includes(currentRole.id) || currentRole.id === 'gm',
      ),
    [todoList, currentRole.id],
  );

  const bizTypeOptions = useMemo(() => {
    const map = new Map<string, string>();
    roleTodos.forEach((t) => {
      if (!map.has(t.bizType)) map.set(t.bizType, t.bizTypeLabel);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [roleTodos]);

  const filteredTodos = useMemo(() => {
    const list = roleTodos.filter((item) => {
      if (urgentFilter !== 'all' && item.urgentLevel !== urgentFilter) return false;
      if (bizTypeFilter.length > 0 && !bizTypeFilter.includes(item.bizType)) return false;
      return true;
    });
    return sortTodos(list);
  }, [roleTodos, urgentFilter, bizTypeFilter]);

  return (
    <div className="v2-wb-panel">
      <div className="v2-wb-panel__header">
        <div className="v2-wb-panel__title">
          <CheckSquare size={18} style={{ color: 'var(--oneos-primary)' }} />
          <span>我的待办 ({filteredTodos.length})</span>
        </div>

        <div className="v2-wb-panel__filters">
          <label className="v2-wb-filter-field">
            <span className="v2-wb-filter-field__label">紧急程度</span>
            <div className="v2-wb-filter-field__control v2-wb-filter-field__control--sm">
              <V2Select
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'normal', label: '正常' },
                  { value: 'overdue', label: '逾期' },
                ]}
                value={urgentFilter}
                onChange={(val) => setUrgentFilter(val as 'all' | 'normal' | 'overdue')}
                placeholder="紧急程度"
              />
            </div>
          </label>

          <label className="v2-wb-filter-field">
            <span className="v2-wb-filter-field__label">业务类型</span>
            <div className="v2-wb-filter-field__control v2-wb-filter-field__control--md">
              <V2Select
                multiple
                searchable
                options={bizTypeOptions}
                value={bizTypeFilter}
                onChange={(val) => setBizTypeFilter(Array.isArray(val) ? val : [])}
                placeholder="全部类型"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="v2-wb-todo-list">
        {filteredTodos.length === 0 ? (
          <div className="v2-wb-todo-empty">当前筛选条件下暂无未完成待办</div>
        ) : (
          filteredTodos.map((todo) => (
            <div key={todo.id} className="v2-wb-todo-card">
              <div className="v2-wb-todo-card__top">
                <div className="v2-wb-todo-card__main">
                  <V2Tag type={todo.urgentLevel === 'overdue' ? 'error' : 'primary'}>
                    {todo.bizTypeLabel}
                  </V2Tag>
                  <span className="v2-wb-todo-card__title">{todo.title}</span>
                </div>

                {todo.urgentLevel === 'overdue' ? (
                  <span className="v2-wb-todo-card__sla is-overdue">
                    <AlertCircle size={12} />
                    已逾期
                  </span>
                ) : (
                  <span className="v2-wb-todo-card__sla">
                    <Clock size={12} />
                    剩 {Math.ceil(todo.slaHoursLeft / 24)} 天
                  </span>
                )}
              </div>

              {todo.detailSummary && (
                <div className="v2-wb-todo-card__summary">
                  {Object.entries(todo.detailSummary).map(([k, v]) => (
                    <div key={k}>
                      <span className="v2-wb-todo-card__k">{k}: </span>
                      <span className="v2-wb-todo-card__v">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="v2-wb-todo-card__foot">
                <span className="v2-wb-todo-card__time">创建时间: {todo.createTime}</span>

                <div className="v2-wb-todo-card__actions">
                  {currentRole.canUrge && todo.managerCanUrge && (
                    <button
                      type="button"
                      className="v2-wb-btn v2-wb-btn--secondary"
                      onClick={() => setSelectedUrgeItem(todo)}
                    >
                      <Send size={12} />
                      催办
                    </button>
                  )}

                  {todo.href && (
                    <a
                      href={todo.href}
                      className="v2-wb-btn v2-wb-btn--primary"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>去处理</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <UrgeModal
        isOpen={!!selectedUrgeItem}
        title={selectedUrgeItem?.title || ''}
        subtitle="催办任务"
        onClose={() => setSelectedUrgeItem(null)}
        onConfirmUrge={(channels) => {
          onUrgeSuccessToast(
            `已通过【${channels.join('、')}】向责任人发送催办提醒（演示时间: ${new Date().toLocaleTimeString()}）`,
          );
        }}
      />
    </div>
  );
};
