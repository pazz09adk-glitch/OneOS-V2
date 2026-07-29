import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { V2Button } from '../../../resources/design-system/components/UIComponents';
import { vehicleSummary, vehiclesOf } from '../mockData';
import { BoundVehicle } from '../types';

interface BoundVehiclesCellProps {
  vehicleIds: string[];
  onOpenDetail?: () => void;
}

export const BoundVehiclesCell: React.FC<BoundVehiclesCellProps> = ({
  vehicleIds,
  onOpenDetail,
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const list = vehiclesOf(vehicleIds);
  const label = vehicleSummary(vehicleIds);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!list.length) {
    return <span className="v2-two-detail-muted">—</span>;
  }

  return (
    <div className="v2-two-bound-cell" ref={wrapRef}>
      <button
        type="button"
        className="v2-two-bound-trigger"
        onClick={() => setOpen((v) => !v)}
        title="查看绑定车辆"
        aria-label="查看绑定车辆"
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      {open && (
        <div className="v2-two-bound-popover" role="dialog" aria-label="绑定车辆清单">
          <div className="v2-two-bound-popover-title">绑定车辆（{list.length}）</div>
          <ul className="v2-two-bound-popover-list">
            {list.map((v: BoundVehicle) => (
              <li key={v.id}>
                <span className="v2-two-code-cell" style={{ fontSize: 12 }}>
                  {v.plateNo}
                </span>
                <span className="v2-two-detail-muted">
                  {v.model} · {v.mileageSource}
                </span>
              </li>
            ))}
          </ul>
          {onOpenDetail && (
            <div className="v2-two-bound-popover-footer">
              <V2Button
                variant="link"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  onOpenDetail();
                }}
              >
                打开工单详情
              </V2Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
